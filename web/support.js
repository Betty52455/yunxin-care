'use strict';
const supportButton=(label,action,id='',kind='')=>`<button type="button" class="btn ${kind}" data-support="${action}" data-id="${esc(id)}">${label}</button>`;
function supportPrefs(){return YunxinSupport.preferences(db.settings);}
function supportChoice(name,label,values,current){
  return `<fieldset class="support-choices"><legend>${label}</legend>${values.map(([value,text])=>`<label><input type="radio" name="${name}" value="${value}" ${value===current?'checked':''}><span>${text}</span></label>`).join('')}</fieldset>`;
}
function supportStoryCards(){
  const pref=role==='mother'?supportPrefs():{stage:'pregnancy'},stories=Object.entries(YunxinSupport.stories).sort(([a],[b])=>(b===pref.stage)-(a===pref.stage));
  return `<section class="spaced support-stories"><div class="card-header"><h2>换个视角，试着理解</h2><span class="subtle">原创虚构情境 · 随时可退出</span></div><div class="two-col">${stories.map(([id,s])=>`<article class="card support-story-card"><span class="pill">${s.stage} · 约 ${s.minutes} 分钟</span><h3>${icon(s.icon)} ${s.title}</h3><p>${s.scene}</p>${supportButton(supportDraft(id)?'继续上次情境':'进入情境','story',id,'primary small')}</article>`).join('')}</div></section>`;
}
function supportHubView(){
  const p=supportPrefs(),own=role==='mother';
  return `${head('陪伴支持','先照顾此刻的你，再决定下一步。',`<a class="text-link" href="#help">${icon('lifebuoy')}需要帮助</a>`)}
    ${own?`<section class="card support-welcome"><div><span class="eyebrow">按自己的节奏</span><h2>今天想从哪里开始</h2><p>不必先填心情，也不必完成练习。直接说出需要，同样可以。</p></div><form data-form="support-preferences">
    ${supportChoice('stage','我现在的阶段',[['preconception','备孕'],['pregnancy','孕期'],['postpartum','产后']],p.stage)}
    ${supportChoice('energy','此刻愿意花多少精力',[['brief','只想简单一点'],['normal','可以慢慢来']],p.energy)}
    <button type="submit" class="btn small">保存选择</button></form></section>
    <section class="support-entry-grid spaced" aria-label="选择支持方式">
      <button class="support-entry" data-support="one-line">${icon('note')}<strong>只想记一句</strong><span>写下来，先不分析</span></button>
      <button class="support-entry" data-action="go" data-id="support">${icon('sun')}<strong>留一点时间给自己</strong><span>${p.energy==='brief'?'先看看 1—3 分钟的小行动':'按可用时间选择，可随时结束'}</span></button>
      <button class="support-entry" data-support="guide">${icon('people')}<strong>我想获得帮助</strong><span>自己确认需要，再商量安排</span></button>
    </section>${p.stage==='preconception'?`<div class="panel-note spaced">${icon('book')}<span>备孕时可以先整理担忧和想咨询的问题，按自己的意愿决定是否、何时生育。下面的孕期与产后故事也可提前了解。</span></div>`:''}`:
    `<div class="panel-note">${icon('people')}<span>先练习理解，再商量怎样接手。故事角色是虚构人物，不代表对方的真实想法。</span></div>`}
    ${supportStoryCards()}
    <section class="card spaced"><div class="card-header"><h2>${own&&p.stage==='postpartum'?'产后支持工具箱':'原来的支持工具，都在这里'}</h2></div><div class="support-tools">${own&&p.stage==='postpartum'?`${button('先给自己一分钟','activity','small-pause','small','moon')}<a href="#mood">${icon('heart')}心情与睡眠${icon('chevron')}</a>${supportButton('整理想说的话','nvc','','small')}`:''}${[['needs','我的需要','leaf'],['family','家庭协作','people'],['practice','沟通练习','chat'],['support','日常支持','sun'],['help','求助信息','lifebuoy']].filter(([id])=>own||!['needs','support'].includes(id)).map(([id,label,ico])=>`<a href="#${id}">${icon(ico)}${label}${icon('chevron')}</a>`).join('')}</div></section>
    <p class="small-copy spaced">情境与日常练习用于整理感受和沟通，不作诊断或治疗。持续困扰或影响生活时，可以向专业人员求助。<a href="#help">查看求助信息</a></p>`;
}
// Original interface inspired by low-friction journaling and the NVC four-part framework.
// No third-party implementation, book quotations or Skill prompts are bundled.
function supportOneLineModal(){
  showModal('只想记一句',`<form data-form="support-one-line" class="support-mini-form"><p>不需要取标题，也不用先选心情。写一句就可以保存。</p>${textField('text','想留下的话','','此刻有什么想记下来…','required')}<p class="small-copy">保存在我的备忘中，之后可以补充和修改。</p>${footerButtons('保存这句话')}</form>`);
}
function supportNvcCard(){
  if(role!=='mother')return '';
  return `<section class="card support-nvc-card spaced"><div><h2>${icon('chat')}把想说的话整理一下</h2><p>观察、感受、需要、请求。可以只写一项，也可以留给自己。</p></div>${supportButton('开始整理','nvc','','small')}</section>`;
}
const supportNvcField=(...args)=>textField(...args).replace('maxlength="5000"','maxlength="4000"');
function supportNvcModal(){
  showModal('按自己的节奏整理表达',`<form data-form="support-nvc" class="support-mini-form"><p>这是一种表达框架，没有标准答案。任何一项都可留空，也不要求你改变自己的真实感受。</p><div class="support-nvc-fields">
    ${supportNvcField('observation','观察 · 具体发生了什么（选填）','','例如：今晚收拾餐桌时，我又回答了几次东西放在哪里。')}
    ${supportNvcField('feeling','感受 · 我此刻的感觉（选填）','','例如：疲惫、委屈，也有些不知道怎样开口。')}
    ${supportNvcField('need','需要 · 我更希望得到什么（选填）','','例如：有一段不用解释和提醒的休息时间。')}
    ${supportNvcField('request','请求 · 我想与对方商量什么（选填）','','例如：下次你先想一个收拾的办法，我们再确认必要的地方，可以吗？')}
    </div><p class="small-copy">只保存你填写的内容，不自动改写，也不分享给家人。需要协作时，再到“我的需要”确认并填写准备分享的安排。</p>${footerButtons('保存我的表达')}</form>`);
}

function supportDraft(id){
  if(role==='mother')return supportPrefs().drafts?.[id];
  try{return JSON.parse(sessionStorage.getItem('yx-partner-stories')||'{}')[id];}catch{return null;}
}
async function supportSaveDraft(id,draft){
  if(role==='partner'){
    try{const drafts=JSON.parse(sessionStorage.getItem('yx-partner-stories')||'{}');drafts[id]=draft;sessionStorage.setItem('yx-partner-stories',JSON.stringify(drafts));return true;}
    catch{toast('练习进度没有保存，请检查浏览器存储权限',true);return false;}
  }
  return commit(d=>{const p=YunxinSupport.preferences(d.settings);p.drafts={...p.drafts,[id]:draft};d.settings.support=p;},'情境进度已保存，可随时继续');
}
function supportStoryModal(id){
  const s=YunxinSupport.stories[id],d=supportDraft(id);if(!s||!d)return;
  const chosen=s.choices.find(c=>c.id===d.choice);
  const perspective=`<div class="support-perspectives" role="group" aria-label="查看故事视角">${[['mother','妈妈视角'],['partner','伴侣视角']].map(([v,l])=>`<button class="btn small ${d.perspective===v?'primary':''}" type="button" data-support="perspective" data-id="${id}:${v}" aria-pressed="${d.perspective===v}">${l}</button>`).join('')}</div><div class="quote-box"><strong>${d.perspective==='mother'?'故事里的妈妈':'故事里的伴侣'}在想</strong><p>${s[d.perspective]}</p></div>`;
  const body=d.step===0?`${perspective}<h3>${s.question}</h3><div class="support-options">${s.choices.map(c=>supportButton(c.label,'choose',`${id}:${c.id}`)).join('')}</div>`:
    d.step===1?`${perspective}<p>你刚才选择：${chosen.label}</p><div class="support-reflection" role="status">${chosen.reflection}</div><p class="small-copy">这是一个可能的理解，不是标准答案，也不预测真实家庭成员的反应。</p><div class="actions">${supportButton('换一种回应试试','back',id)}${supportButton('看看怎样用于生活','next',id,'primary')}</div>`:
    `<div class="support-reflection">${s.bridge}</div><p>可以先问：“你希望我听一听，还是一起商量具体怎么做？”</p><p class="small-copy">不必完成任何安排才算练习结束。此处不会自动分享。</p><div class="actions">${role==='mother'?supportButton('整理我自己的需要','guide-from-story',id,'primary'):supportButton('查看已分享的安排','family')}${supportButton(role==='mother'?'保存这次回顾':'结束练习','finish',id)}</div>`;
  showModal(s.title,`<div class="support-scene" data-scene="${id}"><div class="inline-end"><span class="pill">${s.stage} · ${d.step+1} / 3</span><span class="subtle">${role==='mother'?'选择后保存进度':'本标签页保留进度'}</span></div><div class="support-narrator"><img src="/assets/plush-bob.png" alt="陪伴小人"><p>陪你看一段日常<br><small>你可以换个视角，也可以随时暂停</small></p></div><p>${s.scene}</p>${body}<div class="modal-footer">${supportButton('暂停，稍后继续','pause')}${supportButton('从头再来','restart',id,'ghost')}</div><small>原创虚构情境，不使用私人记录，不评判好坏。</small></div>`);
  $('#modal .modal-body').scrollTop=0;
  requestAnimationFrame(()=>$('#modal .support-scene button')?.focus());
}
let supportGuideState=null;
function supportGuideModal(category=''){
  supportGuideState={fields:{},asked:[],stopped:false,version:0};
  showModal('把需要说清楚',`<p>先用离线规则整理可能的需要，由你确认。也可以直接填写，不需要完成追问。</p><form data-form="support-guide">
    ${textField('expression','此刻想说的话（默认不分享给家人）','','例如：每天晚上都要我提醒，真的很累。','required')}
    <div class="actions">${supportButton('帮我整理可能的需要','analyze','','small')}</div><div id="need-analysis" class="spaced" aria-live="polite"></div><div id="need-model"></div>
    <div class="field"><label for="support-category">现在更希望得到什么</label><select name="category" id="support-category" required><option value="">请自己选择</option>${option(categories,'')}</select></div>
    ${category?`<p class="small-copy">刚才的故事涉及${esc(category)}，你的实际需要仍由你决定。</p>`:''}
    <label class="check-row"><input name="confirmed" type="checkbox" required>我确认这符合自己的需要，原始表达不自动分享</label>
    <label class="check-row spaced"><input name="arrange" type="checkbox">保存后，我想继续商量一个具体安排</label>
    <div class="spaced">${supportButton('帮我补充安排信息（可跳过）','question','','small ghost')}</div>
    <div id="need-question" class="spaced" aria-live="polite"></div><div id="need-preview" class="small-copy spaced"></div>
    <p class="small-copy">简单模式最多问 1 次，普通模式最多问 2 次；不知道就留空。这里只预填你在安排问题中主动填写的内容。</p>
    ${footerButtons('确认并保存需要')}</form>`);
  const current=supportGuideState;
  if(!globalThis.YunxinStorage)fetch('/api/model/status').then(r=>r.ok?r.json():null).then(c=>{
    if(current!==supportGuideState||!c?.enabled||!$('#need-model'))return;
    $('#need-model').innerHTML=`<label class="check-row spaced"><input type="checkbox" name="modelConsent">本次允许将上面这句话发送给 ${esc(c.destination)} 上配置的模型</label>${supportButton('使用已配置模型整理','model','','small ghost')}`;
  }).catch(()=>{});
}
function supportShowAnalysis(result){
  const target=$('#need-analysis');if(!target)return;
  target.innerHTML=`<div class="support-reflection"><strong>${result.source==='model'?'模型候选 · 尚未确认':'离线规则整理 · 尚未确认'}</strong><p>${esc(result.question)}</p>${result.candidates.length?result.candidates.map(c=>`<p><strong>${esc(c.category)}</strong> · 参考原文“${esc(c.evidence.join('、'))}”</p>`).join(''):'<p>没有找到明确线索，请自己选择，不会猜测你的需要。</p>'}<small>候选可能误解否定、转述或复杂表达。请修改选择；此处不会代你诊断或安排事情。</small></div>`;
}
function supportQuestion(){
  const form=$('[data-form="support-guide"]');if(!form||!supportGuideState)return;
  const state=supportGuideState;
  if(!form.elements.category.value||!form.elements.arrange.checked){$('#need-question').textContent='请先选择需要，并勾选想继续商量安排；也可以直接保存需要。';return;}
  const q=YunxinPlanner.nextQuestion({...state,category:form.elements.category.value,arrange:true,energy:supportPrefs().energy});state.current=q;
  if(!q){$('#need-question').textContent='这次先问到这里。其余内容留空，你可以保存需要后再商量。';return;}
  const control=q.type==='owner'?selectField('clarify-answer',q.label,['','妈妈','伴侣'],''):inputField('clarify-answer',q.label,'',q.type==='date'?'date':'text','maxlength="100"');
  $('#need-question').innerHTML=`<div class="support-reflection">${control}<div class="actions">${supportButton('记下这个回答','answer','','small')}${supportButton('暂不确定，跳过','skip-question','','small ghost')}${supportButton('先问到这里','stop-questions','','small ghost')}</div></div>`;
}
async function supportGuideAction(action){
  const form=$('[data-form="support-guide"]'),s=supportGuideState;if(!form||!s)return;
  if(action==='analyze'||action==='model'){
    const expression=form.elements.expression.value.trim();if(!expression)return showFormError(form,'请先写下此刻想说的话。');
    form.elements.confirmed.checked=false;
    if(action==='analyze'){s.version++;supportShowAnalysis(YunxinPlanner.analyze(expression));return;}
    if(!form.elements.modelConsent?.checked)return showFormError(form,'请先确认本次发送，也可以使用离线整理。');
    const version=++s.version;$('#need-analysis').textContent='正在整理，可继续自行填写…';
    try{
      const response=await fetch('/api/need-proposal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:expression,consent:true}),signal:AbortSignal.timeout(25000)});
      const data=await response.json();if(!response.ok)throw Error(data.error||'模型暂不可用');
      if(s!==supportGuideState||s.version!==version||!form.isConnected||form.elements.expression.value.trim()!==expression)return;
      supportShowAnalysis(YunxinPlanner.validateModel(data.result,expression));
    }catch(error){if(form.isConnected&&s.version===version){supportShowAnalysis(YunxinPlanner.analyze(expression));toast('模型没有返回可用结果，已切回离线规则，请自行核对。',true);}}
    return;
  }
  if(action==='question')return supportQuestion();
  if(action==='stop-questions'){s.stopped=true;return supportQuestion();}
  if(action==='answer'||action==='skip-question'){
    if(!s.current)return;
    const value=form.elements['clarify-answer']?.value?.trim()||'';
    if(action==='answer'&&!value)return showFormError(form,'可以填写回答，或选择暂不确定。');
    if(action==='answer')s.fields[s.current.key]=value;
    s.asked.push(s.current.key);s.current=null;
    const draft=YunxinPlanner.sharedDraft(s.fields);
    $('#need-preview').textContent=`已主动填写：${Object.values(draft).filter(Boolean).join('；')||'暂无'}。未填写的内容保持空白。`;
    supportQuestion();
  }
}
document.addEventListener('input',e=>{
  const form=e.target.closest('[data-form="support-guide"]');if(!form||!supportGuideState)return;
  if(['expression','category'].includes(e.target.name))form.elements.confirmed.checked=false;
  if(e.target.name==='expression'){supportGuideState.version++;$('#need-analysis').textContent='表达已修改，请重新整理或自行选择。';if(form.elements.modelConsent)form.elements.modelConsent.checked=false;}
});

function supportExplanation(id){
  const a=rankActivities().find(x=>x.id===id);if(!a)return;
  showModal('为什么看到这个建议',`<h3>${esc(a.title)}</h3><p>先筛选 ${a.limit} 分钟内的活动，再按下列规则排序。历史反馈只使用相同阶段的记录，并随时间减弱；少量记录会向中性值收缩。分值只用于排序，不是心理健康评分。</p><table class="preview-table support-explanation-table"><thead><tr><th>参考因素</th><th>排序变化</th></tr></thead><tbody>${a.parts.map(p=>`<tr><td>${p.label}</td><td>${p.value>0?'+':''}${Number(p.value.toFixed(3))}</td></tr>`).join('')}</tbody></table><p>${a.historyEnabled?(a.historyCount?`参考了 ${a.historyCount} 条有明确评价的同阶段反馈，每类最多取最近 5 条。`:'还没有相关反馈，没有据此判断什么对你有效。'):'你已关闭历史反馈参考，本次只使用需要、偏好和时间。'}</p><p class="small-copy">${a.historyEnabled?`另有 ${a.excludedCount} 条因阶段不同、缺少阶段或超过最近 5 条范围而未采用。`:""}简单模式中，协调负担的影响加倍。反馈每过 30 天影响减半；这些是待验证的工程参数。<br>“不确定”不增加帮助分。未评价不等于有帮助。你可以在日常支持中关闭历史参考，也可以修改协作反馈。</p>${button('知道了','close','','primary')}`);
}
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-support]');if(!el||!db||busy)return;
  const action=el.dataset.support,[id,value]=String(el.dataset.id||'').split(':');
  if(['one-line','nvc'].includes(action)){if(role!=='mother')return;return action==='one-line'?supportOneLineModal():supportNvcModal();}
  if(['analyze','model','question','answer','skip-question','stop-questions'].includes(action))return role==='mother'?supportGuideAction(action):undefined;
  if(['guide','guide-from-story','explain'].includes(action)&&role!=='mother')return;
  if(action==='guide'||action==='guide-from-story')return supportGuideModal(action==='guide-from-story'?YunxinSupport.stories[id]?.category:'');
  if(action==='explain')return supportExplanation(id);
  if(action==='pause')return closeModal();
  if(action==='family'){closeModal();go('family');return;}
  const s=YunxinSupport.stories[id];if(!s)return;
  if(action==='restart')return showModal('重新开始这个情境？',`<p>这会替换上次保存的选择，已经保存的练习回顾不受影响。</p><div class="modal-footer">${supportButton('继续原来的进度','story',id)}${supportButton('确认重新开始','restart-confirm',id,'primary')}</div>`);
  let d=structuredClone(supportDraft(id)||{step:0,perspective:'mother',choice:''});
  if(action==='story'&&supportDraft(id))return supportStoryModal(id);
  if(action==='restart-confirm')d={step:0,perspective:'mother',choice:''};
  if(action==='perspective')d.perspective=value;
  if(action==='choose'){d.choice=value;d.step=1;}
  if(action==='back'){d.choice='';d.step=0;}
  if(action==='next')d.step=2;
  if(action==='finish'){
    if(role==='mother'){
      const ok=await commit(state=>{state.practices.push({id:uid(),scenario:id,text:`情境回顾：${s.title}\n我尝试的回应：${s.choices.find(c=>c.id===d.choice)?.label}\n${s.bridge}`,created:stamp()});delete state.settings.support.drafts[id];},'练习回顾已保存到沟通练习');
      if(!ok)return;
    }else{try{const drafts=JSON.parse(sessionStorage.getItem('yx-partner-stories')||'{}');delete drafts[id];sessionStorage.setItem('yx-partner-stories',JSON.stringify(drafts));}catch{}toast('练习已结束，没有写入妈妈的私人记录');}
    closeModal();render();return;
  }
  if(await supportSaveDraft(id,d))supportStoryModal(id);
});
document.addEventListener('submit',async e=>{
  const form=e.target.closest('[data-form^="support-"]');if(!form||!['support-preferences','support-guide','support-one-line','support-nvc'].includes(form.dataset.form))return;
  e.preventDefault();e.stopImmediatePropagation();if(busy||role!=='mother')return;
  const data=Object.fromEntries(new FormData(form));
  if(form.dataset.form==='support-one-line'){
    const text=String(data.text||'').trim();if(!text)return showFormError(form,'写下一句话就可以保存。');
    if(await commit(d=>d.notes.push({id:uid(),title:`随手记 · ${today()}`,text,pinned:false,created:stamp(),updated:stamp()}),'这句话已保存到我的备忘')){closeModal();go('notes');}return;
  }
  if(form.dataset.form==='support-nvc'){
    const fields=[['observation','观察'],['feeling','感受'],['need','需要'],['request','请求']];
    const text=fields.filter(([key])=>String(data[key]||'').trim()).map(([key,label])=>`${label}：${data[key].trim()}`).join('\n\n');
    if(!text)return showFormError(form,'可以只写一项，不需要全部填完。');
    if(await commit(d=>d.practices.push({id:uid(),scenario:'nvc',text,created:stamp()}),'表达已保存到沟通练习，尚未分享')){closeModal();go('practice');}return;
  }
  if(form.dataset.form==='support-preferences'){
    if(await commit(d=>{d.settings.support={...YunxinSupport.preferences(d.settings),stage:data.stage,energy:data.energy};},'已按你的选择调整入口'))render();return;
  }
  if(!data.expression?.trim()||!categories.includes(data.category)||data.confirmed!=='on')return showFormError(form,'请写下感受、选择需要，并由你确认。');
  const id=uid();
  if(await commit(d=>d.needs.push({id,category:data.category,text:data.expression.trim(),created:stamp()}),'需要已保存，尚未分享')){
    if(data.arrange==='on')taskModal('',id,YunxinPlanner.sharedDraft(supportGuideState?.fields||{}));else{closeModal();go('needs');}
  }
},true);
