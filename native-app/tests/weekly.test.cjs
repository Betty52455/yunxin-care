const assert=require('node:assert/strict');
const w=require('../www/weekly.js');
const row=(date,score=3,sleep=7,note='')=>({date,score,sleep,note});
assert.equal(w.monday('2026-10-21'),'2026-10-19');
assert.equal(w.monday('2027-01-01'),'2026-12-28');
assert.equal(w.add('2024-02-28',1),'2024-02-29');
let r=w.build([], '2026-10-19','2026-10-21');
assert.equal(r.count,0);assert.equal(r.elapsed,3);assert.equal(r.sleepAverage,null);assert.equal(r.days.filter(d=>d.future).length,4);
r=w.build([row('2026-10-19',1,0),row('2026-10-20',5,8),row('2026-10-21',3,null),row('2026-10-22',5,9),row('2026-10-18',2,4)],'2026-10-19','2026-10-21');
assert.equal(r.count,3);assert.equal(r.sleepAverage,4);assert.equal(r.sleeps.length,2);assert.deepEqual(r.counts,[1,0,1,0,1]);assert.equal(r.complete,false);
assert.equal(w.build([row('2026-10-18')],'2026-10-12','2026-10-19').complete,true);
r=w.build([row('2026-10-19',1),row('2026-10-19',4),row('2026-02-30'),row('2026-10-20',9),row('2026-10-21',2,'')],'2026-10-19','2026-10-21');
assert.equal(r.count,2);assert.equal(r.rows[0].score,4);assert.equal(r.sleeps.length,1);
const original=[row('2026-10-12',2,6,'<img src=x onerror=alert(1)>')];const snapshot=JSON.stringify(original);
const html=w.render(original,'2026-10-21');assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));assert.equal(JSON.stringify(original),snapshot);
assert.equal(w.build([], '2026-10-12','2026-10-21').count,0); // deletion reflected, no stale summaries
assert.ok(w.weeks([row('2025-01-01')],'2026-10-21').includes('2024-12-30'));
console.log('Weekly report: calendar, coverage, missing sleep, zero hours, duplicates, history, escaping and immutability passed');
