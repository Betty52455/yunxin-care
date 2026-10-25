const test=require('node:test'),assert=require('node:assert/strict');
const create=require('../dist/drafts.js');
function backend(){const rows=new Map();return{get length(){return rows.size},key:i=>[...rows.keys()][i],getItem:k=>rows.get(k)||null,setItem:(k,v)=>rows.set(k,v),removeItem:k=>rows.delete(k)}}
const draft={date:'2026-10-21',score:3,sleep:'',note:'尚未提交的感受 <b>原文</b>'};
test('draft survives a new session and stays independent of submitted records',()=>{
 const storage=backend(),a=create(storage);assert.equal(a.save('new',draft),true);
 assert.deepEqual(create(storage).read('new'),draft);assert.equal(a.hasUnpersisted(),false);
 assert.equal(a.drop('new'),true);assert.equal(create(storage).read('new'),null);
});
test('quota failure retains current-session draft and requests unload protection',()=>{
 const a=create({getItem:()=>null,setItem:()=>{throw Error('quota')}});
 assert.equal(a.save('new',draft),false);assert.deepEqual(a.read('new'),draft);assert.equal(a.hasUnpersisted(),true);
});
test('blank dates and zero sleep round-trip; malformed storage is ignored',()=>{
 const s=backend(),a=create(s),blank={...draft,date:'',sleep:'0'};
 a.save('edit-1',blank);assert.deepEqual(create(s).read('edit-1'),blank);
 s.setItem('yunxin-mood-draft:broken','invalid');assert.equal(a.read('broken'),null);
});
test('clear removes only drafts, preserving unrelated preferences',()=>{
 const s=backend(),a=create(s);s.setItem('settings','keep');a.save('new',draft);a.save('edit-1',draft);
 assert.equal(create(s).clear(),true);assert.equal(s.getItem('settings'),'keep');assert.equal(create(s).read('new'),null);
});
