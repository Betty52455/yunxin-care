const {test}=require('node:test');
const assert=require('node:assert/strict');
const p=require('../web/need-planner.js');
const core=require('../web/support-core.js');
const now=Date.parse('2026-10-17T12:00:00Z');
const state=()=>({settings:{available:15,preferred:'信息',support:{stage:'postpartum',energy:'normal',history:true}},needs:[],activities:[],tasks:[]});
const lib=[{id:'rest',category:'休息',minutes:1},{id:'listen',category:'倾听',minutes:3},{id:'long',category:'陪伴',minutes:10}];
const feedback=(extra={})=>({help:'有帮助',burden:'较多',updated:'2026-10-17T12:00:00Z',context:{stage:'postpartum'},...extra});
test('ambiguous expression yields alternatives, never a confirmed need or task',()=>{
 const r=p.analyze('每天晚上都要我提醒，真的很累。');assert.equal(r.ambiguous,true);assert.deepEqual(new Set(r.candidates.map(c=>c.category)),new Set(['休息','实际帮忙']));assert.equal(r.confirmed,undefined);assert.equal(r.owner,undefined);
});
test('explicit negation is not suggested; unfamiliar expression abstains',()=>{
 assert.ok(!p.analyze('不想休息，只想有人听我说').candidates.some(x=>x.category==='休息'));
 assert.deepEqual(p.analyze('今天阳光很好').candidates,[]);
});
test('model schema rejects ungrounded evidence, extra task fields, duplicate categories',()=>{
 for(const v of [{candidates:[{category:'休息',evidence:'休息'}]},{candidates:[],owner:'伴侣'},{candidates:[{category:'倾听',evidence:'很累',title:'接手家务'}]},{candidates:[{category:'休息',evidence:'很累'},{category:'休息',evidence:'很累'}]}])assert.throws(()=>p.validateModel(v,'真的很累'));
 assert.equal(p.validateModel({candidates:[{category:'休息',evidence:'很累'}]},'真的很累').source,'model');
});
test('clarification respects low energy budget, filled fields and skip',()=>{
 const s={category:'休息',arrange:true,fields:{title:'收拾餐桌'},asked:[],energy:'brief'};
 assert.equal(p.nextQuestion(s).key,'owner');s.asked.push('owner');assert.equal(p.nextQuestion(s),null);
 s.energy='normal';assert.equal(p.nextQuestion(s).key,'date');s.asked.push('date');assert.equal(p.nextQuestion(s),null);
});
test('no question before need selection; opt-out and stopping are respected',()=>{
 assert.equal(p.nextQuestion({category:'',arrange:true}),null);
 assert.equal(p.nextQuestion({category:'休息',arrange:false}),null);
 assert.equal(p.nextQuestion({category:'休息',arrange:true,stopped:true}),null);
});
test('private original and model fields cannot enter sharing projection',()=>{
 assert.deepEqual(p.sharedDraft({expression:'秘密',evidence:'秘密',category:'休息',model:{owner:'伴侣'}}),{title:'',date:'',owner:'',details:''});
 assert.equal(p.sharedDraft({title:'收拾餐桌',owner:'猜测的家人'}).owner,'');
});
test('unknown and other-stage history has no influence',()=>{
 const s=state(),base=core.rank(s,lib,now);
 s.tasks=[{category:'休息',feedback:feedback({context:{stage:'pregnancy'}})},{category:'休息',feedback:feedback({context:undefined})}];
 assert.deepEqual(core.rank(s,lib,now).map(x=>x.score),base.map(x=>x.score));assert.equal(core.rank(s,lib,now)[0].excludedCount,2);
});
test('small samples are shrunk; old feedback has less influence',()=>{
 const s=state();s.activities=[{activityId:'rest',...feedback()}];
 const fresh=core.rank(s,lib,now).find(x=>x.id==='rest').score;assert.ok(fresh>0&&fresh<1);
 s.activities[0].updated='2026-09-17T12:00:00Z';const old=core.rank(s,lib,now).find(x=>x.id==='rest').score;assert.ok(old<fresh);
});
test('burden cancels help at ordinary energy and weighs more in brief mode',()=>{
 const s=state();s.tasks=[{category:'休息',feedback:feedback()}];
 assert.equal(core.rank(s,lib,now).find(x=>x.id==='rest').score,0);
 s.settings.support.energy='brief';assert.ok(core.rank(s,lib,now).find(x=>x.id==='rest').score<0);
 assert.ok(!core.rank(s,lib,now).some(x=>x.id==='long'));
});
test('missing/uncertain/future feedback never creates positive evidence',()=>{
 const s=state();s.tasks=[{category:'休息',feedback:feedback({help:'不确定',burden:'不确定'})}];
 s.activities=[{activityId:'rest',...feedback({updated:'2030-01-01'})}];
 assert.ok(core.rank(s,lib,now).every(x=>x.score===0&&x.historyCount===0));
});
test('opt-out removes history and every explanation exactly sums to rank',()=>{
 const s=state();s.tasks=[{category:'休息',feedback:feedback({help:'没有帮助'})}];
 for(const x of core.rank(s,lib,now))assert.equal(x.score,x.parts.reduce((n,p)=>n+p.value,0));
 s.settings.support.history=false;assert.ok(core.rank(s,lib,now).every(x=>x.score===0&&x.historyCount===0&&x.excludedCount===0));
});
test('deleting/correcting feedback changes rank without stale learned state',()=>{
 const s=state();s.tasks=[{category:'休息',feedback:feedback({help:'没有帮助'})}];assert.equal(core.rank(s,lib,now)[0].id,'listen');
 s.tasks[0].feedback=feedback({help:'有帮助',burden:'没有'});assert.equal(core.rank(s,lib,now)[0].id,'rest');
 s.tasks=[];assert.equal(core.rank(s,lib,now)[0].score,0);
});
test('feedback context survives browser backup and invalid stages are rejected',()=>{
 const storage=require('../online/dist/storage.js');const s=storage.emptyState();
 s.activities=[{id:'a',activityId:'rest',help:'有帮助',note:'',created:'2026-10-17',context:{stage:'postpartum'}}];
 const restored=JSON.parse(JSON.stringify(s));storage.validateState(restored);assert.equal(restored.activities[0].context.stage,'postpartum');
 restored.activities[0].context.stage='guess';assert.throws(()=>storage.validateState(restored));
});
