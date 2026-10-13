'use strict';
// Locally served plush sprites with adjustable embroidered features; no network requests.
(function(root){
  const defaults={name:'小暖',face:50,eyes:50,gap:50,smile:65,hair:'bob',skin:'#f3c9a9',hairColor:'#594238',outfit:'#719782',accessory:'leaf'};
  function normalize(value={}){
    const v=value && typeof value==='object'?value:{};const c={...defaults};
    if(typeof v.name==='string')c.name=v.name.trim().slice(0,12)||defaults.name;
    for(const k of ['face','eyes','gap','smile'])if(Number.isFinite(v[k]))c[k]=Math.max(0,Math.min(100,Math.round(v[k])));
    for(const k of ['skin','hairColor','outfit'])if(/^#[0-9a-f]{6}$/i.test(v[k]))c[k]=v[k];
    if(['bob','short','buns'].includes(v.hair))c.hair=v.hair==='short'?'bob':v.hair;
    if(['leaf','glasses','none'].includes(v.accessory))c.accessory=v.accessory;
    return c;
  }
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let drawing=0;
  function avatar(c,state='idle'){
    const n='plush-'+(++drawing),src=c.hair==='buns'?'/assets/plush-buns.png':'/assets/plush-bob.png';
    const eye=21+c.eyes*.14,gap=65+c.gap*.6,scale=.91+c.face*.0018;
    const happy=['pat','wave','dance'].includes(state),sleep=state==='sleep';
    const eyes=x=>sleep||happy?`<path d="M${x-28} 411q28 ${sleep?24:-30} 56 0" fill="none" stroke="#50382c" stroke-width="10" stroke-linecap="round"/>`:`<g class="pet-eye"><ellipse cx="${x}" cy="403" rx="${eye}" ry="${eye*1.12}" fill="#493128" stroke="#805743" stroke-width="3"/><ellipse cx="${x-8}" cy="394" rx="6" ry="8" fill="#fff5df"/></g>`;
    const image=`<image href="${src}" width="1280" height="1280"/>`;
    return `<svg viewBox="0 0 1280 1280" aria-hidden="true" focusable="false"><defs><clipPath id="${n}-skin"><ellipse cx="640" cy="415" rx="155" ry="100"/></clipPath><clipPath id="${n}-hair"><path fill-rule="evenodd" d="M350 275H930V550H350Z M455 290H812V515H455Z"/></clipPath><filter id="${n}-skin-dye"><feFlood flood-color="${c.skin}" flood-opacity=".22"/><feBlend in2="SourceGraphic" mode="multiply"/><feComposite in2="SourceGraphic" operator="in"/></filter><filter id="${n}-hair-dye"><feFlood flood-color="${c.hairColor}" flood-opacity=".4"/><feBlend in2="SourceGraphic" mode="multiply"/><feComposite in2="SourceGraphic" operator="in"/></filter><clipPath id="${n}-body"><rect x="0" y="535" width="1280" height="745"/></clipPath><clipPath id="${n}-head"><rect width="1280" height="550"/></clipPath><clipPath id="${n}-clothes"><path d="M546 554L585 561 593 633 680 633 693 556 734 548 722 641 741 747 804 1017 794 1073 666 1086 640 928 620 1087 460 1087 445 1024 506 762 548 663Z"/></clipPath><filter id="${n}-dye" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values=".2"/><feFlood flood-color="${c.outfit}" flood-opacity=".38"/><feBlend in2="SourceGraphic" mode="multiply"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs><g class="pet-body"><g clip-path="url(#${n}-body)">${image}</g><g clip-path="url(#${n}-clothes)" filter="url(#${n}-dye)">${image}</g><g transform="translate(${640*(1-scale)} 0) scale(${scale} 1)"><g clip-path="url(#${n}-head)">${image}</g><g clip-path="url(#${n}-skin)" filter="url(#${n}-skin-dye)">${image}</g><g clip-path="url(#${n}-hair)" filter="url(#${n}-hair-dye)">${image}</g><ellipse cx="530" cy="447" rx="27" ry="14" fill="#d89184" opacity=".35"/><ellipse cx="750" cy="447" rx="27" ry="14" fill="#d89184" opacity=".35"/>${eyes(640-gap)}${eyes(640+gap)}<path d="M633 437q-5 9 10 7" fill="none" stroke="#b68068" stroke-width="5" stroke-linecap="round"/><path d="M617 466q23 ${happy?34:8+c.smile*.28} 46 0" fill="none" stroke="#6d4636" stroke-width="6" stroke-linecap="round"/>${c.accessory==='glasses'?`<g fill="none" stroke="#7f765d" stroke-width="6"><circle cx="${640-gap}" cy="406" r="48"/><circle cx="${640+gap}" cy="406" r="48"/><path d="M${688-gap} 402H${592+gap}"/></g>`:''}${c.accessory==='leaf'?'<g transform="translate(815 235)"><path d="M0 0Q-44-47-35-14Q-25 10 0 0Q30-49 36-22Q30 8 0 0" fill="#8fa478" stroke="#6d8158" stroke-width="2"/><circle r="8" fill="#d8bd76"/></g>':''}</g></g>${state==='snack'?'<text x="870" y="780" font-size="120">🍪</text>':sleep?'<text x="900" y="220" fill="#829487" font-size="80">z z</text>':state==='pat'?'<text x="905" y="235" fill="#c89288" font-size="90">♡</text>':''}</svg>`;
  }
  root.YunxinPet={normalize,defaults,avatar};
  if(typeof module!=='undefined')module.exports=root.YunxinPet;
  if(!root.customElements)return;
  class Companion extends HTMLElement {
    connectedCallback(){
      try{this.config=normalize(JSON.parse(this.getAttribute('config')||'{}'));}catch{this.config=normalize();}
      this.state='idle';this.offset=0;
      this.innerHTML=`<div class="pet"><div class="pet-label"><span class="pet-dot"></span><strong class="pet-name"></strong><span>你的毛绒小伙伴</span></div><div class="pet-stage"><div class="pet-orbit"></div><p class="pet-speech" role="status">慢慢来，我陪你。</p><button class="pet-doll" type="button" aria-label="摸摸小人，可用左右方向键移动"></button><span class="pet-ground"></span></div><div class="pet-actions"><button type="button" data-pet="wave">👋 打招呼</button><button type="button" data-pet="snack">🍪 小饼干</button><button type="button" data-pet="sleep">☾ 休息</button><button type="button" data-pet="dance">♫ 摇一摇</button><button type="button" data-pet="encourage">♡ 鼓励一下</button><button type="button" data-pet="weather">☀ 天气提醒</button></div><button class="pet-more" type="button" data-pet="more" aria-expanded="false">陪我玩一会儿</button><button class="pet-customize" type="button" data-pet="edit">✧ 捏脸与换装 <span>换个喜欢的样子 →</span></button><dialog class="pet-editor" aria-labelledby="pet-editor-title"><div class="pet-editor-head"><div><small>YOUR LITTLE COMPANION</small><h2 id="pet-editor-title">捏一个喜欢的小伙伴</h2></div><button type="button" data-pet="cancel" aria-label="关闭捏脸">×</button></div><div class="pet-editor-grid"><div class="pet-preview"><div class="pet-preview-art"></div><strong class="pet-preview-name"></strong><p>每一点不同，都很可爱。</p></div><form class="pet-form"><label>小伙伴的名字<input name="name" maxlength="12" required></label><div class="pet-two"><label>发型<select name="hair"><option value="bob">贝雷帽波波头</option><option value="buns">毛线双丸子头</option></select></label><label>配饰<select name="accessory"><option value="leaf">小芽发夹</option><option value="glasses">圆框眼镜</option><option value="none">不戴配饰</option></select></label></div><fieldset><legend>捏捏五官</legend>${[['face','脸颊圆润度'],['eyes','眼睛大小'],['gap','眼睛间距'],['smile','微笑弧度']].map(([key,label])=>`<label class="pet-range">${label}<output data-output="${key}"></output><input type="range" name="${key}" aria-label="${label}" min="0" max="100" step="1"></label>`).join('')}</fieldset><div class="pet-colors">${[['skin','肤色'],['hairColor','发色'],['outfit','衣服颜色']].map(([key,label])=>`<label>${label}<input type="color" name="${key}" aria-label="${label}"></label>`).join('')}</div><p class="pet-save-note" role="status">调整时可以预览，保存后下次还会记得。</p><div class="pet-editor-actions"><button type="button" data-pet="random">试试另一种</button><button type="submit" class="pet-primary">保存小伙伴</button></div></form></div></dialog></div>`;
      this.doll=this.querySelector('.pet-doll');this.dialog=this.querySelector('.pet-editor');this.form=this.querySelector('form');
      this.refresh();
      this.addEventListener('click',e=>{const button=e.target.closest('[data-pet]');if(!button)return;const action=button.dataset.pet;if(action==='more'){this.classList.toggle('pet-expanded');button.setAttribute('aria-expanded',String(this.classList.contains('pet-expanded')));}else if(action==='weather')this.dispatchEvent(new CustomEvent('pet-weather',{bubbles:true}));else if(action==='edit')this.edit();else if(action==='cancel')this.dialog.close();else if(action==='random')this.randomize();else this.react(action);});
      this.form.addEventListener('input',()=>{this.draft=this.readForm();this.preview();});
      this.form.addEventListener('submit',e=>{e.preventDefault();this.save();});
      this.dialog.addEventListener('close',()=>{this.draft=null;});
      this.doll.addEventListener('click',()=>{if(this.suppressClick){this.suppressClick=false;return;}this.react('pat');});
      this.doll.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();this.move(this.offset+(e.key==='ArrowLeft'?-15:15));}});
      this.doll.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.drag={x:e.clientX,offset:this.offset,moved:false};this.doll.setPointerCapture(e.pointerId);});
      this.doll.addEventListener('pointermove',e=>{if(!this.drag)return;const delta=e.clientX-this.drag.x;if(Math.abs(delta)>4)this.drag.moved=true;this.move(this.drag.offset+delta);});
      this.doll.addEventListener('pointerup',()=>{if(this.drag?.moved){this.suppressClick=true;this.say('这里也很舒服，就坐在这里陪你。');}this.drag=null;});
      this.doll.addEventListener('pointercancel',()=>{this.drag=null;this.suppressClick=false;});
    }
    disconnectedCallback(){clearTimeout(this.timer);}
    refresh(){this.querySelector('.pet-name').textContent=this.config.name;this.doll.innerHTML=avatar(this.config,this.state);this.doll.dataset.state=this.state;}
    say(message){this.querySelector('.pet-speech').textContent=message;}
    move(x){const room=Math.max(0,(this.querySelector('.pet-stage').clientWidth-this.doll.clientWidth)/2-8);this.offset=Math.max(-room,Math.min(room,x));this.doll.style.translate=`${this.offset}px 0`;}
    react(action){clearTimeout(this.timer);if(this.state==='sleep'&&action==='sleep')action='wave';this.state=action;this.refresh();this.say({pat:'收到摸摸！给你一颗小小的心。',wave:'嗨，我在。今天也慢慢来吧。',snack:'咔嚓！也记得给自己留一点好吃的。',sleep:'一起安静一会儿。点我可以叫醒我。',dance:'摇一摇，把紧绷的心情放轻一点。',encourage:'不用把每件事都做好，你已经在认真照顾自己了。'}[action]);if(action!=='sleep')this.timer=setTimeout(()=>{this.state='idle';this.refresh();this.say('不用完成什么，我就在这里。');},3200);}
    edit(){this.draft={...this.config};this.fillForm();this.preview();this.dialog.showModal();}
    fillForm(){for(const[k,v]of Object.entries(this.draft)){const field=this.form.elements.namedItem(k);if(field)field.value=v;}}
    readForm(){const value={...this.config,...Object.fromEntries(new FormData(this.form))};for(const k of ['face','eyes','gap','smile'])value[k]=Number(value[k]);return normalize(value);}
    preview(){this.querySelector('.pet-preview-art').innerHTML=avatar(this.draft);this.querySelector('.pet-preview-name').textContent=this.draft.name;for(const output of this.querySelectorAll('output'))output.value=this.draft[output.dataset.output];}
    randomize(){this.draft={...this.readForm(),face:Math.floor(Math.random()*101),eyes:Math.floor(Math.random()*101),gap:Math.floor(Math.random()*101),smile:Math.floor(Math.random()*61)+40,hair:['bob','buns'][Math.floor(Math.random()*2)],outfit:['#719782','#b58b9a','#829eb3','#c4a16f'][Math.floor(Math.random()*4)]};this.fillForm();this.preview();}
    save(){if(this.saving)return;this.saving=true;const config=this.readForm();const button=this.form.querySelector('[type=submit]');button.disabled=true;button.textContent='正在保存…';this.dispatchEvent(new CustomEvent('pet-save',{bubbles:true,detail:{config,done:ok=>{this.saving=false;button.disabled=false;button.textContent='保存小伙伴';if(ok){this.config=config;this.refresh();this.dialog.close();this.say('新样子准备好了，继续陪你。');}else this.querySelector('.pet-save-note').textContent='没有保存成功，调整仍在这里。请查看页面提示后重试。';}}}));}
  }
  customElements.define('yunxin-pet',Companion);
})(globalThis);
