import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { execFileSync, spawn } from 'node:child_process';
import { createServer as createNetServer } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from './index.mjs';
import { readSeed, openDatabase, importContent, loadContent, getCounts, projectRoot } from './content.mjs';

function temp(t) {
  const directory = mkdtempSync(join(tmpdir(), 'fitness-site-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test('production entry point starts through the release symlink', async (t) => {
  const directory = temp(t);
  const current = join(directory, 'current');
  symlinkSync(projectRoot, current, 'dir');
  const probe = createNetServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, [join(current, 'server/index.mjs')], {
    cwd: current,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), DATABASE_PATH: join(directory, 'fitness.db') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const ended = once(child, 'exit');
      child.kill('SIGTERM');
      await ended;
    }
  });
  let output = '';
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start: ${output}`)), 5000);
    child.stderr.on('data', chunk => { output += chunk; });
    child.stdout.on('data', chunk => {
      output += chunk;
      if (output.includes('listening on')) { clearTimeout(timer); resolve(); }
    });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited ${code}: ${output}`)); });
  });
  const health = await (await fetch(`http://127.0.0.1:${port}/api/health`)).json();
  assert.equal(health.status, 'ok');
  assert.equal(health.counts.exercises, readSeed().exercises.length);
});

test('content imports are durable, idempotent, and reject broken plan references before mutation', (t) => {
  const path = join(temp(t), 'fitness.db');
  const seed = readSeed();
  let db = openDatabase(path);
  importContent(db, seed);
  importContent(db, seed);
  assert.equal(getCounts(db).exercises, seed.exercises.length);
  const bad = structuredClone(seed);
  bad.exercises[0].name = 'invalid update must not persist';
  bad.plans[0].days[0].exercises[0].exerciseId = 'not-in-library';
  assert.throws(() => importContent(db, bad), /不存在的动作/);
  db.close();
  db = openDatabase(path);
  assert.equal(loadContent(db).exercises[0].name, seed.exercises[0].name);
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
  db.close();
});

test('live WAL backup can be restored with the latest committed content', (t) => {
  const dir = temp(t);
  const path = join(dir, 'fitness.db');
  const output = join(dir, 'snapshot.sqlite');
  const db = openDatabase(path);
  t.after(() => db.close());
  const seed = readSeed();
  seed.exercises[0].name = '已提交的新动作名称';
  importContent(db, seed);
  execFileSync(process.execPath, ['scripts/backup-db.mjs', output], {
    cwd: projectRoot, env: { ...process.env, DATABASE_PATH: path }, stdio: 'pipe'
  });
  const restored = new DatabaseSync(output, { readOnly: true });
  assert.equal(restored.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  assert.equal(JSON.parse(restored.prepare('SELECT document FROM exercises WHERE id=?').get(seed.exercises[0].id).document).name, '已提交的新动作名称');
  restored.close();
  assert.throws(() => execFileSync(process.execPath, ['scripts/backup-db.mjs', output], {
    cwd: projectRoot, env: { ...process.env, DATABASE_PATH: path }, stdio: 'pipe'
  }));
});

test('HTTP serves persistent content, notices external imports, and rejects writes/private paths', async (t) => {
  const dir = temp(t);
  const path = join(dir, 'fitness.db');
  const dist = join(dir, 'dist');
  mkdirSync(dist);
  writeFileSync(join(dist, 'index.html'), '<!doctype html><title>Test</title>');
  writeFileSync(join(dir, '.env'), 'should-not-be-readable');
  const { server } = createApp({ databasePath: path, distPath: dist });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const health = await (await fetch(`${base}/api/health`)).json();
  assert.equal(health.database, 'ok');
  const first = await fetch(`${base}/api/content`);
  const etag = first.headers.get('etag');
  const before = await first.json();
  const cached = await fetch(`${base}/api/content`, { headers: { 'If-None-Match': etag } });
  assert.equal(cached.status, 304);
  const write = await fetch(`${base}/api/content`, { method: 'POST', body: '{}' });
  assert.equal(write.status, 405);
  for (const route of ['/data/fitness.db', '/.env', '/%2e%2e%2f.env', '/server/index.mjs', '/api/missing']) {
    assert.equal((await fetch(base + route)).status, 404, route);
  }
  const html = await fetch(base);
  assert.match(html.headers.get('content-type'), /text\/html/);
  assert.equal(html.headers.get('x-content-type-options'), 'nosniff');
  const head = await fetch(base, { method: 'HEAD' });
  assert.equal(await head.text(), '');
  const seed = readSeed();
  seed.exercises[0].summary = '外部导入后无需重启即可看到';
  const secondConnection = openDatabase(path);
  importContent(secondConnection, seed);
  secondConnection.close();
  const updated = await fetch(`${base}/api/content`, { headers: { 'If-None-Match': etag } });
  assert.equal(updated.status, 200);
  const after = await updated.json();
  assert.equal(after.exercises.length, before.exercises.length);
  assert.equal(after.exercises[0].summary, '外部导入后无需重启即可看到');
  assert.notEqual(updated.headers.get('etag'), etag);
  const filtered = await (await fetch(`${base}/api/exercises?bodyPart=${encodeURIComponent('背部')}`)).json();
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every(e => e.bodyPart === '背部'));
});
