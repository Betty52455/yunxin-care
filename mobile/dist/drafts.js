(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory;
  else {let storage;try{storage=root.localStorage;}catch{}root.YunxinDrafts=factory(storage);}
})(typeof window!=='undefined'?window:globalThis,function(storage){
  const prefix='yunxin-mood-draft:',memory=new Map(),pending=new Set();
  const valid=value=>value&&(value.date===''||/^\d{4}-\d{2}-\d{2}$/.test(value.date))&&Number(value.score)>=1&&Number(value.score)<=5&&typeof value.sleep==='string'&&typeof value.note==='string';
  function read(key){
    if(memory.has(key))return memory.get(key);
    try{const value=JSON.parse(storage.getItem(prefix+key));return valid(value)?value:null;}catch{return null;}
  }
  function save(key,value){
    if(!valid(value))return false;
    const copy={date:value.date,score:Number(value.score),sleep:value.sleep,note:value.note.slice(0,5000)};
    memory.set(key,copy);
    try{storage.setItem(prefix+key,JSON.stringify(copy));pending.delete(key);return true;}catch{pending.add(key);return false;}
  }
  function drop(key){memory.set(key,null);try{storage.removeItem(prefix+key);pending.delete(key);return true;}catch{pending.add(key);return false;}}
  function clear(){
    const keys=new Set(memory.keys());
    try{for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key.startsWith(prefix))keys.add(key.slice(prefix.length));}}catch{}
    return [...keys].map(drop).every(Boolean);
  }
  return {read,save,drop,clear,hasUnpersisted:()=>pending.size>0};
});
