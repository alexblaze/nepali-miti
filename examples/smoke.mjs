// Runs against the built package: node examples/smoke.mjs
import assert from 'node:assert/strict';
import { toBs, toAd, getMonthGrid } from '../dist/index.js';

assert.deepEqual(toBs(new Date('2026-10-01T20:00:00Z'), { timeZone: 'nepal' }), { year: 2083, month: 6, day: 16 });
assert.deepEqual(toAd({ year: 2084, month: 3, day: 1 }), { year: 2027, month: 6, day: 15 });
assert.equal(
  getMonthGrid(2083, 6)
    .flat()
    .filter((c) => c?.inMonth).length,
  31,
);
console.log('ESM smoke test passed on Node', process.version);
