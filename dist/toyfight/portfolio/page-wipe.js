(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let curtain=null;
  function ensureCurtain(){
    if(curtain)return curtain;
    const style=document.createElement('style');style.textContent='.portfolio-page-curtain{position:fixed;inset:0;z-index:2147483000;background:#0d0d0e;pointer-events:none;transform:translate3d(0,101%,0);will-change:transform;border-radius:0}.portfolio-page-curtain.is-leaving{pointer-events:auto}';document.head.append(style);
    curtain=document.createElement('div');curtain.className='portfolio-page-curtain';curtain.setAttribute('aria-hidden','true');document.body.append(curtain);return curtain;
  }
  let pending=false;
  let entering=false;try{entering=Boolean(sessionStorage.getItem('portfolio-page-entry'));sessionStorage.removeItem('portfolio-page-entry');}catch{}
  // Legacy pages keep their original entry mask. Create the shared exit mask
  // only after interaction, so it cannot interfere with their React hydration.
  if(entering&&!reduced&&document.querySelector('.character-stage'))ensureCurtain().animate([{transform:'translate3d(0,0,0)'},{transform:'translate3d(0,-101%,0)'}],{duration:650,easing:'cubic-bezier(.76,0,.24,1)'});
  window.__portfolioNavigate=async path=>{
    if(pending)return;pending=true;try{sessionStorage.setItem('portfolio-page-entry','1');}catch{}
    ensureCurtain().classList.add('is-leaving');
    if(!reduced){const animation=curtain.animate([{transform:'translate3d(0,101%,0)',borderRadius:'45% 45% 0 0'},{transform:'translate3d(0,0,0)',borderRadius:'0'}],{duration:520,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});await animation.finished.catch(()=>{});}
    const url=new URL(path,location.href);if(url.origin===location.origin&&url.pathname!=='/toyfight'&&!url.pathname.startsWith('/toyfight/'))url.pathname='/toyfight'+url.pathname;location.assign(url.href);
  };
  window.addEventListener('click',event=>{
    const a=event.target.closest?.('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
    const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname)return;
    event.preventDefault();event.stopImmediatePropagation();window.__portfolioNavigate(url.pathname+url.search+url.hash);
  },true);
  window.addEventListener('pageshow',event=>{if(event.persisted){pending=false;curtain?.getAnimations().forEach(a=>a.cancel());curtain?.classList.remove('is-leaving');}});
})();
