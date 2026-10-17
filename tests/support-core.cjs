const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../web/support-core.js');
const storage=require('../online/dist/storage.js');
const library=[{id:'rest',category:'休息',minutes:1},{id:'listen',category:'倾听',minutes:3},{id:'long',category:'陪伴',minutes:10}];
const state=()=>({...storage.emptyState(),settings:{...storage.emptyState().settings,preferred:'信息',support:{stage:'postpartum',energy:'normal',history:true}}});
test('negative help and coordination burden lower rank; explanations account for both',()=>{
  const s=state();s.tasks=[{category:'休息',feedback:{help:'没有帮助',burden:'较多',updated:'2026-10-15'}}];
  const result=core.rankLegacy(s,library);assert.equal(result[0].id,'listen');
  const rest=result.find(x=>x.id==='rest');assert.equal(rest.score,-2);assert.match(rest.reason,/帮助感受降低/);assert.match(rest.reason,/协调负担降低/);
});
test('uncertain and absent feedback never count as positive evidence',()=>{
  const s=state();s.activities=[{activityId:'rest',help:'不确定'}];s.tasks=[{category:'休息',feedback:null},{category:'休息',feedback:{help:'不确定',burden:'不确定'}}];
  assert.equal(core.rankLegacy(s,library)[0].score,0);
});
test('history opt-out removes both beneficial and negative feedback',()=>{
  const s=state();s.settings.support.history=false;s.activities=[{activityId:'rest',help:'有帮助'}];s.tasks=[{category:'倾听',feedback:{help:'没有帮助',burden:'较多'}}];
  const result=core.rankLegacy(s,library);assert.ok(result.every(x=>x.score===0&&x.historyCount===0));
});
test('brief mode caps time without changing the saved usual duration',()=>{
  const s=state();s.settings.support.energy='brief';assert.deepEqual(core.rankLegacy(s,library).map(x=>x.id),['rest','listen']);assert.equal(s.settings.available,15);
  s.settings.available=1;assert.deepEqual(core.rankLegacy(s,library).map(x=>x.id),['rest']);
});
test('only five most recently updated task ratings affect recommendation',()=>{
  const s=state();s.tasks=Array.from({length:6},(_,i)=>({category:'休息',feedback:{help:i===0?'有帮助':'一般',burden:'没有',updated:`2026-10-${10+i}`}}));
  assert.equal(core.rankLegacy(s,library).find(x=>x.id==='rest').score,0);
  s.tasks[0].feedback.updated='2026-10-20';assert.equal(core.rankLegacy(s,library)[0].score,1);
});
test('old backup remains valid; new preferences and resume points survive serialization',()=>{
  storage.validateState(storage.emptyState());const s=state();s.settings.support.drafts={pregnancy:{step:1,perspective:'partner',choice:'listen'}};
  const copy=JSON.parse(JSON.stringify(s));storage.validateState(copy);assert.deepEqual(copy.settings.support,s.settings.support);
});
test('reject corrupted or mismatched progress and unexpected preference values',()=>{
  for(const value of [null,{stage:'postpartum',energy:'bad',history:true},{stage:'pregnancy',energy:'normal',history:true,drafts:{pregnancy:{step:2,choice:'',perspective:'mother'}}},{stage:'pregnancy',energy:'normal',history:true,drafts:{postpartum:{step:1,choice:'listen',perspective:'mother'}}}]){
    const s=state();s.settings.support=value;assert.throws(()=>storage.validateState(s));
  }
});
