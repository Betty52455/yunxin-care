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
  ['home','首页','home'],['mood','心情与身体','heart'],
  ['family','家庭协作','people'],['settings','我的','user']
];
/* 二级页归属：studio 与孕期记录都在 mood 下，practice 在 family 下 */
const parents = {studio:'mood'};
const titles = {studio:'小暖工坊'};
const modules = [
  {id:'mood',label:'心情与身体',ico:'heart',desc:'心情睡眠 · 孕期记录 · 情绪花园',tint:'rose'},
  {id:'family',label:'家庭协作',ico:'people',desc:'协作安排 · 需要记录 · 沟通练习',tint:'amber'},
  {id:'alert',label:'心情预警',ico:'alert',desc:'撑不住时，把这句话递给伴侣',tint:'coral'},
  {id:'settings',label:'我的',ico:'user',desc:'偏好 · 视角 · 备份',tint:'stone'}
];
const paths = {
  home:'m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9',
  heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  leaf:'M20 3C10 2 3 7 5 14c2 7 15 6 15-11ZM4 21 15 10',
  people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  user:'M20 21v-2a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  chat:'M21 11a8 8 0 0 1-8 8H7l-5 3 1-7a8 8 0 1 1 18-4ZM7 10h10M7 14h6',
  sun:'M12 3V1m0 22v-2M3 12H1m22 0h-2M4.2 4.2l1.5 1.5m12.6 12.6 1.5 1.5m0-15.6-1.5 1.5M5.7 18.3l-1.5 1.5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  lifebuoy:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5.6 5.6l3.6 3.6m5.6 5.6 3.6 3.6M18.4 5.6l-3.6 3.6m-5.6 5.6-3.6 3.6',
  note:'M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9M16 3l5 5-10 10-5 1 1-5L17 4M7 7h4',
  settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  lock:'M5 10h14v11H5V10ZM8 10V7a4 4 0 0 1 8 0v3M12 14v3',
  arrow:'M5 12h14m-5-5 5 5-5 5', chevron:'m9 5 7 7-7 7', down:'m6 9 6 6 6-6',
  check:'m5 12 4 4L19 6', plus:'M12 5v14M5 12h14', close:'m6 6 12 12M6 18 18 6',
  calendar:'M4 5h16v16H4V5ZM8 2v6m8-6v6M4 10h16M8 14h2m4 0h2m-8 3h2',  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 6v6l4 2',
  moon:'M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z',
  alert:'M12 3 2.6 20h18.8L12 3ZM12 9.5v4.6M12 17.4v.2',
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
const inputField = (name,label,value='',type='text',extra='') => { const id=`f-${name}-${++fieldNumber}`;return `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`; };
const textField = (name,label,value='',placeholder='',extra='') => { const id=`f-${name}-${++fieldNumber}`;return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" name="${name}" placeholder="${esc(placeholder)}" maxlength="5000" ${extra}>${esc(value)}</textarea></div>`; };
const footerButtons = (label='保存记录') => `<div class="modal-footer">${button('取消','close')}<button class="btn primary" type="submit">${label}</button></div>`;
let db, revision = 0, busy = false, toastTimer, timerInterval, timerEnd;
let role = sessionStorage.getItem('yx-role') === 'partner' ? 'partner' : 'mother';
let familyTab = 'collab';   // collab | practice
let moodTab = 'today';      // today | records | alert
function readHash(){
  const raw = location.hash.slice(1) || 'home';
  const [id, sub] = raw.split('/');
  const rewrite = target => { try { history.replaceState(null, '', target); } catch (e) {} };
  if(id==='practice'){familyTab='practice';rewrite('#family/practice');return 'family';}
  if(id==='records'){moodTab='records';rewrite('#mood/records');return 'mood';}
  if(id==='notes'){moodTab='today';rewrite('#mood');return 'mood';}
  if(id==='mood')moodTab=['today','records','alert','weekly'].includes(sub)?sub:'today';
  if(id==='family'&&sub==='practice')familyTab='practice';
  return id;
}
let page = readHash();
let taskFilter = 'active', trendDays = 7, selectedMood = 3, quickMood = null;
let pendingTask = null, pendingImport = null;
let activeActivity = null;


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
function saveMoodDraft(form){
  if(role!=='mother'||!form?.dataset.draftKey)return;
  const data=Object.fromEntries(new FormData(form));
  const saved=YunxinDrafts.save(form.dataset.draftKey,data);
  const status=form.querySelector('.mood-draft-status');
  if(status)status.textContent=saved?'草稿已保存在本机 · 尚未提交':'草稿暂存于当前页面，无法写入本机；请勿关闭页面，并尽快保存记录';
}
document.addEventListener('input',event=>{
  const moodForm=event.target.closest('form[data-form="mood"]');
  if(moodForm)saveMoodDraft(moodForm);
  const field=event.target,form=field.closest('form[data-form]');if(!form)return;
  if(field.validity?.valid)field.removeAttribute('aria-invalid');
  const feedback=form.querySelector('.form-feedback');if(feedback && !form.querySelector(':invalid'))feedback.hidden=true;
});
async function api(path, options={}) {
  if (options.method === 'POST') {
    const {state,revision,reset}=JSON.parse(options.body);
    return YunxinStorage.save(state,revision,reset);
  }
  return YunxinStorage.read();
}
async function load() {
  const result=await api('/api/state'); db=result.state; db.alerts=db.alerts||[]; revision=result.revision;
}
async function commit(change, message='已保存到当前浏览器', reset=false) {
  if (busy) return false;
  busy=true; document.body.classList.add('saving');
  const next=structuredClone(db);
  try {
    change(next);
    const result=await api('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,state:next,reset})});
    db=result.state; revision=result.revision; toast(message); return true;
  } catch(error) {
    if(error.status===409){await load().catch(()=>{});}
    toast(error.message || '保存失败，请检查浏览器存储权限并重试；请先导出已有记录。',true); return false;
  } finally {busy=false;document.body.classList.remove('saving');}
}
function showModal(title, body) {
  clearInterval(timerInterval);
  $('#modal-content').innerHTML=`<div class="modal-head"><h2>${title}</h2>${iconButton('关闭','close','','close')}</div><div class="modal-body">${body}</div>`;
  if(!$('#modal').open) $('#modal').showModal();
}
function closeModal(){
  const modal=$('#modal');clearInterval(timerInterval);pendingTask=null;pendingImport=null;
  if(!modal.open)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){modal.close();return;}
  const animation=modal.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}],{duration:140,easing:'ease-in'});
  animation.finished.then(()=>modal.close()).catch(()=>{});
}
function go(target){const route=target==='mood'?'mood/today':target;if(location.hash==='#'+route){page=readHash();render();}else location.hash=route;}
function visibleTasks(){return db.tasks.filter(t=>role==='mother'||(t.shared&&!t.revoked));}
function taskPill(t){return `<span class="pill ${t.revoked?'rose':t.status==='completed'?'':t.status==='waiting'||t.status==='proposed'?'warm':t.status==='cancelled'?'gray':'blue'}">${t.revoked?'已撤回分享':t.owner==='妈妈'&&t.status==='draft'?'个人计划':statusNames[t.status]}</span>`;}
function pageTitle(id){return (navs.find(n=>n[0]===id)||[])[1] || titles[id] || '首页';}
function render() {
  if(!db)return;
  if(!navs.some(n=>n[0]===page)&&!titles[page])page='home';
  document.body.classList.toggle('is-home',page==='home');
  YunxinWeekly.destroy();
  renderChrome();
  if(role==='partner'&&['mood','studio'].includes(page)){
    $('#main').innerHTML=`${head(pageTitle(page),'每一份感受，都值得被尊重')}<div class="card locked">${icon('lock')}<h2>这是妈妈的个人空间</h2><p>伴侣视角可以查看已分享的协作安排、收到的预警，并进行沟通练习。<br>心情记录、花园、小暖外观和孕期记录默认不展示在这里。</p>${button('回到首页','go','home','primary','home')} ${button('切换使用视角','role')}</div>`;
  }else{
    const views={home:homeView,mood:moodView,studio:studioView,family:familyView,practice:practiceView,settings:settingsView};
    $('#main').innerHTML=(views[page]||homeView)();
  }
  if(role==='mother'&&page==='mood'&&moodTab==='weekly')YunxinWeekly.mount($('.weekly-report'),render);
  document.title=`${pageTitle(parents[page]||page)} · 孕心智护`;
}
function renderChrome(){
  $('#sidebar').innerHTML='';
  $('#topbar').innerHTML=`<a class="tb-brand" href="#home" aria-label="孕心智护首页"><img src="favicon.svg" alt=""><span><b>孕心智护</b><small>YUNXIN CARE</small></span></a>${page==='home'?'':`<a class="tb-back" href="#home" aria-label="回到首页">‹</a>`}<nav class="tb-nav" aria-label="主导航">${navs.map(([id,label,ico])=>{const on=(parents[page]||page)===id;return `<a href="#${id}" class="${on?'active':''}" ${on?'aria-current="page"':''}>${icon(ico)}<span>${label}</span></a>`;}).join('')}</nav><div class="top-actions"><div class="local-status"><i class="status-dot"></i>本机保存 · 不跨设备同步</div><button class="role-button" data-action="role"><span class="avatar">${role==='mother'?'妈':'伴'}</span><span>${role==='mother'?'妈妈':'伴侣'}视角</span>${icon('down')}</button></div>`;
}

function bloomSvg(score, size=64){
  const c=GARDEN_PAL[score-1], cx=size/2, base=size-5;
  const h=15+score*5.4, top=+(base-h).toFixed(1), r=5.4+score*1.62, n=7+score, ri=r*.62;
  const outer=Array.from({length:n},(_,i)=>`<ellipse cx="${cx}" cy="${(top-r*.66).toFixed(1)}" rx="${(r*.3).toFixed(1)}" ry="${(r*.56).toFixed(1)}" fill="${c[0]}" transform="rotate(${((i*360/n)+12).toFixed(1)} ${cx} ${top})"/>`).join('');
  const inner=Array.from({length:n-1},(_,i)=>`<ellipse cx="${cx}" cy="${(top-ri*.62).toFixed(1)}" rx="${(ri*.3).toFixed(1)}" ry="${(ri*.56).toFixed(1)}" fill="${c[1]}" transform="rotate(${(i*360/(n-1)).toFixed(1)} ${cx} ${top})"/>`).join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${moodWords[score-1]}会种出的花"><ellipse cx="${cx}" cy="${base}" rx="${(6+score).toFixed(1)}" ry="2.4" fill="#dae3c6"/>`
    + `<path d="M${cx} ${base}V${top}" stroke="#a8bd8e" stroke-width="2" stroke-linecap="round"/>`
    + `<ellipse cx="${(cx-5).toFixed(1)}" cy="${(base-h*.42).toFixed(1)}" rx="${(3.4+score*.32).toFixed(1)}" ry="1.9" fill="#c2d3a8" transform="rotate(-28 ${(cx-5).toFixed(1)} ${(base-h*.42).toFixed(1)})"/>`
    + outer + inner + `<circle cx="${cx}" cy="${top}" r="${(r*.34).toFixed(1)}" fill="${c[2]}"/></svg>`;
}
function moodForm(existing){
  const draftKey=existing?.id||'new';
  const draft=YunxinDrafts.read(draftKey), values=draft||existing;
  selectedMood=quickMood??values?.score??existing?.score??3; quickMood=null;
  return `<form data-form="mood" data-id="${esc(existing?.id||'')}" data-draft-key="${esc(draftKey)}">${inputField('date','记录日期',values?.date??today(),'date',`max="${today()}" required`)}<div class="field-label">这一刻的心情</div><div class="mood-pick">${moodWords.map((w,i)=>`<button type="button" class="mood-choice ${selectedMood===i+1?'selected':''}" data-action="mood-select" data-id="${i+1}" aria-pressed="${selectedMood===i+1}">${face(i+1)}<span>${w}</span></button>`).join('')}</div><input type="hidden" name="score" value="${selectedMood}"><div class="mood-preview"><div class="mp-art" data-mp>${bloomSvg(selectedMood,62)}</div><div class="mp-text"><strong>今天会种下这样一朵</strong><span>心情越好，花开得越高；睡足七小时，花瓣上还会留一颗露珠。</span></div></div>${inputField('sleep','昨晚大约睡了多久（小时）',values?.sleep??'','number','min="0" max="24" step="0.5" required placeholder="例如 6.5"')}${textField('note','想多说一点吗？（选填）',values?.note||'','今天发生了什么，或者现在最想被理解的感受…')}<p class="mood-draft-status small-copy" role="status">${draft?'已恢复本机草稿 · 尚未提交':'输入会保留为本机草稿，保存后才计入记录'}</p><div class="inline-end"><span class="subtle">一天一条，可随时修改</span><button class="btn primary" type="submit">${existing?'保存修改':'保存记录'}</button></div><div class="privacy-line">${icon('lock')}原始记录不会出现在伴侣视角中</div></form>`;
}
function chart(){
  const dates=Array.from({length:trendDays},(_,i)=>{let d=new Date();d.setDate(d.getDate()-trendDays+1+i);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  const rows=dates.map(d=>db.moods.find(m=>m.date===d));
  if(!rows.some(Boolean))return empty('从第一条记录开始','记录后，这里会显示心情与睡眠的变化。', '',true);
  const x=i=>38+i*(466/(trendDays-1)),yMood=v=>130-(v-1)*25,ySleep=v=>130-v/24*100;
  function line(field,y){let path='',connected=false;rows.forEach((m,i)=>{if(m){path+=`${connected?'L':'M'}${x(i)},${y(m[field])} `;connected=true;}else connected=false;});return path;}
  return `<svg class="chart" viewBox="0 0 550 165" role="img" aria-label="最近 ${trendDays} 天心情与睡眠趋势。左轴心情一到五分，右轴睡眠零到二十四小时；缺少记录的日期不连线。">${[0,1,2,3,4].map(i=>`<line class="grid-line" x1="38" x2="504" y1="${130-i*25}" y2="${130-i*25}"/><text x="12" y="${134-i*25}">${i+1}</text><text x="515" y="${134-i*25}">${i*6}h</text>`).join('')}<path class="mood-line" d="${line('score',yMood)}"/><path class="sleep-line" d="${line('sleep',ySleep)}"/>${rows.map((m,i)=>m?`<circle cx="${x(i)}" cy="${yMood(m.score)}" r="4"><title>${dates[i]}：${moodWords[m.score-1]}，睡眠 ${m.sleep} 小时</title></circle>`:'').join('')}${dates.map((d,i)=>i%Math.ceil(trendDays/7)===0?`<text x="${x(i)-11}" y="156">${Number(d.slice(5,7))}/${Number(d.slice(8))}</text>`:'').join('')}</svg><div class="chart-legend"><span>心情 · 左轴 1—5 分</span><span class="sleep">睡眠 · 右轴 0—24 小时</span></div>`;
}
function gardenStats(){
  const have=new Set(db.moods.map(m=>m.date));
  const todayMood=db.moods.find(m=>m.date===today());
  let streak=0;
  for(let i=0;i<180;i++){
    const d=new Date();d.setDate(d.getDate()-i);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if(have.has(k))streak++;else if(i===0)continue;else break;
  }
  const days=gardenDays(),filled=days.filter(d=>d.mood);
  return {todayMood,streak,bloom:filled.length,week:days.length,best:filled.length?Math.max(...filled.map(d=>d.mood.score)):0};
}
function petLine(st){
  if(!st.todayMood)return '今天的花盆还空着。要不要和我一起，种下今天的第一朵？';
  if(st.todayMood.score>=4)return '今天的花开得很舒展，我刚给它浇过水。';
  if(st.todayMood.score<=2)return '今天的花有点低着头。没关系，我陪你坐一会儿。';
  return '今天的花开得刚刚好，我把它记在花园里了。';
}
/* ===== 心情预警：把撑不住的时刻递给伴侣 ===== */
const ALERT_LEVELS={
  company:{name:'想有人陪',hint:'难受，但还能说说话',line:'我现在有点难受，想有人在旁边待一会儿，不用一直说话。'},
  hard:{name:'今天很难撑',hint:'需要有人接手一件事',line:'今天真的很难撑，能不能帮我接手一件家务，让我先缓一缓。'},
  danger:{name:'现在感觉危险',hint:'需要马上有人来',line:'我现在感觉不太好，你能马上过来吗？先别问原因。'}
};
const ALERT_NEEDS=['待在旁边就好','帮我接手一件事','帮我联系医生','替我看一会儿','陪我去医院'];
const ALERT_REPLIES={onway:'我这就过去',take:'这件事我来接手',seen:'我看到了，先陪你'};
/* ===== 数据授权 · 心情变化提醒 · 表达草稿（全部本地计算，不联网） ===== */
const GRANT_FIELDS={mood7:'最近 7 天心情分数',sleep7:'最近 7 天睡眠时长',moodAvg:'本周心情平均分',alertCount:'预警次数统计',pregInfo:'孕周与预产期'};
const GRANT_DAYS=[['1','24 小时'],['7','7 天'],['30','30 天']];
function grants(){return [...(db.grants||[])].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));}
function grantUntil(days){const d=new Date();d.setDate(d.getDate()+Number(days)||1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function activeGrants(){const t=today();return grants().filter(g=>g.status==='active'&&g.until>=t);}
function grantData(fields){
  const moods=[...db.moods].sort((a,b)=>a.date.localeCompare(b.date)),last7=moods.slice(-7),out={};
  if(fields.includes('mood7'))out.mood7=last7.length?last7.map(m=>`${Number(m.date.slice(5,7))}/${Number(m.date.slice(8))} ${moodWords[m.score-1]}`).join('；'):'最近 7 天还没有心情记录';
  if(fields.includes('sleep7'))out.sleep7=last7.length?last7.map(m=>`${Number(m.date.slice(5,7))}/${Number(m.date.slice(8))} 睡了 ${m.sleep} 小时`).join('；'):'最近 7 天还没有睡眠记录';
  if(fields.includes('moodAvg'))out.moodAvg=last7.length?`本周平均 ${ (last7.reduce((s,m)=>s+m.score,0)/last7.length).toFixed(1) } 分（满分 5）`:'还没有记录';
  if(fields.includes('alertCount'))out.alertCount=`累计发过 ${(db.alerts||[]).length} 条预警，最近一条 ${alerts()[0]?fmtDate(alerts()[0].date):'还没有'}`;
  if(fields.includes('pregInfo'))out.pregInfo=db.pregnancy&&db.pregnancy.dueDate?`预产期 ${db.pregnancy.dueDate}`:'还没有填写预产期';
  return out;
}
function moodTrendNotice(){
  const ms=[...db.moods].sort((a,b)=>a.date.localeCompare(b.date));
  if(ms.length<6)return '';
  const recent=ms.slice(-3),before=ms.slice(-8,-3);
  if(before.length<3)return '';
  const r=recent.reduce((s,m)=>s+m.score,0)/recent.length,b=before.reduce((s,m)=>s+m.score,0)/before.length;
  const low3=recent.every(m=>m.score<=2);
  if(!(low3||b-r>=1))return '';
  return `<div class="alert-safe">${icon('chart')}<span>本地统计提醒：最近 3 天的心情均分（${r.toFixed(1)}）比之前几天（${b.toFixed(1)}）明显${low3?'低，且连续三天都在低分区':'下滑'}。这只是一个统计，不是诊断——想被接住的时候，随时可以发一条预警。</span></div>`;
}
function draftForAlert(level,needs){
  const wants=(kw)=>(needs||[]).some(n=>n.includes(kw));
  if(level==='danger')return '我看到你的预警了，我马上过来。你不用再解释什么，先坐下歇口气，剩下的事情交给我。';
  if(level==='hard')return wants('接手')||wants('帮')?'这条我来接手，你先去躺一会儿。做不完的部分我再想办法，你别担心。':'收到你的预警了。今晚我多做一些，你只挑一件最轻松的事就好，其他都不用管。';
  return wants('陪')?'看到你想有人陪了。我把手头的事放一放，过来陪你坐一会儿，不说话也可以。':'我看到你想有人在了。我现在就过去，安静地陪着你就好。';
}
function grantsMomBody(){
  const list=grants();if(!list.length)return '';
  const pend=list.filter(g=>g.status==='pending'),act=list.filter(g=>g.status==='active'),past=list.filter(g=>['declined','revoked'].includes(g.status)).slice(0,3);
  return `<section class="card spaced grant-manage"><div class="card-header"><h2>数据授权</h2><span class="subtle">伴侣申请 · 你决定范围与期限</span></div>
  ${pend.length?pend.map(g=>`<article class="alert-item"><div class="alert-item-head"><span class="pill warm">待你决定</span><span class="record-meta">${fmtDate(String(g.createdAt).slice(0,10))} 提出</span></div><p>想看：${g.fields.map(f=>GRANT_FIELDS[f]||f).join('、')}${g.note?`<br>留言：${esc(g.note)}`:''}</p><div class="actions">${button('决定范围和期限','grant-decide',g.id,'small primary','eye')}${button('拒绝','grant-decline',g.id,'small ghost')}</div></article>`).join(''):`<p class="small-copy no-margin">目前没有等待处理的申请。</p>`}
  ${act.length?act.map(g=>`<article class="alert-item"><div class="alert-item-head"><span class="pill">授权中</span><span class="record-meta">到 ${g.until} 前有效</span><span class="alert-state">${g.fields.map(f=>GRANT_FIELDS[f]||f).join('、')}</span></div><div class="actions">${button('撤销授权','grant-revoke',g.id,'small ghost')}</div></article>`).join(''):''}
  ${past.length?`<p class="small-copy">历史：${past.map(g=>g.status==='declined'?'一条申请已拒绝':'一条授权已撤销').join('、')}。</p>`:''}
  <p class="small-copy no-margin">批准后，伴侣视角只显示你勾选的字段；到期或撤销后立即停止显示。参考流程：申请 → 你决定范围和期限 → 只显示获准字段 → 随时可撤销。</p></section>`;
}
function grantsPartnerCard(){
  const act=activeGrants(),pend=grants().filter(g=>g.status==='pending'),last=grants().find(g=>['declined','revoked'].includes(g.status));
  const rows=act.length?Object.entries(grantData(act.flatMap(g=>g.fields))).map(([k,v])=>`<div class="grant-row"><span class="pill">${GRANT_FIELDS[k]}</span><p>${esc(String(v))}</p></div>`).join(''):'';
  return `<section class="card grant-card"><div class="card-header"><h2>她授权我看的</h2>${button('申请查看其他数据','grant-request','','small','eye')}</div>
  ${act.length?`${rows}${act.map(g=>`<p class="small-copy no-margin">授权范围：${g.fields.map(f=>GRANT_FIELDS[f]).join('、')} · 到 ${g.until} 前有效。她可以随时撤销。</p>`).join('')}`:`<p class="small-copy no-margin">暂时没有获得授权。心情、花园和孕期记录默认只在妈妈视角显示；想了解的话，可以发起一次申请，由她决定给哪些、给多久、也可以拒绝。</p>`}
  ${pend.length?`<p class="small-copy no-margin">你有 ${pend.length} 条申请正在等她决定范围和期限。</p>`:''}
  ${last?`<p class="small-copy no-margin">最近一条申请${last.status==='declined'?'被拒绝':'的授权被撤销'}了。可以换个方式直接问她。</p>`:''}</section>`;
}
function alerts(){return [...(db.alerts||[])].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));}
function openAlerts(){return alerts().filter(a=>a.status!=='replied');}
function tileMeta(mo,own){
  if(mo.id==='alert'&&!own)return {href:'#family',label:'收到的预警',desc:'她发来的求助，在这里回应'};
  return {href:`#${mo.id}`,label:mo.label,desc:mo.desc};
}
function alertInboxCard(a){
  const lv=ALERT_LEVELS[a.level]||ALERT_LEVELS.company,mother=role==='mother',done=a.status==='replied';
  return `<article class="alert-card lv-${a.level}">
    <div class="alert-card-head">${icon('alert')}<div><strong>${mother?'你发出的一条预警':'小暖发来一条预警'}</strong><small>${fmtDate(a.date)} ${esc(a.time)} · ${lv.name}</small></div></div>
    <p class="alert-msg">${esc(a.message)}</p>
    ${a.needs&&a.needs.length?`<div class="alert-needs">${a.needs.map(n=>`<span class="alert-chip">${esc(n)}</span>`).join('')}</div>`:''}
    ${done?`<div class="alert-reply">${icon('check')}<span>${mother?'伴侣回你':'你已经回应'}：${esc(a.reply)}</span></div>`
      :mother?`<div class="alert-wait">${icon('clock')}<span>已送到伴侣视角，等一句回应</span></div>`
      :`<div class="actions">${Object.entries(ALERT_REPLIES).map(([k,t])=>`<button class="btn small ${k==='onway'?'primary':''}" data-action="alert-reply" data-id="${a.id}:${k}">${t}</button>`).join('')}<button class="btn small ghost" data-action="alert-reply-custom" data-id="${a.id}">写一句自己的回应</button></div>`}
  </article>`;
}
function partnerSideCard(){
  const open=openAlerts(),last=alerts()[0];
  const privacy='<p class="alert-privacy">她的心情记录、花园和孕期记录不会出现在这里，只有她选择发出的预警会。</p>';
  if(open.length)return `<div class="alert-slot-head">${icon('alert')}<span>${open.length>1?`有 ${open.length} 条预警在等你`:'有一条预警在等你'}</span></div>${alertInboxCard(open[0])}${privacy}`;
  if(last)return `<div class="alert-slot-head">${icon('check')}<span>最近的预警已经回应过了</span></div>${alertInboxCard(last)}<p class="small-copy no-margin">她再发预警时，会出现在这里。</p>${privacy}`;
  return `<div class="alert-slot-head">${icon('leaf')}<span>暂时没有需要立刻回应的消息</span></div><p class="alert-empty-line">她还没有发过心情预警。今天可以主动问一句：现在最想被帮的是什么？</p><a class="gardener-go" href="#family">${icon('people')}去看看今天的协作${icon('chevron')}</a>`;
}
function alertRow(a){
  const lv=ALERT_LEVELS[a.level]||ALERT_LEVELS.company;
  const state=a.status==='replied'?'伴侣已回应':'等待回应';
  return `<article class="alert-item lv-${a.level}">
    <div class="alert-item-head"><span class="pill ${a.level==='danger'?'rose':a.level==='hard'?'warm':'gray'}">${lv.name}</span><span class="record-meta">${fmtDate(a.date)} ${esc(a.time)}</span><span class="alert-state">${state}</span></div>
    <p>${esc(a.message)}</p>
    ${a.needs&&a.needs.length?`<div class="alert-needs">${a.needs.map(n=>`<span class="alert-chip">${esc(n)}</span>`).join('')}</div>`:''}
    ${a.reply?`<div class="alert-reply">${icon('chat')}<span>${esc(a.reply)}</span></div>`:''}
    ${a.status!=='replied'?`<div class="actions">${button('撤回','alert-remove',a.id,'small ghost','trash')}</div>`:''}
  </article>`;
}
function alertBody(){
  const rows=alerts(),todayMood=db.moods.find(m=>m.date===today()),open=rows.find(a=>a.status!=='replied');
  return `<section class="card alert-intro">
    <div class="alert-intro-head">${icon('alert')}<div><h2>心情预警</h2><p>今天分很低，或者只是撑不住了，都可以在这里选一句话，直接递到伴侣的首页。他只会看到这条预警，看不到你的心情记录、花园和孕期记录。</p></div></div>
    <div class="alert-levels">${Object.entries(ALERT_LEVELS).map(([k,v])=>`<button type="button" class="alert-level lv-${k}" data-action="alert-new" data-id="${k}"><strong>${v.name}</strong><small>${v.hint}</small></button>`).join('')}</div>
    <div class="alert-safe">${icon('lifebuoy')}<span>如果有伤害自己或宝宝的念头、出血、剧烈腹痛或胎动明显减少，请不要等回应：先拨打 120 或联系你的医生。这个页面只在本机记录，不会自动呼救。</span></div>
    ${todayMood?`<p class="small-copy no-margin">今天记录的心情是「${moodWords[todayMood.score-1]}」。低分不会自动通知任何人，发不发、发哪一句，都由你决定。</p>`:''}
  </section>
  ${role==='mother'?moodTrendNotice():''}
  ${open?`<div class="spaced">${alertInboxCard(open)}</div>`:''}
  ${role==='mother'?grantsMomBody():''}
  ${rows.length?`<section class="card spaced"><div class="card-header"><h2>发过的预警</h2><span class="subtle">共 ${rows.length} 条</span></div>${rows.map(alertRow).join('')}</section>`
    :`<div class="card spaced">${empty('还没有发过预警','不需要等到最糟的时候。想被接住的时候，就可以说。','',true)}</div>`}`;
}

function alertModal(level){
  const v=ALERT_LEVELS[level]||ALERT_LEVELS.company;
  showModal(`心情预警 · ${v.name}`,`<form data-form="alert" data-id="${level}"><p class="small-copy">这条会出现在伴侣的首页，只包含你写下的这句话和勾选的需要，不会带上心情记录。</p>${textField('message','想让他知道的一句话',v.line,'','required maxlength="300"')}<div class="row-controls spaced-sm">${button('帮我写一版草稿','alert-draft',level,'small ghost','edit')}</div><div class="field-label">需要什么（可多选）</div><div class="chips" data-alert-needs>${ALERT_NEEDS.map((n,i)=>`<button type="button" class="chip ${i===0?'on':''}" data-action="alert-need" data-id="${i}" aria-pressed="${i===0}">${n}</button>`).join('')}</div>${level==='danger'?`<div class="alert-safe">${icon('lifebuoy')}<span>如果情况紧急，先拨打 120 或联系医生，再发这条。它不会自动通知任何人，也不会替你叫救护车。</span></div>`:''}<div class="modal-footer">${button('取消','close')}<button class="btn primary" type="submit">发送给伴侣</button></div></form>`);
}

function moduleStat(id){
  if(id==='mood'){
    if(role!=='mother')return '仅妈妈可见';
    const m=db.moods.find(x=>x.date===today());
    return m?`今天 · ${moodWords[m.score-1]} · ${careAge()}`:`${careAge()} · 今日待记录`;
  }
  if(id==='alert'){
    const open=openAlerts().length,total=alerts().length;
    if(role!=='mother')return open?`${open} 条等你回应`:(total?'已经回应过了':'还没有收到预警');
    return open?`${open} 条等待回应`:(total?`已发出 ${total} 条`:'暂无待回应的预警');
  }
  if(id==='family'){
    const t=visibleTasks().filter(x=>x.date===today()&&x.status!=='cancelled');
    const wait=visibleTasks().filter(x=>x.status==='waiting'||x.status==='proposed').length;
    return t.length?`今天 ${t.length} 件安排`:(wait?`${wait} 件待确认`:'今日暂无安排');
  }
  if(id==='studio'){
    const u=petUnlocks(),n=Object.values(u).filter(x=>x.ok).length;
    return `已解锁 ${n}/5 件装扮`;
  }
  return '当前浏览器保存';
}
function miniGarden(){
  const days=gardenDays(),w=250,h=46,pad=12;
  const step=days.length>1?(w-pad*2)/(days.length-1):0;
  return `<svg class="mini-garden" viewBox="0 0 ${w} ${h}" role="img" aria-label="最近 ${days.length} 天的花园缩影，今天的格子带虚线圈">`
    + `<path d="M0 ${h-7}Q${w/2} ${h-13} ${w} ${h-7}" fill="none" stroke="#dfe7cf" stroke-width="1"/>`
    + days.map((d,i)=>{
        const x=pad+step*i,y=h-8;
        if(!d.mood)return `<path d="M${x.toFixed(1)} ${y}v-4" stroke="#c9d5b9" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>`;
        const c=GARDEN_PAL[d.mood.score-1],r=(2.4+d.mood.score*.85).toFixed(1),hh=6+d.mood.score*2.6,ty=y-hh;
        return `<g><path d="M${x.toFixed(1)} ${y}V${ty.toFixed(1)}" stroke="#a8bd8e" stroke-width="1.4" stroke-linecap="round"/>`
          +`<circle cx="${x.toFixed(1)}" cy="${ty.toFixed(1)}" r="${r}" fill="${c[0]}"/>`
          +`<circle cx="${x.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(r*.48)}" fill="${c[1]}"/>`
          +`${i===days.length-1?`<circle cx="${x.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(+r+2.8).toFixed(1)}" fill="none" stroke="#dcc089" stroke-width="1" stroke-dasharray="2 2.4"/>`:''}</g>`;
      }).join('')
    + `</svg>`;
}
function homeGardenArt(){
  const sunCx=56,sunCy=40;
  const rays=Array.from({length:9},(_,i)=>{
    const a=(i*40-90)*Math.PI/180,r1=13,r2=19;
    return `<path d="M${(sunCx+r1*Math.cos(a)).toFixed(1)} ${(sunCy+r1*Math.sin(a)).toFixed(1)}L${(sunCx+r2*Math.cos(a)).toFixed(1)} ${(sunCy+r2*Math.sin(a)).toFixed(1)}"/>`;
  }).join('');
  const picket=Array.from({length:8},(_,i)=>{
    const x=+(2+i*9).toFixed(1);
    return `<path d="M${x} 11h6.4v33h-6.4z" fill="#fefcf6" stroke="#e5ddc8" stroke-width=".9"/><path d="M${x} 11l3.2-4.6 3.2 4.6z" fill="#fefcf6" stroke="#e5ddc8" stroke-width=".9"/><path d="M${x+1.6} 15v26" stroke="#f2ecdd" stroke-width="1.4" stroke-linecap="round"/>`;
  }).join('');
  const tuft=(x,y,s)=>`<path d="M${x} ${y}q${(-2*s).toFixed(1)} ${(-3.2*s).toFixed(1)} ${(-3.3*s).toFixed(1)} ${(-6.6*s).toFixed(1)}M${x} ${y}q${(.2*s).toFixed(1)} ${(-3.6*s).toFixed(1)} ${(.7*s).toFixed(1)} ${(-7.6*s).toFixed(1)}M${x} ${y}q${(2*s).toFixed(1)} ${(-3.2*s).toFixed(1)} ${(3.5*s).toFixed(1)} ${(-6*s).toFixed(1)}" stroke="#b7ca9d" stroke-width="${(1.25*s).toFixed(2)}" fill="none" stroke-linecap="round" opacity=".6"/>`;
  return `<div class="gardener-bg" aria-hidden="true">
  <svg class="hg-bands" viewBox="0 0 350 237" preserveAspectRatio="none">
    <defs>
      <linearGradient id="hgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e1f0e9" stop-opacity=".92"/><stop offset=".44" stop-color="#f1f9ee" stop-opacity=".42"/><stop offset="1" stop-color="#fdf8ea" stop-opacity="0"/></linearGradient>
      <linearGradient id="hgHillA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ebf4dd"/><stop offset="1" stop-color="#e1edd0"/></linearGradient>
      <linearGradient id="hgHillB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfedc8"/><stop offset="1" stop-color="#d5e4bb"/></linearGradient>
      <radialGradient id="hgSunGlow"><stop offset="0" stop-color="#fdefc6" stop-opacity=".95"/><stop offset=".5" stop-color="#fdefc6" stop-opacity=".3"/><stop offset="1" stop-color="#fdefc6" stop-opacity="0"/></radialGradient>
      <radialGradient id="hgWarm" cx=".92" cy=".06" r=".7"><stop offset="0" stop-color="#fdf0cc" stop-opacity=".55"/><stop offset="1" stop-color="#fdf0cc" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="350" height="237" fill="url(#hgSky)"/>
    <rect width="350" height="237" fill="url(#hgWarm)"/>
    <path d="M0 162q44-25 90-13.5 30 7.8 58 2 34-6.8 66 3.6 32 10.4 62 3.4 36-7.6 74 1.6v78H0z" fill="url(#hgHillA)"/>
    <path d="M0 177q56-16 106-6 40 7.6 78 1 40-6.8 80 3.6 44 9.6 86 .8v61H0z" fill="url(#hgHillB)"/>
    <path d="M0 197q88-16 175-5 88 11 175-4v49H0z" fill="#e3eed0" opacity=".96"/>
    <path d="M0 206q88-13 175-3 88 10 175-3" fill="none" stroke="#d0e1b4" stroke-width="1.4" opacity=".75"/>
  </svg>
  <div class="hg-props">
  <svg class="hg-sun" viewBox="0 0 96 96"><circle cx="${sunCx}" cy="${sunCy}" r="40" fill="url(#hgSunGlow)"/><g class="hg-rays" stroke="#f2d59a" stroke-width="1.5" stroke-linecap="round" opacity=".6">${rays}</g><circle cx="${sunCx}" cy="${sunCy}" r="9" fill="#fbe2a8"/><circle cx="${sunCx}" cy="${sunCy}" r="5.6" fill="#fdf3d0"/></svg>
  <svg class="hg-cloud c1" viewBox="0 0 88 46"><g fill="#fff" opacity=".92"><ellipse cx="26" cy="30" rx="19" ry="9"/><ellipse cx="42" cy="23" rx="14" ry="12"/><ellipse cx="58" cy="31" rx="15" ry="8"/></g></svg>
  <svg class="hg-cloud c2" viewBox="0 0 68 36"><g fill="#fff" opacity=".7"><ellipse cx="20" cy="23" rx="15" ry="7"/><ellipse cx="33" cy="17" rx="11" ry="9.4"/><ellipse cx="46" cy="24" rx="12" ry="6.4"/></g></svg>
  <svg class="hg-fence l" viewBox="0 0 78 54"><g stroke-linejoin="round"><path d="M0 22h78M0 33h78" stroke="#f6f1e2" stroke-width="3.2" stroke-linecap="round"/>${picket}</g><ellipse cx="39" cy="46" rx="37" ry="3" fill="#cbdcae" opacity=".45"/></svg>
  <svg class="hg-fence r" viewBox="0 0 78 54"><g stroke-linejoin="round"><path d="M0 22h78M0 33h78" stroke="#f6f1e2" stroke-width="3.2" stroke-linecap="round"/>${picket}</g><ellipse cx="39" cy="46" rx="37" ry="3" fill="#cbdcae" opacity=".45"/></svg>
  <svg class="hg-birds" viewBox="0 0 52 22" fill="none" stroke="#9fb0a3" stroke-width="1.8" stroke-linecap="round" opacity=".78"><path d="M2 14q5-4.6 10 0q5-4.6 10 0"/><path d="M27 7q4-3.6 8 0q4-3.6 8 0"/></svg>
  <svg class="hg-bird" viewBox="0 0 36 26"><ellipse cx="17" cy="16" rx="6" ry="4.4" fill="#c9d6df"/><circle cx="22" cy="11.4" r="3.4" fill="#dbe5ec"/><path d="M25.2 11l4.4 1.4-4.4 1.6z" fill="#e9b96a"/><circle cx="23" cy="10.4" r=".8" fill="#4a5a63"/><path d="M11.2 17.2l-5.4 2.8 5.4.6z" fill="#bcc9d3"/></svg>
  <svg class="hg-fly" viewBox="0 0 30 26"><g class="hg-wing"><path d="M15 13q-7-7-10 0 7 7 10 0" fill="#f3c3a0"/></g><g class="hg-wing"><path d="M15 13q7-7 10 0-7 7-10 0" fill="#f8dcc3"/></g><path d="M15 13v6" stroke="#8a7a63" stroke-width="1.2" stroke-linecap="round"/><path d="M14 9.4l-1.6-3M16 9.4l1.6-3" stroke="#8a7a63" stroke-width=".9" stroke-linecap="round"/></svg>
  <svg class="hg-bee" viewBox="0 0 24 20"><ellipse cx="12" cy="12" rx="5" ry="3.4" fill="#f2cd8e"/><path d="M7 12h10M8.2 10v4M10.6 9.4v5.2" stroke="#b58f4e" stroke-width="1.1"/><ellipse cx="12" cy="7.6" rx="4" ry="2.4" fill="#fdf9ec" opacity=".9"/><circle cx="19.4" cy="12" r="1.4" fill="#e8dcbd" opacity=".8"/></svg>
  <svg class="hg-house" viewBox="0 0 40 62"><path d="M20 34v26" stroke="#c9b48f" stroke-width="4" stroke-linecap="round"/><path d="M7 30h26v-13H7z" fill="#fbf5e6" stroke="#e2d6bd"/><path d="M4 18l16-11 16 11z" fill="#d9b38c" stroke="#c9a079" stroke-linejoin="round"/><circle cx="20" cy="23" r="3.4" fill="#c3b096"/><circle cx="20" cy="23" r="1.9" fill="#8d7f6a"/><path d="M20 27v4" stroke="#cbbfa5" stroke-width="1.4"/><ellipse cx="20" cy="60" rx="8" ry="2" fill="#cbdcae" opacity=".5"/></svg>
  <svg class="hg-pot" viewBox="0 0 50 46"><ellipse cx="25" cy="41" rx="14" ry="3.2" fill="#cba97e" opacity=".3"/><path d="M12 25h26l-3.4 16H15.4z" fill="#d9ab7e"/><path d="M11 20.4h28V26H11z" fill="#e3b98d"/><path d="M25 20.4v-9" stroke="#a8bd8e" stroke-width="1.7" stroke-linecap="round"/><ellipse cx="20.4" cy="13.6" rx="4.4" ry="2.1" fill="#c2d3a8" transform="rotate(-28 20.4 13.6)"/><ellipse cx="29.6" cy="9.6" rx="4.4" ry="2.1" fill="#c2d3a8" transform="rotate(26 29.6 9.6)"/><circle cx="25" cy="9.6" r="2.2" fill="#f6c5ce"/><circle cx="25" cy="9.6" r=".9" fill="#f8ecc0"/></svg>
  <i class="hg-petal p1"></i><i class="hg-petal p2"></i><i class="hg-petal p3"></i>
  </div>
</div>`;
}

function homeView(){
  const own=role==='mother',st=gardenStats(),m=st.todayMood,w=careLatestWeight(),p=carePreg();
  const name=db.settings.name?esc(db.settings.name):'';
  const journalDay=new Date(today()+'T12:00:00');
  const journalMonth=journalDay.toLocaleDateString('zh-CN',{year:'numeric',month:'long'});
  const journalWeekday=journalDay.toLocaleDateString('zh-CN',{weekday:'long'});
  const gardenCaption=st.todayMood
    ? (st.todayMood.score<=2?'低落也值得被温柔安放 一页记录 一份关照':'今日心绪已入册 花园又添一朵花')
    :'以一朵花收藏心绪<br>让平凡的日子留下痕迹';
  const journalDescriptions={
    mood:'心情 · 睡眠 · 孕期档案',
    family:'协作安排 · 需要表达 · 沟通练习',
    alert:own?'情绪支持 · 向伴侣表达需要':'情绪支持 · 回应伴侣的需要',
    settings:'个人偏好 · 使用视角 · 数据备份'
  };
  const tasks=visibleTasks().filter(x=>x.date===today()&&x.status!=='cancelled');
  const wait=visibleTasks().filter(x=>x.status==='waiting'||x.status==='proposed').length;
  const nextVisit=own?[...p.visits].filter(v=>!v.done&&v.date>=today()).sort((a,b)=>a.date.localeCompare(b.date))[0]:null;
  const openAlert=openAlerts()[0];
  const lowMood=own&&m&&m.score<=2;
  const note=own
    ? (lowMood&&!openAlert?'今天的分很低。低分不会自动通知任何人，要不要把这句递给他？'
      : (nextVisit?`下一次产检安排：${esc(nextVisit.date)} ${esc(nextVisit.time||'')} ${esc(nextVisit.title)}`
      : (wait?`有 ${wait} 件协作在等确认，去家庭协作看一眼。`
      : (m?'今日心绪已留存 愿余下的时光从容安宁':'今日心情尚未记录 每一种感受都值得留存'))))
    : (openAlert?'小暖把一条预警放在这里，先看这一条。'
      :(tasks.length?`今天有 ${tasks.length} 件小事被安排好了，挑一件先接手。`:'先听一听，再接手一件力所能及的小事。'));
  return `<div class="home-dash">
    <header class="home-hero">
      <div class="home-hello">
        <div class="journal-intro">
          <h1>${own?'孕心手记':'相伴手记'}</h1>
          <p class="journal-subtitle">${name?`${name}的日常珍藏`:'记录身心 留存日常'}</p>
          <a class="journal-profile" href="${own?'#mood/records':'#family'}">${icon(own?'leaf':'people')}<span>${own?`${careAge()}${p.dueDate?` · 预产期 ${esc(p.dueDate)}`:''}`:'家庭协作 · 共同记录'}</span>${icon('chevron')}</a>
        </div>
        <time class="journal-date" datetime="${today()}" aria-label="${journalDay.toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}">
          <span>${journalMonth}</span><strong>${String(journalDay.getDate()).padStart(2,'0')}</strong><small>${journalWeekday}</small>
        </time>
      </div>
      <div class="home-chips">${own?`<a class="home-chip" href="#mood"><span>心情</span><strong>${m?moodWords[m.score-1]:'待记录'}</strong></a><a class="home-chip" href="#mood"><span>睡眠</span><strong>${m?m.sleep+' h':'待记录'}</strong></a><a class="home-chip" href="#mood/records"><span>体重</span><strong>${w?w.weight+' kg':'待记录'}</strong></a><a class="home-chip" href="#family"><span>今天安排</span><strong>${tasks.length} 件</strong></a>`:`<a class="home-chip" href="#family"><span>今天安排</span><strong>${tasks.length} 件</strong></a><a class="home-chip" href="#practice"><span>沟通练习</span><strong>${db.practices.length} 次</strong></a>`}</div>
    </header>
    ${own?`<section class="home-gardener" aria-label="园丁小暖与你的情绪花园">
      <div class="gardener-head"><div><h2>小暖 · 陪伴页</h2></div></div>
      <p class="gardener-line">${gardenCaption}</p>
      <div class="gardener-stage">${homeGardenArt()}<yunxin-pet compact gardener streak="${st.streak}" line="${esc(petLine(st))}" config="${esc(JSON.stringify(db.settings.pet||{}))}"></yunxin-pet><button type="button" class="doll-studio-btn" data-action="open-studio">${icon('leaf')}小暖装扮</button></div>
      ${miniGarden()}
      <div class="gardener-stats"><span><strong>${st.streak}</strong> 天连续</span><span><strong>${st.bloom}</strong> 朵花</span><span><strong>${st.week}</strong> 天花园</span></div>
      <a class="gardener-go" href="#mood">${icon('heart')}${st.todayMood?'翻阅情绪花园':'书写今日心情'}${icon('chevron')}</a>
    </section>`:`<section class="home-gardener alert-slot" aria-label="伴侣的预警收件">
      ${partnerSideCard()}
    </section>`}
    <nav class="home-tiles" aria-label="模块导航">${modules.map((mo,i)=>{const meta=tileMeta(mo,own);return `<a class="tile tile-${mo.tint} ${mo.wide?'tile-wide':''}" href="${meta.href}" style="--i:${i}"><span class="tile-mark" aria-hidden="true">${icon(mo.ico)}</span><span class="tile-icon">${icon(mo.ico)}</span><span class="tile-body"><strong>${meta.label}</strong><small>${journalDescriptions[mo.id]||meta.desc}</small></span><span class="tile-stat">${esc(moduleStat(mo.id))}</span><span class="tile-arrow">${icon('chevron')}</span></a>`;}).join('')}</nav>
    <footer class="home-note">${icon(own&&lowMood&&!openAlert?'alert':'leaf')}<span>${note}</span>${own?`<a href="#mood/alert">${lowMood&&!openAlert?'把这句话递给他 →':'心情预警 →'}</a>`:`<a href="#family">去协作 →</a>`}</footer>
  </div>`;
}
let gardenMode = 'garden';
function gardenDays(){
  return Array.from({length:trendDays},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-trendDays+1+i);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return {date:key,mood:db.moods.find(m=>m.date===key)};
  });
}
let gardenSeq = 0;
function plushInGarden(st){
  if(typeof YunxinPet==='undefined'||!YunxinPet.avatar)return '';
  const conf=(()=>{try{return (db&&db.settings&&db.settings.pet)||{};}catch{return {};}})();
  const cfg=YunxinPet.normalize(conf);
  const score=st.todayMood?st.todayMood.score:0;
  const svg=YunxinPet.avatar(cfg,score>=4?'pat':'idle',{gardener:true,streak:st.streak||0});
  return svg.replace('<svg viewBox="0 0 1280 1280"','<svg x="18" y="48" width="196" height="196" viewBox="0 0 1280 1280" preserveAspectRatio="xMidYMid meet"');
}
function gardenerSvg(st){
  const s = st.todayMood ? st.todayMood.score : 0;
  const bubble = !s ? '种一朵花？' : s <= 2 ? '陪你坐会儿' : s >= 4 ? '今天开花啦' : '开得刚刚好';
  let potFlower = '<ellipse cx="46" cy="214" rx="15" ry="4.5" fill="#b08a63"/>';
  if(s){
    const c = GARDEN_PAL[s - 1], h = 16 + s * 9, top = 216 - h, r = 5 + s * .85, n = 4 + s;
    const petals = Array.from({length: n}, (_, k) => `<ellipse cx="46" cy="${(top - r * .62).toFixed(1)}" rx="${(r * .34).toFixed(1)}" ry="${(r * .62).toFixed(1)}" fill="${c[0]}" transform="rotate(${(k * 360 / n).toFixed(1)} 46 ${top})"/>`).join('');
    potFlower = `<g class="pot-flower"><path d="M46 215V${top}" stroke="#a8bd8e" stroke-width="2" stroke-linecap="round"/>`
      + `<ellipse cx="40" cy="${(216 - h * .45).toFixed(1)}" rx="4.6" ry="2.2" fill="#c2d3a8" transform="rotate(-26 40 ${(216 - h * .45).toFixed(1)})"/>`
      + `<ellipse cx="52" cy="${(216 - h * .68).toFixed(1)}" rx="4.2" ry="2" fill="#c2d3a8" transform="rotate(24 52 ${(216 - h * .68).toFixed(1)})"/>`
      + petals + `<circle cx="46" cy="${top}" r="${(r * .34).toFixed(1)}" fill="${c[2]}"/></g>`;
  }
  return `<g class="gardener">
    ${plushInGarden(st)}
    <ellipse cx="46" cy="216" rx="20" ry="3.6" fill="#c2915f"/>
    <path d="M26 216h40l-5 22h-30z" fill="#d8a97c"/>
    <path d="M26 216h40" stroke="#c2915f" stroke-width="3.4"/>
    <path d="M33 230h26" stroke="#c08f60" stroke-width="2" opacity=".7"/>
    ${potFlower}
    <g class="bubble"><path d="M116 41l4 12-16-10z" fill="#fffdf4" stroke="#e6ebdc" stroke-linejoin="round"/><path d="M101 42h18" stroke="#fffdf4" stroke-width="2.6"/><rect x="88" y="8" width="182" height="34" rx="13" fill="#fffdf4" stroke="#e6ebdc"/><text class="g-text" x="179" y="29.4" text-anchor="middle" font-size="11.5" fill="#5d7058">${bubble}</text></g>
  </g>`;
}
/* ===== 花园成长等级 ===== */
const GARDEN_LEVELS = [
  {n:1,name:'小苗圃',need:0,deco:''},
  {n:2,name:'小花园',need:3,deco:'木栅栏和一条石径'},
  {n:3,name:'有光的花园',need:7,deco:'小路灯和彩旗'},
  {n:4,name:'热闹的花园',need:14,deco:'野花丛和小蜜蜂'},
  {n:5,name:'秘密花园',need:21,deco:'萤火虫来串门'}
];
function gardenLevel(){
  const total=db.moods.length;
  let lv=GARDEN_LEVELS[0];
  for(const l of GARDEN_LEVELS) if(total>=l.need) lv=l;
  const next=GARDEN_LEVELS.find(l=>l.need>total)||null;
  return {lv,total,next,remain:next?next.need-total:0};
}
function gardenProgress(){
  const {lv,next,total,remain}=gardenLevel();
  const span=next?next.need-lv.need:1, done=next?total-lv.need:span;
  const pct=Math.max(8,Math.min(100,Math.round(done/span*100)));
  return `<div class="garden-level"><span class="lv-badge">Lv.${lv.n} · ${lv.name}</span><div class="lv-bar" role="img" aria-label="距离下一级还有 ${next?remain:0} 朵花"><i style="width:${pct}%"></i></div><span class="lv-next">${next?`再种 ${remain} 朵，解锁${next.deco}`:'花园已经开满，慢慢来就好'}</span></div>`;
}
function flowerGarden(){
  const days=gardenDays(), filled=days.filter(d=>d.mood), st=gardenStats(), bloomed=!!st.todayMood;
  return `<div class="garden-wrap"><svg class="garden-svg" viewBox="0 0 760 306" role="img" aria-label="情绪花园：最近 ${days.length} 天已记录 ${filled.length} 天，园丁小暖守着今天的花盆。花朵越高、花瓣越多表示当天心情越好；花瓣上的露珠表示睡足七小时。点击花朵可以回看那一天。">${gardenScene(days, st)}</svg></div>`
    + gardenProgress()
    + `<div class="garden-legend"><span class="garden-count">本周 ${filled.length} 朵 · 连续 ${st.streak} 天</span>${moodWords.map((w,i)=>`<span><i style="background:${GARDEN_PAL[i][1]}"></i>${w}</span>`).join('')}</div>`
    + (bloomed?`<p class="garden-hint">点一朵花，就能回到那一天。</p>`:`<div class="garden-cta">${button('种下今天的花','focus-mood','','small primary','flower')}<span>空着的那块土，会一直等你回来。</span></div>`);
}
const GARDEN_PAL = [['#d3cbe0','#aca1c3','#8b7fa6'],['#c4d3e3','#9fb3c9','#8095ae'],['#efdcab','#d9c07a','#bfa45d'],['#f6c5ce','#e79daa','#d4808f'],['#f9a888','#ea8056','#d1673f']];

function gardenScene(days, st){
  const uid='gd'+(++gardenSeq);
  const ground=238, left=216, right=706;
  const step=days.length>1?(right-left)/(days.length-1):0;
  const sc=days.length>10?0.74:1;
  const lv=gardenLevel().lv;
  const scoreToday=st.todayMood?st.todayMood.score:0;

  const flower=(cx,base,m,delay,isToday)=>{
    const score=m.score, c=GARDEN_PAL[score-1], boost=isToday?1.16:1;
    const h=(50+score*16)*sc*boost, top=+(base-h).toFixed(1), r=(10.6+score*1.85)*sc*boost;
    const lean=((cx*7)%5-2)*1.1, n=7+score, ri=r*.62;
    const halo=isToday?`<circle class="halo" cx="${cx}" cy="${top}" r="${(r*2.5).toFixed(1)}" fill="url(#${uid}-halo)"/>`:'';
    const sparkle=score>=4?`<g class="sparkles" stroke="#f6e6ad" stroke-width="1.6" stroke-linecap="round">${[[-.95,-1.62],[-.3,-2.05],[.18,-1.7]].map(([dx,dy],k)=>{const x=+(cx+r*dx).toFixed(1),y=+(top+r*dy).toFixed(1);return `<path class="spk" style="animation-delay:${(k*.8).toFixed(1)}s" d="M${x} ${y-3.2}v6.4M${x-3.2} ${y}h6.4"/>`;}).join('')}</g>`:'';
    const outer=Array.from({length:n},(_,i)=>`<ellipse cx="${cx}" cy="${(top-r*.66).toFixed(1)}" rx="${(r*.3).toFixed(1)}" ry="${(r*.56).toFixed(1)}" fill="${c[0]}" transform="rotate(${((i*360/n)+12).toFixed(1)} ${cx} ${top})"/>`).join('');
    const inner=Array.from({length:n-1},(_,i)=>`<ellipse cx="${cx}" cy="${(top-ri*.62).toFixed(1)}" rx="${(ri*.3).toFixed(1)}" ry="${(ri*.56).toFixed(1)}" fill="${c[1]}" transform="rotate(${(i*360/(n-1)).toFixed(1)} ${cx} ${top})"/>`).join('');
    const dew=m.sleep>=7?`<circle cx="${(cx+r*.55).toFixed(1)}" cy="${(top+r*.5).toFixed(1)}" r="${(2.2*sc).toFixed(1)}" fill="#eaf3fb" stroke="#a9c6dc" stroke-width=".7"/><circle cx="${(cx+r*.45).toFixed(1)}" cy="${(top+r*.42).toFixed(1)}" r=".9" fill="#fff" opacity=".9"/>`:'';
    return `<g class="bloom" data-action="garden-day" data-id="${m.date}" style="animation-delay:${delay}s"><title>${fmtDate(m.date)} · ${moodWords[score-1]} · 睡眠 ${m.sleep} 小时</title>`
      + `<ellipse cx="${cx}" cy="${base}" rx="${(10+score).toFixed(1)}" ry="3.6" fill="#dae3c6" opacity=".9"/>`
      + halo
      + `<path class="stem" d="M${cx} ${base}C${(cx+lean).toFixed(1)} ${(base-h*.45).toFixed(1)} ${(cx-lean).toFixed(1)} ${(base-h*.78).toFixed(1)} ${cx} ${top}"/>`
      + `<ellipse class="leaf" cx="${(cx-6*sc).toFixed(1)}" cy="${(base-h*.42).toFixed(1)}" rx="${(5+score*.5).toFixed(1)}" ry="2.6" transform="rotate(-28 ${(cx-6*sc).toFixed(1)} ${(base-h*.42).toFixed(1)})"/>`
      + `<ellipse class="leaf" cx="${(cx+6*sc).toFixed(1)}" cy="${(base-h*.62).toFixed(1)}" rx="${(4.4+score*.45).toFixed(1)}" ry="2.4" transform="rotate(26 ${(cx+6*sc).toFixed(1)} ${(base-h*.62).toFixed(1)})"/>`
      + outer + inner
      + `<circle cx="${cx}" cy="${top}" r="${(r*.34).toFixed(1)}" fill="${c[2]}"/>`
      + `<circle cx="${(cx-r*.1).toFixed(1)}" cy="${(top-r*.14).toFixed(1)}" r="${(r*.1).toFixed(1)}" fill="#fff" opacity=".55"/>`
      + dew + sparkle
      + `</g>`;
  };

  const fence = lv.n>=2
    ? `<g class="fence" opacity=".92">` + Array.from({length:14},(_,i)=>{const x=196+i*40;return `<path d="M${x} 212v-27l7-6 7 6v27" fill="#f7efdd" stroke="#e3d3b8" stroke-width="1.1"/>`;}).join('')
      + `<path d="M190 201h566M190 212h566" stroke="#e8d9bf" stroke-width="1.6" opacity=".9"/></g>`
    : '';
  const stones = lv.n>=2
    ? `<g class="stones" opacity=".9">${[[64,258,11,4.4],[90,270,9,3.8],[118,281,10,4],[150,289,8,3.4]].map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#ece5d5" stroke="#ddd2ba" stroke-width=".8"/>`).join('')}</g>`
    : '';
  const bunting = lv.n>=3 ? (()=>{
    const colors=['#f2b6a8','#f7d69a','#b9cfa8','#c3cbe0','#e8c0cf'];
    let g=`<path d="M250 22Q360 66 470 26" fill="none" stroke="#e3e7d7" stroke-width="1.2"/>`;
    for(let i=0;i<8;i++){
      const t=(i+.5)/8;
      const x=(1-t)*(1-t)*250+2*t*(1-t)*360+t*t*470;
      const y=(1-t)*(1-t)*22+2*t*(1-t)*66+t*t*26;
      g+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)}L${(x+6).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y+14).toFixed(1)}Z" fill="${colors[i%5]}"/>`;
    }
    return `<g class="bunting">${g}</g>`;
  })() : '';
  const lamp = lv.n>=3
    ? `<g class="lamp"><circle cx="192" cy="158" r="26" fill="url(#${uid}-glow)"/><path d="M192 240v-72" stroke="#c6b99f" stroke-width="3" stroke-linecap="round"/><path d="M183 240h18" stroke="#b9aa8f" stroke-width="3" stroke-linecap="round"/><rect x="185" y="146" width="14" height="20" rx="3" fill="#fbe7b4" stroke="#d9c493" stroke-width="1.2"/><path d="M192 139l-8 7h16z" fill="#ccbea0"/><circle cx="192" cy="156" r="3" fill="#fff6d8"/></g>`
    : '';
  const wild = lv.n>=4
    ? Array.from({length:16},(_,i)=>{const x=226+((i*41)%470), y=250+((i*17)%24), c=['#f3c3b5','#f6dcae','#dcc9e2'][i%3];return `<circle cx="${x}" cy="${y}" r="2.4" fill="${c}" opacity=".9"/><circle cx="${x}" cy="${y}" r=".9" fill="#fdf3d8"/>`;}).join('') : '';
  const bees = lv.n>=4
    ? `<g class="bees"><g class="bee b1"><ellipse cx="0" cy="0" rx="4.2" ry="3" fill="#ecc46f"/><path d="M-4 0h8M-3 -2v4M1 -2v4" stroke="#6d5a3a" stroke-width="1"/><ellipse cx="-2" cy="-4.5" rx="3.4" ry="2" fill="#fffdf6" opacity=".85" transform="rotate(-28 -2 -4.5)"/></g><g class="bee b2"><ellipse cx="0" cy="0" rx="3.6" ry="2.6" fill="#ecc46f"/><path d="M-3.4 0h6.8M-2.6 -1.8v3.6M.8 -1.8v3.6" stroke="#6d5a3a" stroke-width=".9"/><ellipse cx="-2" cy="-4" rx="3" ry="1.8" fill="#fffdf6" opacity=".85" transform="rotate(-28 -2 -4)"/></g></g>`
    : '';
  const flies = lv.n>=5
    ? Array.from({length:7},(_,i)=>`<circle class="fly" cx="${292+i*64}" cy="${146+((i*31)%62)}" r="2" fill="#fbe6a2" style="animation-delay:${(i*.65).toFixed(1)}s"/>`).join('') : '';
  const petals = scoreToday>=1
    ? `<g class="petals">`+Array.from({length:8},(_,i)=>`<g transform="translate(${248+((i*73)%432)} ${112+((i*27)%44)})"><path class="petal" style="animation-delay:${(i*.85).toFixed(1)}s" d="M0 0q3-4 6 0-3 5-6 0" fill="#f3bfb0"/></g>`).join('')+`</g>`
    : '';

  let art='', labels='';
  days.forEach((d,i)=>{
    const xv=left+step*i, x=xv.toFixed(1), isToday=i===days.length-1;
    if(!d.mood){
      if(isToday){
        art+=`<g class="plot" data-action="focus-mood">`
          + `<ellipse cx="${x}" cy="${ground}" rx="28" ry="9" fill="#e0d0ae"/>`
          + `<ellipse cx="${x}" cy="${ground-1.8}" rx="21" ry="6.4" fill="#d2bd93"/>`
          + `<path d="M${x-13} ${ground-3.4}q13 4.6 26 0" fill="none" stroke="#bfa87f" stroke-width="1.1"/>`
          + `<circle cx="${x}" cy="${ground-25}" r="24" fill="url(#${uid}-plot)"/>`
          + `<circle class="plot-ring" cx="${x}" cy="${ground-25}" r="17.5" fill="#fffbf0" stroke="#bda87c" stroke-width="1.7" stroke-dasharray="3.8 4.2"/>`
          + `<path d="M${x} ${ground-9}v-8" stroke="#a8bd8e" stroke-width="2" stroke-linecap="round"/>`
          + `<path d="M${x-7} ${ground-25}h14M${x} ${ground-32}v14" stroke="#7f9a68" stroke-width="2.6" stroke-linecap="round"/>`
          + `<rect x="${x-22}" y="${ground-62}" width="44" height="17" rx="8.5" fill="#fffdf3" stroke="#d8c8a6"/>`
          + `<text class="g-text plot-label" x="${x}" y="${ground-50}" text-anchor="middle" font-size="10.5" fill="#6f8460">种一朵</text></g>`;
      }else{
        art+=`<g class="sprout" opacity=".55"><path d="M${x} ${ground}v-7" stroke="#b9c7a5" stroke-width="1.6" stroke-linecap="round"/><path d="M${x} ${ground-4}l-4.5-5M${x} ${ground-4}l4.5-5" stroke="#c6d2b2" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>`;
      }
    }else{
      art+=flower(xv,ground,d.mood,(i*.07).toFixed(2),isToday);
    }
    if(isToday)art+=`<g class="today-flag"><circle cx="${x}" cy="${ground}" r="16" fill="none" stroke="#d9b878" stroke-width="1.6" stroke-dasharray="3.4 4.4"/><rect x="${x-17}" y="${ground+15}" width="34" height="15" rx="7.5" fill="#fbf2dc" stroke="#e6d2a8"/><text class="g-text" x="${x}" y="${ground+25.8}" text-anchor="middle" font-size="9.5" fill="#a8863f">今天</text></g>`;
    if(days.length<=7||i%2===0)labels+=`<text class="g-text garden-date" x="${x}" y="296" text-anchor="middle" font-size="9" fill="#98a48f">${Number(d.date.slice(5,7))}/${Number(d.date.slice(8))}</text>`;
  });

  const hedge = `<g class="hedge">`
    + Array.from({length:15},(_,i)=>{const hx=168+i*40, hy=212-((i*11)%8), hr=12+((i*7)%6);
        return `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="#dce7ca"/><circle cx="${(hx+6).toFixed(1)}" cy="${(hy-7).toFixed(1)}" r="${(hr*.64).toFixed(1)}" fill="#e8efd9"/>`;}).join('')
    + `</g>`;
  const props = `<g class="props">`
    + [[22,286,9],[48,293,7.6],[71,288,8.4]].map(([x,y,r])=>
        `<ellipse cx="${x}" cy="${y+2}" rx="${(r*1.25).toFixed(1)}" ry="${(r*.3).toFixed(1)}" fill="#cdd8bb" opacity=".5"/>`
        + `<path d="M${(x-r*.72).toFixed(1)} ${y}l${(r*.16).toFixed(1)} ${(r*1.1).toFixed(1)}h${(r*1.12).toFixed(1)}l${(r*.16).toFixed(1)}-${(r*1.1).toFixed(1)}z" fill="#dfae82" stroke="#cb9a6d" stroke-width=".9" stroke-linejoin="round"/>`
        + `<path d="M${(x-r*.72).toFixed(1)} ${y}h${(r*1.44).toFixed(1)}" stroke="#c9956a" stroke-width="2"/>`
        + `<path d="M${x} ${y}v-${(r*.74).toFixed(1)}" stroke="#a8bd8e" stroke-width="1.5" stroke-linecap="round"/>`
        + `<ellipse cx="${(x-r*.34).toFixed(1)}" cy="${(y-r*.82).toFixed(1)}" rx="${(r*.36).toFixed(1)}" ry="${(r*.16).toFixed(1)}" fill="#c2d3a8" transform="rotate(-26 ${(x-r*.34).toFixed(1)} ${(y-r*.82).toFixed(1)})"/>`
        + `<ellipse cx="${(x+r*.34).toFixed(1)}" cy="${(y-r*.98).toFixed(1)}" rx="${(r*.32).toFixed(1)}" ry="${(r*.15).toFixed(1)}" fill="#c2d3a8" transform="rotate(24 ${(x+r*.34).toFixed(1)} ${(y-r*.98).toFixed(1)})"/>`
      ).join('')
    + `<g class="mushrooms"><path d="M172 272q7-10 14 0-7 4-14 0Z" fill="#efb0a1"/><path d="M176 272h6v6h-6z" fill="#fdf8ec"/>`
    + `<circle cx="177" cy="267.6" r="1" fill="#fdf8ec"/><circle cx="182" cy="269" r=".8" fill="#fdf8ec"/>`
    + `<path d="M190 281q5-7 10 0-5 3-10 0Z" fill="#f3c6b8"/><path d="M193 281h4v5h-4z" fill="#fdf8ec"/></g>`
    + `<g class="pebbles" fill="#e6e0d0"><ellipse cx="142" cy="284" rx="4.4" ry="2.3"/><ellipse cx="154" cy="292" rx="3.4" ry="1.9"/><ellipse cx="128" cy="296" rx="3" ry="1.7"/></g>`
    + `</g>`;
  const bird = lv.n>=2
    ? `<g class="bird"><ellipse cx="596" cy="176" rx="6" ry="4.6" fill="#cdd8e0"/><circle cx="601" cy="170.6" r="3.4" fill="#dde6ec"/><path d="M604 170.4l4.4 1.5-4.4 1.7z" fill="#e9b96a"/><circle cx="602" cy="169.8" r=".8" fill="#4a5a63"/><path d="M590.4 177.4l-5.4 3 5.4 .6z" fill="#c1ccd6"/></g>`
    : '';
  return `<defs>
    <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f2f6"/><stop offset=".55" stop-color="#f3f8ef"/><stop offset="1" stop-color="#fbf7e8"/></linearGradient>
    <radialGradient id="${uid}-sun"><stop offset="0" stop-color="#fbe7b2" stop-opacity=".95"/><stop offset="1" stop-color="#fbe7b2" stop-opacity="0"/></radialGradient>
    <radialGradient id="${uid}-plot"><stop offset="0" stop-color="#fff3cd" stop-opacity=".85"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
    <radialGradient id="${uid}-halo"><stop offset="0" stop-color="#fdf1c8" stop-opacity=".95"/><stop offset=".55" stop-color="#fdf1c8" stop-opacity=".35"/><stop offset="1" stop-color="#fdf1c8" stop-opacity="0"/></radialGradient>
    <radialGradient id="${uid}-glow"><stop offset="0" stop-color="#fbe3a8" stop-opacity=".85"/><stop offset="1" stop-color="#fbe3a8" stop-opacity="0"/></radialGradient>
    <linearGradient id="${uid}-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8efdc"/><stop offset="1" stop-color="#e2ebd3"/></linearGradient>
    <linearGradient id="${uid}-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3e3"/><stop offset="1" stop-color="#e7eed8"/></linearGradient>
  </defs>
  <rect x="0" y="0" width="760" height="252" fill="url(#${uid}-sky)"/>
  <circle cx="676" cy="54" r="62" fill="url(#${uid}-sun)"/>
  <g class="sun"><circle cx="676" cy="54" r="21" fill="#f7d98f"/><circle cx="676" cy="54" r="21" fill="none" stroke="#f0c96b" stroke-width="1.6" opacity=".7"/><g class="sun-rays" stroke="#f2d79c" stroke-width="1.6" stroke-linecap="round" opacity=".7">${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,x1=676+28*Math.cos(a),y1=54+28*Math.sin(a),x2=676+35*Math.cos(a),y2=54+35*Math.sin(a);return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;}).join('')}</g></g>
  <g class="cloud c1"><ellipse cx="146" cy="58" rx="30" ry="15" fill="#fff" opacity=".92"/><ellipse cx="172" cy="49" rx="22" ry="18" fill="#fff" opacity=".92"/><ellipse cx="196" cy="59" rx="26" ry="13" fill="#fff" opacity=".92"/></g>
  <g class="cloud c2"><ellipse cx="468" cy="38" rx="24" ry="11" fill="#fff" opacity=".78"/><ellipse cx="488" cy="33" rx="17" ry="13" fill="#fff" opacity=".78"/><ellipse cx="508" cy="40" rx="20" ry="10" fill="#fff" opacity=".78"/></g>
  <g class="birds" fill="none" stroke="#a4b3a7" stroke-width="1.4" stroke-linecap="round" opacity=".65"><path d="M556 88q6-5 12 0q6-5 12 0"/><path d="M592 72q5-4 10 0q5-4 10 0"/></g>
  <path d="M0 212Q120 184 254 204T520 196T760 210L760 252L0 252Z" fill="url(#${uid}-hill)"/>
  ${hedge}
  ${fence}
  <path d="M0 232Q140 218 300 230T560 228T760 234L760 306L0 306Z" fill="url(#${uid}-grass)"/>
  <path d="M0 238Q140 232 300 236T560 235T760 238" fill="none" stroke="#dbe4cd" stroke-width="1.3"/>
  ${props}
  <g class="grass-tuft" opacity=".7">${Array.from({length:26},(_,i)=>`<path d="M${12+i*29} ${252+(i%3)*6}q3-9 6 0" stroke="#c6d2b2" stroke-width="1.5" fill="none" stroke-linecap="round"/>`).join('')}</g>
  ${stones}${lamp}${bunting}
  <g class="butterfly b1"><path d="M0 0q-9-9-13 0 9 9 13 0" fill="#f3c3a0"/><path d="M0 0q9-9 13 0-9 9-13 0" fill="#f8dcc3"/><path d="M0 0v7" stroke="#8a7a63" stroke-width="1.2"/></g>
  <g class="butterfly b2"><path d="M0 0q-7-7-10 0 7 7 10 0" fill="#d3c3e0"/><path d="M0 0q7-7 10 0-7 7-10 0" fill="#e6dcf0"/><path d="M0 0v6" stroke="#8a7a63" stroke-width="1.1"/></g>
  ${gardenerSvg(st)}
  ${art}${wild}${bees}${flies}${bird}${petals}${labels}
  `;
}

function moodView(){
  const rows=[...db.moods].sort((a,b)=>b.date.localeCompare(a.date));
  const days=gardenDays(),count=days.filter(d=>d.mood).length;
  const sub = moodTab==='weekly'?'以周为页，回看心情与休息的变化。':moodTab==='records'?'记录身体的变化，产检时更容易说清楚。'
    : moodTab==='alert'?'撑不住的时候，把这句话递到伴侣的首页。'
    : (count?`花园里已经有 ${count} 朵花，慢慢开就好。`:'记录真实的自己，不给感受打对错分。');
  const action = moodTab==='records'?careBodyButton('孕期信息','profile','','small'):'';
  return `<section class="mood-page">${head('心情与身体',sub,action)}${subNav([['today','心情与睡眠','心情 · 睡眠 · 情绪花园','tab-mood'],['weekly','每周简报','自动整理 · 翻页回顾','tab-mood'],['records','孕期记录','孕周 · 体重 · 血压 · 产检','tab-mood'],['alert','心情预警','需要时，递给伴侣','tab-mood']],moodTab)}${moodTab==='weekly'?YunxinWeekly.render(db.moods,today()):moodTab==='records'?careRecordsBody():moodTab==='alert'?alertBody():moodTodayBody(rows,count)}</section>`;
}
function moodTodayBody(rows,count){
  return `<div class="two-col mood-layout"><section class="card mood-record-card"><div class="card-header"><h2>给今天留一个记录</h2><span class="pill">仅妈妈可见</span></div>${moodForm(db.moods.find(m=>m.date===today()))}</section><div class="stack"><section class="card garden-card"><div class="card-header"><h2>我的情绪花园</h2><div class="tabs"><button class="tab ${gardenMode==='garden'?'active':''}" data-action="garden-mode" data-id="garden">花园</button><button class="tab ${gardenMode==='trend'?'active':''}" data-action="garden-mode" data-id="trend">趋势</button></div></div>${gardenMode==='garden'?flowerGarden():chart()}<div class="garden-foot">${gardenMode==='garden'?'<span>花开得越舒展，说明那天的心情越好；花瓣上的露珠，代表睡足了七小时。想给她换帽子或围裙，点下面的按钮。</span>':''}<button type="button" class="btn small ghost" data-action="open-studio">${icon('leaf')}给小暖换装</button><div class="tabs">${[7,14].map(n=>`<button class="tab ${trendDays===n?'active':''}" data-action="trend" data-id="${n}">${n} 天</button>`).join('')}</div></div><p class="small-copy spaced no-margin">这些是你自己的生活记录，用来回顾变化，不代表诊断结果。</p></section><section class="card mood-history-card"><div class="card-header"><h2>过往记录</h2><span class="subtle">共 ${rows.length} 条</span></div>${rows.length?rows.map(m=>`<article class="record"><div class="record-head"><strong>${fmtDate(m.date)}</strong><div class="row-controls">${iconButton('编辑心情记录','mood-edit',m.id,'edit')}${iconButton('删除心情记录','delete',`moods:${m.id}`,'trash')}</div></div><span class="pill">${moodWords[m.score-1]}</span> <span class="pill blue">睡眠 ${m.sleep} 小时</span>${m.note?`<p>${esc(m.note)}</p>`:''}</article>`).join(''):empty('还没有记录','可以从今天开始，也可以补记过去的一天。')}</section></div></div>`;
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
function energyRing(){
  const tasks=visibleTasks();
  const shared=tasks.filter(t=>t.shared&&!t.revoked);
  const done=shared.filter(t=>t.status==='completed');
  const doing=shared.filter(t=>t.status==='in_progress'||t.status==='accepted');
  const waiting=shared.filter(t=>t.status==='waiting'||t.status==='proposed'||t.status==='draft');
  const total=shared.length;
  const slots=Math.min(12,Math.max(6,total));
  const lit=Math.min(slots,done.length);
  const full=lit===slots;
  const sweep=lit/slots*360;
  const points=['50% 50%','50% -25%'];
  for(let angle=0;angle<=sweep;angle+=5){
    const rad=(angle-90)*Math.PI/180;
    points.push(`${(50+75*Math.cos(rad)).toFixed(2)}% ${(50+75*Math.sin(rad)).toFixed(2)}%`);
  }
  const end=(sweep-90)*Math.PI/180;
  points.push(`${(50+75*Math.cos(end)).toFixed(2)}% ${(50+75*Math.sin(end)).toFixed(2)}%`);
  const reveal=full?'none':lit?`polygon(${points.join(',')})`:'polygon(50% 50%,50% 50%,50% 50%)';
  const status=full?'暖意成环':lit?'相伴渐成':'静候初绽';
  const description=`相伴花环：共 ${total} 项已分享安排，完成 ${done.length} 次接力，花环已点亮 ${lit} / ${slots} 份。`;
  return `<section class="energy-card"><div class="energy-visual">
    <div class="energy-wreath ${full?'is-full':''}" role="img" aria-label="${description}">
      <img class="wreath-ghost" src="/assets/companion-wreath.png" alt="" aria-hidden="true" width="1024" height="1024">
      <img class="wreath-leaves" src="/assets/companion-wreath.png" alt="" aria-hidden="true" width="1024" height="1024" style="clip-path:${reveal}">
      <div class="wreath-center" aria-hidden="true"><strong>${done.length}</strong><span>次接力</span><i></i><small>${status}</small></div>
    </div>
    <div class="wreath-caption">${lit} / ${slots} 份相伴已留存</div>
  </div><div class="energy-copy"><div class="energy-title"><h2>相伴花环</h2><span class="pill">协作留下的温度</span></div><p class="small-copy">每完成一项已分享的安排，花环就舒展一分。把彼此分担的日常，收进这一圈花叶之间。</p><div class="energy-stats"><div><strong>${total}</strong><span>已分享安排</span></div><div><strong>${doing.length+done.length}</strong><span>已接手或完成</span></div><div><strong>${waiting.length}</strong><span>等待确认</span></div></div><p class="wreath-footnote">花环最多呈现 12 份相伴，接力次数继续累计</p>${role==='mother'?`<div class="energy-actions"><a class="text-link" href="#mood">翻阅情绪花园 →</a><a class="text-link" href="#practice">进入沟通练习 →</a></div>`:''}</div></section>`;
}
function needInline(){
  const needs=[...db.needs].reverse().slice(0,3);
  const mom=role==='mother';
  return `<section class="card need-inline"><div class="card-header"><h2>此刻，我需要什么</h2>${mom?button('记录一个需要','need-new','','small','plus'):'<span class="pill">仅妈妈可编辑</span>'}</div>${mom?`<div class="chips">${categories.map(c=>button(c,'need-new',c,'chip')).join('')}</div>`:''}<p class="small-copy no-margin">先选一个最贴近的，再写下感受。只有你确认的需要，才会整理成协作安排。</p>${needs.length?`<div class="need-mini-list">${needs.map(n=>`<div class="need-mini"><div class="inline-end"><span class="pill">${esc(n.category)}</span><span class="record-meta">${fmtDate(n.created)}</span></div><p>${esc(n.text)}</p>${mom?`<div class="row-controls">${iconButton('编辑需要','need-edit',n.id,'edit')}${button('整理成协作','task-from-need',n.id,'small ghost','arrow')}</div>`:''}</div>`).join('')}</div>`:empty('还没有记录需要','想到的时候，再写下来也可以。','',true)}</section>`;
}
/* 二级模块切换条：把合并进来的子模块放在同一页 */
function subNav(items,active){
  const illustrated=items.some(item=>item[3]==='tab-mood');
  return `<div class="subnav ${illustrated?'subnav-expanded':''}" role="tablist" aria-label="子模块">${items.map(([key,label,desc,action])=>`<button type="button" role="tab" class="subnav-item ${active===key?'active':''}" aria-selected="${active===key}" data-action="${action}" data-id="${key}">${illustrated?`<span class="subnav-symbol" aria-hidden="true">${icon({today:'heart',weekly:'book',records:'leaf',alert:'alert'}[key]||'heart')}</span>`:''}<span class="subnav-copy"><strong>${label}</strong><small>${desc}</small></span>${illustrated?`<span class="subnav-current" aria-hidden="true">${active===key?icon('check'):icon('chevron')}</span>`:''}</button>`).join('')}</div>`;
}
function familyView(){
  const own=role==='mother';
  const action=familyTab==='collab'&&own?button('创建协作安排','task-new','','primary','plus'):'';
  const alert=familyTab==='collab'&&(openAlerts().length||(role==='partner'&&alerts().length))?`<div class="spaced">${alertInboxCard(openAlerts()[0]||alerts()[0])}</div>`:'';
  return `${head('家庭协作',own?'先商量，再接手；事情做完以后，也听听彼此的感受。':'先听一听，再接手一件力所能及的小事。',action)}${subNav([['collab','协作安排','需要 → 安排 → 接手 → 反馈','tab-family'],['practice','沟通练习','三组虚构情境与参考表达','tab-family']],familyTab)}${alert}${familyTab==='practice'?practiceBody():familyBody()}`;
}
function familyBody(){
  const tasks=visibleTasks(); const rows=tasks.filter(t=>taskFilter==='all'||(taskFilter==='active'&&!['completed','cancelled'].includes(t.status))||(taskFilter==='completed'&&t.status==='completed')||(taskFilter==='today'&&t.date===today()));
  return `${energyRing()}<div class="toolbar"><div class="tabs">${[['active','待办安排'],['today','今日计划'],['completed','已完成'],['all','全部']].map(([v,l])=>`<button class="tab ${taskFilter===v?'active':''}" data-action="task-filter" data-id="${v}">${l}</button>`).join('')}</div><span class="subtle">${role==='mother'?'妈妈提出需要 · 伴侣确认接手':'这里只展示妈妈选择分享的安排'}</span></div><div class="wide-col"><div>${rows.length?[...rows].sort((a,b)=>a.date.localeCompare(b.date)).map(taskCard).join(''):`<div class="card">${empty('这里还没有符合条件的安排',role==='mother'?'从一个具体的小请求开始，时间与做法都可以商量。':'妈妈分享后，安排会出现在这里。可以先练习怎样倾听。',role==='mother'?button('创建第一个安排','task-new','','small'):button('试试沟通练习','go','practice','small'))}</div>`}</div><div class="stack">${role==='partner'?grantsPartnerCard():''}${needInline()}<section class="card"><div class="card-header"><h2>一个请求，四个小步骤</h2></div><ol class="step-list"><li>妈妈整理需要，预览后分享具体安排。</li><li>伴侣接受、提出修改，或说明暂时无法接手。</li><li>双方确认同一个安排后，由负责人接手。</li><li>分别记录完成情况和妈妈感受到的帮助。</li></ol></section>${panel('原始倾诉、心情和帮助反馈不会显示在伴侣视角中。撤回分享后，伴侣视角不再展示该安排。')}<div class="quote"><p>“做完了”和“有帮助”，<br>是两件可以分别记录的事。</p></div></div></div>`;
}
function practiceBody(){
  const history=role==='mother'?db.practices:[];
  return `<div class="panel-note">${icon('book')}<span>以下使用虚构生活情境和固定参考表达。练习没有标准分数，也不是 AI 对话。</span></div><div class="three-col spaced">${scenarios.map(s=>`<section class="card practice-card"><div class="tile-icon">${icon(s.icon)}</div><h3>${s.title}</h3><p>${s.desc}</p>${button('开始练习','practice-start',s.id,'small','arrow')}</section>`).join('')}</div>${role==='mother'?`<section class="card spaced"><div class="card-header"><h2>我的练习笔记</h2><span class="subtle">只在妈妈视角中展示</span></div>${history.length?[...history].reverse().map(p=>`<article class="record"><div class="record-head"><strong>${esc(scenarios.find(s=>s.id===p.scenario)?.title||'沟通练习')}</strong><div class="row-controls"><span class="record-meta">${fmtDate(p.created)}</span>${iconButton('删除练习记录','delete',`practices:${p.id}`,'trash')}</div></div><p>${esc(p.text)}</p></article>`).join(''):empty('留下一句想尝试的新表达','完成练习后，可以把自己的表达保存在这里。', '',true)}</section>`:''}`;
}



function practiceView(){
  return `${head('沟通练习','不追求完美的回应，从一次更温柔的表达开始。')}${practiceBody()}`;
}

/* ===== 小暖工坊：毛绒小人形象设计 ===== */
const PET_HATS=[['straw','草帽'],['wreath','花环'],['beret','贝雷帽'],['none','不戴帽子']];
const PET_ACCS=[['leaf','小芽发夹'],['glasses','圆框眼镜'],['bow','小领结'],['none','不戴配饰']];
const PET_SKINS=[['#f3c9a9','奶杏'],['#e8b48f','蜜桃'],['#d79b76','麦色'],['#b97f5f','可可']];
const PET_HAIRS=[['#594238','栗棕'],['#7b4b33','焦糖'],['#2f2a28','墨黑'],['#a9784f','亚麻'],['#c9a06a','麦金']];
const PET_OUTFITS=[['#719782','鼠尾草'],['#b58b9a','豆沙'],['#829eb3','雾蓝'],['#c4a16f','麦芽'],['#8ea9c4','湖水蓝',7],['#d7a3a9','蔷薇',14]];
let petDraft=null;
let studioTab="face", studioZoom="full";
function petIsDirty(){return JSON.stringify(YunxinPet.normalize(petDraft||db.settings.pet||{}))!==JSON.stringify(YunxinPet.normalize(db.settings.pet||{}));}

function petUnlocks(){
  const total=db.moods.length, streak=gardenStats().streak;
  return {
    wreath:{ok:total>=5,need:Math.max(0,5-total),kind:'flower'},
    beret:{ok:streak>=5,need:Math.max(0,5-streak),kind:'day'},
    bow:{ok:total>=10,need:Math.max(0,10-total),kind:'flower'},
    '#8ea9c4':{ok:total>=7,need:Math.max(0,7-total),kind:'flower'},
    '#d7a3a9':{ok:total>=14,need:Math.max(0,14-total),kind:'flower'}
  };
}
function lockText(u){return u? (u.kind==='day'?`再连续 ${u.need} 天`:`再种 ${u.need} 朵花`):'';}
function petChips(field,items,current,unlocks){
  return items.map(([v,label])=>{
    const u=unlocks[v], ok=!u||u.ok;
    return `<button type="button" class="pchip ${current===v?'on':''} ${ok?'':'locked'}" aria-pressed="${current===v}" data-action="pet-set" data-id="${field}:${v}" ${ok?'':`aria-disabled="true" title="${lockText(u)}解锁"`}>${esc(label)}${ok?'':`<small>${lockText(u)}</small>${icon('lock')}`}</button>`;
  }).join('');
}
function petSwatches(field,items,current,unlocks){
  return items.map(([hex,label,need])=>{
    const u=need?unlocks[hex]:null, ok=!u||u.ok;
    return `<button type="button" class="psw ${current.toLowerCase()===hex.toLowerCase()?'on':''} ${ok?'':'locked'}" style="--swatch:${hex}" aria-pressed="${current.toLowerCase()===hex.toLowerCase()}" data-sw="${hex}" data-action="pet-set" data-id="${field}:${hex}" aria-label="${esc(label)}" title="${esc(label)}${ok?'':` · ${lockText(u)}解锁`}" ${ok?'':'aria-disabled="true"'}><i aria-hidden="true"></i><span>${esc(label)}</span>${ok?'':icon('lock')}</button>`;
  }).join('');
}
function studioPet(st){
  return `<yunxin-pet id="studio-pet" gardener streak="${st.streak}" line="${esc(petLine(st))}" config="${esc(JSON.stringify(petDraft))}"></yunxin-pet>`;
}
function studioControls(){
  const u=petUnlocks(), c=YunxinPet.normalize(petDraft),dirty=petIsDirty();
  const fields={
    face:`<div class="pfield"><span>肤色</span><div class="prow">${petSwatches('skin',PET_SKINS,c.skin,u)}</div></div>
      <div class="pfield"><span>表情起点</span><div class="pchips expression-presets">${[['soft','温柔',35,45,45,55],['bright','明朗',60,65,55,85],['calm','恬静',45,35,45,30]].map(([k,l])=>`<button class="pchip" type="button" data-action="pet-expression" data-id="${k}">${icon('heart')}${l}</button>`).join('')}</div></div>
      <div class="face-sliders">${[['face','脸颊圆润','清秀','圆润'],['eyes','眼睛大小','细巧','明亮'],['gap','眼睛间距','靠近','舒展'],['smile','微笑弧度','轻抿','微笑']].map(([k,l,left,right])=>`<div class="prange"><label for="pr-${k}">${l}</label><output data-pet-out="${k}" for="pr-${k}">${c[k]}</output><input id="pr-${k}" type="range" min="0" max="100" value="${c[k]}" data-pet-range="${k}"><div class="range-ends"><span>${left}</span><span>${right}</span></div></div>`).join('')}</div>`,
    hair:`<div class="pfield"><span>发型</span><div class="pchips hair-options">${petChips('hair',[['bob','波波头'],['buns','双丸子']],c.hair,u)}</div></div><div class="pfield"><span>发色</span><div class="prow">${petSwatches('hairColor',PET_HAIRS,c.hairColor,u)}</div></div><div class="pfield"><span>帽子</span><div class="pchips">${petChips('hat',PET_HATS,c.hat,u)}</div></div>`,
    outfit:`<div class="pfield"><span>围裙颜色</span><div class="prow">${petSwatches('outfit',PET_OUTFITS,c.outfit,u)}</div></div><div class="pfield"><span>随身配饰</span><div class="pchips">${petChips('accessory',PET_ACCS,c.accessory,u)}</div></div><p class="studio-hint">带锁的装扮会随记录慢慢解锁，已解锁的可以随心搭配。</p>`
  };
  return `<form data-form="pet"><div class="studio-editor-title"><h2>设计你的小暖</h2><span id="pet-draft-status" role="status">${dirty?'有修改待保存':'已与保存的外观一致'}</span></div><div class="pfield studio-name-field"><label for="pet-name-input">小伙伴的名字</label><input class="input" id="pet-name-input" maxlength="12" autocomplete="off" value="${esc(c.name)}" aria-label="小暖的名字"></div>
  <div class="studio-tabs" role="tablist" aria-label="外观分类">${[['face','五官与表情'],['hair','发型与帽子'],['outfit','颜色与配饰']].map(([k,l])=>`<button type="button" role="tab" id="studio-tab-${k}" aria-selected="${studioTab===k}" aria-controls="studio-panel" tabindex="${studioTab===k?0:-1}" data-action="pet-tab" data-id="${k}">${l}</button>`).join('')}</div>
  <div class="studio-panel" id="studio-panel" role="tabpanel" aria-labelledby="studio-tab-${studioTab}">${fields[studioTab]}</div>
  <div class="studio-save"><div class="studio-save-main"><button class="btn primary" type="submit">${icon('check')}保存小暖的新样子</button><button class="btn" type="button" data-action="pet-discard">放弃本次修改</button></div><div class="studio-save-secondary"><button class="text-link" type="button" data-action="pet-random">试试随机搭配</button><button class="text-link" type="button" data-action="pet-reset">恢复默认外观</button><span>调整只预览，保存后生效</span></div></div></form>`;
}
function studioUnlockCard(){
  const st=gardenStats(), u=petUnlocks();
  const rows=[['wreath','花环',`累计种下 5 朵花`,'flower'],['#8ea9c4','湖水蓝围裙','累计种下 7 朵花','leaf'],['bow','小领结','累计种下 10 朵花','heart'],['#d7a3a9','蔷薇围裙','累计种下 14 朵花','leaf'],['beret','贝雷帽','连续记录 5 天','sun']];
  return `<section class="card studio-unlock"><div class="card-header"><h2>种花解锁</h2><span class="pill">已种 ${st.bloom} 朵</span></div>
  <ul class="unlock-list">${rows.map(([key,label,rule,ico])=>{
    const done=u[key]?.ok;
    return `<li class="${done?'done':''}"><span class="u-icon">${icon(ico)}</span><span><b>${label}</b><em>${done?'已解锁':rule}</em></span><span class="u-state">${done?'✓':`差 ${u[key]?.need??0}`}</span></li>`;
  }).join('')}</ul>
  <p class="small-copy no-margin spaced">每一朵花都来自一次真实的记录。不用为了解锁去补记难过的事，花园等你慢慢来。</p></section>`;
}
function studioView(){
  if(!petDraft)petDraft=YunxinPet.normalize(db.settings.pet||{});
  const st=gardenStats(), gl=gardenLevel();
  const ro=role!=='mother';
  return `${head('小暖工坊', ro?'这是妈妈为小暖设计的样子，你可以看看。':'捏一个只属于你的园丁。花园里种下的花，会慢慢解锁新的装扮。')}
  <div class="studio-back"><a href="#mood">‹ 返回心情与身体</a><span>心情与身体 · 小暖工坊</span></div>
  <div class="studio-grid">
    <section class="card studio-preview" aria-label="小暖的预览">
      <div class="studio-head"><h2 id="studio-name">${esc(petDraft.name)}</h2><p>${gl.lv.name} · 已种下 ${st.bloom} 朵花 · 连续 ${st.streak} 天</p></div>
      <div class="preview-modes" role="group" aria-label="预览范围">${[["full","全身"],["face","脸部特写"]].map(([k,l])=>`<button type="button" data-action="pet-zoom" data-id="${k}" aria-pressed="${studioZoom===k}">${l}</button>`).join('')}</div><div class="studio-stage ${studioZoom==='face'?'zoom-face':''}" id="studio-stage">${studioPet(st)}</div>
      <p class="studio-quote">“${esc(petLine(st))}”</p>
      <div class="studio-stats"><div><strong>${st.bloom}</strong><span>朵花</span></div><div><strong>${st.streak}</strong><span>天连续</span></div><div><strong>Lv.${gl.lv.n}</strong><span>花园等级</span></div></div>
    </section>
    <div class="stack">
      ${ro?'<section class="card"><div class="card-header"><h2>这是妈妈设计的小暖</h2><span class="pill">只读</span></div><p class="small-copy no-margin">小暖的样子由妈妈在妈妈视角里设计。花园里种下的花，会为它解锁新的装扮。</p></section>':`<section class="card" id="studio-controls">${studioControls()}</section>`}
      ${studioUnlockCard()}
    </div>
  </div>`;
}
function refreshPetOnly(){
  const host=$('#studio-pet');
  if(host){const cfg=YunxinPet.normalize(petDraft);host.config=cfg;host.setAttribute('config',JSON.stringify(cfg));host.refresh();}
  const nameEl=$('#studio-name');if(nameEl)nameEl.textContent=petDraft.name;
  const status=$('#pet-draft-status');if(status)status.textContent=petIsDirty()?'有修改待保存':'已与保存的外观一致';
  const line=$('.studio-quote');if(line)line.textContent=`“${petLine(gardenStats())}”`;
}
function syncPetStudio(){
  const focus=document.activeElement;const action=focus?.dataset.action,id=focus?.dataset.id;
  const box=$('#studio-controls');if(box){box.innerHTML=studioControls();if(action&&id)box.querySelector(`[data-action="${CSS.escape(action)}"][data-id="${CSS.escape(id)}"]`)?.focus({preventScroll:true});}
  refreshPetOnly();
}

function settingsView(){
  if(role==='partner')return `${head('我的','本地使用，随时切换体验视角。')}<section class="card"><div class="settings-row"><div><h3>当前为伴侣视角</h3><p>基本偏好与数据管理入口位于妈妈视角。</p></div>${button('切换使用视角','role')}</div>${panel('进入妈妈视角需要账号密码验证（默认示意账号 yunxin，密码 123456）。数据仍只保存在这台设备，不等于真实账户隔离。')}</section>`;
  const total=['moods','needs','tasks','notes','practices','alerts'].reduce((n,k)=>n+(db[k]?.length||0),0)+(db.pregnancy?.entries.length||0)+(db.pregnancy?.visits.length||0);
  return `${head('我的','你的记录，由你自己掌握。')}<div class="two-col"><div class="stack"><section class="card mobile-guide"><div class="card-header"><h2>手机使用</h2><span class="pill">iPhone · 安卓</span></div><p class="small-copy">“离线资源已就绪”后，可离线记录。天气查询和外部链接仍需要网络。</p><details><summary>添加到手机主屏幕</summary><p>iPhone：用 Safari 打开网址，轻点分享按钮，选择“添加到主屏幕”。</p><p>安卓：用 Chrome 或 Edge 打开网址，在浏览器菜单中选择“添加到主屏幕”或“安装应用”。</p><p>如在微信中打开，请先选择“在浏览器打开”。开始正式记录前，先确定使用浏览器还是桌面入口，避免记录分散在不同空间。</p></details><details><summary>换手机与备份</summary><p>在下方“导出备份”保存 JSON 文件。换手机后，打开同一网址，选择“从备份恢复”。记录不会自动跨设备同步。</p></details><p class="small-copy mobile-cache-state" role="status">正在检查离线资源</p></section><section class="card"><div class="card-header"><h2>基本信息</h2></div><form data-form="settings">${inputField('name','希望怎么称呼你',db.settings.name,'text','maxlength="30" placeholder="选填，首页会用这个名字问候你"')}${selectField('stage','当前阶段',['产后居家','孕期准备','其他'],db.settings.stage)}${selectField('preferred','更偏好的支持方式',categories,db.settings.preferred)}${selectField('available','通常可以留出的时间（分钟）',['5','10','15','30'],String(db.settings.available))}<button class="btn primary" type="submit">保存偏好</button></form></section><section class="card"><div class="card-header"><h2>使用视角</h2></div><p class="small-copy">当前：妈妈视角。伴侣视角展示已分享的安排，以及沟通练习。</p>${button('切换到伴侣视角','switch-role','partner','','people')}${button('修改视角密码','role-pass','','','lock')}<div class="privacy-line">${icon('info')}进入妈妈视角需要账号密码验证；密码只保存在这台设备，忘记密码可在说明文档查看重置方法。</div></section></div><div class="stack"><section class="card"><div class="card-header"><h2>本地数据</h2><span class="pill">保存在当前浏览器</span></div><span class="export-count">${total} <small class="subtle">条记录</small></span><p class="small-copy">保存按钮成功提示后，记录已经写入当前浏览器。刷新、关闭浏览器或重启设备后，用同一浏览器打开同一网址即可继续。更换设备或浏览器不会同步。</p><div class="panel-note warm">清除网站数据、使用无痕模式或浏览器自动回收存储都可能丢失记录。请使用普通窗口，并定期导出备份。</div><div class="settings-row"><div><h3>申请保留浏览器数据</h3><p>请浏览器尽量避免自动清理记录；能否开启取决于浏览器，仍需备份。</p></div>${button('申请保留','persist','','small')}</div><div class="settings-row"><div><h3>导出完整备份</h3><p>将所有记录存成一个文件，建议定期另存一份。</p></div>${button('导出备份','export','','small','download')}</div><div class="settings-row"><div><h3>从备份恢复</h3><p>先检查文件，再确认是否覆盖当前全部记录。</p></div>${button('选择备份','import','','small','upload')}</div><input type="file" id="backup-file" accept=".json,application/json" class="hidden"><p class="small-copy spaced no-margin">未提交草稿只留在当前浏览器，不计入备份。备份包含个人记录，是未加密文件，请放在自己管理的位置。本应用不提供云同步。</p></section><section class="card danger-area"><h3>清空所有记录</h3><p class="small-copy">这会重置当前数据和偏好。请先导出备份；操作前需要输入“清空”。</p>${button('清空本地记录','clear','','small danger','trash')}</section><div class="panel-note">${icon('leaf')}<span>网页版 1.0 · 浏览器保存<br>情绪花园与协作能量环均为当前记录的可视化，不接入在线 AI，不提供诊断或自动救援。</span></div></div></div>`;
}

function needModal(id='',category=''){
  const n=db.needs.find(n=>n.id===id);
  showModal(n?'修改我的需要':'此刻，我需要什么？',`<form data-form="need" data-id="${esc(n?.id||'')}">${selectField('category','最贴近当前需要的一项',categories,n?.category||category||'倾听')}${textField('text','写下自己的感受',n?.text||'','例如：今天听到了很多建议，我更希望有人听我说完。','required')}<div class="check-row"><input id="need-confirm" type="checkbox" required><label for="need-confirm">我确认这符合自己的需要。原始表达不自动分享。</label></div>${footerButtons('确认并保存')}</form>`);
}
function taskModal(id='',needId=''){
  const t=db.tasks.find(x=>x.id===id);const n=db.needs.find(x=>x.id===needId);
  showModal(t?'编辑安排':'把需要整理成一个具体安排',`<form data-form="task" data-id="${esc(t?.id||'')}" data-need="${esc(t?.needId||needId)}">${inputField('title','这次希望做什么',t?.title||(n?`我希望得到${n.category}支持`:''),'text','required maxlength="100" placeholder="例如：今晚帮我收拾餐桌"')}<div class="form-grid">${inputField('date','日期',t?.date||today(),'date','required')}${inputField('time','时间（可留空后商量）',t?.time||'','time')}${selectField('owner','希望由谁负责',['伴侣','妈妈'],t?.owner||'伴侣')}${selectField('category','对应的支持需要',categories,t?.category||n?.category||'实际帮忙')}</div>${textField('details','怎样算完成 / 有什么需要商量的（选填）',t?.details||'','例如：收好碗筷并擦干净桌面。也可以先保存，稍后补充。')}${panel('这里填写的是你准备分享的安排。原始倾诉不会自动复制进来。保存后，仍需预览并确认才会分享给伴侣。')}${footerButtons('先保存安排')}</form>`);
}
function shareModal(id){
  const t=db.tasks.find(x=>x.id===id); if(!t)return;
  pendingTask=id;
  showModal('分享前，再看一眼',`<p>伴侣视角将看到以下内容。只有双方确认的安排，才开始执行。</p><table class="preview-table"><tbody><tr><td>分享给</td><td>伴侣视角</td></tr><tr><td>需要类型</td><td>${esc(t.category)}</td></tr><tr><td>具体安排</td><td>${esc(t.title)}</td></tr><tr><td>时间</td><td>${esc(t.date)} ${esc(t.time||'待商量')}</td></tr><tr><td>负责人</td><td>${esc(t.owner)}</td></tr><tr><td>完成要求</td><td>${esc(t.details)}</td></tr></tbody></table>${panel('不包含心情、原始倾诉、个人备忘或帮助反馈。你可以撤回后续展示，但无法收回对方已经看过的内容。')}<div class="modal-footer">${button('再想一想','close')}${button('确认分享','share-confirm',id,'primary','shield')}</div>`);
}
function practiceModal(id,step=1){
  const s=scenarios.find(x=>x.id===id); if(!s)return;
  showModal(s.title,`<span class="pill">${step===1?'第一步 · 读懂情境':'第二步 · 试着表达'}</span><div class="quote-box">${s.scene}</div>${step===1?`<ol class="step-list">${s.steps.map(x=>`<li>${x}</li>`).join('')}</ol><div class="modal-footer">${button('先到这里','close')}${button('我想试着回应','practice-write',id,'primary','arrow')}</div>`:`<form data-form="practice" data-id="${id}">${textField('text','你会怎样回应？','','按照自己的习惯写，不需要和参考表达一模一样。','required')}<details><summary class="text-link">看看一个参考表达</summary><div class="quote-box">${s.example}</div></details>${role==='partner'?'<p class="small-copy spaced">伴侣视角可以练习，本次内容不保存到妈妈的个人笔记中。</p>':''}${footerButtons(role==='mother'?'保存这次练习':'完成练习')}</form>`}`);
}



document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const el=event.target.closest?.('[role="button"][data-action]');if(!el)return;
  event.preventDefault();
  el.dispatchEvent(new MouseEvent('click',{bubbles:true}));
});
document.addEventListener('click',async event=>{
  const el=event.target.closest('[data-action]');if(!el||!db||busy)return;
  const action=el.dataset.action,id=el.dataset.id||'';
  if(action==='open-studio'&&event.target.closest('[data-pet]'))return;
  const motherOnly=['open-studio','quick-mood','mood-select','mood-edit','alert-new','alert-remove','alert-remove-confirm','need-new','need-edit','task-new','task-edit','task-from-need','task-share','share-confirm','task-revoke','feedback','export','import','clear','clear-confirm','delete','delete-confirm','proposal-review','proposal-accept','proposal-decline','grant-decide','grant-decline','grant-decline-confirm','grant-revoke','grant-revoke-confirm'];
  if(role==='partner'&&motherOnly.includes(action))return toast('请切换到妈妈视角后操作',true);
  if(action==='go')return go(id);
  if(action==='open-studio')return go('studio');
  if(action==='tab-family'){familyTab=id==='practice'?'practice':'collab';history.replaceState(null,'',familyTab==='practice'?'#family/practice':'#family');render();return;}
  if(action==='tab-mood'){moodTab=['today','records','alert','weekly'].includes(id)?id:'today';history.replaceState(null,'',moodTab==='today'?'#mood':`#mood/${moodTab}`);render();return;}
  if(action==='alert-new')return alertModal(id);
  if(action==='alert-need'){el.classList.toggle('on');el.setAttribute('aria-pressed',String(el.classList.contains('on')));return;}
  if(action==='alert-reply'){
    const [aid,code]=id.split(':');if(!ALERT_REPLIES[code])return;
    if(await commit(d=>{const a=(d.alerts||[]).find(x=>x.id===aid);if(!a)return;a.status='replied';a.reply=ALERT_REPLIES[code];a.replyAt=stamp();},'已经回给她了'))render();
    return;
  }
  if(action==='alert-remove')return showModal('撤回这条预警？',`<p>撤回后，这条预警会从伴侣的首页消失。已经发生的对话不会被改写。</p><div class="modal-footer">${button('保留','close')}${button('确认撤回','alert-remove-confirm',id,'danger')}</div>`);
  if(action==='alert-reply-custom'){
    const a=alerts().find(x=>x.id===id);if(!a)return;
    return showModal('写一句自己的回应',`<p>下面的草稿只是按她的预警生成的参考，发送前可以随便改。草稿只在你这边预览，不会自动发出去。</p><form data-form="alert-reply-custom" data-id="${id}"><div class="field"><label for="reply-input">你的回应</label><textarea id="reply-input" class="input" name="reply" rows="3" required maxlength="200">${esc(draftForAlert(a.level,a.needs||[]))}</textarea></div>${footerButtons('回给她')}</form>`);
  }
  if(action==='alert-draft'){
    const form2=el.closest('form');if(!form2)return;
    const needs=[...form2.querySelectorAll('[data-alert-needs] .chip.on')].map(b=>b.textContent.trim());
    const field=form2.querySelector('[name="message"]');
    if(field){field.value=draftForAlert(el.dataset.id,needs);field.dispatchEvent(new Event('input',{bubbles:true}));}
    return toast('已按你的选择填入草稿，发送前可以随便改');
  }
  if(action==='grant-request')return showModal('申请查看其他数据',`<p>选择想了解的数据，由她决定给哪些、给多久，也可以拒绝。批准后，这里只会显示她批准的字段，到期自动停止显示。</p><form data-form="grant-request"><div class="field-label">想看什么（可多选）</div><div class="chips" data-grant-fields>${Object.entries(GRANT_FIELDS).map(([k,l])=>`<button type="button" class="chip" data-action="alert-need" data-id="${k}">${l}</button>`).join('')}</div><div class="field"><label for="grant-days">希望看多久</label><select id="grant-days" class="input" name="days">${GRANT_DAYS.map(([v,l])=>`<option value="${v}" ${v==='7'?'selected':''}>${l}</option>`).join('')}</select></div>${textField('note','为什么想看（选填）','','例如：想这周多留意一下她的睡眠。','maxlength="200"')}${footerButtons('把申请递给她')}</form>`);
  if(action==='grant-decide'){
    const g=grants().find(x=>x.id===id);if(!g)return;
    return showModal('决定查看范围和期限',`<p>她申请查看：${g.fields.map(f=>GRANT_FIELDS[f]||f).join('、')}${g.note?`，留言：${esc(g.note)}`:''}。</p><p>勾选你同意展示的数据；期限从现在开始计算，到期自动停止，也可以随时撤销。没有勾选的字段不会出现在伴侣视角。</p><form data-form="grant-decide" data-id="${id}"><div class="grant-checks">${Object.entries(GRANT_FIELDS).map(([k,l])=>`<label class="check-row"><input type="checkbox" name="gf" data-id="${k}" ${g.fields.includes(k)?'checked':''}><span>${l}</span></label>`).join('')}</div><div class="field"><label for="gd-days">授权期限</label><select id="gd-days" class="input" name="days">${GRANT_DAYS.map(([v,l])=>`<option value="${v}" ${v===String(g.days||'7')?'selected':''}>${l}</option>`).join('')}</select></div>${footerButtons('按这个范围批准')}</form>`);
  }
  if(action==='grant-decline')return showModal('拒绝这次申请？',`<p>拒绝后，伴侣视角会显示「未获批准」，不会看到任何额外数据。你们仍然可以直接聊。</p><div class="modal-footer">${button('再想想','close')}${button('确认拒绝','grant-decline-confirm',id,'danger')}</div>`);
  if(action==='grant-decline-confirm'){if(await commit(d=>{const g=(d.grants||[]).find(x=>x.id===id);if(g&&g.status==='pending')g.status='declined';},'已拒绝这次申请')){closeModal();render();}return;}
  if(action==='grant-revoke')return showModal('撤销这项授权？',`<p>撤销后，伴侣视角立即停止显示这些数据；此前对方是否已经看过，页面无法知道。</p><div class="modal-footer">${button('保留授权','close')}${button('确认撤销','grant-revoke-confirm',id,'danger')}</div>`);
  if(action==='grant-revoke-confirm'){if(await commit(d=>{const g=(d.grants||[]).find(x=>x.id===id);if(g&&g.status==='active')g.status='revoked';},'授权已撤销，伴侣视角立即停止显示')){closeModal();render();}return;}
  if(action==='alert-remove-confirm'){if(await commit(d=>{d.alerts=(d.alerts||[]).filter(x=>x.id!==id);},'预警已撤回')){closeModal();render();}return;}
  if(action==='close')return closeModal();
  if(action==='persist'){const granted=await YunxinStorage.requestPersistence();toast(granted?'浏览器已允许保留数据，仍请定期导出备份':'浏览器尚未允许持久保留，请定期导出备份');return;}
  if(action==='role'){
    const momBtn=role==='mother'
      ?`<button class="role-option" disabled><span class="avatar">妈</span><span><strong>妈妈视角</strong><small>当前视角 · 记录感受、确认需要、分享安排</small></span></button>`
      :`<button class="role-option" data-action="role-login"><span class="avatar">妈</span><span><strong>妈妈视角</strong><small>记录感受、确认需要、分享安排 · 需密码验证</small></span></button>`;
    const partnerBtn=role==='partner'
      ?`<button class="role-option" disabled><span class="avatar">伴</span><span><strong>伴侣视角</strong><small>当前视角 · 查看与陪伴</small></span></button>`
      :`<button class="role-option" data-action="switch-role" data-id="partner"><span class="avatar">伴</span><span><strong>伴侣视角</strong><small>查看已分享安排、协商接手、练习沟通 · 无需验证</small></span></button>`;
    return showModal('选择使用视角',`<p>进入妈妈视角需要账号密码验证身份；切换到伴侣视角无需验证。视角只保存在当前浏览器。</p>${momBtn}${partnerBtn}`);
  }
  if(action==='role-login')return showModal('进入妈妈视角',`<p>请输入账号密码验证身份。默认示意账号 <b>yunxin</b>，密码 <b>123456</b>，可在「我的」页面修改。</p><form data-form="role-login">${inputField('user','账号','','text','required autocomplete="username" placeholder="请输入账号"')}${inputField('pass','密码','','password','required autocomplete="current-password" placeholder="请输入密码"')}${footerButtons('验证并进入妈妈视角')}</form><p class="small-copy no-margin">忘记密码？<button type="button" class="text-link" data-action="role-pass-reset">恢复默认密码</button></p>`);
  if(action==='role-pass-reset'){localStorage.removeItem('yx-mom-auth');closeModal();return toast('已恢复默认账号 yunxin，密码 123456');}
  if(action==='role-pass')return showModal('修改妈妈视角密码',`<p>密码只保存在这台设备的浏览器里，用于进入妈妈视角时验证身份。</p><form data-form="role-pass">${inputField('old','当前密码','','password','required autocomplete="current-password" placeholder="请输入当前密码"')}${inputField('npass','新密码','','password','required minlength="4" autocomplete="new-password" placeholder="至少 4 位"')}${inputField('npass2','确认新密码','','password','required autocomplete="new-password" placeholder="再输入一次"')}${footerButtons('保存新密码')}</form>`);
  if(action==='switch-role'){role=id==='partner'?'partner':'mother';sessionStorage.setItem('yx-role',role);closeModal();page='home';location.hash='home';render();return toast(`已切换为${role==='mother'?'妈妈':'伴侣'}视角`);}
  if(action==='quick-mood'){quickMood=Number(id);go('mood');return;}
  if(action==='mood-select'){
    selectedMood=Number(id);const form=el.closest('form');$('input[name="score"]',form).value=id;saveMoodDraft(form);
    form.querySelectorAll('.mood-choice').forEach(b=>{b.classList.toggle('selected',b.dataset.id===id);b.setAttribute('aria-pressed',String(b.dataset.id===id));});
    const mp=form.querySelector('[data-mp]');if(mp){mp.innerHTML=bloomSvg(Number(id),62);const box=form.querySelector('.mood-preview');if(box){box.classList.remove('pop');void box.offsetWidth;box.classList.add('pop');}}return;
  }
  if(action==='garden-mode'){gardenMode=id==='trend'?'trend':'garden';render();return;}
  if(action==='garden-go')return go('mood');
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
    const t=db.tasks.find(x=>x.id===id);return showModal('事情做完后，你感觉怎样？',`<p>安排：${esc(t.title)}。完成情况和实际帮助分别记录，不需要为了感谢对方而选择“有帮助”。</p><form data-form="feedback" data-id="${id}">${selectField('help','这次对你有帮助吗？',['有帮助','一般','没有帮助'],t.feedback?.help||'有帮助')}${selectField('burden','安排或提醒这件事，带来了额外负担吗？',['没有','一点','较多'],t.feedback?.burden||'没有')}${textField('note','下次想调整什么？（选填）',t.feedback?.note||'','例如：希望减少过程中反复确认的小问题。')}${panel('这份反馈只在妈妈视角中展示，并会影响同类日常支持的推荐顺序。')}${footerButtons('保存我的反馈')}</form>`);
  }
  if(action==='practice-start')return practiceModal(id);
  if(action==='practice-write')return practiceModal(id,2);
  if(action==='focus-mood'){const f=$('[data-form="mood"]');if(f){f.scrollIntoView({behavior:'smooth',block:'center'});f.querySelector('.mood-choice')?.focus({preventScroll:true});}return;}
  if(action==='garden-day'){
    const m=db.moods.find(x=>x.date===id);if(!m)return;
    return showModal(`${fmtDate(id)} 的那朵花`,`<div class="garden-day"><span class="garden-day-face">${face(m.score)}</span><div><strong>${moodWords[m.score-1]}</strong><span class="subtle">睡眠 ${m.sleep} 小时${m.sleep>=7?' · 花瓣上留了一颗露珠':''}</span></div></div>${m.note?`<div class="quote-box">${esc(m.note)}</div>`:'<p class="small-copy">那天没有留下文字，只有一朵花。</p>'}<div class="modal-footer">${button('只是看看','close')}${button('编辑这一天','mood-edit',m.id,'primary')}</div>`);
  }
  if(action==='pet-zoom'){
    studioZoom=id==='face'?'face':'full';
    $('#studio-stage')?.classList.toggle('zoom-face',studioZoom==='face');
    document.querySelectorAll('[data-action="pet-zoom"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===studioZoom)));return;
  }
  if(action==='pet-tab'){
    if(!['face','hair','outfit'].includes(id))return;
    studioTab=id;syncPetStudio();$('#studio-tab-'+id)?.focus({preventScroll:true});return;
  }
  if(action==='pet-discard'){
    if(role!=='mother')return;
    petDraft=YunxinPet.normalize(db.settings.pet||{});syncPetStudio();toast('已恢复到上次保存的样子');return;
  }
  if(action==='pet-expression'){
    if(role!=='mother')return;
    const presets={soft:[35,45,45,55],bright:[60,65,55,85],calm:[45,35,45,30]};
    if(!presets[id])return;
    if(!petDraft)petDraft=YunxinPet.normalize(db.settings.pet||{});
    ['face','eyes','gap','smile'].forEach((k,i)=>petDraft[k]=presets[id][i]);syncPetStudio();return;
  }
  if(action==='pet-set'){
    if(role!=='mother')return toast('请切换到妈妈视角后操作',true);
    const i=id.indexOf(':');if(i<0)return;
    const k=id.slice(0,i), v=id.slice(i+1), u=petUnlocks()[v];
    if(u&&!u.ok)return toast(u.kind==='day'?`再连续记录 ${u.need} 天，就能解锁这个装扮`:`再种 ${u.need} 朵花，就能解锁这个装扮`,true);
    if(!petDraft)petDraft=YunxinPet.normalize(db.settings.pet||{});
    petDraft[k]=v;syncPetStudio();return;
  }
  if(action==='pet-random'){
    if(role!=='mother')return toast('请切换到妈妈视角后操作',true);
    const u=petUnlocks(), pick=a=>a[Math.floor(Math.random()*a.length)];
    if(!petDraft)petDraft=YunxinPet.normalize(db.settings.pet||{});
    const hats=['straw','none'].concat(u.wreath.ok?['wreath']:[]).concat(u.beret.ok?['beret']:[]);
    const accs=['leaf','glasses','none'].concat(u.bow.ok?['bow']:[]);
    const outs=PET_OUTFITS.filter(([h,,n])=>!n||u[h]?.ok).map(([h])=>h);
    petDraft={...petDraft,hair:pick(['bob','buns']),hat:pick(hats),accessory:pick(accs),outfit:pick(outs),skin:pick(PET_SKINS.map(([h])=>h)),hairColor:pick(PET_HAIRS.map(([h])=>h)),
      face:Math.floor(Math.random()*101),eyes:Math.floor(Math.random()*81)+10,gap:Math.floor(Math.random()*81)+5,smile:Math.floor(Math.random()*61)+40};
    syncPetStudio();return;
  }
  if(action==='pet-reset'){
    if(role!=='mother')return toast('请切换到妈妈视角后操作',true);
    petDraft=YunxinPet.normalize({});syncPetStudio();return;
  }
  if(action==='delete')return showModal('删除这条记录？',`<p>删除后，页面中不再保留这条记录。相关的协作安排不会自动删除。需要保留副本时，可以先到“我的”导出备份。</p><div class="modal-footer">${button('保留记录','close')}${button('确认删除','delete-confirm',id,'danger')}</div>`);
  if(action==='delete-confirm'){
    const [group,recordId]=id.split(':');if(!['moods','needs','notes','practices','activities','contacts'].includes(group))return;
    if(await commit(d=>{d[group]=d[group].filter(x=>x.id!==recordId);},'记录已删除')){if(group==='moods')YunxinDrafts.drop(recordId);closeModal();render();}return;
  }
  if(action==='export'){
    const content={app:'yunxin-local',backupVersion:1,exportedAt:stamp(),state:db};const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`孕心智护备份_${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已生成备份，请保管好下载的文件');return;
  }
  if(action==='import'){ $('#backup-file').click();return; }
  if(action==='import-confirm'){
    if(role!=='mother'||!pendingImport)return;const imported=pendingImport;
    if(await commit(d=>{Object.keys(d).forEach(k=>delete d[k]);Object.assign(d,imported);},'备份已恢复')){YunxinDrafts.clear();closeModal();render();}return;
  }
  if(action==='clear')return showModal('清空所有本地记录',`<p>孕期记录、产检安排、心情、未提交草稿、需要、协作安排、心情预警、沟通练习和个人偏好都将被重置。</p><p>请先导出备份。清空后，普通页面无法撤销；上一次保存的技术恢复文件也会清除。</p><form data-form="clear">${inputField('confirm','请输入“清空”确认','','text','required pattern="清空" autocomplete="off"')}${footerButtons('确认清空')}</form>`);
});

document.addEventListener('submit',async event=>{
  const form=event.target.closest('[data-form]');if(!form)return;event.preventDefault();if(busy)return;
  const kind=form.dataset.form,id=form.dataset.id||'',data=Object.fromEntries(new FormData(form));
  for(const k in data)if(typeof data[k]==='string')data[k]=data[k].trim();
  if(role==='partner'&&!['practice','proposal','grant-request','alert-reply-custom','role-login'].includes(kind))return toast('请切换到妈妈视角后操作',true);
  const submit=$('[type="submit"]',form),submitLabel=submit?.textContent;if(submit){submit.disabled=true;submit.textContent='正在保存…';}
  let ok=false;
  try{
    if(kind==='role-login'){
      const auth=(()=>{try{return JSON.parse(localStorage.getItem('yx-mom-auth'))||{}}catch{return{}}})();
      if(data.user===(auth.user||'yunxin')&&data.pass===(auth.pass||'123456')){
        role='mother';sessionStorage.setItem('yx-role','mother');closeModal();page='home';location.hash='home';render();
        toast('身份验证通过，已进入妈妈视角');return;
      }
      return toast('账号或密码不正确，无法进入妈妈视角',true);
    }
    if(kind==='role-pass'){
      if(role!=='mother')return toast('请先进入妈妈视角再修改密码',true);
      const auth=(()=>{try{return JSON.parse(localStorage.getItem('yx-mom-auth'))||{}}catch{return{}}})();
      const cur={user:auth.user||'yunxin',pass:auth.pass||'123456'};
      if(data.old!==cur.pass)return toast('当前密码不正确',true);
      if(!data.npass||data.npass.length<4)return toast('新密码至少 4 位',true);
      if(data.npass!==data.npass2)return toast('两次输入的新密码不一致',true);
      localStorage.setItem('yx-mom-auth',JSON.stringify({user:cur.user,pass:data.npass}));
      toast('视角密码已更新');ok=true;
    }
    if(kind==='mood'){
      if(!data.date||data.date>today())return toast('请选择今天或过去的日期',true);
      const other=db.moods.find(m=>m.date===data.date&&m.id!==id);
      if(other){showModal('这一天已经有记录',`<p>为了让趋势清楚，每天保留一条记录。请编辑已有记录，避免覆盖自己的感受。</p><div class="modal-footer">${button('返回','close')}${button('编辑这一天','mood-edit',other.id,'primary')}</div>`);return;}
      ok=await commit(d=>{const row={id:id||uid(),date:data.date,score:Number(data.score),sleep:Number(data.sleep),note:data.note};if(id)d.moods[d.moods.findIndex(x=>x.id===id)]=row;else d.moods.push(row);});
      if(ok&&!YunxinDrafts.drop(form.dataset.draftKey))toast('记录已保存，但旧草稿未能清理，请检查浏览器存储权限',true);
    }
    if(kind==='alert'){
      const needs=[...form.querySelectorAll('[data-alert-needs] .chip.on')].map(b=>b.textContent.trim());
      const now=new Date(),hh=String(now.getHours()).padStart(2,'0'),mm=String(now.getMinutes()).padStart(2,'0');
      ok=await commit(d=>{d.alerts=d.alerts||[];d.alerts.push({id:uid(),createdAt:stamp(),date:today(),time:`${hh}:${mm}`,level:form.dataset.id,message:data.message,needs,status:'sent',reply:'',replyAt:''});},'预警已经放在伴侣的首页');
      if(ok){moodTab='alert';page='mood';history.replaceState(null,'','#mood/alert');}
    }
    if(kind==='alert-reply-custom'){
      if(!data.reply)return toast('写一句想回的话',true);
      ok=await commit(d=>{const a=(d.alerts||[]).find(x=>x.id===id);if(!a)throw new Error('这条预警已经不在了');a.status='replied';a.reply=data.reply;a.replyAt=stamp();},'已经回给她了');
    }
    if(kind==='grant-request'){
      const fields=[...form.querySelectorAll('[data-grant-fields] .chip.on')].map(b=>b.dataset.id);
      if(!fields.length)return toast('请至少选择一项想看的数据',true);
      ok=await commit(d=>{d.grants=d.grants||[];d.grants.push({id:uid(),createdAt:stamp(),fields,days:String(data.days||'7'),note:data.note||'',status:'pending',until:''});},'申请已经递给她，等她决定范围和期限');
      if(ok){page='family';location.hash='family';}
    }
    if(kind==='grant-decide'){
      const fields=[...form.querySelectorAll('input[name="gf"]:checked')].map(i=>i.dataset.id);
      if(!fields.length)return toast('请至少保留一项授权，或选择拒绝',true);
      ok=await commit(d=>{const g=(d.grants||[]).find(x=>x.id===id);if(!g)throw new Error('这条申请已经不在了');if(g.status!=='pending')throw new Error('这条申请已经处理过了');g.fields=fields;g.days=String(data.days||'7');g.until=grantUntil(data.days);g.status='active';},'已按你选择的范围批准；到期或随时可撤销');
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
    if(kind==='feedback')ok=await commit(d=>{d.tasks.find(x=>x.id===id).feedback={help:data.help,burden:data.burden,note:data.note};},'完成情况与帮助反馈已分别保存');
    if(kind==='practice'){
      if(!data.text)return toast('请试着写下一句自己的回应',true);
      if(role==='partner'){toast('练习完成，谢谢你愿意认真倾听');ok=true;}
      else ok=await commit(d=>d.practices.push({id:uid(),scenario:id,text:data.text,created:stamp()}),'练习笔记已保存');
    }
    if(kind==='pet'){
      if(role!=='mother')return toast('请切换到妈妈视角后操作',true);
      ok=await commit(d=>{d.settings.pet=YunxinPet.normalize(petDraft||{});},'小暖的新样子已经保存');
      if(ok)petDraft=null;
    }
    if(kind==='settings')ok=await commit(d=>{d.settings={...d.settings,name:data.name,stage:data.stage,preferred:data.preferred,available:Number(data.available)};},'偏好已保存');
    if(kind==='clear'&&data.confirm==='清空'){
      ok=await commit(d=>{d.settings={name:'',stage:'产后居家',preferred:'休息',available:15};delete d.pregnancy;for(const k of ['moods','needs','tasks','notes','practices','activities','contacts','alerts','grants'])d[k]=[];d.helpCard={person:'',place:'',message:''};},'已清空当前记录与偏好',true);
      if(ok)YunxinDrafts.clear();
    }
    if(ok){closeModal();render();}
  }catch(e){toast(e.message||'操作没有完成，请重试',true);}
  finally{if(submit){submit.disabled=false;submit.textContent=submitLabel;}}
});
function saveMoodDraft(form){
  if(role!=='mother'||!form?.dataset.draftKey)return;
  const data=Object.fromEntries(new FormData(form));
  const saved=YunxinDrafts.save(form.dataset.draftKey,data);
  const status=form.querySelector('.mood-draft-status');
  if(status)status.textContent=saved?'草稿已保存在本机 · 尚未提交':'草稿暂存于当前页面，无法写入本机；请勿关闭页面，并尽快保存记录';
}
document.addEventListener('input',event=>{
  const moodForm=event.target.closest('form[data-form="mood"]');
  if(moodForm)saveMoodDraft(moodForm);
  if(event.target.id==='pet-name-input'){
    if(role!=='mother'){event.target.value=petDraft?.name||'';return;}
    if(!petDraft)petDraft=YunxinPet.normalize(db.settings.pet||{});
    petDraft.name=event.target.value.trim().slice(0,12)||'小暖';refreshPetOnly();return;
  }
  const range=event.target.dataset?.petRange;
  if(range){
    if(role!=='mother')return;
    if(!petDraft)petDraft=YunxinPet.normalize(db.settings.pet||{});
    petDraft[range]=Number(event.target.value);
    const out=event.target.parentElement.querySelector('output');if(out)out.textContent=event.target.value;
    refreshPetOnly();
  }
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
let routeTransition;
window.addEventListener('hashchange',()=>{
  const update=()=>{page=readHash();render();window.scrollTo(0,0);};
  routeTransition?.skipTransition();
  if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)routeTransition=document.startViewTransition(update);else update();
});
document.addEventListener('keydown',event=>{
  const tab=event.target.closest('[role="tab"][data-action="pet-tab"]');
  if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const ids=['face','hair','outfit'],i=ids.indexOf(studioTab);
  studioTab=event.key==='Home'?ids[0]:event.key==='End'?ids[2]:ids[(i+(event.key==='ArrowRight'?1:2))%3];
  syncPetStudio();$('#studio-tab-'+studioTab)?.focus({preventScroll:true});
});
window.addEventListener('beforeunload',event=>{if(busy||YunxinDrafts.hasUnpersisted()){event.preventDefault();event.returnValue='';}});
window.addEventListener('DOMContentLoaded',()=>{load().then(render).catch(error=>{$('#main').innerHTML=`<div class="card locked">${icon('info')}<h2>暂时无法打开本地记录</h2><p>${esc(error.message||'请先双击“启动孕心智护.command”，再从浏览器打开本地地址。')}</p><p>为避免覆盖原有内容，页面没有创建或重置记录。</p><button class="btn" id="retry-load">重新读取</button></div>`;$('#retry-load').addEventListener('click',()=>location.reload());});});

document.addEventListener('pet-save',async event=>{const ok=await commit(d=>{d.settings.pet=event.detail.config;},'小伙伴的样子已保存');event.detail.done(ok);});
document.addEventListener('pet-garden',()=>{if(db)go('mood');});

// Refresh an open report after local midnight or returning from a suspended tab.
let weeklyCalendarDay=today();
function refreshWeeklyCalendar(){const now=today();if(now!==weeklyCalendarDay){weeklyCalendarDay=now;if(db&&role==='mother'&&page==='mood'&&moodTab==='weekly')render();}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshWeeklyCalendar();});
setInterval(refreshWeeklyCalendar,60000);
