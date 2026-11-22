export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export function advanceSpring(position,velocity,target,dt){
  const steps=Math.max(1,Math.ceil(dt/.008)),h=dt/steps;
  for(let n=0;n<steps;n++){velocity+=((target-position)*560-velocity*46)*h;position+=velocity*h;}
  return {position,velocity};
}
export function landingRoom(raw,settled,direction,momentum=0){
  const distance=raw-settled;
  let index=Math.round(clamp(raw+clamp(momentum,-4,4)*.12,0,3));
  if(Math.abs(distance)>.08&&Math.abs(distance)<.5&&Math.sign(distance)===direction)index=settled+direction;
  return clamp(index,0,3);
}

export function createRoomWalk(){
  const walk=document.querySelector('.room-walk'),stage=walk.querySelector('.room-stage'),track=walk.querySelector('.room-track');
  const rooms=[...track.querySelectorAll('.table-page')],buttons=[...walk.querySelectorAll('[data-room]')];
  let start=0,step=1,position=0,velocity=0,target=0,raf=0,last=0,active=-1,visible=true,idleTimer,settled=0,previousY=scrollY,direction=1,glide=null,drag=null,touching=false;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const readTarget=()=>clamp((scrollY-start)/step,0,3);
  function cancelGlide(){if(glide)cancelAnimationFrame(glide.raf);glide=null;clearTimeout(idleTimer);}
  function follow(){
    const next=readTarget(),delta=next-target;
    // Most of each input delta reaches the scene immediately; the spring only
    // cushions the remainder instead of adding a second long easing curve.
    position=clamp(position+delta*(drag?.active ? .94 : .76),0,3);target=next;request();
  }
  function glideTo(top,duration=250){
    cancelGlide();const from=scrollY;
    if(media.matches||Math.abs(top-from)<2){scrollTo({top,behavior:'instant'});follow();return;}
    const motion={from,to:top,started:performance.now(),duration,raf:0};glide=motion;
    function tick(now){
      if(glide!==motion)return;
      const t=clamp((now-motion.started)/motion.duration,0,1),ease=1-(1-t)**3;
      scrollTo({top:motion.from+(motion.to-motion.from)*ease,behavior:'instant'});follow();
      if(t<1)motion.raf=requestAnimationFrame(tick);else{glide=null;target=readTarget();request();}
    }
    motion.raf=requestAnimationFrame(tick);
  }
  function measure(){
    cancelGlide();if(drag){drag=null;stage.classList.remove('is-dragging');}
    walk.querySelector('.walk-hint').textContent=matchMedia('(pointer:fine)').matches&&innerWidth>650?'滚动或拖动，穿过房间':'向下滑动，穿过房间';
    const oldStep=step,wasInside=scrollY>=start&&scrollY<=start+oldStep*3;
    start=walk.getBoundingClientRect().top+scrollY;step=Math.max(innerHeight*.8,360);
    walk.style.setProperty('--walk-distance',`${step*3}px`);
    if(media.matches){track.style.transform='';rooms.forEach(r=>{r.inert=false;r.removeAttribute('aria-hidden');r.style.setProperty('--room-drift','0');});return;}
    if(wasInside&&Math.abs(oldStep-step)>50&&oldStep>1)scrollTo({top:start+clamp(position,0,3)*step,behavior:'instant'});
    position=target=readTarget();settled=Math.round(target);previousY=scrollY;velocity=0;paint();request();
  }
  function paint(){
    if(media.matches)return;
    track.style.transform=`translate3d(${-clamp(position,0,3)*stage.clientWidth}px,0,0)`;
    rooms.forEach((room,i)=>room.style.setProperty('--room-drift',String(clamp(position-i,-1,1))));
    const next=Math.round(clamp(position,0,3));
    if(active!==next){active=next;rooms.forEach((room,i)=>{room.inert=i!==active;room.setAttribute('aria-hidden',String(i!==active));});buttons.forEach((b,i)=>{b.setAttribute('aria-current',i===active?'step':'false');});walk.dataset.activeRoom=rooms[active].id;document.dispatchEvent(new CustomEvent('portfolio:roomchange',{detail:{section:rooms[active]}}));}
    stage.style.setProperty('--walk-progress',String(clamp(position/3,0,1)));
  }
  function frame(now){
    raf=0;if(media.matches||!visible)return;
    followTarget();
    const dt=Math.min(.04,Math.max(.001,(now-last)/1000||.016));last=now;
    ({position,velocity}=advanceSpring(position,velocity,target,dt));
    if(Math.abs(position-target)<.00015&&Math.abs(velocity)<.001){position=target;velocity=0;paint();return;}
    paint();raf=requestAnimationFrame(frame);
  }
  function followTarget(){const next=readTarget();if(Math.abs(next-target)>.00001){position=clamp(position+(next-target)*(drag?.active ? .94 : .76),0,3);target=next;}}
  function request(){if(!raf&&!media.matches&&visible){last=performance.now();raf=requestAnimationFrame(frame);}}
  function goTo(id,instant=false){
    const index=rooms.findIndex(r=>r.id===id);if(index<0)return false;
    settled=index;clearTimeout(idleTimer);
    if(media.matches)rooms[index].scrollIntoView({behavior:'auto'});
    else if(instant){cancelGlide();scrollTo({top:start+step*index,behavior:'instant'});position=target=readTarget();velocity=0;paint();}
    else glideTo(start+step*index,clamp(230+Math.abs(index-position)*35,250,340));
    history.replaceState(null,'',`#${id}`);request();return true;
  }
  buttons.forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.room)));
  document.addEventListener('click',event=>{const anchor=event.target.closest('a[href^="#"]');if(!anchor)return;const id=anchor.getAttribute('href').slice(1);if(rooms.some(r=>r.id===id)){event.preventDefault();goTo(id);}});
  stage.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('video,input,textarea,dialog'))return;const direction=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(direction){event.preventDefault();goTo(rooms[clamp(active+direction,0,3)].id);}});
  function settle(){
    const raw=(scrollY-start)/step;
    if(media.matches||touching||drag||glide||raw<0||raw>3||!document.querySelector('#entrance').hidden||document.querySelector('dialog[open]')||!document.querySelector('#catalog').hidden)return;
    settled=landingRoom(raw,settled,direction);
    if(Math.abs(raw-settled)*step>2)glideTo(start+step*settled,clamp(160+Math.abs(raw-settled)*100,170,255));
  }
  addEventListener('scroll',()=>{if(Math.abs(scrollY-previousY)>1)direction=Math.sign(scrollY-previousY);previousY=scrollY;follow();clearTimeout(idleTimer);if(!glide&&!drag)idleTimer=setTimeout(settle,90);},{passive:true});addEventListener('resize',measure,{passive:true});
  addEventListener('wheel',()=>{cancelGlide();},{passive:true});
  addEventListener('touchstart',()=>{touching=true;cancelGlide();},{passive:true});
  const endTouch=()=>{touching=false;clearTimeout(idleTimer);idleTimer=setTimeout(settle,90);};
  addEventListener('touchend',endTouch,{passive:true});addEventListener('touchcancel',endTouch,{passive:true});
  addEventListener('keydown',event=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(event.key))cancelGlide();});
  stage.addEventListener('pointerdown',event=>{
    if(media.matches||event.pointerType!=='mouse'||event.button!==0||event.target.closest('button,a,input,video,summary')||!document.querySelector('#entrance').hidden)return;
    cancelGlide();drag={id:event.pointerId,x:event.clientX,y:event.clientY,scroll:scrollY,lastX:event.clientX,time:performance.now(),speed:0,active:false};
  });
  stage.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y,now=performance.now();
    if(!drag.active&&Math.abs(dx)>5&&Math.abs(dx)>Math.abs(dy)){drag.active=true;stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging');}
    if(!drag.active)return;event.preventDefault();
    const dt=Math.max(8,now-drag.time);drag.speed=drag.speed*.3+(event.clientX-drag.lastX)/dt*1000*.7;drag.lastX=event.clientX;drag.time=now;
    scrollTo({top:clamp(drag.scroll-dx/stage.clientWidth*step,start,start+3*step),behavior:'instant'});follow();
  });
  function endDrag(event){
    if(!drag||event.pointerId!==drag.id)return;
    const gesture=drag;drag=null;stage.classList.remove('is-dragging');
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
    if(!gesture.active)return;
    const raw=readTarget(),momentum=performance.now()-gesture.time<110?-gesture.speed/stage.clientWidth:0;
    direction=Math.abs(momentum)>.08?Math.sign(momentum):(Math.sign(raw-settled)||direction);settled=landingRoom(raw,settled,direction,momentum);
    glideTo(start+step*settled,220);
  }
  addEventListener('pointerup',endDrag);addEventListener('pointercancel',endDrag);
  addEventListener('blur',()=>{drag=null;stage.classList.remove('is-dragging');});
  addEventListener('hashchange',()=>{if(rooms.some(r=>r.id===location.hash.slice(1)))goTo(location.hash.slice(1),true);});
  media.addEventListener('change',()=>{active=-1;measure();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();},{rootMargin:'100px'}).observe(walk);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelGlide();drag=null;touching=false;stage.classList.remove('is-dragging');cancelAnimationFrame(raf);raf=0;}else request();});
  document.addEventListener('portfolio:entered',()=>{measure();if(rooms.some(r=>r.id===location.hash.slice(1)))goTo(location.hash.slice(1),true);});
  document.addEventListener('focusin',event=>{const room=event.target.closest('.table-page');if(room&&!media.matches&&room!==rooms[active])goTo(room.id,true);});
  measure();if(rooms.some(r=>r.id===location.hash.slice(1)))goTo(location.hash.slice(1),true);
  return {goTo};
}
