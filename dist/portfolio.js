import {sound,setupExperience,hidePeek} from './room-experience.js?v=9';
import {enterSurface,leaveSurface,fade,stopMotion} from './motion-core.js?v=9';
import './site-motion.js?v=9';
import {createRoomWalk} from './room-walk.js?v=9';
import {animateObjects} from './object-life.js?v=9';
const $=s=>document.querySelector(s);
const dialog=$('#work-dialog'),catalog=$('#catalog'),shade=$('#catalog-shade'),media=$('#media-container');
let works=[],current=0,returnFocus=null,catalogFocus=null,toastTimer,closingWork=false,catalogClosing=false,catalogMotion=0,workMotion=0;
const duration=s=>{const seconds=Math.round(s);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
function clearMedia(){const video=media.querySelector('video');if(video){video.pause();video.removeAttribute('src');video.load();}media.replaceChildren();media.className='';$('#media-status').textContent='';}
function showWork(id){
  const index=works.findIndex(w=>w.id===id);if(index<0)return;current=index;hidePeek(true);sound.duck(true);
  const opening=!dialog.open||closingWork;workMotion++;closingWork=false;dialog.classList.remove('is-closing');stopMotion(dialog);
  const work=works[index];if(!dialog.open){returnFocus=document.activeElement;if(!catalog.hidden)closeCatalog(false,true);dialog.showModal();}clearMedia();
  $('#work-category').textContent=work.category+' / SELECTED WORK';$('#work-title').textContent=work.title;$('#work-object').textContent='来自桌上的'+work.object;$('#work-meta').textContent=work.kind==='pdf'?`${work.pages} 页 · 品牌手册`:`${duration(work.duration)} · 影像作品`;
  $('#work-count').textContent=`${index+1} / ${works.length}`;$('#open-document').hidden=work.kind!=='pdf';
  $('#work-description').textContent=work.description||'';
  if(work.kind==='video'){
    const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=work.poster;video.src=work.src;video.setAttribute('aria-label',work.title);media.append(video);
    video.addEventListener('error',()=>{if(media.contains(video))$('#media-status').textContent='视频暂时无法播放，请稍后再试。';});video.play().catch(()=>{if(media.contains(video))$('#media-status').textContent='点击播放，开始观看。';});
  }else{
    media.className='pdf-pages';for(let page=1;page<=work.pages;page++){const img=new Image();img.src=`media/brand-${String(page).padStart(2,'0')}.jpg`;img.alt=`${work.title}，第 ${page} 页`;img.loading=page>1?'lazy':'eager';media.append(img);}$('#open-document').href=work.src;
  }
  dialog.scrollTop=0;media.scrollTop=0;document.body.style.overflow='hidden';
  if(opening)enterSurface(dialog);else fade(media,0,1,{duration:220,fromTransform:'translateY(5px)'});
}
dialog.addEventListener('close',()=>{clearMedia();sound.duck(false);document.body.style.overflow='';if(returnFocus?.isConnected&&!returnFocus.closest('[hidden]'))returnFocus.focus({preventScroll:true});else $('#catalog-toggle').focus({preventScroll:true});});
function closeWork(){if(!dialog.open||closingWork)return;closingWork=true;const ticket=++workMotion;dialog.classList.add('is-closing');media.querySelector('video')?.pause();leaveSurface(dialog).then(done=>{if(done&&ticket===workMotion){dialog.close();dialog.classList.remove('is-closing');closingWork=false;}});}
$('#close-work').addEventListener('click',closeWork);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeWork();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeWork();}});
$('#previous-work').addEventListener('click',()=>showWork(works[(current-1+works.length)%works.length].id));$('#next-work').addEventListener('click',()=>showWork(works[(current+1)%works.length].id));
function openCatalog(){if(!catalog.hidden&&!catalogClosing)return;catalogMotion++;catalogClosing=false;hidePeek(true);catalogFocus=document.activeElement;catalog.hidden=shade.hidden=false;document.body.style.overflow='hidden';$('#catalog-toggle').setAttribute('aria-expanded','true');$('#main-content').inert=true;$('.site-header').inert=true;$('#catalog-close').focus();enterSurface(catalog,'drawer');fade(shade,0,1,{duration:230});}
function closeCatalog(focus=true,immediate=false){if(catalog.hidden||(catalogClosing&&!immediate))return;catalogClosing=true;hidePeek(true);const ticket=++catalogMotion;const finish=()=>{if(ticket!==catalogMotion)return;catalog.hidden=shade.hidden=true;catalogClosing=false;if(!dialog.open)document.body.style.overflow='';$('#catalog-toggle').setAttribute('aria-expanded','false');$('#main-content').inert=false;$('.site-header').inert=false;if(focus)catalogFocus?.focus({preventScroll:true});};if(immediate){stopMotion(catalog);stopMotion(shade);finish();}else{fade(shade,1,0,{duration:210});leaveSurface(catalog,'drawer').then(done=>{if(done)finish();});}}
$('#catalog-toggle').addEventListener('click',openCatalog);$('#catalog-close').addEventListener('click',()=>closeCatalog());shade.addEventListener('click',()=>closeCatalog());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!catalog.hidden)closeCatalog();if(e.key==='Tab'&&!catalog.hidden){const nodes=[...catalog.querySelectorAll('button,a')];if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus();}}});
$('.skip-link').addEventListener('click',e=>{e.preventDefault();openCatalog();});
$('#copy-email').addEventListener('click',async()=>{const email='gongyuxin2027@163.com';try{await navigator.clipboard.writeText(email);toast('邮箱已复制，期待你的来信。');}catch{const input=document.createElement('textarea');input.value=email;document.body.append(input);input.select();const ok=document.execCommand('copy');input.remove();toast(ok?'邮箱已复制，期待你的来信。':'请长按邮箱地址复制。');}});
async function loadJson(url){const r=await fetch(url);if(!r.ok)throw new Error('无法加载 '+url);return r.json();}
async function init(){
  try{
    const [projectData,tables,details]=await Promise.all([loadJson('works.json'),loadJson('table-layout.json'),loadJson('work-details.json')]);works=projectData.map(w=>({...w,...details[w.id]}));
    for(const table of tables){const figure=document.querySelector(`[data-table="${table.table}"]`);for(const item of table.items){const work=works.find(w=>w.id===item.id);if(!work)throw new Error('作品入口缺少对应作品');work.object=item.object;
      const button=document.createElement('button');button.className='hotspot';button.dataset.work=item.id;button.style.left=item.x+'%';button.style.top=item.y+'%';button.style.width=item.w+'%';button.style.height=item.h+'%';button.setAttribute('aria-label',item.object+'：'+work.title);
      const label=document.createElement('span');label.className='object-label';label.textContent=work.title;const plus=document.createElement('span');plus.className='hotspot-plus';plus.textContent='+';plus.setAttribute('aria-hidden','true');button.append(label,plus);figure.querySelector('.hotspots').append(button);
    }}
    for(const work of works){const item=document.createElement('button');item.className='catalog-item';item.dataset.work=work.id;const img=new Image();img.src=work.poster;img.alt='';img.loading='lazy';const text=document.createElement('span');const cat=document.createElement('span');cat.className='catalog-category';cat.textContent=work.category;const title=document.createElement('strong');title.textContent=work.title;const desc=document.createElement('span');desc.className='catalog-description';desc.textContent=work.description;const small=document.createElement('small');small.textContent=`${work.object} · ${work.kind==='pdf'?work.pages+' 页':duration(work.duration)}`;text.append(cat,title,desc,small);item.append(img,text);item.addEventListener('click',()=>showWork(work.id));$('#catalog-items').append(item);}
    animateObjects();setupExperience(works,showWork);
  }catch(error){console.error(error);toast('作品加载失败，请刷新重试。');}
}
createRoomWalk();init();
