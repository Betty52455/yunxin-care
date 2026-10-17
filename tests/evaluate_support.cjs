// Engineering probes with fictitious records, not a user/clinical dataset.
const core=require('../web/support-core.js');
const planner=require('../web/need-planner.js');
const fs=require('node:fs');
const now=Date.parse('2026-10-17T12:00:00Z');
const lib=[{id:'rest',category:'休息',minutes:1},{id:'listen',category:'倾听',minutes:3},{id:'long',category:'陪伴',minutes:10}];
const blank=()=>({settings:{available:15,preferred:'信息',support:{stage:'postpartum',energy:'normal',history:true}},needs:[],tasks:[],activities:[]});
const fb=(extra={})=>({help:'有帮助',burden:'较多',updated:'2026-10-17T12:00:00Z',context:{stage:'postpartum'},...extra});
const score=(rank,s)=>rank(s,lib,now).find(x=>x.id==='rest').score;
const cases=[
 ['其他阶段不沿用',rank=>{const s=blank();s.tasks=[{category:'休息',feedback:fb({context:{stage:'pregnancy'},help:'没有帮助'})}];return score(rank,s)===0;}],
 ['缺少阶段不猜测',rank=>{const s=blank();s.tasks=[{category:'休息',feedback:fb({context:undefined,help:'没有帮助'})}];return score(rank,s)===0;}],
 ['单次反馈影响小于 1',rank=>{const s=blank();s.activities=[{activityId:'rest',...fb()}];return score(rank,s)>0&&score(rank,s)<1;}],
 ['30 天前的反馈影响更小',rank=>{const s=blank();s.activities=[{activityId:'rest',...fb()}];const fresh=score(rank,s);s.activities[0].updated='2026-09-17T12:00:00Z';return score(rank,s)<fresh;}],
 ['低精力时更重视协调负担',rank=>{const s=blank();s.tasks=[{category:'休息',feedback:fb()}];const normal=score(rank,s);s.settings.support.energy='brief';return score(rank,s)<normal;}],
 ['不确定保持中性',rank=>{const s=blank();s.tasks=[{category:'休息',feedback:fb({help:'不确定',burden:'不确定'})}];return score(rank,s)===0;}],
 ['关闭历史后不引用反馈',rank=>{const s=blank();s.settings.support.history=false;s.tasks=[{category:'休息',feedback:fb({help:'没有帮助'})}];return score(rank,s)===0;}],
 ['超过可用时间不推荐',rank=>{const s=blank();s.settings.available=3;return rank(s,lib,now).every(a=>a.minutes<=3);}]
];
const rows=cases.map(([name,check])=>({name,baseline:check(core.rankLegacy),updated:check(core.rank)}));
const questions=[];
for(const energy of ['brief','normal']){
 let s={category:'实际帮忙',arrange:true,energy,fields:{},asked:[]};
 let q;while(q=planner.nextQuestion(s)){s.asked.push(q.key);} // skip each: measure request count, never pretend information was collected.
 questions.push({energy,fixedQuestions:4,adaptiveQuestions:s.asked.length,unfilledFields:4,stop:'budget'});
}
const result={date:'2026-10-17',kind:'synthetic engineering requirements probes; not accuracy or efficacy',recommendation:rows,clarification:questions};
console.log(JSON.stringify(result,null,2));
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));
if(rows.some(r=>!r.updated))process.exitCode=1;
