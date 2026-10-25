const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
fs.mkdirSync(out, {recursive:true});
fs.cpSync(path.join(root, 'web-source'), out, {recursive:true});
function replaceOnce(text, old, value) {
  if (!text.includes(old)) throw Error('Source changed: missing patch target: ' + old.slice(0, 70));
  return text.replace(old, value);
}
let index = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
index = index.replace(/\s*<script defer src="\/mobile\.js[^\"]*"><\/script>/, '')
  .replace(/\s*<link rel="manifest"[^>]*>/, '')
  .replace('网页版 1.0', 'App 1.0');
index = replaceOnce(index, '  <script defer src="/storage.js', '  <script defer src="/native.js"></script>\n  <script defer src="/storage.js');
fs.writeFileSync(path.join(out,'index.html'), index);
for (const file of ['sw.js','mobile.js','manifest.webmanifest']) fs.rmSync(path.join(out,file), {force:true});
let app = fs.readFileSync(path.join(out, 'app.js'), 'utf8');
app = replaceOnce(app, 'const uid = () => crypto.randomUUID();', `const uid = () => {
  if(crypto.randomUUID)return crypto.randomUUID();
  const bytes=crypto.getRandomValues(new Uint8Array(16));
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
  return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
};`);
const marker = "const content={app:'yunxin-local',backupVersion:1,exportedAt:stamp(),state:db};";
app = replaceOnce(app, marker, marker + `
    if(window.YunxinNative?.isNative){
      try{await window.YunxinNative.exportBackup(content,\`孕心智护备份_\${today()}.json\`);toast('已关闭导出窗口，请确认备份已另存');}
      catch(error){toast('未完成备份导出，请重试；原记录仍然保留',true);}
      return;
    }
    `);
app = app.replace(/<section class="card mobile-guide">[\s\S]*?<\/section>/,
  '<section class="card mobile-guide"><div class="card-header"><h2>应用与备份</h2><span class="pill">App 1.0</span></div><p class="small-copy">基础记录与简报随应用提供，离线也可使用。天气查询和外部链接仍需联网。</p><p class="small-copy">网页与 App 的记录不自动互通。请从原网页导出 JSON 备份，再在此处恢复。卸载应用或清除应用数据可能删除记录，请定期备份。</p></section>');
app = app.replaceAll('当前浏览器','当前应用').replaceAll('保存在你自己的浏览器','保存在当前设备的应用中')
  .replace('刷新、关闭浏览器或重启设备后，用同一浏览器打开同一网址即可继续。更换设备或浏览器不会同步。','关闭应用或重启设备后，重新打开同一应用即可继续。更换设备不会自动同步。')
  .replace('清除网站数据、使用无痕模式或浏览器自动回收存储都可能丢失记录。请使用普通窗口，并定期导出备份。','卸载应用、清除应用数据或设备损坏可能造成记录丢失，请定期导出备份。')
  .replace(/<div class="settings-row"><div><h3>申请保留浏览器数据<\/h3>[\s\S]*?\$\{button\('申请保留','persist','','small'\)\}<\/div>/, '')
  .replace('网页版 1.0 · 浏览器保存','App 1.0 · 本机保存');
app += `\nwindow.YunxinHandleBack=()=>{if(document.querySelector('#modal')?.open){closeModal();return;}if(location.hash!=='#home'){go('home');return;}window.YunxinMinimize?.();};\n`;
fs.writeFileSync(path.join(out,'app.js'), app);
esbuild.buildSync({entryPoints:[path.join(root,'src/native.js')],bundle:true,format:'iife',target:['safari15','chrome100'],outfile:path.join(out,'native.js'),minify:true});
console.log('Native web assets built; bundled resources, native backup, back button; no service worker');
