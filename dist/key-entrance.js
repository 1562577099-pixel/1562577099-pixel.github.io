import {spring,fade,playFrames,reducedMotion,stopMotion} from './motion-core.js?v=9';

// One continuous gesture: the pointer's key settles into the lock and turns.
export function createKeyEntrance(sound){
  const $=s=>document.querySelector(s),entrance=$('#entrance'),main=$('#main-content'),header=$('.site-header');
  const lock=$('#door-lock'),key=$('#turning-key'),door=$('.entry-door'),music=$('#sound-toggle'),status=$('#entry-status');
  let entering=false,ticket=0,lastPoint=null;
  const hint=()=>matchMedia('(pointer:coarse)').matches?'轻触锁孔，打开小小世界。':'把钥匙移到锁孔，轻轻一转。';
  function cancel(){ticket++;[entrance,key,lock,...entrance.querySelectorAll('.door-wing')].forEach(stopMotion);key.hidden=true;entrance.classList.remove('unlocking','opening','leaving');entrance.querySelectorAll('.door-wing').forEach(w=>w.style.transform='');lock.disabled=false;entering=false;}
  function close(){cancel();entrance.hidden=true;document.body.append(music);main.inert=header.inert=false;document.body.style.overflow='';try{sessionStorage.setItem('yuxin-room-entered','1');}catch{}$('#portfolio-title').setAttribute('tabindex','-1');$('#portfolio-title').focus({preventScroll:true});document.dispatchEvent(new Event('portfolio:entered'));}
  function show(){cancel();entrance.hidden=false;entrance.append(music);main.inert=header.inert=true;document.body.style.overflow='hidden';status.textContent=hint();lock.focus({preventScroll:true});document.dispatchEvent(new Event('portfolio:intro'));}
  async function unlock(event){
    if(entering)return;entering=true;const generation=++ticket;lock.disabled=true;
    // Start audio synchronously in the user gesture, without delaying the visual.
    sound.startAutomatically();entrance.classList.add('unlocking');status.textContent='钥匙轻转，故事开启。';
    if(!reducedMotion()){
      const r=lock.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
      const pointer=event.detail>0&&lastPoint?lastPoint:{x:x-32,y:y+20};
      const dx=Math.max(-90,Math.min(90,pointer.x-x)),dy=Math.max(-65,Math.min(65,pointer.y-y));
      key.style.left=(x-9)+'px';key.style.top=(y-9)+'px';key.hidden=false;
      await spring(key,p=>({opacity:Math.min(1,p*2),transform:`translate3d(${dx*(1-p)}px,${dy*(1-p)}px,0) rotate(${-18*(1-p)}deg) scale(${.7+.3*p})`}),{stiffness:210,damping:24});
      if(generation!==ticket)return;
      sound.lock();
      await playFrames(key,[{transform:'rotate(0deg)',opacity:1},{transform:'rotate(94deg)',opacity:1,offset:.72},{transform:'rotate(88deg)',opacity:1}],{duration:600,easing:'cubic-bezier(.25,.8,.3,1)'});
      if(generation!==ticket)return;
      await fade(key,1,0,{duration:170,fromTransform:'rotate(88deg)',toTransform:'rotate(88deg) scale(.9)'});
    }
    if(generation!==ticket)return;key.hidden=true;entrance.classList.add('opening');sound.door();
    const doors=[...entrance.querySelectorAll('.door-wing')];
    await Promise.all(doors.map((wing,i)=>{const angle=i?108:-108;wing.style.transform=`rotateY(${angle}deg)`;return spring(wing,p=>({transform:`rotateY(${angle*p}deg)`}),{stiffness:70,damping:13});}));
    if(generation!==ticket)return;entrance.classList.add('leaving');
    if(await fade(entrance,1,0,{duration:420})&&generation===ticket)close();
  }
  lock.addEventListener('pointermove',e=>{lastPoint={x:e.clientX,y:e.clientY};});
  lock.addEventListener('pointerdown',e=>{lastPoint={x:e.clientX,y:e.clientY};});
  lock.addEventListener('click',unlock);
  const ready=()=>{if(!entering){door.classList.add('key-near');spring(lock,p=>({scale:String(1+.08*p)}),{stiffness:220,damping:18});}};
  const away=()=>{door.classList.remove('key-near');stopMotion(lock);};
  lock.addEventListener('pointerenter',ready);lock.addEventListener('focus',ready);lock.addEventListener('pointerleave',away);lock.addEventListener('blur',away);
  $('#entry-skip').addEventListener('click',()=>{sound.startAutomatically();close();});
  document.querySelectorAll('[data-replay-intro]').forEach(b=>b.addEventListener('click',show));
  entrance.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();close();return;}
    if(e.key==='Tab'){const nodes=[...entrance.querySelectorAll('button:not(:disabled)')].filter(n=>!n.hidden),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });
  addEventListener('resize',()=>{if(entering)close();},{passive:true});
  let entered=false;try{entered=sessionStorage.getItem('yuxin-room-entered')==='1';}catch{}
  if(entered){entrance.hidden=true;document.body.append(music);}else show();
}
