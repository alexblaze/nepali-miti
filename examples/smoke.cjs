// Runs against the built package: node examples/smoke.cjs
const assert = require('node:assert/strict');
const { toBs, toAd, format } = require('../dist/index.cjs');

assert.deepEqual(toBs('2026-10-18'), { year: 2083, month: 7, day: 1 });
assert.deepEqual(toAd('2083-06-31'), { year: 2026, month: 10, day: 17 });
assert.equal(format('2083-07-01', 'dddd, D MMMM YYYY', { locale: 'ne' }), 'आइतबार, १ कार्तिक २०८३');
console.log('CJS smoke test passed on Node', process.version);
