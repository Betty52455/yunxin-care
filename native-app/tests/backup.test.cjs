const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const path=require('node:path');
const esbuild=require('esbuild');
async function harness(failShare=false){
  const trace=[],timers=[];
  const mock={native:true,failShare,trace};
  const result=await esbuild.build({entryPoints:[path.join(__dirname,'../src/native.js')],bundle:true,format:'iife',write:false,plugins:[{name:'native-mocks',setup(build){
    build.onResolve({filter:/^@capacitor\//},a=>({path:a.path,namespace:'mock'}));
    build.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:`
      const m=globalThis.mock;
      export const Capacitor={isNativePlatform:()=>m.native};
      export const App={addListener:async()=>{},minimizeApp:async()=>{}};
      export const Directory={Cache:'CACHE'},Encoding={UTF8:'utf8'};
      export const Filesystem={readdir:async()=>({files:[]}),writeFile:async o=>{m.trace.push(['write',o]);return {uri:'file:///cache/'+o.path}},deleteFile:async o=>{m.trace.push(['delete',o])}};
      export const Share={share:async o=>{m.trace.push(['share',o]);if(m.failShare)throw Error('cancelled')}};
    `}));
  }}]});
  const window={};vm.runInNewContext(result.outputFiles[0].text,{window,mock,document:{documentElement:{classList:{add(){}}}},setTimeout:fn=>timers.push(fn)});
  return {window,trace,timers};
}
test('backup passes the full JSON to a cache file and opens share only after explicit export',async()=>{
  const {window,trace,timers}=await harness();assert.equal(trace.length,0);
  const backup={app:'yunxin-local',backupVersion:1,state:{notes:[{text:'仅测试'}]}};
  assert.equal(await window.YunxinNative.exportBackup(backup,'backup.json'),true);
  assert.equal(trace[0][0],'write');assert.deepEqual(JSON.parse(trace[0][1].data),backup);
  assert.equal(trace[0][1].directory,'CACHE');assert.equal(trace[1][0],'share');
  assert.equal(trace[1][1].files[0],'file:///cache/exports/backup.json');
  await timers[0]();assert.equal(trace[2][0],'delete');
});
test('cancelled or failed share rejects without claiming success and schedules cache cleanup',async()=>{
  const {window,trace,timers}=await harness(true);
  await assert.rejects(window.YunxinNative.exportBackup({app:'yunxin-local'},'backup.json'));
  await timers[0]();assert.equal(trace.at(-1)[0],'delete');
});
