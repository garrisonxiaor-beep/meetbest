import { readSeed } from '../server/content.mjs';
const data = readSeed(process.argv[2]);
console.log(JSON.stringify({
  exercises: data.exercises.length, verifiedVideos: data.exercises.filter(e => e.video).length,
  supplements: data.supplements.length, plans: data.plans.length,
  updatedAt: data.meta.updatedAt
}, null, 2));
