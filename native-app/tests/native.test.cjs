const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const {createServer}=require('../desktop/server.cjs');
test('native resources bundle locally, avoid stale service workers and preserve backup import',()=>{
  const html=fs.readFileSync(path.join(root,'www/index.html'),'utf8');
  assert.match(html,/native.js/);assert.doesNotMatch(html,/mobile.js|manifest.webmanifest/);
  for(const [,url] of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g))assert.ok(fs.existsSync(path.join(root,'www',url.split('?')[0])),url);
  const app=fs.readFileSync(path.join(root,'www/app.js'),'utf8');
  assert.match(app,/YunxinNative.exportBackup/);assert.match(app,/YunxinHandleBack/);assert.match(app,/backup-file/);
  assert.doesNotMatch(app,/添加到手机主屏幕/);
});
test('desktop server serves assets and rejects foreign hosts, writes, traversal and directory listings',async()=>{
  const server=createServer(path.join(root,'www'),18779);
  await new Promise(r=>server.listen(18779,'127.0.0.1',r));
  try{
    const base='http://127.0.0.1:18779';
    const response=await fetch(base);assert.equal(response.status,200);assert.match(await response.text(),/孕心智护/);
    assert.equal((await fetch(base,{method:'POST'})).status,403);
    const foreignHost=await new Promise((resolve,reject)=>{
      require('node:http').get(base,{headers:{Host:'evil.example'}},res=>{res.resume();resolve(res.statusCode);}).on('error',reject);
    });
    assert.equal(foreignHost,403);
    assert.equal((await fetch(base+'/assets/')).status,404);
    assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,403);
    assert.equal((await fetch(base+'/../package.json')).status,404);
  }finally{await new Promise(r=>server.close(r));}
});
test('native permissions and identity stay narrow',()=>{
  const config=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json')));
  assert.equal(config.appId,'com.betty52455.yunxincare');assert.equal(config.server.url,undefined);
  const manifest=fs.readFileSync(path.join(root,'android/app/src/main/AndroidManifest.xml'),'utf8');
  assert.match(manifest,/android:allowBackup="false"/);assert.doesNotMatch(manifest,/ACCESS_FINE_LOCATION|READ_CONTACTS|CAMERA/);
});
