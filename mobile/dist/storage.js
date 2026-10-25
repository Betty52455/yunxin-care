'use strict';
// No records leave the browser. The revision check and write share one transaction.
(function (root) {
  const groups = {
    moods: ['date','score','sleep','note'], needs: ['category','text','created'],
    tasks: ['title','date','time','owner','details','status','shared','revoked','category','feedback','proposal','needId'],
    notes: ['title','text','pinned','created','updated'], practices: ['scenario','text','created'],
    activities: ['activityId','help','note','created'], contacts: ['name','phone','kind','address','note']
  };
  const categories = ['倾听','休息','实际帮忙','信息','陪伴'];
  function emptyState() {
    return {version:1,settings:{name:'',stage:'产后居家',preferred:'休息',available:15},
      moods:[],needs:[],tasks:[],notes:[],practices:[],activities:[],contacts:[],alerts:[],helpCard:{person:'',place:'',message:''}};
  }
  function validateState(s) {
    const require = (ok, message='备份内容格式不正确') => { if (!ok) throw new Error(message); };
    const obj = (v, fields) => require(v && typeof v==='object' && !Array.isArray(v) && fields.every(k=>Object.hasOwn(v,k)));
    const str = (v,max=20000) => require(typeof v==='string' && v.length<=max);
    const num = (v,low,high) => require(typeof v==='number' && Number.isFinite(v) && v>=low && v<=high);
    const date = v => { str(v,10); require(/^\d{4}-\d{2}-\d{2}$/.test(v)); const d=new Date(v+'T12:00:00Z'); require(Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===v); };
    if(!Object.hasOwn(s,'alerts')) s.alerts=[];
    obj(s,Object.keys(emptyState())); require(s.version===1,'不支持此备份版本');
    obj(s.settings,['name','stage','preferred','available']);
    for (const k of ['name','stage','preferred']) str(s.settings[k],100);
    require(categories.includes(s.settings.preferred)); num(s.settings.available,1,120);
    if (Object.hasOwn(s.settings,'pet')) {
      const p=s.settings.pet;
      obj(p,['name','face','eyes','gap','smile','hair','skin','hairColor','outfit','accessory']);str(p.name,12);
      for(const k of ['face','eyes','gap','smile'])num(p[k],0,100);
      for(const k of ['skin','hairColor','outfit'])require(typeof p[k]==='string' && /^#[0-9a-fA-F]{6}$/.test(p[k]));
      require(['bob','short','buns'].includes(p.hair));require(['leaf','glasses','bow','none'].includes(p.accessory));if(Object.hasOwn(p,'hat'))require(['straw','wreath','beret','none'].includes(p.hat));
    }
    if(Object.hasOwn(s,'pregnancy')){const validator=root.YunxinPregnancy || (typeof require==='function'?require('./pregnancy.js'):null);validator.validate(s.pregnancy);}
    obj(s.helpCard,['person','place','message']); for (const k of ['person','place','message']) str(s.helpCard[k]);
    for (const [group,fields] of Object.entries(groups)) {
      require(Array.isArray(s[group]) && s[group].length<=10000);
      const ids=new Set();
      for (const row of s[group]) {
        obj(row,['id',...fields]); str(row.id,100); require(row.id && !ids.has(row.id)); ids.add(row.id);
        for (const key of fields) if (!['score','sleep','pinned','shared','revoked','feedback','help'].includes(key)) str(row[key]);
        if (group==='moods') { date(row.date); num(row.score,1,5); require(Number.isInteger(row.score)); num(row.sleep,0,24); }
        if (['needs','tasks'].includes(group)) require(categories.includes(row.category));
        if (group==='notes') require(typeof row.pinned==='boolean');
        if (group==='activities') require(['有帮助','一般','不适合'].includes(row.help));
        if (group==='tasks') {
          date(row.date); require(['妈妈','伴侣'].includes(row.owner));
          require(['draft','waiting','accepted','in_progress','completed','cancelled','proposed'].includes(row.status));
          require(typeof row.shared==='boolean' && typeof row.revoked==='boolean');
          if (row.feedback!==null) {
            obj(row.feedback,['help','burden','note']);
            require(['有帮助','一般','没有帮助'].includes(row.feedback.help));
            require(['没有','一点','较多'].includes(row.feedback.burden)); str(row.feedback.note);
          }
        }
      }
    }
    require(new Set(s.moods.map(x=>x.date)).size===s.moods.length,'同一天只能保留一条心情记录');
    require(Array.isArray(s.alerts) && s.alerts.length<=5000);
    const alertIds=new Set();
    for(const a of s.alerts){
      obj(a,['id','createdAt','date','time','level','message','needs','status','reply','replyAt']);
      str(a.id,100); require(a.id && !alertIds.has(a.id)); alertIds.add(a.id);
      str(a.createdAt,40); require(!!a.createdAt);
      date(a.date); str(a.time,5); require(!a.time || /^([01]\d|2[0-3]):[0-5]\d$/.test(a.time));
      require(['company','hard','danger'].includes(a.level));
      str(a.message,500); require(!!a.message.trim());
      require(Array.isArray(a.needs) && a.needs.length<=8); a.needs.forEach(n=>str(n,20));
      require(['sent','seen','replied'].includes(a.status)); str(a.reply,300); str(a.replyAt,40);
    }
    require(new TextEncoder().encode(JSON.stringify(s)).byteLength<=8*1024*1024,'记录超过 8 MB，请先导出备份并整理记录');
    return s;
  }
  function storageError(error) {
    if (error?.name==='QuotaExceededError') return new Error('浏览器存储空间不足，未保存本次修改。请先导出已有记录。');
    return error || new Error('浏览器无法保存记录，请检查网站存储权限，并使用普通浏览窗口。');
  }
  let connection;
  function open() {
    if (connection) return connection;
    connection=new Promise((resolve,reject)=>{
      if (!root.indexedDB) { reject(new Error('此浏览器不支持本地记录，请使用最新版 Chrome、Edge 或 Safari。')); return; }
      const request=root.indexedDB.open('yunxin-care-browser',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('records');
      request.onerror=()=>reject(storageError(request.error));
      request.onblocked=()=>reject(new Error('请关闭此网站的其他旧页面，再重新打开。'));
      request.onsuccess=()=>{const db=request.result; db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
    }).catch(e=>{connection=null;throw e;});
    return connection;
  }
  async function transact(next,revision,reset) {
    if (next!==undefined) {
      validateState(next);
      const blank=emptyState();
      if (reset && (Object.keys(groups).some(k=>next[k].length) || (next.alerts||[]).length ||
          Object.keys(blank.settings).some(k=>next.settings[k]!==blank.settings[k]) ||
          Object.keys(blank.helpCard).some(k=>next.helpCard[k]!==blank.helpCard[k]))) throw new Error('清空操作必须重置全部数据');
      if (reset) next=blank;
    }
    const db=await open();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('records',next===undefined?'readonly':'readwrite');
      const store=tx.objectStore('records'); let result, failure;
      tx.oncomplete=()=>resolve(result);
      tx.onabort=()=>reject(storageError(failure||tx.error));
      tx.onerror=()=>{}; // onabort handles request/transaction errors once.
      const request=store.get('current');
      request.onsuccess=()=>{
        try {
          const old=request.result ?? {revision:0,state:emptyState()};
          validateState(old.state);
          if (!Number.isSafeInteger(old.revision) || old.revision<0) throw new Error('记录版本无法读取；请恢复独立备份。');
          if (next===undefined) {result=old;return;}
          if (revision!==old.revision) {const e=new Error('记录已在另一个页面更新。本次修改未保存，请重新核对后保存。');e.status=409;throw e;}
          result={revision:old.revision+1,state:next}; store.put(result,'current');
        } catch(e) {failure=e;tx.abort();}
      };
    });
  }
  const api={emptyState,validateState,read:()=>transact(),save:(state,revision,reset=false)=>transact(state,revision,reset),
    async requestPersistence(){try{return !!(await root.navigator?.storage?.persist?.());}catch{return false;}}};
  root.YunxinStorage=api;
  if (typeof module!=='undefined') module.exports=api;
})(globalThis);
