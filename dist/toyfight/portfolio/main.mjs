import {mountCharacters} from './hero.mjs';
import {mountScrollMotion} from './scroll-motion.mjs?v=motion-1';
import {mountVideoTheater} from './video-theater.mjs?v=motion-1';
const stage=document.querySelector('#character-stage');
try{mountCharacters(stage);}catch(error){console.error('Character scene:',error);stage.innerHTML='<p class="scene-loading">3D 场景暂时不可用，请使用支持 WebGL 的浏览器。</p>';}
const videos=[...document.querySelectorAll('video')];
mountScrollMotion();mountVideoTheater(videos);
const videoVisibility=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)e.target.pause();}),{threshold:.05});videos.forEach(v=>videoVisibility.observe(v));
const terminal=document.querySelector('#terminal'),command=document.querySelector('#command'),menu=document.querySelector('#mobile-menu');
function openTerminal(){if(!terminal.open)terminal.showModal();command.focus();}
document.querySelector('.terminal-toggle').addEventListener('click',openTerminal);
document.querySelector('.mobile-menu-toggle').addEventListener('click',()=>menu.showModal());
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.close()));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();openTerminal();}});
document.querySelector('#command-form').addEventListener('submit',e=>{e.preventDefault();const value=command.value.trim().toLowerCase();command.value='';
  if(['bw','negative'].includes(value)){document.body.classList.toggle('effect-'+value);terminal.close();return;}
  if(value==='reset'){document.body.classList.remove('effect-bw','effect-negative');terminal.close();return;}
  terminal.close();if(value==='home')window.scrollTo({top:0,behavior:'smooth'});else if(value==='work')document.querySelector('#work').scrollIntoView({behavior:'smooth'});else if(['services','connect','store'].includes(value))(window.__portfolioNavigate||location.assign.bind(location))('/'+value);
});
for(const dialog of [terminal,menu])dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
