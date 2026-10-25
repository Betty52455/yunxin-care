'use strict';
(function(root){
  const empty=()=>({dueDate:'',preWeight:null,height:null,entries:[],visits:[]});
  const day=value=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('日期格式不正确');const n=Date.parse(value+'T12:00:00Z');if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==value)throw Error('日期不存在');return n;};
  function validate(p){
    const need=(ok,msg='孕期记录格式不正确')=>{if(!ok)throw Error(msg);};
    const str=(x,max)=>need(typeof x==='string'&&x.length<=max);
    const number=(x,min,max)=>need(x===null||(typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max));
    need(p&&typeof p==='object'&&!Array.isArray(p));str(p.dueDate,10);if(p.dueDate)day(p.dueDate);
    number(p.preWeight,20,300);number(p.height,80,230);
    for(const key of ['entries','visits']){
      need(Array.isArray(p[key])&&p[key].length<=10000);const ids=new Set(),dates=new Set();
      for(const r of p[key]){
        need(r&&typeof r==='object');str(r.id,100);need(r.id&&!ids.has(r.id));ids.add(r.id);day(r.date);str(r.note,5000);
        if(key==='entries'){
          need(!dates.has(r.date),'同一天的身体记录请合并到一条');dates.add(r.date);
          number(r.weight,20,300);number(r.systolic,40,300);number(r.diastolic,20,200);
          need((r.systolic===null)===(r.diastolic===null),'血压请同时填写高压和低压');
          need(r.weight!==null||r.systolic!==null||r.note.trim(),'至少填写一项身体记录');
        }else{str(r.title,100);need(r.title.trim());str(r.time,5);need(!r.time||/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time));need(typeof r.done==='boolean');}
      }
    }
    return p;
  }
  function age(dueDate,asOf){if(!dueDate)return null;const days=280+Math.round((day(asOf)-day(dueDate))/86400000);return days<0||days>315?null:{weeks:Math.floor(days/7),days:days%7,totalDays:days};}
  function weights(p){return p.entries.filter(r=>r.weight!==null).sort((a,b)=>a.date.localeCompare(b.date));}
  root.YunxinPregnancy={empty,validate,age,weights,day};if(typeof module!=='undefined')module.exports=root.YunxinPregnancy;
})(globalThis);
