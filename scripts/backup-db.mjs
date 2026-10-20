import { DatabaseSync } from 'node:sqlite';
import { resolve, dirname } from 'node:path';
import { mkdirSync, existsSync, chmodSync } from 'node:fs';
import { defaultDatabase } from '../server/content.mjs';

const input = resolve(process.env.DATABASE_PATH || defaultDatabase);
const destination = process.argv[2];
if (!destination) throw new Error('请指定备份文件路径，例如 npm run db:backup -- ./backups/fitness.sqlite');
const output = resolve(destination);
if (!existsSync(input)) throw new Error('数据库不存在');
if (existsSync(output)) throw new Error('备份目标已存在，请使用新文件名');
if (input === output) throw new Error('备份目标不能是当前数据库');
mkdirSync(dirname(output), { recursive: true, mode: 0o700 });
const db = new DatabaseSync(input);
try {
  db.exec('PRAGMA busy_timeout=10000');
  // VACUUM INTO creates a transactionally consistent standalone snapshot,
  // including committed records currently stored in the WAL.
  db.prepare('VACUUM INTO ?').run(output);
  chmodSync(output, 0o600);
  const check = new DatabaseSync(output, { readOnly: true });
  try {
    if (check.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('备份完整性校验失败');
  } finally { check.close(); }
  console.log(`Backup verified: ${output}`);
} finally { db.close(); }
