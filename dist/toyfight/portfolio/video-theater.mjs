export function mountVideoTheater(videos){
  const dialog=document.createElement('dialog');dialog.className='film-theater';dialog.setAttribute('aria-label','作品视频播放器');
  dialog.innerHTML='<div class="film-theater-panel"></div><div class="film-theater-controls"><button class="film-sound" type="button" aria-label="关闭声音">Sound On</button><button class="film-close" type="button" aria-label="关闭视频返回作品">×</button></div>';
  document.body.append(dialog);
  const panel=dialog.querySelector('.film-theater-panel'),sound=dialog.querySelector('.film-sound');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let active=null,animation=null,closing=false,previousOverflow='';
  const frameTransform=rect=>`translate3d(${rect.left}px,${rect.top}px,0) scale(${rect.width/window.innerWidth},${rect.height/window.innerHeight})`;
  function open(video,frame,button){
    if(active)return;
    const rect=frame.getBoundingClientRect();active={video,frame,button};closing=false;
    videos.forEach(other=>{if(other!==video)other.pause();});
    frame.style.backgroundImage=`url(${JSON.stringify(video.getAttribute('poster'))})`;
    frame.classList.add('playing');panel.append(video);video.controls=true;
    dialog.setAttribute('aria-label',video.getAttribute('aria-label')+' · 视频播放器');
    dialog.showModal();previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    sound.textContent=video.muted?'Sound Off':'Sound On';sound.setAttribute('aria-label',video.muted?'打开声音':'关闭声音');
    animation=panel.animate([{transform:frameTransform(rect)},{transform:'translate3d(0,0,0) scale(1)'}],{duration:reduce.matches?0:620,easing:'cubic-bezier(.22,1,.36,1)'});
    video.play().catch(()=>{});dialog.querySelector('.film-close').focus({preventScroll:true});
  }
  async function close(){
    if(!active||closing)return;closing=true;
    const {video,frame,button}=active,rect=frame.getBoundingClientRect();
    const current=getComputedStyle(panel).transform;animation?.cancel();
    animation=panel.animate([{transform:current==='none'?'translate3d(0,0,0) scale(1)':current},{transform:frameTransform(rect)}],{duration:reduce.matches?0:520,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
    await animation.finished.catch(()=>{});
    video.pause();video.controls=false;frame.prepend(video);frame.classList.remove('playing');
    dialog.close();animation.cancel();document.documentElement.style.overflow=previousOverflow;
    active=null;closing=false;button.focus({preventScroll:true});
  }
  dialog.querySelector('.film-close').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  sound.addEventListener('click',()=>{if(!active)return;active.video.muted=!active.video.muted;sound.textContent=active.video.muted?'Sound Off':'Sound On';sound.setAttribute('aria-label',active.video.muted?'打开声音':'关闭声音');});
  for(const video of videos){
    const frame=video.closest('.film-frame'),button=frame.querySelector('.film-play');
    button.addEventListener('click',()=>open(video,frame,button));
    video.addEventListener('click',()=>{if(!dialog.open&&!video.controls)open(video,frame,button);});
    video.addEventListener('play',()=>frame.classList.add('playing'));
    video.addEventListener('pause',()=>{if(active?.video!==video)frame.classList.remove('playing');});
    video.addEventListener('ended',()=>{if(active?.video===video)close();else frame.classList.remove('playing');});
  }
  return {close};
}
