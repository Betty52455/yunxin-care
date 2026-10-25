'use strict';

function carePreg(){return db.pregnancy||YunxinPregnancy.empty();}
function careAge(){const p=carePreg(),a=YunxinPregnancy.age(p.dueDate,today());return a?`孕 ${a.weeks} 周 + ${a.days} 天`:p.dueDate?'预产期待核对':'孕期档案 · 待完善';}
function careBodyRows(){const p=carePreg();return [...p.entries].sort((a,b)=>b.date.localeCompare(a.date));}
function careLatestWeight(){return YunxinPregnancy.weights(carePreg()).at(-1);}
function careBodyButton(label,action,id='',cls=''){return `<button type="button" class="btn ${cls}" data-care="${action}" data-id="${esc(id)}">${label}</button>`;}
function careHomeView(){
 const own=role==='mother',m=db.moods.find(x=>x.date===today()),w=careLatestWeight();
 const tasks=visibleTasks().filter(x=>x.date===today()&&x.status!=='cancelled');
 const p=carePreg(),visits=own?p.visits.filter(x=>x.date===today()&&!x.done):[];
 return `<div class="care-home"><header class="care-heading"><div><h1>今天</h1><p>${new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</p></div><span class="care-greeting">${db.settings.name?esc(db.settings.name)+'，':''}按自己的节奏，慢慢来。</span></header>
 ${own?`<div class="care-preg-line"><strong>${careAge()}</strong>${p.dueDate?`<span>预产期 ${esc(p.dueDate)}</span>`:careBodyButton('设置预产期','profile','','small ghost')}</div>`:''}
 <section class="care-ask"><form data-form="care-question"><label for="care-question">有什么想问的？</label><div class="care-question-row"><input id="care-question" class="input" name="question" maxlength="2000" placeholder="写下疑问，留待产检或咨询时询问…" required><button class="btn primary" type="submit">保存问题</button></div><small>即时回答尚未接通；问题会存入个人备忘，不会发送给他人。</small></form></section>
 <div class="care-home-grid"><section class="care-paper"><div class="card-header"><h2>今日安排</h2>${own?button('添加安排','task-new','','small ghost','plus'):button('全部协作','go','family','small ghost')}</div>
 ${tasks.length||visits.length?`${tasks.map(t=>`<div class="care-task"><span class="status-ring ${t.status==='completed'?'done':''}">${t.status==='completed'?icon('check'):''}</span><div><strong>${esc(t.title)}</strong><small>${esc(t.time||'时间待商量')} · ${esc(t.owner)}负责</small></div>${iconButton('查看安排','task-open',t.id,'chevron')}</div>`).join('')}${visits.map(v=>`<div class="care-task"><span class="status-ring"></span><div><strong>${esc(v.title)}</strong><small>${esc(v.time||'时间待定')} · 产检安排</small></div>${careBodyButton('查看','visit',v.id,'small ghost')}</div>`).join('')}`:empty('今天还没有安排','有需要时，再加一件小事。','',true)}
 ${own?`<div class="care-memo"><div class="card-header"><h2>快速备忘</h2><a href="#notes" class="text-link">全部备忘 →</a></div><form data-form="quick-note"><label class="sr-only" for="care-memo">备忘内容</label><textarea id="care-memo" name="text" placeholder="先记下一件小事…" maxlength="5000" required></textarea><div class="care-save-row"><button class="btn primary small" type="submit">保存</button></div></form></div>`:''}</section>
 <aside class="care-right"><section class="care-snapshot"><h2>${own?'今日记录':'一起分担'}</h2>${own?`<a href="#records"><span>体重</span><strong>${w?`${w.weight} <small>kg</small>`:'待记录'}</strong></a>${w?`<p class="care-measured">最近测量：${esc(w.date)}</p>`:''}<a href="#mood"><span>睡眠</span><strong>${m?`${m.sleep} <small>小时</small>`:'待记录'}</strong></a><a href="#mood"><span>心情</span><strong>${m?moodWords[m.score-1]:'待记录'}</strong></a><a class="care-record-link" href="#records">查看记录 →</a>`:`<p>听见需要，再接手一件力所能及的小事。</p><a href="#family">查看家庭协作 →</a><a href="#practice">练习好好说话 →</a>`}</section><yunxin-pet compact config="${esc(JSON.stringify(db.settings.pet||{}))}"></yunxin-pet></aside></div>
 <div class="care-bottom"><a href="#mood">看看我的情绪花园 →</a><a href="#notes">写下想问的问题</a></div></div>`;
}

function careWeightChart(){
 const rows=YunxinPregnancy.weights(carePreg());if(!rows.length)return empty('还没有体重记录','保存第一条测量后，这里会展示变化。','',true);
 const values=rows.map(x=>x.weight),lo=Math.floor(Math.min(...values)-1),hi=Math.ceil(Math.max(...values)+1),start=YunxinPregnancy.day(rows[0].date),end=YunxinPregnancy.day(rows.at(-1).date);
 const x=r=>rows.length===1?290:45+(YunxinPregnancy.day(r.date)-start)/Math.max(1,end-start)*480,y=v=>140-(v-lo)/(hi-lo)*115;
 return `<svg class="care-chart" viewBox="0 0 570 178" role="img" aria-label="体重变化，横轴为测量日期，纵轴为公斤。${esc(rows.map(r=>r.date+' '+r.weight+'公斤').join('；'))}">${[0,1,2].map(i=>{const v=lo+(hi-lo)*i/2;return `<line x1="45" x2="525" y1="${y(v)}" y2="${y(v)}" class="grid-line"/><text x="5" y="${y(v)+4}">${v.toFixed(1)}</text>`;}).join('')}<path d="${rows.map((r,i)=>`${i?'L':'M'}${x(r)} ${y(r.weight)}`).join(' ')}" class="weight-line"/>${rows.map(r=>`<circle cx="${x(r)}" cy="${y(r.weight)}" r="3.5"><title>${esc(r.date)}：${r.weight} kg</title></circle>`).join('')}<text x="45" y="169">${esc(rows[0].date)}</text>${rows.length>1?`<text x="455" y="169">${esc(rows.at(-1).date)}</text>`:''}</svg>`;
}
function careRecordsView(){
 return `${head('孕期记录','记录身体的变化，产检时更容易说清楚。',careBodyButton('孕期信息','profile','','small'))}${careRecordsBody()}`;
}
function careRecordsBody(){
 const p=carePreg(),rows=careBodyRows(),weights=YunxinPregnancy.weights(p),last=weights.at(-1),first=weights[0];
 const change=last&&p.preWeight!==null?+(last.weight-p.preWeight).toFixed(1):null;
 return `<section class="care-record-top"><div><strong>${careAge()}</strong><p>${p.dueDate?'预产期 '+esc(p.dueDate):'以医生确认的预产期为准，可随时修改。'}</p></div><div><span>最近体重</span><strong>${last?last.weight+' kg':'—'}</strong></div><div><span>较孕前变化</span><strong>${change===null?'—':(change>0?'+':'')+change+' kg'}</strong></div>${careBodyButton('记录身体情况','entry','','primary')}</section><div class="care-record-grid"><div class="stack"><section class="care-paper"><div class="card-header"><h2>体重变化</h2><span class="subtle">单位：kg</span></div>${careWeightChart()}<p class="small-copy">${weights.length>1?`从 ${esc(first.date)} 到 ${esc(last.date)}，变化 ${(last.weight-first.weight).toFixed(1)} kg，共 ${weights.length} 次测量。`:'持续记录后，可以回顾一段时间内的变化。'}这里只展示记录与差值，不判断是否达标。</p></section><section class="care-paper"><div class="card-header"><h2>身体记录</h2><span class="subtle">${rows.length} 条</span></div>${rows.length?rows.map(r=>`<article class="record"><div class="record-head"><strong>${esc(r.date)}</strong><div class="row-controls">${careBodyButton('编辑','entry',r.id,'small ghost')}${careBodyButton('删除','remove-entry',r.id,'small ghost')}</div></div><div class="actions">${r.weight!==null?`<span class="pill">体重 ${r.weight} kg</span>`:''}${r.systolic!==null?`<span class="pill blue">血压 ${r.systolic}/${r.diastolic} mmHg</span>`:''}</div>${r.note?`<p>${esc(r.note)}</p>`:''}</article>`).join(''):empty('今天的记录，从一项开始','体重、血压或身体感受，都可以单独记录。','',true)}</section></div><div class="stack"><section class="care-paper"><div class="card-header"><h2>产检安排</h2>${careBodyButton('添加','visit','','small')}</div>${p.visits.length?[...p.visits].sort((a,b)=>a.date.localeCompare(b.date)).map(v=>`<div class="care-visit"><span class="pill ${v.done?'':'warm'}">${v.done?'已完成':v.date<today()?'待核对':'待完成'}</span><h3>${esc(v.title)}</h3><p>${esc(v.date)} ${esc(v.time)}</p>${v.note?`<p>${esc(v.note)}</p>`:''}<div class="actions">${careBodyButton('编辑','visit',v.id,'small ghost')}${careBodyButton(v.done?'设为待完成':'标记完成','visit-toggle',v.id,'small ghost')}${careBodyButton('删除','remove-visit',v.id,'small ghost')}</div></div>`).join(''):empty('还没有产检安排','按自己的预约日期添加。','',true)}</section><a class="care-paper care-linked" href="#mood"><h2>${icon('heart')} 心情与睡眠</h2><p>原有的心情记录、睡眠趋势和历史记录都保留在这里。</p><span>去记录 →</span></a><a class="text-link" href="#settings">导出或恢复全部记录 →</a></div></div>`;
}
function careProfileModal(){const p=carePreg();showModal('孕期信息',`<form data-form="care-profile">${inputField('dueDate','医生确认的预产期',p.dueDate,'date','required')}
 <div class="form-grid">${inputField('preWeight','孕前体重（kg，选填）',p.preWeight??'','number','min="20" max="300" step="0.1"')}${inputField('height','身高（cm，选填）',p.height??'','number','min="80" max="230" step="0.1"')}</div><p class="small-copy">孕周按预产期倒推 40 周估算，不替代产检结论。医生调整预产期后，可在这里更新。</p>${footerButtons('保存孕期信息')}</form>`);}
function careEntryModal(id=''){const r=carePreg().entries.find(x=>x.id===id);showModal(r?'修改身体记录':'记录身体情况',`<form data-form="care-entry" data-id="${esc(id)}">${inputField('date','测量日期',r?.date||today(),'date',`required max="${today()}"`)}${inputField('weight','体重（kg，选填）',r?.weight??'','number','min="20" max="300" step="0.1"')}<div class="form-grid">${inputField('systolic','高压（mmHg，选填）',r?.systolic??'','number','min="40" max="300" step="1"')}${inputField('diastolic','低压（mmHg，选填）',r?.diastolic??'','number','min="20" max="200" step="1"')}</div>${textField('note','身体感受或备注（选填）',r?.note||'','例如：测量时间、今天的感受、产检想问的问题')}<p class="small-copy">至少填写一项；血压需成对填写。记录不会自动作诊断。</p>${footerButtons()}</form>`);}
function careVisitModal(id=''){const v=carePreg().visits.find(x=>x.id===id);showModal(v?'修改产检安排':'添加产检安排',`<form data-form="care-visit" data-id="${esc(id)}">${inputField('title','安排名称',v?.title||'','text','required maxlength="100" placeholder="例如：产检复诊"')}<div class="form-grid">${inputField('date','预约日期',v?.date||today(),'date','required')}${inputField('time','预约时间（选填）',v?.time||'','time')}</div>${textField('note','地点、准备事项或想问的问题',v?.note||'')}${footerButtons('保存安排')}</form>`);}
document.addEventListener('click',async e=>{const el=e.target.closest('[data-care]');if(!el||!db||busy)return;const action=el.dataset.care,id=el.dataset.id;if(role==='partner')return toast('请切换到妈妈视角后操作',true);
 if(action==='profile')return careProfileModal();if(action==='entry')return careEntryModal(id);if(action==='visit')return careVisitModal(id);
 if(action==='visit-toggle'){if(await commit(d=>{const v=d.pregnancy.visits.find(x=>x.id===id);v.done=!v.done;}))render();return;}
 if(action==='remove-entry'||action==='remove-visit')return showModal('删除这条孕期记录？',`<p>需要保留时，请先到“我的”导出备份。</p><div class="modal-footer">${button('保留','close')}${careBodyButton('确认删除',action+'-confirm',id,'danger')}</div>`);
 if(action==='remove-entry-confirm'||action==='remove-visit-confirm'){const key=action==='remove-entry-confirm'?'entries':'visits';if(await commit(d=>{d.pregnancy[key]=d.pregnancy[key].filter(x=>x.id!==id);},'记录已删除')){closeModal();render();}}
});
document.addEventListener('submit',async e=>{
 const form=e.target.closest('[data-form^="care-"]');if(!form||form.dataset.form==='care-weather')return;e.preventDefault();e.stopImmediatePropagation();if(busy)return;if(role==='partner')return toast('请切换到妈妈视角后操作',true);
 const kind=form.dataset.form,id=form.dataset.id,data=Object.fromEntries(new FormData(form)),submit=form.querySelector('[type="submit"]');for(const k in data)data[k]=data[k].trim();const original=submit.textContent;submit.disabled=true;submit.textContent='正在保存…';
 try{let ok=false;const numeric=k=>data[k]===''?null:Number(data[k]);
 if(kind==='care-question'){
  if(!data.question)throw Error('先写下想问的问题。');ok=await commit(d=>d.notes.push({id:uid(),title:'待询问：'+data.question.slice(0,24),text:data.question,pinned:false,created:stamp(),updated:stamp()}),'问题已保存到备忘录；尚未发送或生成回答');
 }else{
  const next=structuredClone(carePreg());
  if(kind==='care-profile'){next.dueDate=data.dueDate;next.preWeight=numeric('preWeight');next.height=numeric('height');}
  if(kind==='care-entry'){
   if(data.date>today())throw Error('身体记录请选择今天或过去的日期。');const duplicate=next.entries.find(x=>x.date===data.date&&x.id!==id);if(duplicate)throw Error('这一天已有身体记录，请先关闭窗口，编辑该日期的记录。');
   const row={id:id||uid(),date:data.date,weight:numeric('weight'),systolic:numeric('systolic'),diastolic:numeric('diastolic'),note:data.note};if(id)next.entries[next.entries.findIndex(x=>x.id===id)]=row;else next.entries.push(row);
  }
  if(kind==='care-visit'){const old=next.visits.find(x=>x.id===id),row={id:id||uid(),date:data.date,time:data.time,title:data.title,note:data.note,done:old?.done||false};if(id)next.visits[next.visits.findIndex(x=>x.id===id)]=row;else next.visits.push(row);}
  YunxinPregnancy.validate(next);ok=await commit(d=>{d.pregnancy=next;});
 }
 if(ok){closeModal();render();}
 }catch(err){showFormError(form,err.message||'保存没有完成，请重试。');}finally{submit.disabled=false;submit.textContent=original;}
},true);
