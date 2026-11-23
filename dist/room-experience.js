import {createSoundscape} from './soundscape.js?v=9';
import {createKeyEntrance} from './key-entrance.js?v=10';
import {enterSurface,leaveSurface,stopMotion} from './motion-core.js?v=9';
const $=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
export const sound=createSoundscape($('#sound-toggle'));
createKeyEntrance(sound);
const peek=$('#work-peek'),peekVideo=$('#peek-video'),peekImage=$('#peek-image');let active=null,activeButton=null,showTimer,hideTimer,touchMode=false,peekTicket=0;
export function hidePeek(immediate=false){clearTimeout(showTimer);clearTimeout(hideTimer);const ticket=++peekTicket;peekVideo.pause();active=null;touchMode=false;const finish=()=>{if(ticket!==peekTicket)return;peek.hidden=true;peek.classList.remove('visible','touch-peek');peekVideo.removeAttribute('src');peekVideo.load();};if(immediate||reduced||peek.hidden){stopMotion(peek);finish();}else leaveSurface(peek,'preview').then(done=>{if(done)finish();});}
document.addEventListener('portfolio:roomchange',()=>hidePeek(true));
function placePeek(button,event){if(touchMode)return;const r=button.getBoundingClientRect();const x=event?.clientX??r.right,y=event?.clientY??r.top;const pw=peek.offsetWidth||490,ph=peek.offsetHeight||500;let left=x+23;if(left+pw>innerWidth-15)left=x-pw-23;left=Math.max(12,Math.min(left,innerWidth-pw-12));const top=Math.max(12,Math.min(y-25,innerHeight-ph-12));peek.style.left=left+'px';peek.style.top=top+'px';}
export function setupExperience(works,showWork){
  const fine=()=>matchMedia('(hover:hover) and (pointer:fine)').matches&&innerWidth>650;
  const byId=new Map(works.map(w=>[w.id,w]));
  function showPeek(work,button,event,touch=false){clearTimeout(hideTimer);peekTicket++;stopMotion(peek);active=work;activeButton=button;touchMode=touch;peek.classList.toggle('touch-peek',touch);peek.dataset.frame=['film-01','film-08','film-04','film-05','brand','film-03'].includes(work.id)?'buttons':'cream';$('#peek-title').textContent=work.title;$('#peek-description').textContent=work.description;$('#peek-category').textContent=work.category;const seconds=Math.round(work.duration||0);$('#peek-duration').textContent=work.kind==='pdf'?`${work.pages} 页 · 品牌手册`:`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} · 视频作品`;
    peekImage.src=work.poster;peekImage.alt=work.title+'预览';peekVideo.hidden=work.kind!=='video'||reduced;if(work.kind==='video'&&!reduced){const url=new URL(`media/previews/${work.id}.mp4`,location.href).href;if(peekVideo.src!==url){peekVideo.src=url;peekVideo.load();}peekVideo.play().catch(()=>{});}else{peekVideo.pause();peekVideo.removeAttribute('src');}peek.hidden=false;peek.classList.add('visible');placePeek(button,event);enterSurface(peek,'preview');sound.hover(works.indexOf(work));if(touch)$('#peek-watch').focus({preventScroll:true});
  }
  document.querySelectorAll('.hotspot,.catalog-item').forEach(button=>{const work=byId.get(button.dataset.work);if(!work)return;button.setAttribute('aria-describedby','peek-description');
    button.addEventListener('pointerenter',event=>{if(!fine())return;clearTimeout(showTimer);showTimer=setTimeout(()=>showPeek(work,button,event),170);});button.addEventListener('pointerleave',()=>{clearTimeout(showTimer);if(!touchMode)hideTimer=setTimeout(hidePeek,110);});
    button.addEventListener('focus',()=>{if(fine()&&!touchMode)showPeek(work,button);});button.addEventListener('blur',()=>{if(!touchMode)hidePeek();});
    if(button.classList.contains('hotspot'))button.addEventListener('click',e=>{if(!fine()&&e.detail!==0){if(active?.id===work.id&&touchMode){hidePeek();showWork(work.id);}else showPeek(work,button,null,true);}else{hidePeek();showWork(work.id);}});
  });
  $('#peek-watch').addEventListener('click',()=>{const id=active?.id,target=activeButton;hidePeek();target?.focus({preventScroll:true});if(id)showWork(id);});$('#peek-close').addEventListener('click',()=>{const target=activeButton;hidePeek();target?.focus({preventScroll:true});});
  document.addEventListener('pointerdown',e=>{if(touchMode&&!e.target.closest('.work-peek,.hotspot'))hidePeek();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!peek.hidden){e.preventDefault();hidePeek();}});
  addEventListener('scroll',()=>{if(!touchMode)hidePeek();},{passive:true});
  addEventListener('resize',()=>hidePeek(true),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hidePeek(true);});
}
