import {reducedMotion} from './motion-core.js?v=9';

export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export function advanceSpring(position,velocity,target,dt){
  const steps=Math.max(1,Math.ceil(dt/.008)),h=dt/steps;
  for(let n=0;n<steps;n++){velocity+=((target-position)*185-velocity*25)*h;position+=velocity*h;}
  return {position,velocity};
}

export function createRoomWalk(){
  const walk=document.querySelector('.room-walk'),stage=walk.querySelector('.room-stage'),track=walk.querySelector('.room-track');
  const rooms=[...track.querySelectorAll('.table-page')],buttons=[...walk.querySelectorAll('[data-room]')];
  let start=0,step=1,position=0,velocity=0,target=0,raf=0,last=0,active=-1,visible=true,idleTimer,settled=0,previousY=scrollY,direction=1;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  function measure(){
    const oldStep=step,wasInside=scrollY>=start&&scrollY<=start+oldStep*3;
    start=walk.getBoundingClientRect().top+scrollY;step=Math.max(innerHeight*.94,420);
    walk.style.setProperty('--walk-distance',`${step*3}px`);
    if(media.matches){track.style.transform='';rooms.forEach(r=>{r.inert=false;r.removeAttribute('aria-hidden');r.style.setProperty('--room-drift','0');});return;}
    if(wasInside&&Math.abs(oldStep-step)>50&&oldStep>1)scrollTo({top:start+clamp(position,0,3)*step,behavior:'instant'});
    position=target=clamp((scrollY-start)/step,0,3);settled=Math.round(target);velocity=0;paint();request();
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
    target=clamp((scrollY-start)/step,0,3);if(Math.abs(target-Math.round(target))<.003)target=Math.round(target);
    const dt=Math.min(.04,Math.max(.001,(now-last)/1000||.016));last=now;
    ({position,velocity}=advanceSpring(position,velocity,target,dt));
    if(Math.abs(position-target)<.00015&&Math.abs(velocity)<.001){position=target;velocity=0;paint();return;}
    paint();raf=requestAnimationFrame(frame);
  }
  function request(){if(!raf&&!media.matches&&visible){last=performance.now();raf=requestAnimationFrame(frame);}}
  function goTo(id,instant=false){
    const index=rooms.findIndex(r=>r.id===id);if(index<0)return false;
    settled=index;clearTimeout(idleTimer);
    if(media.matches)rooms[index].scrollIntoView({behavior:'auto'});
    else scrollTo({top:start+step*index,behavior:instant?'instant':'smooth'});
    history.replaceState(null,'',`#${id}`);request();return true;
  }
  buttons.forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.room)));
  document.addEventListener('click',event=>{const anchor=event.target.closest('a[href^="#"]');if(!anchor)return;const id=anchor.getAttribute('href').slice(1);if(rooms.some(r=>r.id===id)){event.preventDefault();goTo(id);}});
  stage.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('video,input,textarea,dialog'))return;const direction=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(direction){event.preventDefault();goTo(rooms[clamp(active+direction,0,3)].id);}});
  function settle(){
    const raw=(scrollY-start)/step;
    if(media.matches||raw<0||raw>3||!document.querySelector('#entrance').hidden||document.querySelector('dialog[open]')||!document.querySelector('#catalog').hidden)return;
    const distance=Math.abs(raw-settled);let index=Math.round(raw);if(distance>.08&&distance<.5)index=settled+direction;
    index=clamp(index,0,3);settled=index;
    if(Math.abs(raw-index)*step>3)scrollTo({top:start+step*index,behavior:'smooth'});
  }
  addEventListener('scroll',()=>{if(Math.abs(scrollY-previousY)>1)direction=Math.sign(scrollY-previousY);previousY=scrollY;request();clearTimeout(idleTimer);idleTimer=setTimeout(settle,210);},{passive:true});addEventListener('resize',measure,{passive:true});
  addEventListener('hashchange',()=>{if(rooms.some(r=>r.id===location.hash.slice(1)))goTo(location.hash.slice(1),true);});
  media.addEventListener('change',()=>{active=-1;measure();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();},{rootMargin:'100px'}).observe(walk);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else request();});
  document.addEventListener('portfolio:entered',()=>{measure();if(rooms.some(r=>r.id===location.hash.slice(1)))goTo(location.hash.slice(1),true);});
  document.addEventListener('focusin',event=>{const room=event.target.closest('.table-page');if(room&&!media.matches&&room!==rooms[active])goTo(room.id,true);});
  measure();if(rooms.some(r=>r.id===location.hash.slice(1)))goTo(location.hash.slice(1),true);
  return {goTo};
}
