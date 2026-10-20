import { resolve } from 'node:path';
import { readSeed, openDatabase, importContent } from '../server/content.mjs';

const seed = readSeed(process.argv[2] ? resolve(process.argv[2]) : undefined);
const db = openDatabase();
try { console.log(JSON.stringify({ imported: importContent(db, seed) })); }
finally { db.close(); }
