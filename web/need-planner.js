/* Original, deterministic support clarification. No diagnosis or inferred sharing. */
(function(root){
 'use strict';
 const categories=['倾听','休息','实际帮忙','信息','陪伴'];
 const lexicon={倾听:['听我说','听一听','倾听','说说话'],休息:['休息','睡一会','睡觉','很累','疲惫'],实际帮忙:['接手','家务','收拾','提醒','帮忙'],信息:['资料','咨询','问医生','不了解','怎么做'],陪伴:['陪我','陪同','陪伴','一个人']};
 function analyze(text){
  text=String(text).slice(0,5000);
  const candidates=Object.entries(lexicon).map(([category,words])=>{
   const evidence=words.filter(word=>{const at=text.indexOf(word);return at>=0&&!/(不想|不要|不需要|不用|别).{0,3}$/.test(text.slice(Math.max(0,at-8),at));});
   return {category,evidence,score:evidence.length};
  }).filter(x=>x.score).sort((a,b)=>b.score-a.score);
  return {source:'rules',candidates,ambiguous:candidates.length!==1,question:candidates.length>1?'这句话里可能有几种需要，此刻你更希望得到哪一种？':'这个理解符合你的意思吗？也可以自己选择其他需要。'};
 }
 function validateModel(value,text){
  if(!value||typeof value!=='object'||Object.keys(value).some(k=>k!=='candidates')||!Array.isArray(value.candidates)||value.candidates.length>5)throw Error('模型结果格式不符合要求');
  const seen=new Set();
  const candidates=value.candidates.map(x=>{
   if(!x||Object.keys(x).some(k=>!['category','evidence'].includes(k))||!categories.includes(x.category)||seen.has(x.category)||typeof x.evidence!=='string'||!x.evidence.trim()||x.evidence.length>100||!text.includes(x.evidence))throw Error('模型提出了无法从原文核对的内容');
   seen.add(x.category);return {category:x.category,evidence:[x.evidence]};
  });
  return {source:'model',candidates,ambiguous:candidates.length!==1,question:'以下只是待确认的理解，请由你自己选择，也可以完全不用。'};
 }
 // Expected utility of a question = field importance / input cost. No semantic information-gain claim.
 const questions=[{key:'title',label:'你希望对方具体接手哪一件事？',type:'text',priority:5,cost:1},
  {key:'owner',label:'希望由谁负责？不确定可以跳过',type:'owner',priority:4,cost:1},
  {key:'date',label:'希望哪一天做？暂未商量可以跳过',type:'date',priority:3,cost:1},
  {key:'details',label:'怎样做能减少你反复提醒？',type:'text',priority:3,cost:2}];
 function nextQuestion({category,arrange,fields={},asked=[],energy='normal',stopped=false}){
  if(stopped||!arrange||!categories.includes(category))return null;
  if(asked.length>=(energy==='brief'?1:2))return null;
  return questions.filter(q=>!asked.includes(q.key)&&!String(fields[q.key]||'').trim()).sort((a,b)=>b.priority/b.cost-a.priority/a.cost)[0]||null;
 }
 function sharedDraft(fields){
  const out={};
  for(const key of ['title','date','owner','details'])out[key]=typeof fields[key]==='string'?fields[key].trim().slice(0,key==='details'?5000:100):'';
  if(!['妈妈','伴侣'].includes(out.owner))out.owner='';
  if(out.date&&!/^\d{4}-\d{2}-\d{2}$/.test(out.date))out.date='';
  return out; // Private expression, evidence, model output and guesses never copied.
 }
 const api={analyze,validateModel,nextQuestion,sharedDraft,categories};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.YunxinPlanner=api;
})(globalThis);
