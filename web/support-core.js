/* Original scenario content. Branching interaction inspired by Ink; no Ink code bundled. */
(function(root){
  'use strict';
  const stories={
    pregnancy:{title:'产检前，想有人陪我',stage:'孕期',icon:'calendar',minutes:3,
      scene:'明天要产检，小禾反复查看预约信息。她对伴侣说：“我有点担心，今晚脑子停不下来。”',
      mother:'我还没整理清楚担心什么。比起立刻听到结论，我希望有人认真听，也想商量明天是否有人陪同。',
      partner:'我很想让她安心，但不知道她想听建议，还是想让我陪她一起去。我明天也需要协调工作。',
      question:'如果你是伴侣，会先怎样回应？',
      choices:[
        {id:'reassure',label:'“别想太多，肯定没事的。”',reflection:'这句话可能出于关心，但没有了解她在担心什么，也无法保证检查结果。可以先听完，再一起整理想问医生的问题。'},
        {id:'listen',label:'“我愿意听。你想先说说，还是一起商量明天怎么安排？”',reflection:'这给了她选择的空间。接下来仍要由她确认需要，陪同的时间也要双方商量。'},
        {id:'plan',label:'“我来帮你查资料，你先睡吧。”',reflection:'查资料是一种可能的支持，但未必是她现在想要的。先询问她希望得到什么，可以避免信息越查越多。'}],
      bridge:'把“想有人陪我”说清楚，可以从陪同、倾听或一起整理提问中选一件。时间不确定时，先留待商量。',category:'陪伴'},
    postpartum:{title:'事情做完了，我还是很累',stage:'产后',icon:'moon',minutes:3,
      scene:'晚饭后，小禾请伴侣收拾餐桌，想安静休息一会儿。伴侣一边收拾，一边不断询问每件东西放哪里。',
      mother:'事情确实在做，但我一直要回答和提醒，还是没有休息下来。我想说出这一点，也担心对方觉得我不领情。',
      partner:'我担心做得不合适，所以不断确认。我还没有意识到，反复提问也会让她继续操心。',
      question:'如果你是伴侣，知道她仍然很累后，会怎样回应？',
      choices:[
        {id:'defend',label:'“我都做完了，你怎么还不满意？”',reflection:'这把“完成”与“有帮助”混在了一起。可以承认事情完成了，同时听听过程中还有什么负担。'},
        {id:'ask',label:'“那你把每一步写给我，我照着做。”',reflection:'清楚的说明有时有用，但把所有计划工作交给她，也可能增加负担。可以由接手的人先提出做法，再一起确认必要的部分。'},
        {id:'own',label:'“原来你还得一直操心。下次我先说说准备怎么做，我们一起确认。”',reflection:'这开始把准备和执行一起接过来。具体哪些问题需要确认、哪些可以自行处理，仍应由双方商量。'}],
      bridge:'下次安排可以同时写清“一件具体的事”和“怎样减少反复提醒”。完成情况、帮助感受、协调负担分别记录。',category:'实际帮忙'}
  };
  function preferences(settings){return {stage:settings.stage?.includes('产后')?'postpartum':'pregnancy',energy:'normal',history:true,...settings.support};}
  function validate(value){
    const fail=()=>{throw new Error('陪伴偏好或练习进度格式不正确');};
    if(!value||typeof value!=='object'||Array.isArray(value))fail();
    if(!['pregnancy','postpartum','preconception'].includes(value.stage)||!['brief','normal'].includes(value.energy)||typeof value.history!=='boolean')fail();
    if(value.drafts!==undefined){
      if(!value.drafts||typeof value.drafts!=='object'||Array.isArray(value.drafts))fail();
      for(const [id,d] of Object.entries(value.drafts)){
        if(!stories[id]||!d||!['mother','partner'].includes(d.perspective)||!Number.isInteger(d.step)||d.step<0||d.step>2||!['',...stories[id].choices.map(c=>c.id)].includes(d.choice)||(d.step>0&&!d.choice))fail();
      }
    }
    return value;
  }
  function recent(rows){return rows.map((row,index)=>({row,index})).sort((a,b)=>String(a.row.updated||a.row.created||'').localeCompare(String(b.row.updated||b.row.created||''))||a.index-b.index).slice(-5).map(x=>x.row);}
  function rankLegacy(state,library){
    const pref=preferences(state.settings),need=state.needs.at(-1)?.category;
    const limit=pref.energy==='brief'?Math.min(3,state.settings.available):state.settings.available;
    return library.filter(a=>a.minutes<=limit).map(a=>{
      const activity=pref.history?recent(state.activities.filter(x=>x.activityId===a.id)):[];
      const tasks=pref.history?recent(state.tasks.filter(t=>t.category===a.category&&t.feedback).map(t=>({...t.feedback,id:t.id}))):[];
      const parts=[
        {label:'最近确认的需要',value:a.category===need?4:0},
        {label:'你选择的偏好',value:a.category===state.settings.preferred?2:0},
        {label:'这项活动的反馈',value:activity.reduce((v,x)=>v+(x.help==='有帮助'?1:x.help==='不适合'?-1:0),0)},
        {label:'同类安排的帮助感受',value:tasks.reduce((v,x)=>v+(x.help==='有帮助'?1:x.help==='没有帮助'?-1:0),0)},
        {label:'同类安排的协调负担',value:-tasks.filter(x=>x.burden==='较多').length}
      ];
      const reasons=parts.filter(x=>x.value).map(x=>`${x.label}${x.value>0?'提升':'降低'}了排序`);
      return {...a,score:parts.reduce((v,x)=>v+x.value,0),parts,historyCount:activity.length+tasks.length,
        reason:reasons.join('；')||`适合目前留出的 ${limit} 分钟`,historyEnabled:pref.history,limit};
    }).sort((a,b)=>b.score-a.score);
  }
  const helpValue={'有帮助':1,'一般':0,'没有帮助':-1,'不适合':-1};
  const burdenValue={'没有':0,'一点':0.5,'较多':1};
  function validateContext(c){
    if(!c||typeof c!=='object'||!['pregnancy','postpartum','preconception'].includes(c.stage))throw Error('反馈阶段格式不正确');
    return c;
  }
  function estimate(rows,key,values,now){
    let sum=0,mass=0,count=0;
    for(const x of rows){
      if(!Object.hasOwn(values,x[key]))continue;
      const time=Date.parse(x.updated||x.created||'');if(!Number.isFinite(time)||time>now)continue;
      const days=(now-time)/86400000,weight=2**(-days/30);
      sum+=weight*values[x[key]];mass+=weight;count++;
    }
    return {value:sum/(2+mass),count,mass}; // neutral prior mass 2, half-life 30 days
  }
  function rank(state,library,now=Date.now()){
    const pref=preferences(state.settings),need=state.needs.at(-1)?.category;
    const limit=pref.energy==='brief'?Math.min(3,state.settings.available):state.settings.available;
    const relevant=x=>x.context?.stage===pref.stage;
    return library.filter(a=>a.minutes<=limit).map(a=>{
      const allA=state.activities.filter(x=>x.activityId===a.id);
      const allT=state.tasks.filter(t=>t.category===a.category&&t.feedback).map(t=>t.feedback);
      const act=pref.history?recent(allA.filter(relevant)):[],tasks=pref.history?recent(allT.filter(relevant)):[];
      const ah=estimate(act,'help',helpValue,now),th=estimate(tasks,'help',helpValue,now),tb=estimate(tasks,'burden',burdenValue,now);
      const lambda=pref.energy==='brief'?2:1;
      const parts=[{label:'最近确认的需要',value:a.category===need?4:0},{label:'你选择的偏好',value:a.category===state.settings.preferred?2:0},
        {label:'这项活动的反馈',value:ah.value},{label:'同类安排的帮助感受',value:th.value},{label:'同类安排的协调负担',value:-lambda*tb.value}];
      const score=parts.reduce((v,x)=>v+x.value,0);
      const reason=parts.filter(x=>x.value).map(x=>`${x.label}${x.value>0?'提升':'降低'}了排序`).join('；')||`适合目前留出的 ${limit} 分钟`;
      const counted=[...act,...tasks].filter(x=>(Object.hasOwn(helpValue,x.help)||Object.hasOwn(burdenValue,x.burden))&&Number.isFinite(Date.parse(x.updated||x.created))&&Date.parse(x.updated||x.created)<=now).length;
      return {...a,score,parts,reason,limit,historyEnabled:pref.history,historyCount:counted,
        excludedCount:pref.history?allA.length+allT.length-act.length-tasks.length:0,algorithm:'context-shrink-v2',lambda,
        evidenceMass:ah.mass+Math.max(th.mass,tb.mass)};
    }).sort((a,b)=>b.score-a.score||a.minutes-b.minutes||a.id.localeCompare(b.id));
  }
  const api={stories,preferences,validate,validateContext,rank,rankLegacy,estimate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.YunxinSupport=api;
})(globalThis);
