/* Only public application files are cached. Records remain in IndexedDB. */
(() => {
  let status = '离线资源尚未就绪，请保持联网';
  const update = () => document.querySelectorAll('.mobile-cache-state').forEach(node => {
    if (node.textContent !== status) node.textContent = status;
  });
  const observer = new MutationObserver(update);
  observer.observe(document.getElementById('main'), {childList:true});
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status = '当前打开方式不支持离线缓存，请使用 HTTPS 网址'; update(); return;
  }
  navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).then(reg => {
    const ready = () => {
      status = reg.waiting ? '新版已准备好，关闭此网站所有窗口后重新打开即可更新' : '离线资源已就绪 · 个人记录仍需定期备份';
      update();
    };
    if (reg.active) ready();
    const watch = () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' || worker.state === 'activated') ready();
        if (worker.state === 'redundant' && !reg.active) {
          status = '离线资源下载未完成，请联网后重新打开'; update();
        }
      });
    };
    watch(); reg.addEventListener('updatefound', watch);
    navigator.serviceWorker.ready.then(ready);
  }).catch(() => { status = '暂未启用离线缓存，联网使用不受影响'; update(); });
})();
