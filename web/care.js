'use strict';
const careNavs=[['home','首页','home'],['care','陪伴支持','heart'],['records','孕期记录','calendar'],['community','孕妈社区','people'],['my','我的','settings']];
const careGroups={care:['care','needs','family','practice','support','help'],records:['records','mood'],my:['my','notes','settings']};
function careSection(){return Object.keys(careGroups).find(k=>careGroups[k].includes(page))||page;}
function careSubnav(){const keys=careGroups[careSection()];if(!keys)return '';return `<nav class="care-subnav" aria-label="${esc(careNavs.find(x=>x[0]===careSection())[1])}子导航">${keys.map(k=>`<a href="#${k}" ${page===k?'aria-current="page"':''}>${esc(navs.find(x=>x[0]===k)[1])}</a>`).join('')}</nav>`;}
function carePreg(){return db.pregnancy||YunxinPregnancy.empty();}
function careAge(){const p=carePreg(),a=YunxinPregnancy.age(p.dueDate,today());return a?`孕 ${a.weeks} 周 + ${a.days} 天`:p.dueDate?'请核对预产期':'还没有设置孕期信息';}
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
 <div class="care-bottom"><a href="#community">去孕妈社区聊聊 →</a><a href="#help">需要帮助</a></div></div>`;
}
function careHubView(){return supportHubView();}
function careMyView(){return `${head('我的','个人偏好、备忘和备份，都在这里。')}<section class="care-paper"><a class="care-hub-row" href="#notes">${icon('note')}<div><h2>备忘录</h2><p>${db.notes.length} 条备忘 · 包括保存的问题</p></div>${icon('chevron')}</a><a class="care-hub-row" href="#settings">${icon('settings')}<div><h2>数据与设置</h2><p>个人偏好、切换视角、导出备份、恢复数据</p></div>${icon('chevron')}</a></section><p class="small-copy spaced">目前记录保存在${typeof YunxinStorage==='undefined'?'当前电脑':'当前浏览器'}。邮箱账号和跨设备同步尚未启用。</p>`;}
function careWeightChart(){
 const rows=YunxinPregnancy.weights(carePreg());if(!rows.length)return empty('还没有体重记录','保存第一条测量后，这里会展示变化。','',true);
 const values=rows.map(x=>x.weight),lo=Math.floor(Math.min(...values)-1),hi=Math.ceil(Math.max(...values)+1),start=YunxinPregnancy.day(rows[0].date),end=YunxinPregnancy.day(rows.at(-1).date);
 const x=r=>rows.length===1?290:45+(YunxinPregnancy.day(r.date)-start)/Math.max(1,end-start)*480,y=v=>140-(v-lo)/(hi-lo)*115;
 return `<svg class="care-chart" viewBox="0 0 570 178" role="img" aria-label="体重变化，横轴为测量日期，纵轴为公斤。${esc(rows.map(r=>r.date+' '+r.weight+'公斤').join('；'))}">${[0,1,2].map(i=>{const v=lo+(hi-lo)*i/2;return `<line x1="45" x2="525" y1="${y(v)}" y2="${y(v)}" class="grid-line"/><text x="5" y="${y(v)+4}">${v.toFixed(1)}</text>`;}).join('')}<path d="${rows.map((r,i)=>`${i?'L':'M'}${x(r)} ${y(r.weight)}`).join(' ')}" class="weight-line"/>${rows.map(r=>`<circle cx="${x(r)}" cy="${y(r.weight)}" r="3.5"><title>${esc(r.date)}：${r.weight} kg</title></circle>`).join('')}<text x="45" y="169">${esc(rows[0].date)}</text>${rows.length>1?`<text x="455" y="169">${esc(rows.at(-1).date)}</text>`:''}</svg>`;
}
function careRecordsView(){
 const p=carePreg(),rows=careBodyRows(),weights=YunxinPregnancy.weights(p),last=weights.at(-1),first=weights[0];
 const change=last&&p.preWeight!==null?+(last.weight-p.preWeight).toFixed(1):null;
 return `${head('孕期记录','记录身体的变化，产检时更容易说清楚。',careBodyButton('孕期信息','profile','','small'))}<section class="care-record-top"><div><strong>${careAge()}</strong><p>${p.dueDate?'预产期 '+esc(p.dueDate):'以医生确认的预产期为准，可随时修改。'}</p></div><div><span>最近体重</span><strong>${last?last.weight+' kg':'—'}</strong></div><div><span>较孕前变化</span><strong>${change===null?'—':(change>0?'+':'')+change+' kg'}</strong></div>${careBodyButton('记录身体情况','entry','','primary')}</section><div class="care-record-grid"><div class="stack"><section class="care-paper"><div class="card-header"><h2>体重变化</h2><span class="subtle">单位：kg</span></div>${careWeightChart()}<p class="small-copy">${weights.length>1?`从 ${esc(first.date)} 到 ${esc(last.date)}，变化 ${(last.weight-first.weight).toFixed(1)} kg，共 ${weights.length} 次测量。`:'持续记录后，可以回顾一段时间内的变化。'}这里只展示记录与差值，不判断是否达标。</p></section><section class="care-paper"><div class="card-header"><h2>身体记录</h2><span class="subtle">${rows.length} 条</span></div>${rows.length?rows.map(r=>`<article class="record"><div class="record-head"><strong>${esc(r.date)}</strong><div class="row-controls">${careBodyButton('编辑','entry',r.id,'small ghost')}${careBodyButton('删除','remove-entry',r.id,'small ghost')}</div></div><div class="actions">${r.weight!==null?`<span class="pill">体重 ${r.weight} kg</span>`:''}${r.systolic!==null?`<span class="pill blue">血压 ${r.systolic}/${r.diastolic} mmHg</span>`:''}</div>${r.note?`<p>${esc(r.note)}</p>`:''}</article>`).join(''):empty('今天的记录，从一项开始','体重、血压或身体感受，都可以单独记录。','',true)}</section></div><div class="stack"><section class="care-paper"><div class="card-header"><h2>产检安排</h2>${careBodyButton('添加','visit','','small')}</div>${p.visits.length?[...p.visits].sort((a,b)=>a.date.localeCompare(b.date)).map(v=>`<div class="care-visit"><span class="pill ${v.done?'':'warm'}">${v.done?'已完成':v.date<today()?'待核对':'待完成'}</span><h3>${esc(v.title)}</h3><p>${esc(v.date)} ${esc(v.time)}</p>${v.note?`<p>${esc(v.note)}</p>`:''}<div class="actions">${careBodyButton('编辑','visit',v.id,'small ghost')}${careBodyButton(v.done?'设为待完成':'标记完成','visit-toggle',v.id,'small ghost')}${careBodyButton('删除','remove-visit',v.id,'small ghost')}</div></div>`).join(''):empty('还没有产检安排','按自己的预约日期添加。','',true)}</section><a class="care-paper care-linked" href="#mood"><h2>${icon('heart')} 心情与睡眠</h2><p>原有的心情记录、睡眠趋势和历史记录都保留在这里。</p><span>去记录 →</span></a><a class="text-link" href="#settings">导出或恢复全部记录 →</a></div></div>`;
}
function careProfileModal(){const p=carePreg();showModal('孕期信息',`<form data-form="care-profile">${inputField('dueDate','医生确认的预产期',p.dueDate,'date','required')}
 <div class="form-grid">${inputField('preWeight','孕前体重（kg，选填）',p.preWeight??'','number','min="20" max="300" step="0.1"')}${inputField('height','身高（cm，选填）',p.height??'','number','min="80" max="230" step="0.1"')}</div><p class="small-copy">孕周按预产期倒推 40 周估算，不替代产检结论。医生调整预产期后，可在这里更新。</p>${footerButtons('保存孕期信息')}</form>`);}
function careEntryModal(id=''){const r=carePreg().entries.find(x=>x.id===id);showModal(r?'修改身体记录':'记录身体情况',`<form data-form="care-entry" data-id="${esc(id)}">${inputField('date','测量日期',r?.date||today(),'date',`required max="${today()}"`)}${inputField('weight','体重（kg，选填）',r?.weight??'','number','min="20" max="300" step="0.1"')}<div class="form-grid">${inputField('systolic','高压（mmHg，选填）',r?.systolic??'','number','min="40" max="300" step="1"')}${inputField('diastolic','低压（mmHg，选填）',r?.diastolic??'','number','min="20" max="200" step="1"')}</div>${textField('note','身体感受或备注（选填）',r?.note||'','例如：测量时间、今天的感受、产检想问的问题')}<p class="small-copy">至少填写一项；血压需成对填写。记录不会自动作诊断。</p>${footerButtons()}</form>`);}
function careVisitModal(id=''){const v=carePreg().visits.find(x=>x.id===id);showModal(v?'修改产检安排':'添加产检安排',`<form data-form="care-visit" data-id="${esc(id)}">${inputField('title','安排名称',v?.title||'','text','required maxlength="100" placeholder="例如：产检复诊"')}<div class="form-grid">${inputField('date','预约日期',v?.date||today(),'date','required')}${inputField('time','预约时间（选填）',v?.time||'','time')}</div>${textField('note','地点、准备事项或想问的问题',v?.note||'')}${footerButtons('保存安排')}</form>`);}
document.addEventListener('click',async e=>{const el=e.target.closest('[data-care]');if(!el||!db||busy)return;const action=el.dataset.care,id=el.dataset.id;if(role==='partner')return toast('请切换到妈妈视角后操作',true);
 if(action==='profile')return careProfileModal();if(action==='entry')return careEntryModal(id);if(action==='visit')return careVisitModal(id);
 if(action==='visit-toggle'){if(await commit(d=>{const v=d.pregnancy.visits.find(x=>x.id===id);v.done=!v.done;}))render();return;}
 if(action==='remove-entry'||action==='remove-visit')return showModal('删除这条孕期记录？',`<p>需要保留时，请先到数据与设置导出备份。</p><div class="modal-footer">${button('保留','close')}${careBodyButton('确认删除',action+'-confirm',id,'danger')}</div>`);
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

// Public-source summaries. Names and avatar seeds are generated display aliases, not user accounts.
const communityPosts=[
  {
    "id": "rest",
    "category": "生活照顾",
    "title": "累的时候，允许自己慢一点",
    "intro": "孕期容易疲倦，尤其在早期。休息和接受帮助，也是照顾自己的一部分。",
    "body": [
      "把休息留进日程，愿意帮忙的家人可以分担家务。睡前少喝含咖啡因的饮品，给自己一个安静的收尾。",
      "孕晚期可以用枕头支撑身体；从孕 28 周起，建议侧卧入睡，左右侧都可以。醒来发现仰卧，不必惊慌，转回侧卧即可。若睡眠问题持续困扰你，可咨询产检医生。"
    ],
    "prompt": "今天有哪些事情，可以请身边的人分担？",
    "source": "Tiredness and sleep problems",
    "url": "https://www.nhs.uk/pregnancy/common-symptoms/tiredness/",
    "name": "暖暖的栗子",
    "avatar": 42416
  },
  {
    "id": "feelings",
    "category": "心情陪伴",
    "title": "不是每天都开心，也没有关系",
    "intro": "孕期会有期待，也会有不安。感受值得被听见，不必强迫自己时刻保持好心情。",
    "body": [
      "可以找信任的人聊聊，也给喜欢的小事留一点时间。参加适合自己的孕期课程，有时也能增加交流和支持。",
      "如果情绪持续低落，或已经影响日常生活，请告诉产检医生或心理健康专业人员。获得帮助不需要等到自己撑不住。"
    ],
    "prompt": "最近有什么小事，让你觉得被照顾到了？",
    "source": "Mental health in pregnancy",
    "url": "https://www.nhs.uk/pregnancy/mental-health-in-pregnancy-and-after-the-birth/mental-health/",
    "name": "向阳小麦",
    "avatar": 37253
  },
  {
    "id": "food",
    "category": "生活照顾",
    "title": "好好吃饭，不必“一人吃两份”",
    "intro": "孕期饮食重在均衡和多样，不是简单地把每顿饭翻倍。",
    "body": [
      "主食、蔬果、蛋白质食物和奶类或合适替代品，可以一起组成日常饮食。保持规律吃饭，慢慢调整搭配。",
      "比起追求某一种“神奇食物”，更值得关注一段时间内是否吃得多样。若已有医生制定的饮食方案，按个人方案安排。"
    ],
    "prompt": "你想给明天的餐桌增加哪一种食物？",
    "source": "Healthy eating in pregnancy",
    "url": "https://www.nhs.uk/best-start-in-life/pregnancy/healthy-eating-in-pregnancy/",
    "name": "晚风里的小橘",
    "avatar": 55784
  },
  {
    "id": "visit",
    "category": "产检准备",
    "title": "产检前，留一张自己的提问清单",
    "intro": "产检不仅是做检查，也可以聊身体感受、情绪和让你担心的事情。",
    "body": [
      "提前记下想问的问题，到了诊室更容易把需要说清楚。如果愿意，也可以请伴侣陪同。",
      "检查和复诊安排以当地医院及个人情况为准。有让你担心的变化，不必等到下一次预约才联系医疗团队。"
    ],
    "prompt": "下次产检，你最想问清楚哪一件事？",
    "source": "Your antenatal care and appointments",
    "url": "https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-care-and-appointments/",
    "name": "软糖与晴天",
    "avatar": 50430
  },
  {
    "id": "walk",
    "category": "生活照顾",
    "title": "活动一点点，也算在照顾自己",
    "intro": "孕期活动可以从适合自己的轻缓运动开始，不需要追赶别人的步数。",
    "body": [
      "如果孕前很少运动，就从轻缓、短时间的活动逐渐开始。散步等日常活动也有价值，强度以还能交谈为参考，累了就休息。",
      "有健康问题、妊娠并发症或医生限制活动时，先向产检团队确认适合的方式。运动中出现不适，应停止并咨询。"
    ],
    "prompt": "哪一种轻松的活动，会让你更愿意出门？",
    "source": "Exercise in pregnancy",
    "url": "https://www.nhs.uk/pregnancy/keeping-well/exercise/",
    "name": "山茶听雨",
    "avatar": 78650
  },
  {
    "id": "partner",
    "category": "心情陪伴",
    "title": "陪伴，可以是一件具体的小事",
    "intro": "一起准备、一起了解孕期变化，能让支持更具体。",
    "body": [
      "伴侣可以一起参加孕期课程、提前熟悉去医院的路线，也可以在适合的情况下陪同散步、准备均衡的饭菜。",
      "避免让孕妈接触二手烟，也是实实在在的支持。整理建议：从上面选一件双方都认可的事，放进家庭协作安排。"
    ],
    "prompt": "你最希望伴侣接手哪一件具体的事？",
    "source": "Advice for partners",
    "url": "https://www.nhs.uk/best-start-in-life/pregnancy/advice-for-partners/",
    "name": "棉花小朵",
    "avatar": 35888
  },
  {
    "id": "weight",
    "category": "生活照顾",
    "title": "体重记录，是线索，不是评分",
    "intro": "每个人孕期体重变化不同，有疑问时，把记录带给医生一起看。",
    "body": [
      "孕期增加的重量不仅来自脂肪，也与胎儿生长等变化有关。体重增加过多或过少，都值得结合个人情况讨论。",
      "不建议为了追赶某个数字自行节食减重。吃得均衡、按医生建议活动，具体增重目标请由产检团队结合孕前情况评估。"
    ],
    "prompt": "下次产检，可以把哪些体重变化带给医生看？",
    "source": "Weight gain in pregnancy",
    "url": "https://www.nhs.uk/pregnancy/keeping-well/weight-gain/",
    "name": "薄荷小圆",
    "avatar": 6274
  },
  {
    "id": "bag",
    "category": "产检准备",
    "title": "待产包，先装真正用得上的东西",
    "intro": "从证件资料、舒适衣物、洗漱用品和宝宝用品开始，按医院清单慢慢准备。",
    "body": [
      "可以准备产检资料、宽松衣物、拖鞋、洗漱用品、手机和充电器；宝宝的衣物、尿布和回家所需用品也别忘了。",
      "整理建议：先向分娩医院核对要求，再按“妈妈、宝宝、陪同人”分装。不必一次买齐，实际用品和数量以医院安排及个人需要为准。"
    ],
    "prompt": "有没有一件能让你住院时更安心的小物品？",
    "source": "Hospital bag checklist",
    "url": "https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/hospital-bag-checklist/",
    "name": "月亮晒被子",
    "avatar": 75158
  },
  {
    "id": "anxiety",
    "category": "心情陪伴",
    "title": "担心停不下来时，不用独自硬撑",
    "intro": "偶尔担心很常见；如果焦虑持续影响睡眠和生活，就值得认真寻求支持。",
    "body": [
      "持续紧张、难以放松、睡不好或难以集中注意力，都可以向医生说明。是否需要治疗，应由专业人员评估。",
      "支持方式可能包括心理治疗，必要时也可能涉及药物。正在用药时不要自行停药或调整剂量，和医生共同商量。"
    ],
    "prompt": "你愿意先向哪一个信任的人说说近况？",
    "source": "Anxiety in pregnancy",
    "url": "https://www.nhs.uk/pregnancy/mental-health-in-pregnancy-and-after-the-birth/anxiety-in-pregnancy/",
    "name": "一颗青柚",
    "avatar": 42224
  },
  {
    "id": "kitchen",
    "category": "生活照顾",
    "title": "厨房里的几个小习惯，让吃饭更安心",
    "intro": "注意食物是否熟透、是否经过杀菌，以及冷藏和保质要求。",
    "body": [
      "避免生肉或未熟透的肉类，奶制品留意是否经过巴氏杀菌等适当处理。买回来的即食食品按包装要求冷藏，并在食用期限内吃完。",
      "孕期需要留意的食物不止这些。拿不准某种食物时，可查看权威资料或询问医疗人员，不必照搬网络上的极端忌口清单。"
    ],
    "prompt": "家里哪一个食品保存习惯，可以一起调整？",
    "source": "Foods to avoid in pregnancy",
    "url": "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/",
    "name": "橙花慢慢开",
    "avatar": 31077
  }
];
let communityCategory='全部';
function communityAvatar(p){
 const n=p.avatar,bg=['#edf0df','#f6e8df','#ede8f3','#e4eef1','#f5edda'][n%5],hair=['#65564b','#4f5045','#795b49'][n%3],shirt=['#91a692','#bb9480','#9998b0','#819eac'][n%4];
 return `<svg class="community-avatar" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="${bg}"/><path d="M9 48q0-17 15-17t15 17" fill="${shirt}"/><path d="M12 28V19q0-15 12-15t12 15v12H12" fill="${hair}"/>${n%2?`<circle cx="12" cy="11" r="6" fill="${hair}"/><circle cx="36" cy="11" r="6" fill="${hair}"/>`:''}<ellipse cx="24" cy="22" rx="10" ry="12" fill="#f3d4bc"/><path d="M13 18Q13 4 25 7q11 1 11 12-8-2-12-8-4 7-11 7" fill="${hair}"/><circle cx="20" cy="23" r="1" fill="#5e5148"/><circle cx="28" cy="23" r="1" fill="#5e5148"/><path d="M21 28q3 3 6 0" fill="none" stroke="#a57063" stroke-linecap="round"/><ellipse cx="17" cy="27" rx="2" ry="1" fill="#e9afa5"/><ellipse cx="31" cy="27" rx="2" ry="1" fill="#e9afa5"/><circle cx="33" cy="13" r="3" fill="${shirt}"/></svg>`;
}
function communitySaved(p){return role==='mother'&&db.notes.some(n=>n.id==='community-'+p.id);}
function communityButton(action,p,label){return `<button type="button" class="btn small ghost" data-community="${action}" data-id="${esc(p.id)}" ${action==='save'&&communitySaved(p)?'disabled':''}>${label}</button>`;}
function communitySource(p){return `<a class="community-source" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">来源：NHS · ${esc(p.source)} ↗</a>`;}
function careCommunityView(){
 const categories=['全部',...new Set(communityPosts.map(p=>p.category))],posts=communityPosts.filter(p=>communityCategory==='全部'||p.category===communityCategory);
 return `${head('孕妈社区','读一点孕期日常，也给自己一点温柔。')}<div class="community-wrap"><div class="community-intro"><div><strong>给准妈妈的 10 个小话题</strong><p>依据公开健康资料整理；昵称与头像为随机生成的展示化名，并非真实用户发帖。</p></div><a class="text-link" href="#notes">我的备忘 →</a></div><nav class="community-filters" aria-label="社区话题分类">${categories.map(c=>`<button type="button" data-community="filter" data-category="${esc(c)}" aria-pressed="${c===communityCategory}">${esc(c)}</button>`).join('')}<span aria-live="polite">${posts.length} 条话题</span></nav><div class="community-feed">${posts.map(p=>`<article class="community-post"><header>${communityAvatar(p)}<div><strong>${esc(p.name)}</strong><small>资料分享 · 展示化名</small></div><span class="pill">${esc(p.category)}</span></header><h2><button type="button" data-community="read" data-id="${esc(p.id)}">${esc(p.title)}</button></h2><p>${esc(p.intro)}</p><footer>${communitySource(p)}<div>${communityButton('save',p,communitySaved(p)?'已收藏到备忘':'收藏到备忘')}${communityButton('read',p,'阅读全文 →')}</div></footer></article>`).join('')}</div><p class="community-footnote">内容供日常了解与交流参考，个人健康问题请咨询产检医生。收藏仅进入个人备忘，不会公开发布。</p></div>`;
}
function communityRead(p){showModal(esc(p.title),`<article class="community-reading"><header>${communityAvatar(p)}<div><strong>${esc(p.name)}</strong><small>资料分享 · 展示化名</small></div></header><p class="community-lead">${esc(p.intro)}</p>${p.body.map(t=>`<p>${esc(t)}</p>`).join('')}<aside><strong>留给自己的一个小问题</strong><p>${esc(p.prompt)}</p></aside>${communitySource(p)}<p class="small-copy">根据英国 NHS 公开资料中文概述，非原文转载；具体照护以本地医疗团队建议为准。</p><div class="modal-footer">${button('关闭','close')}${communityButton('save',p,communitySaved(p)?'已收藏到备忘':'收藏到备忘')}</div></article>`);}
document.addEventListener('click',async e=>{
 const el=e.target.closest('[data-community]');if(!el||!db||busy)return;
 if(el.dataset.community==='filter'){communityCategory=el.dataset.category;render();document.querySelector(`[data-category="${communityCategory}"]`)?.focus();return;}
 const p=communityPosts.find(p=>p.id===el.dataset.id);if(!p)return;
 if(el.dataset.community==='read')return communityRead(p);
 if(el.dataset.community==='save'){
  if(role!=='mother')return toast('请切换到妈妈视角后收藏到个人备忘',true);
  if(communitySaved(p))return toast('这条话题已在你的备忘录中');
  el.disabled=true;
  const ok=await commit(d=>d.notes.push({id:'community-'+p.id,title:p.title,text:[p.intro,...p.body,'留给自己的问题：'+p.prompt,'来源：NHS · '+p.source,p.url,'以上为公开资料整理，展示化名不代表真实用户。'].join('\n\n'),pinned:false,created:stamp(),updated:stamp()}),'已收藏到个人备忘');
  if(ok){const modalOpen=$('#modal').open;render();if(modalOpen)communityRead(p);}else el.disabled=false;
 }
});
