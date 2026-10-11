/* 在独立临时目录验证真实页面流程，不读取或修改用户正式数据。 */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const net = require('node:net');
const root = path.resolve(__dirname, '..');
let server, browser, temp;
const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async()=>{
  temp = await fs.mkdtemp(path.join(os.tmpdir(),'yunxin-browser-'));
  const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
  const url=`http://127.0.0.1:${port}`;
  async function start(){
    server=spawn(process.env.PYTHON_BIN||(process.platform==='win32'?'python':'python3'),[path.join(root,'server.py'),'--port',String(port),'--data-dir',path.join(temp,'data')],{stdio:'pipe'});
    for(let i=0;i<40;i++){try{if((await fetch(url+'/api/health')).ok)return;}catch{}await sleep(100);}
    throw new Error('Test server did not start');
  }
  await start();
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1080},acceptDownloads:true});
  const page=await context.newPage();
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(url))external.push(r.url());});
  const action=async(name,id)=>{await page.locator(`[data-action="${name}"]${id===undefined?'':`[data-id="${id}"]`}`).first().click();};
  const submit=async kind=>{await page.locator(`form[data-form="${kind}"] button[type="submit"]`).click();await page.waitForFunction(()=>!document.body.classList.contains('saving'));};
  const nav=async id=>{await page.locator(`.nav a[href="#${id}"]`).click();await page.waitForFunction(id=>document.title.startsWith(({home:'首页',mood:'心情',needs:'我的需要',family:'家庭',practice:'沟通',support:'日常',help:'求助',notes:'备忘',settings:'数据'})[id]),id);};
  const role=async id=>{await action('role');await action('switch-role',id);};
  const snapshot=async()=> (await (await fetch(url+'/api/state')).json()).state;
  await page.goto(url);
  await page.waitForSelector('.hero');
  assert.equal(await page.locator('.nav a').count(),9);
  await page.screenshot({path:path.join(temp,'home.png'),fullPage:true});
  console.log('PASS: empty home and nine pages');

  await nav('mood');
  await action('mood-select','4');
  await page.locator('[name="sleep"]').fill('6.5');
  await page.locator('[name="note"]').fill('私密心情：只想被听见 <script>alert(1)</script>');
  await submit('mood');
  await page.reload();await page.waitForSelector('.record');
  assert.equal((await snapshot()).moods[0].score,4);
  assert.equal(await page.locator('.record').count(),1);
  await nav('home');await action('quick-mood','2');
  await page.waitForSelector('form[data-form="mood"]');
  assert.equal(await page.locator('input[name="score"]').inputValue(),'2');
  await action('mood-edit');
  assert.equal(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);return ids.length===new Set(ids).size;}),true);
  await action('close');
  console.log('PASS: mood and sleep persist on refresh; raw text remains inert');

  await nav('needs');await action('need-new','休息');
  await page.locator('textarea[name="text"]').fill('私密原话：想有人接手家务，让我休息一会儿。');
  await page.locator('#need-confirm').check();await submit('need');
  await action('task-from-need');
  await page.locator('[name="title"]').fill('今晚收拾餐桌');
  await page.locator('[name="time"]').fill('20:00');
  await page.locator('[name="details"]').fill('收好碗筷并擦干净桌面');await submit('task');
  assert.equal((await snapshot()).tasks[0].shared,false);
  await role('partner');await nav('family');assert.equal(await page.locator('.task-card').count(),0);
  await role('mother');await nav('family');await action('task-share');
  assert(!(await page.locator('#modal').innerText()).includes('私密原话'));
  await action('share-confirm');await page.waitForFunction(()=>!document.body.classList.contains('saving'));
  console.log('PASS: draft hidden, sharing preview excludes raw needs');

  await role('partner');await nav('family');await action('proposal');
  await page.locator('[name="proposal"]').fill('可以改为21点吗？');await submit('proposal');
  await role('mother');await nav('family');await action('proposal-review');
  await page.locator('[name="time"]').fill('21:00');await submit('proposal-review');
  await role('partner');await nav('family');await action('task-status');
  await page.waitForFunction(()=>!document.body.classList.contains('saving'));await action('task-status');
  await page.waitForFunction(()=>!document.body.classList.contains('saving'));await action('task-status');
  await page.waitForFunction(()=>!document.body.classList.contains('saving'));
  assert.equal((await snapshot()).tasks[0].status,'completed');
  await role('mother');await nav('family');await action('task-filter','completed');await action('feedback');
  await page.locator('[name="help"]').selectOption('没有帮助');await page.locator('[name="burden"]').selectOption('较多');
  await page.locator('[name="note"]').fill('仍需要反复提醒');await submit('feedback');
  const task=(await snapshot()).tasks[0];assert.equal(task.status,'completed');assert.equal(task.feedback.help,'没有帮助');
  await page.screenshot({path:path.join(temp,'family.png'),fullPage:true});
  await role('partner');await nav('family');assert(!(await page.locator('#main').innerText()).includes('反复提醒'));
  await nav('mood');assert(await page.locator('.locked').isVisible());
  await role('mother');await nav('family');await action('task-revoke');await action('task-confirm');
  await page.waitForFunction(()=>!document.body.classList.contains('saving'));
  await role('partner');await nav('family');await action('task-filter','all');assert.equal(await page.locator('.task-card').count(),0);
  console.log('PASS: negotiate, reconfirm, execute, private feedback, revoke');

  await role('mother');await nav('home');await page.locator('#quick-note').fill('记得问医生的问题');await submit('quick-note');
  await nav('notes');await action('note-pin');await page.waitForFunction(()=>!document.body.classList.contains('saving'));
  assert(await page.locator('.note-card.pinned').isVisible());
  await page.locator('#note-search').fill('不存在的词');assert.equal(await page.locator('.note-card').count(),0);
  await page.locator('#note-search').fill('医生');assert.equal(await page.locator('.note-card').count(),1);
  await action('note-edit');await page.locator('[name="title"]').fill('就诊前要问的问题');await submit('note');
  console.log('PASS: quick memo, pin, search, edit');

  await nav('practice');await action('practice-start','listening');await action('practice-write','listening');
  await page.locator('textarea[name="text"]').fill('我愿意听你说，现在需要我先陪着吗？');await submit('practice');
  await nav('support');await page.locator('select[name="available"]').selectOption('5');await submit('support-filter');
  assert.equal(await page.locator('.activity-card').count(),3);
  await action('activity','quiet');await action('timer-start');await action('timer-stop');
  await page.locator('[name="note"]').fill('短暂安静了一会儿');await submit('activity');
  console.log('PASS: stepped practice, time filter, timer, activity feedback');

  await nav('help');await action('contact-new');await page.locator('[name="name"]').fill('测试支持联系人');
  await page.locator('[name="phone"]').fill('测试号码，请替换');await submit('contact');
  await page.locator('[name="person"]').fill('可信赖的家人');await page.locator('[name="place"]').fill('熟悉的医疗机构');
  await page.locator('[name="message"]').fill('我需要有人陪我待一会儿');await submit('help-card');
  console.log('PASS: support contact and help card');

  const beforeRestart=await snapshot();
  await new Promise(resolve=>{server.once('exit',resolve);server.kill();});await start();
  await page.reload();await page.waitForSelector('.contact-card');assert.deepEqual(await snapshot(),beforeRestart);
  console.log('PASS: data retained across full local-service restart');

  await nav('settings');
  const downloadPromise=page.waitForEvent('download');await action('export');const download=await downloadPromise;
  const backupPath=path.join(temp,'backup.json');await download.saveAs(backupPath);
  const backup=JSON.parse(await fs.readFile(backupPath,'utf8'));assert.deepEqual(backup.state,beforeRestart);
  await action('clear');await page.locator('[name="confirm"]').fill('清空');await submit('clear');
  assert.equal((await snapshot()).notes.length,0);
  assert.equal(await fs.stat(path.join(temp,'data','previous.json')).then(()=>true,()=>false),false);
  await page.locator('#backup-file').setInputFiles(backupPath);await action('import-confirm');
  await page.waitForFunction(()=>!document.body.classList.contains('saving'));assert.deepEqual(await snapshot(),beforeRestart);
  console.log('PASS: backup export, confirmed reset, backup restore');

  const second=await context.newPage();await second.goto(url);await second.waitForSelector('.hero');
  await nav('home');await page.locator('#quick-note').fill('第一个窗口新增');await submit('quick-note');
  await second.locator('#quick-note').fill('第二个窗口新增');await second.locator('form[data-form="quick-note"] button').click();
  await second.waitForFunction(()=>!document.body.classList.contains('saving'));
  assert((await second.locator('#toast').innerText()).includes('另一个页面'));
  assert.equal((await snapshot()).notes.length,beforeRestart.notes.length+1);
  await second.locator('form[data-form="quick-note"] button').click();await second.waitForFunction(()=>!document.body.classList.contains('saving'));
  assert.equal((await snapshot()).notes.length,beforeRestart.notes.length+2);
  await second.close();
  console.log('PASS: two-window conflict cannot overwrite newer records');

  await page.reload();await page.waitForSelector('.hero');
  for(const id of ['home','mood','needs','family','practice','support','help','notes','settings']){
    await nav(id);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false,`${id} has horizontal overflow`);
  }
  await page.setViewportSize({width:1024,height:768});await nav('home');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  await fs.mkdir(path.join(root,'tests','output'),{recursive:true});
  await fs.copyFile(path.join(temp,'home.png'),path.join(root,'tests','output','home.png'));
  await fs.copyFile(path.join(temp,'family.png'),path.join(root,'tests','output','family.png'));
  console.log('PASS: all pages render, desktop widths fit, no script errors, no external requests');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(browser)await browser.close();
  if(server&&server.exitCode===null)await new Promise(resolve=>{server.once('exit',resolve);server.kill();});
  if(temp)await fs.rm(temp,{recursive:true,force:true});
});
