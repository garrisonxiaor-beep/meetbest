import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const defaultSeed = resolve(projectRoot, 'content/seed.json');
export const defaultDatabase = resolve(projectRoot, 'data/fitness.db');

function assert(condition, message) {
  if (!condition) throw new Error(`内容校验失败：${message}`);
}
function text(value, name, max = 10000) {
  assert(typeof value === 'string' && value.trim().length > 0 && value.length <= max, `${name} 应为非空文字`);
}
function strings(value, name, allowEmpty = false) {
  assert(Array.isArray(value) && (allowEmpty || value.length > 0), `${name} 应为文字数组`);
  value.forEach((item, i) => text(item, `${name}[${i}]`));
}
function url(value, name, protocols = ['https:', 'http:']) {
  text(value, name, 3000);
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error(`内容校验失败：${name} URL 无效`); }
  assert(protocols.includes(parsed.protocol) && !parsed.username && !parsed.password, `${name} 协议无效或含凭据`);
}
function sources(value, name) {
  assert(Array.isArray(value) && value.length > 0, `${name} 至少包含一个来源`);
  value.forEach((s, i) => {
    text(s.title, `${name}[${i}].title`);
    url(s.url, `${name}[${i}].url`);
  });
}
function collection(value, name) {
  assert(Array.isArray(value) && value.length > 0 && value.length < 10000, `${name} 数量无效`);
  const ids = new Set();
  value.forEach((item, i) => {
    assert(item && typeof item === 'object', `${name}[${i}] 应为对象`);
    assert(typeof item.id === 'string' && /^[a-z0-9][a-z0-9-]{0,99}$/.test(item.id), `${name}[${i}].id 无效`);
    assert(!ids.has(item.id), `${name} 存在重复 id: ${item.id}`);
    ids.add(item.id);
    text(item.name, `${name}[${i}].name`, 200);
  });
  return ids;
}

export function validateContent(data) {
  assert(data && typeof data === 'object', '根节点应为对象');
  const ids = collection(data.exercises, 'exercises');
  collection(data.supplements, 'supplements');
  collection(data.plans, 'plans');
  assert(data.meta && typeof data.meta === 'object', 'meta 缺失');
  text(data.meta.name, 'meta.name');
  text(data.meta.description, 'meta.description');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(data.meta.updatedAt), 'meta.updatedAt 应为日期');
  data.exercises.forEach((e) => {
    const key = `exercise:${e.id}`;
    assert(['胸部', '背部', '肩部', '腿臀', '手臂', '腹部', '全身'].includes(e.bodyPart), `${key} bodyPart 无效`);
    assert(['入门', '基础', '进阶'].includes(e.difficulty), `${key} difficulty 无效`);
    assert(['力量', '热身', '拉伸'].includes(e.category), `${key} category 无效`);
    ['equipment', 'summary', 'prescription'].forEach(f => text(e[f], `${key}.${f}`));
    ['muscles', 'steps', 'tips'].forEach(f => strings(e[f], `${key}.${f}`));
    sources(e.sources, `${key}.sources`);
    if (e.video !== null) {
      assert(e.video && typeof e.video === 'object', `${key}.video 应为对象或 null`);
      url(e.video.url, `${key}.video.url`);
      assert(['抖音', '哔哩哔哩'].includes(e.video.platform), `${key}.video.platform 无效`);
      ['title', 'author'].forEach(f => text(e.video[f], `${key}.video.${f}`));
      if (e.video.appUrl) url(e.video.appUrl, `${key}.video.appUrl`, ['snssdk1128:', 'bilibili:', 'https:']);
    }
  });
  data.supplements.forEach((s) => {
    const key = `supplement:${s.id}`;
    assert(['证据较充分', '特定情境', '证据有限'].includes(s.evidence), `${key}.evidence 无效`);
    ['englishName', 'category', 'summary', 'usage'].forEach(f => text(s[f], `${key}.${f}`));
    ['goals', 'benefits', 'suitableFor', 'cautions', 'selectionTips'].forEach(f => strings(s[f], `${key}.${f}`));
    assert(Array.isArray(s.myths), `${key}.myths 缺失`);
    s.myths.forEach(m => { text(m.question, `${key}.myths.question`); text(m.answer, `${key}.myths.answer`); });
    sources(s.sources, `${key}.sources`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(s.reviewedAt), `${key}.reviewedAt 无效`);
  });
  data.plans.forEach((p) => {
    const key = `plan:${p.id}`;
    text(p.level, `${key}.level`);
    text(p.description, `${key}.description`);
    assert(Number.isInteger(p.daysPerWeek) && p.daysPerWeek >= 1 && p.daysPerWeek <= 7, `${key}.daysPerWeek 无效`);
    assert(Array.isArray(p.days) && p.days.length === p.daysPerWeek, `${key}.days 数量不符`);
    p.days.forEach((d, i) => {
      ['title', 'subtitle', 'warmup'].forEach(f => text(d[f], `${key}.days[${i}].${f}`));
      assert(Array.isArray(d.exercises) && d.exercises.length > 0, `${key}.days[${i}] 缺少动作`);
      d.exercises.forEach(e => {
        assert(ids.has(e.exerciseId), `${key} 引用了不存在的动作 ${e.exerciseId}`);
        ['sets', 'reps', 'rest', 'note'].forEach(f => text(e[f], `${key}.${e.exerciseId}.${f}`));
      });
    });
  });
  return data;
}

export function readSeed(path = defaultSeed) {
  return validateContent(JSON.parse(readFileSync(path, 'utf8')));
}

export function openDatabase(filename = process.env.DATABASE_PATH || defaultDatabase) {
  if (filename !== ':memory:') mkdirSync(dirname(resolve(filename)), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA foreign_keys=ON;
    PRAGMA busy_timeout=5000;
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, body_part TEXT NOT NULL,
      equipment TEXT NOT NULL, category TEXT NOT NULL,
      document TEXT NOT NULL CHECK(json_valid(document)), sort_index INTEGER NOT NULL DEFAULT 0
    ) STRICT;
    CREATE TABLE IF NOT EXISTS supplements (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, evidence TEXT NOT NULL,
      document TEXT NOT NULL CHECK(json_valid(document)), sort_index INTEGER NOT NULL DEFAULT 0
    ) STRICT;
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY, name TEXT NOT NULL,
      document TEXT NOT NULL CHECK(json_valid(document)), sort_index INTEGER NOT NULL DEFAULT 0
    ) STRICT;
    CREATE TABLE IF NOT EXISTS plan_exercises (
      plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      day_index INTEGER NOT NULL, position INTEGER NOT NULL,
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      PRIMARY KEY(plan_id, day_index, position)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT;
    CREATE INDEX IF NOT EXISTS idx_exercises_body ON exercises(body_part);
  `);
  return db;
}

export function getCounts(db) {
  return Object.fromEntries(['exercises', 'supplements', 'plans'].map(t => [t, db.prepare(`SELECT count(*) AS n FROM ${t}`).get().n]));
}

export function importContent(db, data) {
  validateContent(data);
  const exercise = db.prepare(`INSERT INTO exercises VALUES(?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name,body_part=excluded.body_part,
    equipment=excluded.equipment,category=excluded.category,document=excluded.document,sort_index=excluded.sort_index`);
  const supplement = db.prepare(`INSERT INTO supplements VALUES(?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name,evidence=excluded.evidence,document=excluded.document,sort_index=excluded.sort_index`);
  const plan = db.prepare(`INSERT INTO plans VALUES(?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name,document=excluded.document,sort_index=excluded.sort_index`);
  const item = db.prepare('INSERT INTO plan_exercises VALUES(?,?,?,?)');
  db.exec('BEGIN IMMEDIATE');
  try {
    data.exercises.forEach((e, i) => exercise.run(e.id, e.name, e.bodyPart, e.equipment, e.category, JSON.stringify(e), i));
    data.supplements.forEach((s, i) => supplement.run(s.id, s.name, s.evidence, JSON.stringify(s), i));
    data.plans.forEach((p, i) => {
      plan.run(p.id, p.name, JSON.stringify(p), i);
      db.prepare('DELETE FROM plan_exercises WHERE plan_id=?').run(p.id);
      p.days.forEach((d, di) => d.exercises.forEach((e, ei) => item.run(p.id, di, ei, e.exerciseId)));
    });
    db.prepare('INSERT INTO metadata(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run('meta', JSON.stringify(data.meta));
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return getCounts(db);
}

export function loadContent(db) {
  const data = Object.fromEntries(['exercises', 'supplements', 'plans'].map(t => [
    t, db.prepare(`SELECT document FROM ${t} ORDER BY sort_index,id`).all().map(row => JSON.parse(row.document))
  ]));
  data.meta = JSON.parse(db.prepare("SELECT value FROM metadata WHERE key='meta'").get()?.value || '{}');
  return data;
}
