/* Weekly reflection, derived only from local mood records. No network or separate archive. */
(function(root){
  'use strict';
  const words=['很低落','有点累','还可以','挺好的','很开心'];
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const valid=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&key(new Date(s+'T12:00:00'))===s;
  const add=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return key(d);};
  const monday=s=>{const d=new Date(s+'T12:00:00');return add(s,-((d.getDay()+6)%7));};
  const short=s=>`${Number(s.slice(5,7))}月${Number(s.slice(8))}日`;
  function clean(records,today){
    const byDay=new Map();
    for(const r of records||[])if(r&&valid(r.date)&&r.date<=today&&Number.isInteger(r.score)&&r.score>=1&&r.score<=5)byDay.set(r.date,r);
    return [...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date));
  }
  function weeks(records,today){return [...new Set([monday(today),add(monday(today),-7),...clean(records,today).map(r=>monday(r.date))])].sort().reverse();}
  function build(records,start,today){
    start=monday(valid(start)?start:today);
    const end=add(start,6),all=clean(records,today),rows=all.filter(r=>r.date>=start&&r.date<=end);
    const days=Array.from({length:7},(_,i)=>({date:add(start,i),label:'周'+'一二三四五六日'[i],record:rows.find(r=>r.date===add(start,i))||null,future:add(start,i)>today}));
    const counts=words.map((_,i)=>rows.filter(r=>r.score===i+1).length);
    const sleeps=rows.filter(r=>typeof r.sleep==='number'&&Number.isFinite(r.sleep)&&r.sleep>=0&&r.sleep<=24);
    const max=Math.max(...counts),common=max?words.filter((_,i)=>counts[i]===max):[];
    return {start,end,rows,days,counts,common,count:rows.length,elapsed:days.filter(d=>!d.future).length,complete:end<today,sleeps,sleepAverage:sleeps.length?sleeps.reduce((n,r)=>n+r.sleep,0)/sleeps.length:null,notes:rows.filter(r=>typeof r.note==='string'&&r.note.trim())};
  }
  let selected=null,book=null,host=null,cleanup=null,readMode=null;
  const number=n=>Number(n.toFixed(1)).toString();
  function pages(r){
    const period=`${r.start.slice(0,4)}年 ${short(r.start)} — ${short(r.end)}`;
    const missing=r.elapsed-r.count;
    const overview=r.count?`这一周，你留下了 ${r.count} 天的心情。${r.common.length===1?`记录中出现最多的是「${r.common[0]}」。`:`「${r.common.join('」「')}」在记录中并列最多。`}`:'这一周还没有心情记录。空白也是生活的一部分，可以从下一次记录开始。';
    const sleepText=r.sleeps.length?`已记录的 ${r.sleeps.length} 晚，平均睡眠 ${number(r.sleepAverage)} 小时。最短 ${number(Math.min(...r.sleeps.map(m=>m.sleep)))} 小时，最长 ${number(Math.max(...r.sleeps.map(m=>m.sleep)))} 小时。`:'这一周没有可汇总的睡眠时长。';
    return [
      {title:'一周心情手记',cover:true,body:`<p class="wb-period">${period}</p><div class="wb-cover-art" aria-hidden="true"><img src="assets/pressed-botanical.png" alt=""></div><p class="wb-cover-line">把一周的感受<br>轻轻收进这一页</p><p class="wb-stamp">${r.complete?'本周回顾':'本周进行中'} · ${r.count} 天记录</p>`},
      {title:'这一周的你',body:`<p class="wb-lead">${overview}</p><dl class="wb-counts"><div><dt>已记录</dt><dd>${r.count}<small> 天</small></dd></div><div><dt>已过去未记录</dt><dd>${missing}<small> 天</small></dd></div></dl><div class="wb-distribution">${words.map((w,i)=>`<div><span>${w}</span><span class="wb-bar"><i style="width:${r.count?countsPercent(r.counts[i],r.count):0}%;--mood-color:${['#a797ba','#88a7b5','#b7ad7f','#84a38a','#d09b81'][i]}"></i></span><b>${r.counts[i]} 天</b></div>`).join('')}</div><p class="wb-caption">只汇总写下的感受，不用平均分定义这一周。</p>`},
      {title:'七日心绪',body:`<div class="wb-days">${r.days.map(d=>`<div class="wb-day"><span>${d.label}<small>${short(d.date)}</small></span><strong>${d.record?words[d.record.score-1]:d.future?'尚未到来':'未记录'}</strong><span class="wb-mood-dots" aria-hidden="true">${[1,2,3,4,5].map(i=>`<i class="${d.record&&i<=d.record.score?'filled':''}"></i>`).join('')}</span></div>`).join('')}</div><p class="wb-caption">空白日期不推测、不补齐。</p>`},
      {title:'夜晚的休息',body:`<p class="wb-lead">${sleepText}</p><div class="wb-sleep-days">${r.days.map(d=>{const m=r.sleeps.find(m=>m.date===d.date);return `<div><span>${d.label}</span><div class="wb-sleep-track"><i style="width:${m?m.sleep/24*100:0}%"></i></div><b>${m?number(m.sleep)+' h':d.future?'待到来':'未记录'}</b></div>`;}).join('')}</div><p class="wb-caption">条形以 24 小时为完整刻度。未填写的日期不计入平均值；0 小时按实际记录计算。</p>`},
      {title:'留在纸上的片刻',body:r.notes.length?`<div class="wb-excerpts">${r.notes.slice(0,2).map(m=>`<blockquote><time>${short(m.date)}</time><p>${escape(m.note.trim().replace(/\s+/g,' ').slice(0,80))}${m.note.trim().length>80?'…':''}</p></blockquote>`).join('')}</div><p class="wb-caption">摘录本周最早 ${Math.min(2,r.notes.length)} 条文字。切换顶部「连续阅读」可查看完整内容。</p>`:'<p class="wb-lead">这一周没有留下文字。</p><p>不必为每一种心情找到解释。哪天想写，一句话也可以。</p>'},
      {title:'留一点余地给下周',body:`<p class="wb-lead">${r.count?'记录让变化有迹可循，也让平凡的片刻被留下。':'不需要一次写满七天，从愿意记录的那一天开始。'}</p><ul class="wb-prompts"><li>这一周，有哪个时刻想再记住一次</li><li>有什么小事，希望身边的人分担</li><li>下周想为自己留出怎样的一点时间</li></ul><p class="wb-caption">简报根据本机记录自动整理，仅用于生活回顾，不判断健康状况，也不会自动分享给伴侣。</p><span class="wb-end-mark" aria-hidden="true">—</span>`}
    ];
  }
  const countsPercent=(n,total)=>Math.round(n/total*100);
  function render(records,today){
    const list=weeks(records,today);
    if(!selected||!list.includes(selected)){const previous=add(monday(today),-7);selected=clean(records,today).some(r=>monday(r.date)===previous)?previous:monday(today);}
    const r=build(records,selected,today),sheets=pages(r);
    const continuous=readMode??Boolean(root.matchMedia?.('(max-width:700px)').matches);
    const fullNotes=r.notes.length?`<div class="wb-full-notes">${r.notes.map(m=>`<article><h4>${short(m.date)}</h4><p class="wb-note-full">${escape(m.note)}</p></article>`).join('')}</div>`:null;
    return `<section class="weekly-report" data-reading-mode="${continuous?'read':'flip'}" aria-label="每周心情简报"><div class="weekly-toolbar"><div><h2>每周心情简报</h2><p>每周一整理上周 · 本周随记录更新 · 仅妈妈可见</p></div><label class="weekly-select">翻阅周次<select id="weekly-week" aria-label="选择简报周次">${list.map(w=>`<option value="${w}" ${w===selected?'selected':''}>${short(w)} — ${short(add(w,6))}（${w===monday(today)?'本周':w.slice(0,4)+'年'}）</option>`).join('')}</select></label></div><div class="weekly-mode" role="group" aria-label="简报阅读方式"><button type="button" data-weekly-mode="flip" aria-pressed="${!continuous}" aria-controls="weekly-flip-panel">翻页</button><button type="button" data-weekly-mode="read" aria-pressed="${continuous}" aria-controls="weekly-full">连续阅读</button></div><p class="weekly-fallback-message" role="status" hidden>翻页暂不可用，已为你展开完整简报</p><div class="weekly-flip-panel" id="weekly-flip-panel" ${continuous?'hidden':''}><div class="weekly-reader"><div class="weekly-book" id="weekly-book" aria-label="心情简报翻页书">${sheets.map((s,i)=>`<article class="wb-page ${s.cover?'wb-cover':''}" ${s.cover?'data-density="hard"':''}><div class="wb-page-inner"><h3>${s.title}</h3>${s.body}<footer>${i+1} / ${sheets.length}</footer></div></article>`).join('')}</div></div><div class="weekly-controls" role="group" aria-label="简报翻页控制"><button class="btn" type="button" data-weekly="prev">上一页</button><span id="weekly-page-status" role="status" aria-live="polite"></span><button class="btn primary" type="button" data-weekly="next">下一页</button></div><p class="weekly-tip">点击按钮或拖动书页翻阅 · 聚焦翻页按钮时可用左右方向键</p></div><div class="weekly-full" id="weekly-full" role="region" aria-label="连续阅读完整简报" ${continuous?'':'hidden'}><div class="weekly-text">${sheets.map((s,i)=>`<section><h3>${s.title}</h3>${i===4&&fullNotes?fullNotes:s.body}</section>`).join('')}</div></div><p class="weekly-footnote">周一至周日为一周。关闭应用后不会在后台运行，再次打开时会自动补齐历史周的回顾；修改或删除原记录，简报会同步更新。</p></section>`;
  }

  function destroy(){cleanup?.();cleanup=null;book?.destroy();book=null;host=null;}
  function mount(container,onWeek){
    host=container;if(!host)return;
    const node=host.querySelector('#weekly-book'),status=host.querySelector('#weekly-page-status'),prev=host.querySelector('[data-weekly="prev"]'),next=host.querySelector('[data-weekly="next"]');
    const reduced=root.matchMedia('(prefers-reduced-motion: reduce)'),compact=root.matchMedia('(max-width:700px)');
    const flipPanel=host.querySelector('#weekly-flip-panel'),full=host.querySelector('#weekly-full'),modeButtons=host.querySelectorAll('[data-weekly-mode]');
    const available=Boolean(root.St?.PageFlip);
    const sync=()=>{if(!book||!host)return;const n=book.getCurrentPageIndex(),spread=book.getOrientation()==='landscape'&&n>0&&n<5;host.dataset.bookEdge=book.getOrientation()==='landscape'?(n===0?'front':n===5?'back':'open'):'open';status.textContent=`第 ${n+1}${spread?'—'+(n+2):''} 页 / 共 6 页`;prev.disabled=n===0;next.disabled=n===5;host.querySelectorAll('.wb-page').forEach((p,i)=>p.setAttribute('aria-hidden',String(i!==n&&!(spread&&i===n+1))));};
    const initBook=()=>{
      if(book){book.update();sync();return;}
      book=new root.St.PageFlip(node,{width:compact.matches?320:390,height:compact.matches?560:530,size:'stretch',minWidth:260,maxWidth:410,minHeight:400,maxHeight:compact.matches?720:558,showCover:true,usePortrait:true,flippingTime:650,maxShadowOpacity:.16,mobileScrollSupport:false,showPageCorners:!reduced.matches,useMouseEvents:!reduced.matches});
      book.on('flip',sync);book.on('changeOrientation',sync);book.on('init',sync);book.loadFromHTML(node.querySelectorAll('.wb-page'));sync();
    };
    const setMode=continuous=>{
      continuous=continuous||!available;
      host.dataset.readingMode=continuous?'read':'flip';
      flipPanel.hidden=continuous;full.hidden=!continuous;
      modeButtons.forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.weeklyMode==='read')===continuous)));
      if(!continuous)initBook();
    };
    if(!available){host.classList.add('weekly-fallback');host.querySelector('[data-weekly-mode="flip"]').disabled=true;host.querySelector('.weekly-fallback-message').hidden=false;}
    setMode(readMode??compact.matches);
    const turn=direction=>{if(!book||flipPanel.hidden)return;if(direction==='prev'&&!prev.disabled)reduced.matches?book.turnToPrevPage():book.flipPrev();if(direction==='next'&&!next.disabled)reduced.matches?book.turnToNextPage():book.flipNext();};
    const click=e=>{const mode=e.target.closest('[data-weekly-mode]');if(mode){readMode=mode.dataset.weeklyMode==='read';setMode(readMode);return;}const b=e.target.closest('[data-weekly]');if(b)turn(b.dataset.weekly);};
    const keyboard=e=>{if(!e.target.closest('.weekly-controls')||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();turn(e.key==='ArrowRight'?'next':'prev');};
    const change=e=>{if(e.target.id==='weekly-week'){selected=e.target.value;onWeek();document.querySelector('#weekly-week')?.focus({preventScroll:true});}};
    host.addEventListener('click',click);host.addEventListener('keydown',keyboard);host.addEventListener('change',change);
    const resize=()=>onWeek();compact.addEventListener('change',resize);
    const saved=host;cleanup=()=>{compact.removeEventListener('change',resize);saved.removeEventListener('click',click);saved.removeEventListener('keydown',keyboard);saved.removeEventListener('change',change);};
  }

  const api={build,weeks,monday,add,render,mount,destroy};root.YunxinWeekly=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
