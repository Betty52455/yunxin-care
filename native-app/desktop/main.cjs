const {app,BrowserWindow,Menu,dialog,shell,session} = require('electron');
const path = require('node:path');
const {createServer}=require('./server.cjs');
const PORT=18775, ORIGIN=`http://127.0.0.1:${PORT}`;
let window, server;
const checkArg=process.argv.find(a=>a.startsWith('--verify-output='));
if(checkArg) app.setPath('userData',path.join(require('node:os').tmpdir(),'yunxin-desktop-qa-'+require('node:crypto').createHash('sha256').update(checkArg).digest('hex').slice(0,12)));
app.setName('孕心智护');
function external(url){
  try{const u=new URL(url);if(['https:','mailto:','tel:'].includes(u.protocol))shell.openExternal(url);}catch{}
}
function openWindow(){
  window=new BrowserWindow({width:1180,height:820,minWidth:360,minHeight:560,show:false,backgroundColor:'#f6f7f0',title:'孕心智护',icon:path.join(__dirname,'www/assets/app-icon.png'),webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,devTools:false}});
  window.once('ready-to-show',()=>window.show());
  window.webContents.setWindowOpenHandler(({url})=>{external(url);return {action:'deny'};});
  window.webContents.on('will-navigate',(e,url)=>{if(new URL(url).origin!==ORIGIN){e.preventDefault();external(url);}});
  window.webContents.on('will-attach-webview',e=>e.preventDefault());
  window.loadURL(ORIGIN+'/#home');
  // Read-only startup verification is restricted to a fresh temporary profile.
  if(checkArg)window.webContents.once('did-finish-load',async()=>{
    try{
      const evidence=await window.webContents.executeJavaScript(`new Promise(resolve=>{let n=0;const timer=setInterval(()=>{if(document.querySelector('.home-dash')||++n>100){clearInterval(timer);resolve({title:document.title,home:!!document.querySelector('.home-dash'),text:document.querySelector('main')?.innerText,hasNode:typeof process!=='undefined',secure:window.isSecureContext})}},100)})`);
      if(process.argv.includes('--verify-write')){
        await window.webContents.executeJavaScript(`(async()=>{const saved=await YunxinStorage.read();saved.state.notes=[{id:'native-qa',title:'应用重启测试',text:'仅用于隔离测试的虚拟记录',pinned:false,created:'2026-10-21',updated:'2026-10-21'}];await YunxinStorage.save(saved.state,saved.revision);YunxinDrafts.save('new',{date:'2026-10-21',score:3,sleep:'7',note:'隔离测试草稿'});})()`);
      }
      evidence.persisted=await window.webContents.executeJavaScript(`(async()=>({record:(await YunxinStorage.read()).state.notes.some(n=>n.id==='native-qa'),draft:YunxinDrafts.read('new')?.note==='隔离测试草稿'}))()`);
      session.defaultSession.flushStorageData();
      require('node:fs').writeFileSync(checkArg.slice('--verify-output='.length),JSON.stringify(evidence,null,2));
    }finally{app.quit();}
  });
}
if(!app.requestSingleInstanceLock()){app.quit();}else{
  app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});
  app.whenReady().then(async()=>{
    session.defaultSession.setPermissionRequestHandler((_,permission,callback)=>callback(permission==='clipboard-sanitized-write'));
    session.defaultSession.setPermissionCheckHandler((_,permission)=>permission==='clipboard-sanitized-write');
    session.defaultSession.on('will-download',(_,item)=>item.setSaveDialogOptions({title:'保存孕心智护备份',defaultPath:path.join(app.getPath('downloads'),path.basename(item.getFilename()))}));
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      ...(process.platform==='darwin'?[{label:'孕心智护',submenu:[{role:'about'},{type:'separator'},{role:'hide'},{role:'quit'}]}]:[]),
      {label:'编辑',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},
      {label:'显示',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]},
      {label:'帮助',submenu:[{label:'关于与备份',click:()=>dialog.showMessageBox(window,{message:'孕心智护 1.0',detail:'记录保存在本机应用中，不自动云同步。请在“我的”定期导出备份。原网页记录可导出后恢复到此应用。'})}]}
    ]));
    server=createServer(path.join(__dirname,'www'),PORT);
    server.on('error',()=>{dialog.showErrorBox('应用无法启动','本机端口 18775 被占用，请关闭其他孕心智护窗口后重试。');app.quit();});
    server.listen(PORT,'127.0.0.1',openWindow);
    app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)openWindow();});
  });
  app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
  app.on('before-quit',()=>server?.close());
}
