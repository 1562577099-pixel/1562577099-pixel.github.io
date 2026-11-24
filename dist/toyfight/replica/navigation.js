/* Editable adaptation layer. Keep the captured reference resources unchanged. */
(() => {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const local = window.__referenceAssets?.[url];
    if (local) return nativeFetch(local, init);
    // No analytics or message submissions leave this reference build.
    if (/googletagmanager\.com|google-analytics\.com|hooks\.slack\.com|api\.cloudinary\.com|hooks\.spline\.design/.test(url)) {
      return Promise.resolve(new Response('{}', {status:200,headers:{'Content-Type':'application/json'}}));
    }
    return nativeFetch(input, init);
  };
  window.__saveReferenceRecording = blob => new Promise((resolve,reject)=>{
    const request=indexedDB.open('toyfight-reference-recordings',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('recordings',{keyPath:'id'});
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const db=request.result,id=Date.now(),transaction=db.transaction('recordings','readwrite');
      transaction.objectStore('recordings').put({id,blob,createdAt:new Date().toISOString()});
      transaction.oncomplete=()=>{db.close();resolve({data:{secure_url:'local-recording',asset_id:String(id)}});};
      transaction.onerror=()=>{db.close();reject(transaction.error);};
    };
  });
  // The source uses Next server components. Full document navigation preserves
  // each captured page's animation setup when served from a static host.
  window.addEventListener('click', event => {
    const a = event.target.closest?.('a[href]');
    if (!a || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin === location.origin && url.pathname !== location.pathname && !url.hash) {
      event.preventDefault();
      event.stopImmediatePropagation();
      (window.__portfolioNavigate || location.assign.bind(location))(url.pathname + url.search + url.hash);
    }
  }, true);
})();
