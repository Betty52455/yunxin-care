// Run only with disposable servers at 8875 and 8876, never the user's 8765 data.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 for(const [edition,port] of [['local',8875],['browser',8876]]){
  const context=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  const page=await context.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const click=async s=>{await page.locator(s).first().click();await page.waitForFunction(()=>!busy);};
  const go=async hash=>{await page.evaluate(h=>go(h),hash);await page.waitForFunction(h=>page===h,hash);};
  await page.goto(`http://127.0.0.1:${port}/#care`);await page.getByRole('heading',{name:'今天想从哪里开始'}).waitFor();
  const before=await page.evaluate(()=>({notes:db.notes.length,practices:db.practices.length,needs:db.needs.length,tasks:db.tasks.length}));
  await click('[data-support="one-line"]');assert.equal(await page.locator('[name="title"]').count(),0);
  await page.locator('[name="text"]').fill('虚构记录：今天想先安静一下 <img src=x onerror=alert(1)>');
  await click('[data-form="support-one-line"] [type="submit"]');await page.locator('#modal').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>db.notes.length),before.notes+1);assert.equal(await page.locator('img[src="x"]').count(),0);
  await page.reload();await page.waitForFunction(()=>db?.notes.length>0);
  assert.match(await page.evaluate(()=>db.notes.at(-1).text),/今天想先安静/);
  await go('care');await page.getByLabel('产后',{exact:true}).check();await click('[data-form="support-preferences"] [type="submit"]');
  await page.getByRole('heading',{name:'产后支持工具箱'}).waitFor();
  await page.getByRole('link',{name:'心情与睡眠',exact:true}).click();await page.waitForFunction(()=>page==='mood');
  await go('care');await click('[data-action="activity"][data-id="small-pause"]');await click('[data-action="close"]');await page.locator('#modal').waitFor({state:'hidden'});
  await click('[data-support="nvc"]');await click('[data-form="support-nvc"] [type="submit"]');
  assert.equal(await page.evaluate(()=>db.practices.length),before.practices);assert.match(await page.locator('.form-feedback').innerText(),/只写一项/);
  await page.locator('[name="feeling"]').fill('虚构私人感受：有点疲惫');await click('[data-form="support-nvc"] [type="submit"]');await page.locator('#modal').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>db.practices.at(-1).text),'感受：虚构私人感受：有点疲惫');
  assert.equal(await page.evaluate(()=>db.needs.length),before.needs);assert.equal(await page.evaluate(()=>db.tasks.length),before.tasks);
  await click('[data-support="nvc"]');for(const key of ['observation','feeling','need','request']){assert.equal(await page.locator(`[name="${key}"]`).getAttribute('maxlength'),'4000');await page.locator(`[name="${key}"]`).fill('样'.repeat(4000));}
  await click('[data-form="support-nvc"] [type="submit"]');await page.locator('#modal').waitFor({state:'hidden'});assert.ok((await page.evaluate(()=>db.practices.at(-1).text)).length<20000);
  await go('settings');const dl=page.waitForEvent('download');await click('[data-action="export"]');const backup=`tmp/open-source-integration/${edition}-backup.json`;await (await dl).saveAs(backup);
  const data=JSON.parse(fs.readFileSync(backup));assert.equal(data.state.practices.length,before.practices+2);
  await page.locator('#backup-file').setInputFiles(backup);await click('[data-action="import-confirm"]');
  await go('practice');await click('[data-support="nvc"]');await page.locator('[name="observation"]').fill('今晚我回答了几次东西放在哪里');await page.locator('[name="need"]').fill('一段不用反复提醒的休息时间');
  await page.screenshot({path:`tmp/open-source-integration/${edition}-nvc.png`});await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`tmp/open-source-integration/${edition}-nvc-mobile.png`});
  await click('[data-action="close"]');await page.locator('#modal').waitFor({state:'hidden'});
  await click('[data-action="role"]');await click('[data-action="switch-role"][data-id="partner"]');await go('care');assert.equal(await page.locator('[data-support="nvc"],[data-support="one-line"]').count(),0);
  await go('practice');assert.ok(!(await page.locator('#main').innerText()).includes('虚构私人感受'));
  assert.deepEqual(errors,[]);await context.close();console.log(`${edition}: one-line save/reload, toolbox links, optional NVC fields, empty/max-length validation, no auto share, backup restore, partner view and 390px passed`);
 }
})().catch(e=>{console.error(e);process.exit(1)});
