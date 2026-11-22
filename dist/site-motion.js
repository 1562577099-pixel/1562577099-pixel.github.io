import {spring,playFrames,reducedMotion,stopMotion} from './motion-core.js?v=9';
const seen=new WeakSet();let observer;
function reveal(section,force=false){
  if((seen.has(section)&&!force)||!document.querySelector('#entrance').hidden)return;seen.add(section);
  // The horizontal track already reveals these rooms continuously. Restarting
  // a staggered entrance halfway through the crossing made the join hesitate.
  if(section.classList.contains('table-page')&&section.id!=='portfolio')return;
  if(reducedMotion())return;
  let selectors=section.classList.contains('table-page')?['.page-heading','.table-scene','.room-window','.page-bottom']:section.id==='about'?['.portrait-frame','.profile-copy']:['.eyebrow','.contact-content','footer'];
  selectors.forEach((selector,index)=>{const target=section.querySelector(selector);if(!target)return;const distance=selector==='.table-scene'?24:16;
    spring(target,p=>({opacity:Math.min(1,Math.max(0,p*1.18)),transform:`translate3d(0,${distance*(1-p)}px,0)`}),{stiffness:145,damping:19,delay:index*75});
  });
}
export function revealEntrance(){
  document.querySelectorAll('.entry-copy,.entry-door').forEach((el,i)=>spring(el,p=>({opacity:Math.min(1,Math.max(0,p*1.3)),transform:`translate3d(0,${18*(1-p)}px,0)`}),{stiffness:160,damping:21,delay:i*85}));
}
function visibleRoom(){let closest=null,distance=Infinity;document.querySelectorAll('.table-page,.profile-page,#contact').forEach(s=>{const r=s.getBoundingClientRect();if(r.right>innerWidth*.5&&r.left<innerWidth*.5&&r.bottom>0&&r.top<innerHeight&&Math.abs(r.top)<distance){closest=s;distance=Math.abs(r.top);}});return closest;}
if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)reveal(e.target);}),{threshold:.15});document.querySelectorAll('.table-page,.profile-page,#contact').forEach(s=>observer.observe(s));}
document.addEventListener('portfolio:entered',()=>{const section=visibleRoom();if(section)reveal(section,true);});
document.addEventListener('portfolio:roomchange',event=>reveal(event.detail.section));
document.addEventListener('portfolio:intro',revealEntrance);
if(!document.querySelector('#entrance').hidden)revealEntrance();
// Independent scale leaves positioned hotspot transforms and native hit targets intact.
let pressed=null;const selector='button:not(:disabled),a[href]';
function release(){if(!pressed)return;const target=pressed;pressed=null;spring(target,p=>({scale:String(.965+.035*p)}),{stiffness:440,damping:25});}
document.addEventListener('pointerdown',e=>{if(e.button!==0||reducedMotion())return;const target=e.target.closest(selector);if(!target)return;pressed=target;playFrames(target,[{scale:'1'},{scale:'.965'}],{duration:75,easing:'ease-out'});});
document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);addEventListener('blur',release);
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat&&!reducedMotion()){const target=e.target.closest('button');if(target)spring(target,p=>({scale:String(.97+.03*p)}),{stiffness:440,damping:25});}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pressed=null;document.querySelectorAll('button,a').forEach(stopMotion);}});
