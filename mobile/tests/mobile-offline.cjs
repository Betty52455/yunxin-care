const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.join(__dirname,'../dist');
const handlers = {}, stored = new Map();
let networkCalls = 0;
const cache = {addAll:async files=>{for(const f of files){assert.ok(fs.existsSync(path.join(root,f)),f);stored.set(new URL(f,'https://example.test/').href,{cached:f});}},match:async(req)=>stored.get((typeof req==='string'?req:req.url).split('?')[0])};
const context = {URL,Set,self:{location:{href:'https://example.test/sw.js'},addEventListener:(type,fn)=>handlers[type]=fn,clients:{claim:async()=>{}}},caches:{open:async()=>cache,keys:async()=>['unrelated-cache'],delete:async()=>{throw Error('Unrelated cache must not be deleted')}},fetch:async()=>{networkCalls++;throw Error('Network disabled')}};
vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
const fetchResult = async (url,mode='cors',method='GET')=>{let response;handlers.fetch({request:{url,mode,method},respondWith:p=>response=p});return response;};
test('offline install contains every local asset and preserves unrelated caches',async()=>{
  let install; handlers.install({waitUntil:p=>install=p});await install;
  let activate; handlers.activate({waitUntil:p=>activate=p});await activate;
  assert.ok(stored.size>=38);
});
test('offline navigation and versioned CSS use cached application files',async()=>{
  assert.equal((await fetchResult('https://example.test/?v=mobile','navigate')).cached,'./index.html');
  assert.equal((await fetchResult('https://example.test/mobile.css?v=2')).cached,'./mobile.css');
  assert.equal(networkCalls,0);
});
test('external services, API paths and writes are not intercepted',async()=>{
  assert.equal(await fetchResult('https://weather.example.test/data'),undefined);
  assert.equal(await fetchResult('https://example.test/api/private'),undefined);
  assert.equal(await fetchResult('https://example.test/index.html','cors','POST'),undefined);
});
test('phone entry permits zoom, declares local icon and has no missing root assets',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/viewport-fit=cover/);assert.doesNotMatch(html,/user-scalable=no|maximum-scale=1/);
  for(const [,url] of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g))assert.ok(fs.existsSync(path.join(root,url.split('?')[0])),url);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.display,'standalone');assert.ok(fs.existsSync(path.join(root,manifest.icons[0].src)));
});
