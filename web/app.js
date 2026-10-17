'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const uid = () => crypto.randomUUID();
const stamp = () => new Date().toISOString();
const fmtDate = date => new Date(date.length === 10 ? date+'T12:00:00' : date).toLocaleDateString('zh-CN', {month:'long',day:'numeric'});
const categories = ['倾听','休息','实际帮忙','信息','陪伴'];
const moodWords = ['很低落','有点累','还可以','挺好的','很开心'];
const statusNames = {draft:'尚未分享',waiting:'等待伴侣确认',accepted:'已接受',in_progress:'进行中',completed:'已完成',cancelled:'已取消 / 拒绝',proposed:'等待妈妈确认修改'};
const navs = [
  ['home','首页','home'],['mood','心情与睡眠','heart'],['needs','我的需要','leaf'],['family','家庭协作','people'],
  ['practice','沟通练习','chat'],['support','日常支持','sun'],['help','求助信息','lifebuoy'],['notes','备忘录','note'],['settings','数据与设置','settings'],['care','陪伴支持','heart'],['records','孕期记录','calendar'],['community','孕妈社区','people'],['my','我的','settings']
];
const paths = {
  home:'m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9',
  heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  leaf:'M20 3C10 2 3 7 5 14c2 7 15 6 15-11ZM4 21 15 10',
  people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  chat:'M21 11a8 8 0 0 1-8 8H7l-5 3 1-7a8 8 0 1 1 18-4ZM7 10h10M7 14h6',
  sun:'M12 3V1m0 22v-2M3 12H1m22 0h-2M4.2 4.2l1.5 1.5m12.6 12.6 1.5 1.5m0-15.6-1.5 1.5M5.7 18.3l-1.5 1.5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  lifebuoy:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5.6 5.6l3.6 3.6m5.6 5.6 3.6 3.6M18.4 5.6l-3.6 3.6m-5.6 5.6-3.6 3.6',
  note:'M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9M16 3l5 5-10 10-5 1 1-5L17 4M7 7h4',
  settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  lock:'M5 10h14v11H5V10ZM8 10V7a4 4 0 0 1 8 0v3M12 14v3',
  arrow:'M5 12h14m-5-5 5 5-5 5', chevron:'m9 5 7 7-7 7', down:'m6 9 6 6 6-6',
  check:'m5 12 4 4L19 6', plus:'M12 5v14M5 12h14', close:'m6 6 12 12M6 18 18 6',
  calendar:'M4 5h16v16H4V5ZM8 2v6m8-6v6M4 10h16M8 14h2m4 0h2m-8 3h2',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 6v6l4 2',
  moon:'M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z',
  trash:'M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  edit:'m15 4 5 5M3 21l5-1L21 7l-5-5L3 15v6Z',
  pin:'m9 3 9 6-3 3v5l-3 1-6-4-1-3 4-1 3-5M9 16l-5 6',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
  info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6m0-10v1',
  book:'M12 5C8 2 4 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1Zm0 0v15',
  cup:'M4 5h12v8a6 6 0 0 1-12 0V5Zm12 1h2a3 3 0 0 1 0 6h-2M3 21h16',
  flower:'M12 9c-7-12-15 3-4 5-9 9 8 15 8 3 12 2 12-14 0-10-1-10-12-7-4 2ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6',
  search:'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0ZM15 15l6 6',
  refresh:'M21 4v6h-6M3 20v-6h6M5 8a8 8 0 0 1 13-3l3 5M3 14l3 5a8 8 0 0 0 13-3'
};
const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.leaf}"/></svg>`;
const face = score => `<svg class="face" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor"><circle cx="20" cy="20" r="16"/><path d="M13 15h.1M27 15h.1" stroke-width="3" stroke-linecap="round"/><path d="${['M13 28Q20 17 27 28','M14 26Q20 20 26 26','M14 25h12','M13 23Q20 31 27 23','M12 22Q20 35 28 22Z'][score-1]}" stroke-linecap="round"/></svg>`;
const button = (label, action, id='', kind='', ico='') => `<button type="button" class="btn ${kind}" data-action="${action}" data-id="${esc(id)}">${ico?icon(ico):''}${label}</button>`;
const iconButton = (label, action, id, ico) => `<button type="button" class="icon-button" aria-label="${esc(label)}" title="${esc(label)}" data-action="${action}" data-id="${esc(id)}">${icon(ico)}</button>`;
const empty = (title, desc='', action='', compact=false) => `<div class="empty ${compact?'compact':''}">${icon('leaf')}<strong>${title}</strong>${desc?`<p>${desc}</p>`:''}${action}</div>`;
const panel = (text, warm=false) => `<div class="panel-note ${warm?'warm':''}">${icon(warm?'info':'lock')}<span>${text}</span></div>`;
const head = (title, desc, action='') => `<div class="main-title"><div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
const option = (values, value) => values.map(x => `<option value="${esc(x)}" ${x===value?'selected':''}>${esc(x)}</option>`).join('');
let fieldNumber=0;
const selectField = (name, label, values, value) => { const id=`f-${name}-${++fieldNumber}`;return `<div class="field"><label for="${id}">${label}</label><select id="${id}" name="${name}">${option(values,value)}</select></div>`; };
const feedbackField=(name,label,values,value='')=>{const id=`f-${name}-${++fieldNumber}`;return `<div class="field"><label for="${id}">${label}</label><select id="${id}" name="${name}" required><option value="" ${value?'':'selected'} disabled>请选择，也可以暂不评价</option>${option(values,value)}</select></div>`;};
const inputField = (name,label,value='',type='text',extra='') => { const id=`f-${name}-${++fieldNumber}`;return `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`; };
const textField = (name,label,value='',placeholder='',extra='') => { const id=`f-${name}-${++fieldNumber}`;return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" name="${name}" placeholder="${esc(placeholder)}" maxlength="5000" ${extra}>${esc(value)}</textarea></div>`; };
const footerButtons = (label='保存记录') => `<div class="modal-footer">${button('取消','close')}<button class="btn primary" type="submit">${label}</button></div>`;
let db, revision = 0, busy = false, toastTimer, timerInterval, timerEnd;
let role = sessionStorage.getItem('yx-role') === 'partner' ? 'partner' : 'mother';
let page = location.hash.slice(1) || 'home';
let taskFilter = 'active', noteQuery = '', trendDays = 7, selectedMood = 3, quickMood = null;
let pendingTask = null, pendingImport = null;
let activeActivity = null;

const activityLibrary = [
  {id:'small-pause',title:'先给自己一分钟',category:'休息',minutes:1,icon:'moon',desc:'不必完成练习，只给自己一个暂时停下来的间隙。',steps:['如果环境允许，暂时放下手头的事，选择舒服的位置。','保持自然呼吸，不要求自己马上变得开心。','想结束时就结束，也可以直接向可信赖的人请求帮助。']},
  {id:'one-question',title:'整理一个担忧',category:'信息',minutes:3,icon:'note',desc:'把此刻最想问清楚的问题记下来，不必一次解决所有事。',steps:['在备忘录中写下一个正在困扰你的问题。','区分已经知道的情况与还不确定的部分，不用猜测答案。','可以带着问题咨询合适的专业人员，也可以先保存，稍后再看。']},
  {id:'quiet',title:'给自己一小段安静',category:'休息',minutes:5,icon:'moon',desc:'把手头的事情放一放，给今天留一个不用完成任务的间隙。',steps:['选择一个舒服的位置，让身体得到支撑。','把手机和待办暂时放在一边，保持自然呼吸。','不必要求自己立刻放松。结束时，留意此刻最需要什么。']},
  {id:'listen',title:'只听我说一会儿',category:'倾听',minutes:10,icon:'chat',desc:'先约定今天只需要倾听，把解决问题的建议暂时留到以后。',steps:['问对方现在是否有十分钟，愿不愿意听你说一会儿。','说明需要：“我想先说完，暂时不需要建议。”','结束前，请对方用自己的话确认听到了什么。没有合适的人时，也可以先写下来。']},
  {id:'handoff',title:'把一件小事交出去',category:'实际帮忙',minutes:5,icon:'people',desc:'选一件今天最想有人接手的小事，说清做到什么程度就可以。',steps:['挑选一件具体的小事，例如收拾餐桌。','说明时间和完成标准，不用列出所有家务。','询问对方是否愿意接手；如果不方便，一起修改时间或范围。']},
  {id:'together',title:'安静地陪伴十分钟',category:'陪伴',minutes:10,icon:'cup',desc:'一起坐一会儿，不需要寻找话题，也不需要表现得开心。',steps:['选择一个双方都方便的时间。','可以喝杯水、坐在窗边，或者只是安静待着。','告诉对方什么样的陪伴让你舒服，也允许提前结束。']},
  {id:'questions',title:'把疑问整理成一张卡',category:'信息',minutes:5,icon:'book',desc:'把想询问专业人员的问题写清楚，减轻反复搜索的负担。',steps:['写下现在最困扰你的一个问题。','补充发生的时间、频率和自己的感受，避免自行下诊断。','把问题存进备忘录，留待与合适的专业人员沟通。']},
  {id:'pause',title:'留一刻给今天的自己',category:'休息',minutes:15,icon:'flower',desc:'重新安排一小段属于自己的时间，允许今天少做一点。',steps:['找出一件可以推迟或请人接手的事情。','选择你此刻愿意做的休息方式，不必强迫自己入睡。','结束后记录是否有帮助；不适合的方式，可以换一种。']}
];
const scenarios = [
  {id:'listening',title:'我想被倾听，而不是被指导',icon:'chat',desc:'练习先确认感受，再询问对方需要什么。',scene:'妈妈说：“大家一直告诉我应该怎么做，可我现在只想有人听我说完。”',steps:['先停下来，不急着解释或给建议。','用自己的话确认听到的感受。','询问对方现在希望获得哪种支持。'],example:'“听起来你已经接收了很多建议，有些累了。我愿意先听你说。你想让我只听，还是说完后一起想办法？”'},
  {id:'request',title:'把“帮帮我”说得更具体',icon:'people',desc:'练习表达需要、时间和具体的接手方式。',scene:'妈妈很疲惫，伴侣愿意帮忙，却不知道从哪里开始。',steps:['描述此刻的状态，尽量不使用指责。','说清希望对方接手哪件事、什么时候。','询问对方是否方便，给协商留下空间。'],example:'“我今天很累，想安静休息一下。你今晚八点能接手收拾餐桌吗？收好碗筷并擦干净桌面就可以。如果时间不方便，我们再商量。”'},
  {id:'feedback',title:'事情做完了，但我还是很累',icon:'heart',desc:'练习把感谢、真实感受和下一次的需要分开表达。',scene:'伴侣已经完成安排，但妈妈仍然需要反复提醒，感到额外负担。',steps:['认可对方实际完成的事情。','描述具体哪里仍然消耗精力。','提出下一次可以尝试的一项改变。'],example:'“谢谢你完成了这件事。不过过程中我一直需要提醒，还是没能休息。下次能不能先一起确认步骤，然后由你自己按步骤完成？”'}
];

function toast(message, error=false) {
  clearTimeout(toastTimer);
  if(error && $('#modal').open) showFormError($('#modal').querySelector('form') || $('#modal .modal-body'), message);
  const el = $('#toast'); el.textContent = message; el.className = `toast show ${error?'error':''}`;
  toastTimer = setTimeout(() => { el.className = 'toast'; }, error ? 6500 : 3200);
}
function showFormError(container, message, field=null) {
  let feedback=container.querySelector('.form-feedback');
  if(!feedback){feedback=document.createElement('div');feedback.className='form-feedback';feedback.setAttribute('role','alert');feedback.id=`form-error-${++fieldNumber}`;const footer=container.querySelector('.modal-footer');if(footer)footer.before(feedback);else container.prepend(feedback);}
  feedback.textContent=message;feedback.hidden=false;
  if(field){field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',feedback.id);field.focus();}
  feedback.scrollIntoView({block:'nearest'});
}
document.addEventListener('invalid',event=>{
  const field=event.target,form=field.closest('form[data-form]');if(!form)return;
  event.preventDefault();if(form.querySelector(':invalid')!==field)return;
  const label=field.labels?.[0]?.textContent.trim() || '这一项';
  showFormError(form,field.validity.valueMissing?`还没有保存：请填写「${label}」。`:`还没有保存：请检查「${label}」的格式。`,field);
},true);
document.addEventListener('input',event=>{
  const field=event.target,form=field.closest('form[data-form]');if(!form)return;
  if(field.validity?.valid)field.removeAttribute('aria-invalid');
  const feedback=form.querySelector('.form-feedback');if(feedback && !form.querySelector(':invalid'))feedback.hidden=true;
});
async function api(path, options={}) {
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try {
    const response=await fetch(path,{cache:'no-store',...options,signal:controller.signal});
    const payload=await response.json();
    if(!response.ok){const error=new Error(payload.error||'暂时无法保存');error.status=response.status;throw error;}
    return payload;
  } catch(error) {
    if(error.name==='AbortError')throw new Error('保存请求超时。请保留填写内容，检查启动窗口，再重新读取确认是否已保存。');
    if(error instanceof TypeError)throw new Error('无法连接本地服务。请重新打开启动程序，填写内容仍保留在这里。');
    throw error;
  } finally {clearTimeout(timeout);}
}
async function load() {
  const result=await api('/api/state'); db=result.state; revision=result.revision;
}
async function commit(change, message='已保存到这台电脑', reset=false) {
  if (busy) return false;
  busy=true; document.body.classList.add('saving');
  const next=structuredClone(db);
  try {
    change(next);
    const result=await api('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,state:next,reset})});
    db=result.state; revision=result.revision; toast(message); return true;
  } catch(error) {
    if(error.status===409){await load().catch(()=>{});}
    toast(error.message || '保存失败。请检查本地启动窗口是否还在运行，然后重试。',true); return false;
  } finally {busy=false;document.body.classList.remove('saving');}
}
let modalCloseTimer;
function showModal(title, body) {
  clearTimeout(modalCloseTimer);$('#modal-content').classList.remove('support-leave');
  clearInterval(timerInterval);
  $('#modal-content').innerHTML=`<div class="modal-head"><h2>${title}</h2>${iconButton('关闭','close','','close')}</div><div class="modal-body">${body}</div>`;
  if(!$('#modal').open) $('#modal').showModal();
}
function closeModal(){
  clearInterval(timerInterval);pendingTask=null;pendingImport=null;
  const finish=()=>{$('#modal').close();$('#modal-content').classList.remove('support-leave');};
  clearTimeout(modalCloseTimer);
  if($('#modal .support-scene, #modal .support-mini-form')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){$('#modal-content').classList.add('support-leave');modalCloseTimer=setTimeout(finish,120);}else finish();
}
function go(target){ if(page===target)render(); else location.hash=target; }
function visibleTasks(){return db.tasks.filter(t=>role==='mother'||(t.shared&&!t.revoked));}
function taskPill(t){return `<span class="pill ${t.revoked?'rose':t.status==='completed'?'':t.status==='waiting'||t.status==='proposed'?'warm':t.status==='cancelled'?'gray':'blue'}">${t.revoked?'已撤回分享':t.owner==='妈妈'&&t.status==='draft'?'个人计划':statusNames[t.status]}</span>`;}
function render() {
  if(!db)return;
  if(!navs.some(n=>n[0]===page))page='home';
  renderChrome();
  if(role==='partner'&&['mood','needs','support','notes','records'].includes(page)){
    $('#main').innerHTML=`${head(navs.find(n=>n[0]===page)[1],'每一份感受，都值得被尊重')}<div class="card locked">${icon('lock')}<h2>这是妈妈的个人空间</h2><p>伴侣视角可以查看已分享的协作安排、进行沟通练习和查看求助信息。<br>心情、原始表达、备忘和帮助反馈默认不展示在这里。</p>${button('回到家庭协作','go','family','primary','people')} ${button('切换使用视角','role')}</div>`;
  }else{
    const views={home:careHomeView,care:careHubView,records:careRecordsView,community:careCommunityView,my:careMyView,mood:moodView,needs:needsView,family:familyView,practice:practiceView,support:supportView,help:helpView,notes:notesView,settings:settingsView};
    $('#main').innerHTML=careSubnav()+views[page]();
  }
  document.title=`${navs.find(n=>n[0]===page)[1]} · 孕心智护`;
}
function renderChrome(){
  $('#sidebar').innerHTML=`<a class="brand" href="#home" aria-label="孕心智护首页"><img src="/favicon.svg" alt=""><div><strong>孕心智护</strong><small>YUNXIN CARE</small></div></a><div class="nav-caption">我的支持空间</div><nav class="nav" aria-label="主导航">${careNavs.map(([id,label,ico],i)=>`${i===7?'<div class="nav-divider"></div>':''}<a href="#${id}" class="${careSection()===id?'active':''}" ${careSection()===id?'aria-current="page"':''} title="${label}">${icon(ico)}<span class="nav-label">${label}</span>${careSection()===id?'<i class="nav-dot"></i>':''}</a>`).join('')}</nav><div class="side-note"><div class="note-top">${icon('shield')}只在你的电脑上</div><p>每一份记录，都留在本地。<br>按自己的节奏，慢慢来。</p></div>`;
  $('#topbar').innerHTML=`<div class="breadcrumb"><span>我的空间</span>${icon('chevron')}<b>${navs.find(n=>n[0]===page)[1]}</b></div><div class="top-actions"><div class="local-status"><i class="status-dot"></i>离线可用 · 本地保存</div><button class="role-button" data-action="role"><span class="avatar">${role==='mother'?'妈':'伴'}</span><span>${role==='mother'?'妈妈':'伴侣'}视角</span>${icon('down')}</button></div>`;
}
function homeView(){
  const own=role==='mother'; const current=db.moods.find(m=>m.date===today());
  const tasks=visibleTasks(); const todays=tasks.filter(t=>t.date===today()&&t.status!=='cancelled');
  const active=tasks.filter(t=>!['completed','cancelled'].includes(t.status));
  const dateStr=new Date().toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
  const hello=own?(db.settings.name?`${esc(db.settings.name)}，今天也辛苦了`:'今天，也请好好照顾自己'): '让关心，变成具体的支持';
  const noteCount=db.notes.length;
  const cards=own?[
    ['heart','peach','今日心情',current?moodWords[current.score-1]:'还未记录','每一种感受都值得被看见','mood'],
    ['moon','blue','昨晚睡眠',current?`${current.sleep} <small>小时</small>`:'— <small>小时</small>','休息也很重要','mood'],
    ['people','','待办协作',`${active.length} <small>项</small>`,'让帮助真正发生','family'],
    ['note','purple','我的备忘',`${noteCount} <small>条</small>`,'先记下来，不必都放在心上','notes']
  ]:[
    ['people','','待确认',`${tasks.filter(t=>t.status==='waiting').length} <small>项</small>`,'看看对方分享的需要','family'],
    ['clock','blue','今日安排',`${todays.length} <small>项</small>`,'接手一件具体的小事','family'],
    ['check','peach','已经完成',`${tasks.filter(t=>t.status==='completed').length} <small>项</small>`,'完成后也可以问问感受','family'],
    ['chat','purple','沟通练习','一起学倾听','一次只练习一小步','practice']
  ];
  return `${head('首页','从一件小事开始，让今天轻松一点。',`<span class="date-label">${icon('calendar')}${dateStr}</span>`)}
    <section class="hero"><div class="hero-copy"><div class="eyebrow">A LITTLE CARE, EVERY DAY</div><h2>${hello}</h2><p>${own?'不必每一天都做得很好。<br>在这里，记录感受、说出需要，让身边的人一起分担。':'陪伴不需要完美的答案。<br>从听见需要开始，一起商量，再接手一件力所能及的事。'}</p>${button(own?'记录此刻的心情':'查看已分享的安排','go',own?'mood':'family','primary',own?'heart':'people')}</div><yunxin-pet config="${esc(JSON.stringify(db.settings.pet||{}))}"></yunxin-pet></section>
    <div class="summary-grid">${cards.map(([ico,color,label,value,sub,target])=>`<a class="summary-card" href="#${target}"><div class="tile-icon ${color}">${icon(ico)}</div><div><div class="summary-label">${label}</div><div class="summary-value">${value}</div><div class="summary-sub">${sub}</div></div></a>`).join('')}</div>
    <div class="dashboard-grid"><div class="stack"><section class="card"><div class="card-header"><h2>${icon('calendar')}今日计划 <span class="count">${todays.length} 项</span></h2>${own?button('添加计划','task-new','','small','plus'):`<a class="text-link" href="#family">全部协作 ${icon('chevron')}</a>`}</div>${todays.length?todays.slice(0,5).map(t=>`<div class="list-row"><div class="status-ring ${t.status==='completed'?'done':''}">${t.status==='completed'?icon('check'):''}</div><div class="content"><h3>${esc(t.title)}</h3><p>${esc(t.time||'时间待商量')} · ${esc(t.owner)}负责</p></div>${taskPill(t)}${iconButton('查看安排','task-open',t.id,'chevron')}</div>`).join(''):empty('今天还没有安排','留一点空白也很好。需要时，把想做的小事记在这里。',own?button('添加第一项计划','task-new','','small'):'',true)}${todays.length>5?'<a class="text-link spaced" href="#family">查看完整计划 →</a>':''}</section>
    <section class="card"><div class="card-header"><h2>${icon('leaf')}${own?'给今天的一点支持':'一起练习好好说话'}</h2><a class="text-link" href="#${own?'support':'practice'}">查看更多 ${icon('chevron')}</a></div>${own?rankActivities().slice(0,2).map(a=>`<div class="suggestion"><div class="tile-icon ${a.id==='quiet'?'peach':''}">${icon(a.icon)}</div><div class="content"><h3>${a.title}</h3><p>${a.minutes} 分钟 · ${esc(a.reason)}</p></div>${button('试试看','activity',a.id,'small')}</div>`).join(''):`<p class="small-copy">“你希望我先听你说，还是一起想想办法？”<br>一个简单的问题，可以让支持更贴近对方的需要。</p>${button('开始倾听练习','practice-start','listening','small','chat')}`}</section>
    ${own?`<section class="card"><div class="card-header"><h2>${icon('people')}家庭协作</h2><a class="text-link" href="#family">查看全部 ${icon('chevron')}</a></div><p class="small-copy">${active.length?`还有 ${active.length} 项安排需要关注。双方确认后再开始，完成后再听听彼此的感受。`:'把“你能帮帮我吗”变成一个可以接手的具体请求。'}</p><div class="flow-steps"><span>说出需要</span>→<span>双方确认</span>→<span>接手行动</span>→<span>记录感受</span></div>${button('整理我的需要','go','needs','small','arrow')}</section>`:''}</div>
    <div class="stack">${own?`<section class="card"><div class="card-header"><h2>${icon('heart')}此刻，你感觉怎么样？</h2></div><p class="small-copy">不用想太多，选择最接近的感受。</p><div class="mood-pick">${moodWords.map((w,i)=>`<button class="mood-choice ${current?.score===i+1?'selected':''}" data-action="quick-mood" data-id="${i+1}">${face(i+1)}<span>${w}</span></button>`).join('')}</div><div class="privacy-line">${icon('lock')}仅在妈妈视角中展示</div></section><section class="card"><div class="card-header"><h2>${icon('note')}快速备忘</h2><a class="text-link" href="#notes">全部 ${icon('chevron')}</a></div><form data-form="quick-note"><label class="hidden" for="quick-note">备忘内容</label><textarea id="quick-note" name="text" class="quick-note" placeholder="想问的问题、需要买的东西，或一个小小的念头…" maxlength="5000" required></textarea><div class="inline-end spaced"><span class="subtle">让脑袋轻松一点</span><button type="submit" class="btn small primary">${icon('plus')}存下来</button></div></form></section>`:''}<div class="quote">${icon('flower')}<p>照顾好自己，<br>也是一件很重要的事。</p><small>给今天的你，一点温柔</small></div><a class="panel-note" href="#help">${icon('lifebuoy')}<span>需要更多支持时，不必独自面对。<br><strong>查看我的求助信息 →</strong></span></a></div></div>`;
}
function moodForm(existing){
  selectedMood=quickMood??existing?.score??selectedMood??3; quickMood=null;
  return `<form data-form="mood" data-id="${esc(existing?.id||'')}">${inputField('date','记录日期',existing?.date||today(),'date',`max="${today()}" required`)}<div class="field-label">这一刻的心情</div><div class="mood-pick">${moodWords.map((w,i)=>`<button type="button" class="mood-choice ${selectedMood===i+1?'selected':''}" data-action="mood-select" data-id="${i+1}" aria-pressed="${selectedMood===i+1}">${face(i+1)}<span>${w}</span></button>`).join('')}</div><input type="hidden" name="score" value="${selectedMood}">${inputField('sleep','昨晚大约睡了多久（小时）',existing?.sleep??'','number','min="0" max="24" step="0.5" required placeholder="例如 6.5"')}${textField('note','想多说一点吗？（选填）',existing?.note||'','今天发生了什么，或者现在最想被理解的感受…')}<div class="inline-end"><span class="subtle">一天一条，可随时修改</span><button class="btn primary" type="submit">${existing?'保存修改':'保存记录'}</button></div><div class="privacy-line">${icon('lock')}原始记录不会出现在伴侣视角中</div></form>`;
}
function chart(){
  const dates=Array.from({length:trendDays},(_,i)=>{let d=new Date();d.setDate(d.getDate()-trendDays+1+i);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  const rows=dates.map(d=>db.moods.find(m=>m.date===d));
  if(!rows.some(Boolean))return empty('从第一条记录开始','记录后，这里会显示心情与睡眠的变化。', '',true);
  const x=i=>38+i*(466/(trendDays-1)),yMood=v=>130-(v-1)*25,ySleep=v=>130-v/24*100;
  function line(field,y){let path='',connected=false;rows.forEach((m,i)=>{if(m){path+=`${connected?'L':'M'}${x(i)},${y(m[field])} `;connected=true;}else connected=false;});return path;}
  return `<svg class="chart" viewBox="0 0 550 165" role="img" aria-label="最近 ${trendDays} 天心情与睡眠趋势。左轴心情一到五分，右轴睡眠零到二十四小时；缺少记录的日期不连线。">${[0,1,2,3,4].map(i=>`<line class="grid-line" x1="38" x2="504" y1="${130-i*25}" y2="${130-i*25}"/><text x="12" y="${134-i*25}">${i+1}</text><text x="515" y="${134-i*25}">${i*6}h</text>`).join('')}<path class="mood-line" d="${line('score',yMood)}"/><path class="sleep-line" d="${line('sleep',ySleep)}"/>${rows.map((m,i)=>m?`<circle cx="${x(i)}" cy="${yMood(m.score)}" r="4"><title>${dates[i]}：${moodWords[m.score-1]}，睡眠 ${m.sleep} 小时</title></circle>`:'').join('')}${dates.map((d,i)=>i%Math.ceil(trendDays/7)===0?`<text x="${x(i)-11}" y="156">${Number(d.slice(5,7))}/${Number(d.slice(8))}</text>`:'').join('')}</svg><div class="chart-legend"><span>心情 · 左轴 1—5 分</span><span class="sleep">睡眠 · 右轴 0—24 小时</span></div>`;
}
function moodView(){
  const rows=[...db.moods].sort((a,b)=>b.date.localeCompare(a.date));
  return `${head('心情与睡眠','记录真实的自己，不给感受打对错分。')}<div class="two-col"><section class="card"><div class="card-header"><h2>给今天留一个记录</h2><span class="pill">仅妈妈可见</span></div>${moodForm(db.moods.find(m=>m.date===today()))}</section><div class="stack"><section class="card"><div class="card-header"><h2>最近的变化</h2><div class="tabs"><button class="tab ${trendDays===7?'active':''}" data-action="trend" data-id="7">7 天</button><button class="tab ${trendDays===14?'active':''}" data-action="trend" data-id="14">14 天</button></div></div>${chart()}<p class="small-copy spaced no-margin">这些是你自己的生活记录，用来回顾变化，不代表诊断结果。</p></section><section class="card"><div class="card-header"><h2>过往记录</h2><span class="subtle">共 ${rows.length} 条</span></div>${rows.length?rows.map(m=>`<article class="record"><div class="record-head"><strong>${fmtDate(m.date)}</strong><div class="row-controls">${iconButton('编辑心情记录','mood-edit',m.id,'edit')}${iconButton('删除心情记录','delete',`moods:${m.id}`,'trash')}</div></div><span class="pill">${moodWords[m.score-1]}</span> <span class="pill blue">睡眠 ${m.sleep} 小时</span>${m.note?`<p>${esc(m.note)}</p>`:''}</article>`).join(''):empty('还没有记录','可以从今天开始，也可以补记过去的一天。')}</section></div></div>`;
}
function needsView(){
  return `${head('我的需要','把模糊的“有点难受”，整理成一个明确的需要。',button('记录一个需要','need-new','','primary','plus'))}<div class="two-col"><div class="stack"><section class="card"><div class="card-header"><h2>先问问自己，需要什么？</h2></div><p class="small-copy">不必马上解决所有问题。选择此刻最贴近的一项，再写下你的感受；只有你自己确认的需要，才会用于后续安排。</p><div class="chips">${categories.map(c=>button(c,'need-new',c,'chip')).join('')}</div><div class="quote-box">“我想先被听见，再一起想办法。”</div><p class="small-copy no-margin">这里通过预设选项帮你梳理表达，不会自动分析或判断你的心理状态。</p></section>${panel('原始表达默认留在个人空间。生成协作安排时，需要另外填写并预览准备分享的内容。')}</div><section><div class="section-heading no-margin"><h2>已经确认的需要</h2><span class="subtle">${db.needs.length} 条</span></div>${db.needs.length?[...db.needs].reverse().map(n=>`<article class="card need-card"><div class="inline-end"><span class="pill">我需要${esc(n.category)}</span><span class="record-meta">${fmtDate(n.created)}</span></div><blockquote>${esc(n.text)}</blockquote><div class="inline-end"><span class="subtle">${db.tasks.some(t=>t.needId===n.id)?'已有相关安排':'已由本人确认'}</span><div class="actions">${iconButton('编辑需要','need-edit',n.id,'edit')}${iconButton('删除需要','delete',`needs:${n.id}`,'trash')}${button('整理成协作请求','task-from-need',n.id,'small','arrow')}</div></div></article>`).join(''): `<div class="card">${empty('你的需要，可以从这里开始','倾听、休息、帮忙、信息或陪伴，都值得被认真对待。',button('写下第一个需要','need-new','','small'))}</div>`}</section></div>`;
}
function taskCard(t){
  const mother=role==='mother'; const canAct=!t.revoked&&!['cancelled','completed'].includes(t.status);
  let actions='';
  if(mother){
    if(t.status==='draft'&&!t.revoked&&t.owner==='伴侣')actions+=button('预览并分享','task-share',t.id,'small primary');
    if(t.status==='proposed'&&canAct)actions+=button('查看修改建议','proposal-review',t.id,'small primary');
    if(!t.shared&&t.owner==='妈妈'&&canAct)actions+=button('标记完成','task-status',`${t.id}:completed`,'small');
    if(t.status==='completed')actions+=button(t.feedback?'修改帮助反馈':'记录帮助反馈','feedback',t.id,'small primary');
    if(t.shared&&!t.revoked)actions+=button('撤回分享','task-revoke',t.id,'small ghost');
    if(!t.shared&&t.status!=='completed'&&!t.revoked)actions+=button('编辑','task-edit',t.id,'small ghost');
    if(canAct)actions+=button('取消安排','task-cancel',t.id,'small ghost');
  }else if(canAct){
    if(t.status==='waiting')actions+=button('接受安排','task-status',`${t.id}:accepted`,'small primary')+button('提出修改','proposal',t.id,'small')+button('暂时无法接手','task-cancel',t.id,'small ghost');
    if(t.status==='accepted')actions+=button('开始接手','task-status',`${t.id}:in_progress`,'small primary');
    if(t.status==='in_progress')actions+=button('标记完成','task-status',`${t.id}:completed`,'small primary');
  }
  return `<article class="task-card"><div class="inline-end">${taskPill(t)}<span class="record-meta">${esc(t.category)}</span></div><h3>${esc(t.title)}</h3><div class="task-meta"><span>${icon('calendar')}${fmtDate(t.date)} ${esc(t.time)}</span><span>${icon('people')}${esc(t.owner)}负责</span><span>${icon(t.shared?'shield':'lock')}${t.shared?'已选择分享':'尚未分享'}</span></div><div class="task-detail">${esc(t.details)}</div>${t.proposal&&t.status==='proposed'?`<div class="review-note">伴侣的修改建议：${esc(t.proposal)}</div>`:''}<div class="actions">${actions}</div>${mother&&t.feedback?`<div class="feedback-box">我的反馈：${esc(t.feedback.help)} · 额外负担：${esc(t.feedback.burden)}${t.feedback.note?`<br>${esc(t.feedback.note)}`:''}</div>`:''}${!mother&&t.status==='completed'?'<div class="small-copy spaced">已完成。对方是否感到有帮助，将由对方自己记录。</div>':''}</article>`;
}
function familyView(){
  const tasks=visibleTasks(); const rows=tasks.filter(t=>taskFilter==='all'||(taskFilter==='active'&&!['completed','cancelled'].includes(t.status))||(taskFilter==='completed'&&t.status==='completed')||(taskFilter==='today'&&t.date===today()));
  return `${head('家庭协作','先商量，再接手；事情做完以后，也听听彼此的感受。',role==='mother'?button('创建协作安排','task-new','','primary','plus'):'')}<div class="toolbar"><div class="tabs">${[['active','待办安排'],['today','今日计划'],['completed','已完成'],['all','全部']].map(([v,l])=>`<button class="tab ${taskFilter===v?'active':''}" data-action="task-filter" data-id="${v}">${l}</button>`).join('')}</div><span class="subtle">${role==='mother'?'妈妈提出需要 · 伴侣确认接手':'这里只展示妈妈选择分享的安排'}</span></div><div class="wide-col"><div>${rows.length?[...rows].sort((a,b)=>a.date.localeCompare(b.date)).map(taskCard).join(''):`<div class="card">${empty('这里还没有符合条件的安排',role==='mother'?'从一个具体的小请求开始，时间与做法都可以商量。':'妈妈分享后，安排会出现在这里。可以先练习怎样倾听。',role==='mother'?button('创建第一个安排','task-new','','small'):button('试试沟通练习','go','practice','small'))}</div>`}</div><div class="stack"><section class="card"><div class="card-header"><h2>一个请求，四个小步骤</h2></div><ol class="step-list"><li>妈妈整理需要，预览后分享具体安排。</li><li>伴侣接受、提出修改，或说明暂时无法接手。</li><li>双方确认同一个安排后，由负责人接手。</li><li>分别记录完成情况和妈妈感受到的帮助。</li></ol></section>${panel('原始倾诉、心情和帮助反馈不会显示在伴侣视角中。撤回分享后，伴侣视角不再展示该安排。')}<div class="quote"><p>“做完了”和“有帮助”，<br>是两件可以分别记录的事。</p></div></div></div>`;
}
function practiceView(){
  const history=role==='mother'?db.practices:[];
  return `${head('沟通练习','不追求完美的回应，从一次更温柔的表达开始。')}${supportNvcCard()}${supportStoryCards()}<h2 class="spaced">原有表达练习</h2><div class="panel-note">${icon('book')}<span>以下使用虚构生活情境和固定参考表达。练习没有标准分数，也不是 AI 对话。</span></div><div class="three-col spaced">${scenarios.map(s=>`<section class="card practice-card"><div class="tile-icon">${icon(s.icon)}</div><h3>${s.title}</h3><p>${s.desc}</p>${button('开始练习','practice-start',s.id,'small','arrow')}</section>`).join('')}</div>${role==='mother'?`<section class="card spaced"><div class="card-header"><h2>我的练习笔记</h2><span class="subtle">只在妈妈视角中展示</span></div>${history.length?[...history].reverse().map(p=>`<article class="record"><div class="record-head"><strong>${esc(scenarios.find(s=>s.id===p.scenario)?.title||YunxinSupport.stories[p.scenario]?.title||(p.scenario==='nvc'?'我的四步表达':'沟通练习'))}</strong><div class="row-controls"><span class="record-meta">${fmtDate(p.created)}</span>${iconButton('删除练习记录','delete',`practices:${p.id}`,'trash')}</div></div><p>${esc(p.text)}</p></article>`).join(''):empty('留下一句想尝试的新表达','完成练习后，可以把自己的表达保存在这里。', '',true)}</section>`:''}`;
}
function rankActivities(){return YunxinSupport.rank(db,activityLibrary);}
function supportView(){
  const ranked=rankActivities();
  return `${head('日常支持','不用一次改变很多，选一个此刻做得到的小行动。')}<div class="card"><form data-form="support-filter" class="inline-end"><div class="form-grid">${selectField('preferred','现在更偏好的支持',categories,db.settings.preferred)}${selectField('available','可以留给自己的时间（分钟）',['1','3','5','10','15','30'],String(db.settings.available))}</div><label class="support-history-toggle"><input type="checkbox" name="history" ${supportPrefs().history?'checked':''}>参考以前的帮助反馈</label><button class="btn primary" type="submit">更新建议</button></form><p class="small-copy">${supportPrefs().energy==='brief'?'你选择了简单模式，只展示 3 分钟内的活动。可在陪伴支持切换。':'按当前可用时间筛选活动。'}</p><p class="small-copy no-margin">建议来自固定内容库，按已确认的需要、可用时间、偏好和你的反馈排序。可以跳过，不会扣分。</p></div><div class="three-col spaced support-activity-grid">${ranked.map(a=>`<section class="card activity-card"><div class="inline-end"><div class="tile-icon">${icon(a.icon)}</div><span class="pill">${a.minutes} 分钟 · ${a.category}</span></div><h3>${a.title}</h3><p>${a.desc}</p><div class="reason">${esc(a.reason)}</div>${supportButton('查看推荐依据','explain',a.id,'small ghost')}${button('看看怎么做','activity',a.id,'small','arrow')}</section>`).join('')||empty('暂时没有合适的活动','可以增加可用时间，或先休息一下。')}</div><section class="card spaced"><div class="card-header"><h2>尝试过的支持</h2><span class="subtle">帮助程度由你自己决定</span></div>${db.activities.length?[...db.activities].reverse().slice(0,30).map(a=>`<div class="record"><div class="record-head"><strong>${esc(activityLibrary.find(x=>x.id===a.activityId)?.title||'日常支持')}</strong><div class="row-controls"><span class="pill">${esc(a.help)}</span>${iconButton('删除支持反馈','delete',`activities:${a.id}`,'trash')}</div></div><span class="record-meta">${fmtDate(a.created)}</span>${a.note?`<p>${esc(a.note)}</p>`:''}</div>`).join(''):empty('还没有尝试记录','不需要把活动做满。只保留对你有帮助的方式。','',true)}</section>`;
}
function helpView(){
  return `${head('求助信息','提前留好一条可以获得支持的路。',role==='mother'?button('添加联系人','contact-new','','primary','plus'):'')}<div class="panel-note warm">${icon('lifebuoy')}<span>这里是离线保存的联系信息，不会代你联系任何人。遇到需要立即处理的危险，请直接联系当地急救或就近医疗服务。</span></div><div class="two-col spaced"><section><h2>我的支持联系人</h2>${db.contacts.length?db.contacts.map(c=>`<article class="card contact-card"><div class="inline-end"><span class="pill">${esc(c.kind)}</span>${role==='mother'?`<div class="row-controls">${iconButton('编辑联系人','contact-edit',c.id,'edit')}${iconButton('删除联系人','delete',`contacts:${c.id}`,'trash')}</div>`:''}</div><h3>${esc(c.name)}</h3><div class="contact-phone">${esc(c.phone)}</div>${c.address?`<p class="spaced">地址：${esc(c.address)}</p>`:''}${c.note?`<p>${esc(c.note)}</p>`:''}</article>`).join(''):`<div class="card">${empty('先存下一个能联系的人','可以是可信赖的亲友、熟悉的医疗机构或专业人员。',role==='mother'?button('添加第一个联系人','contact-new','','small'):'')}</div>`}</section><section class="card"><div class="card-header"><h2>我的求助卡</h2><span class="pill">两个视角均可查看</span></div>${role==='mother'?`<form data-form="help-card">${inputField('person','我可以先联系谁',db.helpCard.person,'text','maxlength="200" placeholder="姓名和联系方式"')}${inputField('place','我可以去哪里获得支持',db.helpCard.place,'text','maxlength="500" placeholder="熟悉的机构或安全地点"')}${textField('message','需要时，我可以这样开口',db.helpCard.message,'例如：我现在有些撑不住，希望你能陪我待一会儿。')}<button class="btn primary" type="submit">保存求助卡</button></form>`:`<h4>我可以先联系谁</h4><p>${esc(db.helpCard.person)||'还没有填写'}</p><h4>可以去哪里</h4><p>${esc(db.helpCard.place)||'还没有填写'}</p><h4>需要时，可以这样开口</h4><div class="quote-box">${esc(db.helpCard.message)||'还没有填写'}</div>`}</section></div>`;
}
function notesList(){
  const rows=db.notes.filter(n=>(n.title+' '+n.text).toLowerCase().includes(noteQuery.toLowerCase())).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.updated.localeCompare(a.updated));
  return rows.length?`<div class="note-grid">${rows.map(n=>`<article class="note-card ${n.pinned?'pinned':''}"><div class="inline-end"><span class="pill ${n.pinned?'':'gray'}">${n.pinned?'已置顶':'备忘'}</span><div class="row-controls">${iconButton(n.pinned?'取消置顶':'置顶','note-pin',n.id,'pin')}${iconButton('编辑备忘','note-edit',n.id,'edit')}${iconButton('删除备忘','delete',`notes:${n.id}`,'trash')}</div></div><h3>${esc(n.title)}</h3><div class="note-body"><p>${esc(n.text)}</p></div><span class="record-meta">更新于 ${fmtDate(n.updated)}</span></article>`).join('')}</div>`:`<div class="card">${empty(noteQuery?'没有找到相关备忘':'把脑袋里惦记的事，放在这里',noteQuery?'试试其他关键词。':'想问的问题、生活小事和突然想到的念头，都可以记录。',noteQuery?'':button('写下第一条备忘','note-new','','small'))}</div>`;
}
function notesView(){return `${head('备忘录','先记下来，不必每件事都放在心上。',button('新建备忘','note-new','','primary','plus'))}<div class="toolbar"><span class="subtle">${db.notes.length} 条记录 · 置顶内容优先显示</span><input type="search" class="input search-input" id="note-search" placeholder="搜索备忘内容…" aria-label="搜索备忘" value="${esc(noteQuery)}"></div><div id="note-list">${notesList()}</div>`;}
function settingsView(){
  if(role==='partner')return `${head('数据与设置','本地使用，随时切换体验视角。')}<section class="card"><div class="settings-row"><div><h3>当前为伴侣视角</h3><p>基本偏好与数据管理入口位于妈妈视角。</p></div>${button('切换使用视角','role')}</div>${panel('角色切换只是同一台电脑上的操作视角，没有登录验证，不等于真实账户隔离。')}</section>`;
  const total=['moods','needs','tasks','notes','practices','activities','contacts'].reduce((n,k)=>n+db[k].length,0)+(db.pregnancy?.entries.length||0)+(db.pregnancy?.visits.length||0);
  return `${head('数据与设置','你的记录，由你自己掌握。')}<div class="two-col"><div class="stack"><section class="card"><div class="card-header"><h2>我的偏好</h2></div><form data-form="settings">${inputField('name','希望怎么称呼你',db.settings.name,'text','maxlength="30" placeholder="选填，首页会用这个名字问候你"')}${selectField('stage','当前阶段',['产后居家','孕期准备','其他'],db.settings.stage)}${selectField('preferred','更偏好的支持方式',categories,db.settings.preferred)}${selectField('available','通常可以留出的时间（分钟）',['1','3','5','10','15','30'],String(db.settings.available))}<button class="btn primary" type="submit">保存偏好</button></form></section><section class="card"><div class="card-header"><h2>使用视角</h2></div><p class="small-copy">当前：妈妈视角。伴侣视角展示已分享的安排，以及沟通练习和求助信息。</p>${button('切换到伴侣视角','switch-role','partner','','people')}<div class="privacy-line">${icon('info')}视角切换没有身份验证，拿到电脑的人都可以切换。</div></section></div><div class="stack"><section class="card"><div class="card-header"><h2>本地数据</h2><span class="pill">保存在当前电脑</span></div><span class="export-count">${total} <small class="subtle">条记录</small></span><p class="small-copy">保存按钮成功提示后，记录已经写入电脑上的文件。刷新页面、关闭浏览器或重启电脑后，重新启动应用即可继续使用。</p><div class="file-path">孕心智护 / data / data.json</div><div class="settings-row"><div><h3>导出完整备份</h3><p>将所有记录存成一个文件，建议定期另存一份。</p></div>${button('导出备份','export','','small','download')}</div><div class="settings-row"><div><h3>从备份恢复</h3><p>先检查文件，再确认是否覆盖当前全部记录。</p></div>${button('选择备份','import','','small','upload')}</div><input type="file" id="backup-file" accept=".json,application/json" class="hidden"><p class="small-copy spaced no-margin">备份包含个人记录，是未加密文件，请放在自己管理的位置。本应用不提供云同步。</p></section><section class="card danger-area"><h3>清空所有记录</h3><p class="small-copy">这会重置当前数据和偏好。请先导出备份；操作前需要输入“清空”。</p>${button('清空本地记录','clear','','small danger','trash')}</section><div class="panel-note">${icon('leaf')}<span>本地基础版 1.0<br>预设支持内容与沟通练习，不接入在线 AI，不提供诊断或自动救援。</span></div></div></div>`;
}

function needModal(id='',category=''){
  const n=db.needs.find(n=>n.id===id);
  showModal(n?'修改我的需要':'此刻，我需要什么？',`<form data-form="need" data-id="${esc(n?.id||'')}">${selectField('category','最贴近当前需要的一项',categories,n?.category||category||'倾听')}${textField('text','写下自己的感受',n?.text||'','例如：今天听到了很多建议，我更希望有人听我说完。','required')}<div class="check-row"><input id="need-confirm" type="checkbox" required><label for="need-confirm">我确认这符合自己的需要。原始表达不自动分享。</label></div>${footerButtons('确认并保存')}</form>`);
}
function taskModal(id='',needId='',confirmedDraft=null){
  const t=db.tasks.find(x=>x.id===id);const n=db.needs.find(x=>x.id===needId);
  showModal(t?'编辑安排':'把需要整理成一个具体安排',`<form data-form="task" data-id="${esc(t?.id||'')}" data-need="${esc(t?.needId||needId)}">${inputField('title','这次希望做什么',t?.title||(confirmedDraft?confirmedDraft.title:(n?`我希望得到${n.category}支持`:'')),'text','required maxlength="100" placeholder="例如：今晚帮我收拾餐桌"')}<div class="form-grid">${inputField('date','日期',t?.date||(confirmedDraft?confirmedDraft.date:today()),'date','required')}${inputField('time','时间（可留空后商量）',t?.time||'','time')}${confirmedDraft?feedbackField('owner','希望由谁负责',['伴侣','妈妈'],confirmedDraft.owner):selectField('owner','希望由谁负责',['伴侣','妈妈'],t?.owner||'伴侣')}${selectField('category','对应的支持需要',categories,t?.category||n?.category||'实际帮忙')}</div>${textField('details','怎样算完成 / 有什么需要商量的（选填）',t?.details||confirmedDraft?.details||'','例如：收好碗筷并擦干净桌面。也可以先保存，稍后补充。')}${panel('这里填写的是你准备分享的安排。原始倾诉不会自动复制进来。保存后，仍需预览并确认才会分享给伴侣。')}${footerButtons('先保存安排')}</form>`);
}
function shareModal(id){
  const t=db.tasks.find(x=>x.id===id); if(!t)return;
  pendingTask=id;
  showModal('分享前，再看一眼',`<p>伴侣视角将看到以下内容。只有双方确认的安排，才开始执行。</p><table class="preview-table"><tbody><tr><td>分享给</td><td>伴侣视角</td></tr><tr><td>需要类型</td><td>${esc(t.category)}</td></tr><tr><td>具体安排</td><td>${esc(t.title)}</td></tr><tr><td>时间</td><td>${esc(t.date)} ${esc(t.time||'待商量')}</td></tr><tr><td>负责人</td><td>${esc(t.owner)}</td></tr><tr><td>完成要求</td><td>${esc(t.details)}</td></tr></tbody></table>${panel('不包含心情、原始倾诉、个人备忘或帮助反馈。你可以撤回后续展示，但无法收回对方已经看过的内容。')}<div class="modal-footer">${button('再想一想','close')}${button('确认分享','share-confirm',id,'primary','shield')}</div>`);
}
function noteModal(id=''){
  const n=db.notes.find(x=>x.id===id);
  showModal(n?'编辑备忘':'给念头找个地方',`<form data-form="note" data-id="${esc(n?.id||'')}">${inputField('title','标题',n?.title||'','text','required maxlength="100" placeholder="给这条备忘取个名字"')}${textField('text','内容',n?.text||'','想记下的事情…','required')}<label class="check-row"><input type="checkbox" name="pinned" ${n?.pinned?'checked':''}>把这条备忘置顶</label>${footerButtons()}</form>`);
}
function practiceModal(id,step=1){
  const s=scenarios.find(x=>x.id===id); if(!s)return;
  showModal(s.title,`<span class="pill">${step===1?'第一步 · 读懂情境':'第二步 · 试着表达'}</span><div class="quote-box">${s.scene}</div>${step===1?`<ol class="step-list">${s.steps.map(x=>`<li>${x}</li>`).join('')}</ol><div class="modal-footer">${button('先到这里','close')}${button('我想试着回应','practice-write',id,'primary','arrow')}</div>`:`<form data-form="practice" data-id="${id}">${textField('text','你会怎样回应？','','按照自己的习惯写，不需要和参考表达一模一样。','required')}<details><summary class="text-link">看看一个参考表达</summary><div class="quote-box">${s.example}</div></details>${role==='partner'?'<p class="small-copy spaced">伴侣视角可以练习，本次内容不保存到妈妈的个人笔记中。</p>':''}${footerButtons(role==='mother'?'保存这次练习':'完成练习')}</form>`}`);
}
function activityModal(id){
  const a=activityLibrary.find(x=>x.id===id); if(!a)return;
  activeActivity=id;
  showModal(a.title,`<span class="pill">${a.minutes} 分钟 · ${a.category}</span><ol class="step-list">${a.steps.map(x=>`<li>${x}</li>`).join('')}</ol><p class="small-copy">按自己的节奏进行，可以随时结束。计时只是一个可选的小提醒。</p><div class="timer" id="activity-timer">${String(a.minutes).padStart(2,'0')}:00</div><div class="actions"><button class="btn small" type="button" data-action="timer-start" data-id="${a.id}">开始计时</button>${button('停止计时','timer-stop','','small ghost')}</div><form data-form="activity" data-id="${a.id}" class="spaced">${feedbackField('help','试过以后，你觉得怎样？',['有帮助','一般','不适合','不确定'])}${textField('note','想留下一点反馈吗？（选填）','','哪些部分合适，哪些部分下次想调整？')}<div class="modal-footer">${button('暂不评价','close')}<button class="btn primary" type="submit">保存我的反馈</button></div></form>`);
}
function contactModal(id=''){
  const c=db.contacts.find(x=>x.id===id);
  showModal(c?'编辑联系人':'保存一个支持联系人',`<form data-form="contact" data-id="${esc(c?.id||'')}">${inputField('name','姓名或机构名称',c?.name||'','text','required maxlength="100"')}${selectField('kind','联系人类型',['可信赖的亲友','医疗机构','专业人员','其他'],c?.kind||'可信赖的亲友')}${inputField('phone','联系方式',c?.phone||'','text','required maxlength="100" placeholder="电话或其他可用的联系方法"')}${inputField('address','地址（选填）',c?.address||'','text','maxlength="500"')}${textField('note','补充说明（选填）',c?.note||'','例如：方便联系的时间、到达方式…')}${panel('联系人与求助卡在两个视角中均可查看。请自行确认联系方式可用。')}${footerButtons()}</form>`);
}

document.addEventListener('click',async event=>{
  const el=event.target.closest('[data-action]');if(!el||!db||busy)return;
  const action=el.dataset.action,id=el.dataset.id||'';
  const motherOnly=['quick-mood','mood-select','mood-edit','need-new','need-edit','task-new','task-edit','task-from-need','task-share','share-confirm','task-revoke','feedback','note-new','note-edit','note-pin','contact-new','contact-edit','export','import','clear','clear-confirm','delete','delete-confirm','proposal-review','proposal-accept','proposal-decline','activity'];
  if(role==='partner'&&motherOnly.includes(action))return toast('请切换到妈妈视角后操作',true);
  if(action==='go')return go(id);
  if(action==='close')return closeModal();
  if(action==='role')return showModal('选择使用视角',`<p>同一台电脑，两种参与方式。视角切换用于体验协作流程，没有登录验证。</p><button class="role-option" data-action="switch-role" data-id="mother"><span class="avatar">妈</span><span><strong>妈妈视角</strong><small>记录感受、确认需要、分享安排和记录反馈</small></span></button><button class="role-option" data-action="switch-role" data-id="partner"><span class="avatar">伴</span><span><strong>伴侣视角</strong><small>查看已分享安排、协商接手、练习沟通</small></span></button>`);
  if(action==='switch-role'){role=id==='partner'?'partner':'mother';sessionStorage.setItem('yx-role',role);closeModal();page='home';location.hash='home';render();return toast(`已切换为${role==='mother'?'妈妈':'伴侣'}视角`);}
  if(action==='quick-mood'){quickMood=Number(id);go('mood');return;}
  if(action==='mood-select'){
    selectedMood=Number(id);const form=el.closest('form');$('input[name="score"]',form).value=id;
    form.querySelectorAll('.mood-choice').forEach(b=>{b.classList.toggle('selected',b.dataset.id===id);b.setAttribute('aria-pressed',String(b.dataset.id===id));});return;
  }
  if(action==='trend'){trendDays=Number(id);render();return;}
  if(action==='mood-edit')return showModal('修改心情与睡眠',moodForm(db.moods.find(m=>m.id===id)));
  if(action==='need-new')return needModal('',id);
  if(action==='need-edit')return needModal(id);
  if(action==='task-new')return taskModal();
  if(action==='task-edit')return taskModal(id);
  if(action==='task-from-need')return taskModal('',id);
  if(action==='task-open')return showModal('安排详情',taskCard(visibleTasks().find(t=>t.id===id)));
  if(action==='task-filter'){taskFilter=id;render();return;}
  if(action==='task-share')return shareModal(id);
  if(action==='share-confirm'){
    if(await commit(d=>{const t=d.tasks.find(t=>t.id===id);t.shared=true;t.revoked=false;t.status='waiting';},'已分享，等待伴侣确认')){closeModal();render();}return;
  }
  if(action==='task-status'){
    const [taskId,status]=id.split(':');const t=db.tasks.find(t=>t.id===taskId);if(!t)return;
    const allowed=role==='partner'&&t.shared&&!t.revoked&&(({waiting:'accepted',accepted:'in_progress',in_progress:'completed'})[t.status]===status)||role==='mother'&&!t.shared&&t.owner==='妈妈'&&t.status==='draft'&&status==='completed';
    if(!allowed)return toast('当前安排状态已改变，请重新查看',true);
    if(await commit(d=>{d.tasks.find(x=>x.id===taskId).status=status;},status==='completed'?'已记录完成情况，帮助程度由妈妈另行反馈':'安排状态已更新')){closeModal();render();}return;
  }
  if(action==='task-cancel'||action==='task-revoke')return showModal(action==='task-revoke'?'撤回这次分享？':'取消这项安排？',`<p>${action==='task-revoke'?'撤回后，伴侣视角不再展示这项安排。已被对方看过的内容无法收回。记录会保留在妈妈视角。':'安排会保留在“全部”列表中，并标记为取消或拒绝。可以随时创建新的安排。'}</p><div class="modal-footer">${button('保留安排','close')}${button('确认'+(action==='task-revoke'?'撤回':'取消'),'task-confirm',`${id}:${action}`,'danger')}</div>`);
  if(action==='task-confirm'){
    const [taskId,kind]=id.split(':');const task=db.tasks.find(t=>t.id===taskId);
    if(!task||(role==='partner'&&(kind!=='task-cancel'||task.status!=='waiting'||!task.shared||task.revoked)))return;
    if(await commit(d=>{const t=d.tasks.find(t=>t.id===taskId);if(kind==='task-revoke')t.revoked=true;if(t.status!=='completed')t.status='cancelled';},kind==='task-revoke'?'已撤回分享':'已取消安排')){closeModal();render();}return;
  }
  if(action==='proposal'){
    const t=visibleTasks().find(t=>t.id===id);if(role!=='partner'||!t||t.status!=='waiting')return;
    return showModal('一起商量一个做得到的安排',`<p>原安排：${esc(t.title)} · ${esc(t.date)} ${esc(t.time)}</p><form data-form="proposal" data-id="${id}">${textField('proposal','你希望怎样调整？','','例如：今晚八点不方便，可以改成九点吗？','required')}${footerButtons('发出修改建议')}</form>`);
  }
  if(action==='proposal-review'){
    const t=db.tasks.find(x=>x.id===id);return showModal('确认伴侣提出的修改',`<div class="quote-box">${esc(t.proposal)}</div><p>把双方同意的时间和完成要求填写清楚，保存后再交给伴侣确认。</p><form data-form="proposal-review" data-id="${id}"><div class="form-grid">${inputField('date','商量后的日期',t.date,'date','required')}${inputField('time','商量后的时间',t.time,'time')}</div>${textField('details','商量后的完成要求',t.details,'','required')}${footerButtons('更新安排，请伴侣再确认')}</form><div class="spaced">${button('暂不采用，保留原安排','proposal-decline',id,'small ghost')}</div>`);
  }
  if(action==='proposal-decline'){
    if(await commit(d=>{const t=d.tasks.find(t=>t.id===id);t.status='waiting';t.proposal='';},'已保留原安排，等待伴侣重新确认')){closeModal();render();}return;
  }
  if(action==='feedback'){
    const t=db.tasks.find(x=>x.id===id);return showModal('事情做完后，你感觉怎样？',`<p>安排：${esc(t.title)}。完成情况和实际帮助分别记录，不需要为了感谢对方而选择“有帮助”。</p><form data-form="feedback" data-id="${id}">${feedbackField('help','这次对你有帮助吗？',['有帮助','一般','没有帮助','不确定'],t.feedback?.help||'')}${feedbackField('burden','安排或提醒这件事，带来了额外负担吗？',['没有','一点','较多','不确定'],t.feedback?.burden||'')}${textField('note','下次想调整什么？（选填）',t.feedback?.note||'','例如：希望减少过程中反复确认的小问题。')}${panel('这份反馈只在妈妈视角中展示，并会影响同类日常支持的推荐顺序。')}<div class="modal-footer">${button('暂不评价','close')}<button class="btn primary" type="submit">保存我的反馈</button></div></form>`);
  }
  if(action==='practice-start')return practiceModal(id);
  if(action==='practice-write')return practiceModal(id,2);
  if(action==='activity')return activityModal(id);
  if(action==='timer-start'){
    clearInterval(timerInterval);const a=activityLibrary.find(a=>a.id===id);timerEnd=Date.now()+a.minutes*60000;el.textContent='重新计时';
    timerInterval=setInterval(()=>{const left=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));const node=$('#activity-timer');if(!node)return clearInterval(timerInterval);node.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;if(left===0){clearInterval(timerInterval);toast('这段时间结束了，按自己的节奏慢慢来。');}},500);return;
  }
  if(action==='timer-stop'){clearInterval(timerInterval);return toast('计时已停止，可以随时结束活动。');}
  if(action==='note-new')return noteModal();
  if(action==='note-edit')return noteModal(id);
  if(action==='note-pin'){if(await commit(d=>{const n=d.notes.find(x=>x.id===id);n.pinned=!n.pinned;}))render();return;}
  if(action==='contact-new')return contactModal();
  if(action==='contact-edit')return contactModal(id);
  if(action==='delete')return showModal('删除这条记录？',`<p>删除后，页面中不再保留这条记录。相关的协作安排不会自动删除。需要保留副本时，可以先到“数据与设置”导出备份。</p><div class="modal-footer">${button('保留记录','close')}${button('确认删除','delete-confirm',id,'danger')}</div>`);
  if(action==='delete-confirm'){
    const [group,recordId]=id.split(':');if(!['moods','needs','notes','practices','activities','contacts'].includes(group))return;
    if(await commit(d=>{d[group]=d[group].filter(x=>x.id!==recordId);},'记录已删除')){closeModal();render();}return;
  }
  if(action==='export'){
    const content={app:'yunxin-local',backupVersion:1,exportedAt:stamp(),state:db};const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`孕心智护备份_${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已生成备份，请保管好下载的文件');return;
  }
  if(action==='import'){ $('#backup-file').click();return; }
  if(action==='import-confirm'){
    if(role!=='mother'||!pendingImport)return;const imported=pendingImport;
    if(await commit(d=>{Object.keys(d).forEach(k=>delete d[k]);Object.assign(d,imported);},'备份已恢复')){closeModal();render();}return;
  }
  if(action==='clear')return showModal('清空所有本地记录',`<p>孕期记录、产检安排、心情、需要、协作安排、备忘、练习、反馈、联系人和个人偏好都将被重置。</p><p>请先导出备份。清空后，普通页面无法撤销；上一次保存的技术恢复文件也会清除。</p><form data-form="clear">${inputField('confirm','请输入“清空”确认','','text','required pattern="清空" autocomplete="off"')}${footerButtons('确认清空')}</form>`);
});

document.addEventListener('submit',async event=>{
  const form=event.target.closest('[data-form]');if(!form)return;event.preventDefault();if(busy)return;
  const kind=form.dataset.form,id=form.dataset.id||'',data=Object.fromEntries(new FormData(form));
  for(const k in data)if(typeof data[k]==='string')data[k]=data[k].trim();
  if(role==='partner'&&!['practice','proposal'].includes(kind))return toast('请切换到妈妈视角后操作',true);
  const submit=$('[type="submit"]',form),submitLabel=submit?.textContent;if(submit){submit.disabled=true;submit.textContent='正在保存…';}
  let ok=false;
  try{
    if(kind==='mood'){
      if(!data.date||data.date>today())return toast('请选择今天或过去的日期',true);
      const other=db.moods.find(m=>m.date===data.date&&m.id!==id);
      if(other){showModal('这一天已经有记录',`<p>为了让趋势清楚，每天保留一条记录。请编辑已有记录，避免覆盖自己的感受。</p><div class="modal-footer">${button('返回','close')}${button('编辑这一天','mood-edit',other.id,'primary')}</div>`);return;}
      ok=await commit(d=>{const row={id:id||uid(),date:data.date,score:Number(data.score),sleep:Number(data.sleep),note:data.note};if(id)d.moods[d.moods.findIndex(x=>x.id===id)]=row;else d.moods.push(row);});
    }
    if(kind==='quick-note'||kind==='note'){
      if(!data.text||(kind==='note'&&!data.title))return toast('请填写备忘内容',true);
      ok=await commit(d=>{const old=d.notes.find(x=>x.id===id);const row={id:id||uid(),title:kind==='quick-note'?data.text.slice(0,24):data.title,text:data.text,pinned:data.pinned==='on',created:old?.created||stamp(),updated:stamp()};if(id)d.notes[d.notes.findIndex(x=>x.id===id)]=row;else d.notes.push(row);},'备忘已存下来');
    }
    if(kind==='need'){
      if(!data.text)return toast('请写下自己的感受',true);
      ok=await commit(d=>{const old=d.needs.find(x=>x.id===id);const row={id:id||uid(),category:data.category,text:data.text,created:old?.created||stamp()};if(id)d.needs[d.needs.findIndex(x=>x.id===id)]=row;else d.needs.push(row);},'需要已由你确认并保存');
    }
    if(kind==='task'){
      if(!data.title)return toast('还没有保存：请填写这次希望做什么。',true);
      if(!data.date)return toast('还没有保存：请选择安排日期。',true);
      ok=await commit(d=>{const old=d.tasks.find(x=>x.id===id);const row={...old,id:id||uid(),title:data.title,date:data.date,time:data.time,owner:data.owner,details:data.details,category:data.category,needId:form.dataset.need||'',status:'draft',shared:false,revoked:false,feedback:null,proposal:''};if(id)d.tasks[d.tasks.findIndex(x=>x.id===id)]=row;else d.tasks.push(row);},'安排已保存；需要分享时，请先预览');
      if(ok){page='family';location.hash='family';}
    }
    if(kind==='proposal'){
      if(!data.proposal)return toast('请填写希望调整的内容',true);
      ok=await commit(d=>{const t=d.tasks.find(x=>x.id===id);if(!t.shared||t.revoked||t.status!=='waiting')throw new Error('这项安排已改变，请重新查看');t.proposal=data.proposal;t.status='proposed';},'修改建议已提交，等待妈妈确认');
    }
    if(kind==='proposal-review')ok=await commit(d=>{const t=d.tasks.find(x=>x.id===id);t.date=data.date;t.time=data.time;t.details=data.details;t.status='waiting';t.proposal='';},'已更新安排，等待伴侣重新确认');
    if(kind==='feedback'&&(!['有帮助','一般','没有帮助','不确定'].includes(data.help)||!['没有','一点','较多','不确定'].includes(data.burden)))throw new Error('请主动选择帮助感受和协调负担，也可以暂不评价。');
    if(kind==='feedback')ok=await commit(d=>{const task=d.tasks.find(x=>x.id===id);task.feedback={help:data.help,burden:data.burden,note:data.note,updated:stamp(),context:task.feedback?.context||{stage:supportPrefs().stage}};},'完成情况与帮助反馈已分别保存');
    if(kind==='practice'){
      if(!data.text)return toast('请试着写下一句自己的回应',true);
      if(role==='partner'){toast('练习完成，谢谢你愿意认真倾听');ok=true;}
      else ok=await commit(d=>d.practices.push({id:uid(),scenario:id,text:data.text,created:stamp()}),'练习笔记已保存');
    }
    if(kind==='activity'&&!['有帮助','一般','不适合','不确定'].includes(data.help))throw new Error('请主动选择感受，也可以暂不评价。');
    if(kind==='activity')ok=await commit(d=>d.activities.push({id:uid(),activityId:id,help:data.help,note:data.note,created:stamp(),context:{stage:supportPrefs().stage}}),'反馈已记录，之后的建议会参考这次感受');
    if(kind==='support-filter')ok=await commit(d=>{d.settings.preferred=data.preferred;d.settings.available=Number(data.available);d.settings.support={...YunxinSupport.preferences(d.settings),history:data.history==='on'};},'已根据你的选择调整建议');
    if(kind==='help-card')ok=await commit(d=>{d.helpCard={person:data.person,place:data.place,message:data.message};},'求助卡已保存，两个视角均可查看');
    if(kind==='contact'){
      if(!data.name||!data.phone)return toast('请填写姓名和联系方式',true);
      ok=await commit(d=>{const row={id:id||uid(),name:data.name,phone:data.phone,kind:data.kind,address:data.address,note:data.note};if(id)d.contacts[d.contacts.findIndex(x=>x.id===id)]=row;else d.contacts.push(row);});
    }
    if(kind==='settings')ok=await commit(d=>{d.settings={...d.settings,name:data.name,stage:data.stage,preferred:data.preferred,available:Number(data.available)};},'偏好已保存');
    if(kind==='clear'&&data.confirm==='清空'){
      ok=await commit(d=>{d.settings={name:'',stage:'产后居家',preferred:'休息',available:15};delete d.pregnancy;for(const k of ['moods','needs','tasks','notes','practices','activities','contacts'])d[k]=[];d.helpCard={person:'',place:'',message:''};},'已清空当前记录与偏好',true);
    }
    if(ok){closeModal();render();}
  }catch(e){toast(e.message||'操作没有完成，请重试',true);}
  finally{if(submit){submit.disabled=false;submit.textContent=submitLabel;}}
});
document.addEventListener('input',event=>{
  if(event.target.id==='note-search'){noteQuery=event.target.value;$('#note-list').innerHTML=notesList();}
});
document.addEventListener('change',async event=>{
  if(event.target.id!=='backup-file')return;
  const file=event.target.files[0];if(!file)return;event.target.value='';
  try{
    if(file.size>8*1024*1024)throw new Error('备份超过 8 MB，无法导入');
    const data=JSON.parse(await file.text());
    if(data.app!=='yunxin-local'||data.backupVersion!==1||data.state?.version!==1)throw new Error('这不是支持的孕心智护备份文件');
    const groups=['moods','needs','tasks','notes','practices','activities','contacts'];
    if(groups.some(k=>!Array.isArray(data.state[k])))throw new Error('备份结构不完整');
    const count=groups.reduce((n,k)=>n+data.state[k].length,0)+(data.state.pregnancy?.entries?.length||0)+(data.state.pregnancy?.visits?.length||0);if(data.state.pregnancy)YunxinPregnancy.validate(data.state.pregnancy);
    pendingImport=data.state;
    showModal('确认恢复这份备份？',`<p>所选文件：${esc(file.name)}</p><p>包含 ${count} 条记录。恢复后会<strong>覆盖当前全部记录和偏好</strong>，不会自动合并。系统还会检查数据格式，通过后才写入。</p><p>建议先取消并导出当前数据，保留一份独立备份。</p><div class="modal-footer">${button('先取消','close')}${button('确认覆盖并恢复','import-confirm','','primary')}</div>`);
  }catch(e){toast(e.message||'无法读取这个备份文件',true);}
});
$('#modal').addEventListener('close',()=>clearInterval(timerInterval));
window.addEventListener('hashchange',()=>{page=location.hash.slice(1)||'home';render();window.scrollTo(0,0);});
window.addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
window.addEventListener('DOMContentLoaded',()=>{load().then(render).catch(error=>{$('#main').innerHTML=`<div class="card locked">${icon('info')}<h2>暂时无法打开本地记录</h2><p>${esc(error.message||'请先双击“启动孕心智护.command”，再从浏览器打开本地地址。')}</p><p>为避免覆盖原有内容，页面没有创建或重置记录。</p><button class="btn" id="retry-load">重新读取</button></div>`;$('#retry-load').addEventListener('click',()=>location.reload());});});

document.addEventListener('pet-save',async event=>{const ok=await commit(d=>{d.settings.pet=event.detail.config;},'小伙伴的样子已保存');event.detail.done(ok);});
