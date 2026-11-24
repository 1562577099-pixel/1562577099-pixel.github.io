const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));

// The reference intro runs from “top bottom” to “bottom top”: its panel
// travels from -100% to 0 during the first half, while the video goes .5→1→.5.
export function scrollState(top,height,viewportHeight){
  const progress=clamp((viewportHeight-top)/(height+viewportHeight));
  const scale=progress<.5?.5+progress:1.5-progress;
  const panelY=-height*(1-clamp(progress*2));
  return {progress,scale,panelY};
}

export function mountScrollMotion(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width: 760px)');
  const sections=[...document.querySelectorAll('.work-section')];
  const records=sections.map(section=>({section,panel:section.querySelector('.work-panel'),frame:section.querySelector('.film-frame')}));
  let scheduled=false;
  function render(){
    scheduled=false;
    const vh=window.innerHeight,disabled=reduced.matches;
    for(const record of records){
      const {section,panel,frame}=record,rect=section.getBoundingClientRect();
      const state=scrollState(rect.top,rect.height,vh);
      // Touch layouts keep their readable vertical flow and use a gentler zoom.
      const scale=disabled?1:mobile.matches?.84+.16*(1-Math.abs(state.progress*2-1)):state.scale;
      const panelY=disabled||mobile.matches?0:state.panelY;
      panel.style.transform=`translate3d(0,${panelY.toFixed(2)}px,0)`;
      frame.style.transform=`scale(${scale.toFixed(4)})`;
      section.dataset.scrollProgress=state.progress.toFixed(4);
      frame.dataset.videoScale=scale.toFixed(4);
    }
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(render);}}
  render();document.documentElement.classList.add('scroll-motion-ready');
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',schedule);mobile.addEventListener('change',schedule);
  const resize=new ResizeObserver(schedule);sections.forEach(section=>resize.observe(section));

  const copy=[...document.querySelectorAll('.work-section h2,.work-description,.work-category')];
  for(const element of copy){
    const text=element.textContent;
    if(element.matches('.work-category'))continue;
    element.setAttribute('aria-label',text);
    const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh',{granularity:'word'}):null;
    const words=segmenter?[...segmenter.segment(text)].map(s=>s.segment):text.split(/(\s+)/);
    element.replaceChildren();
    words.forEach((word,index)=>{
      if(!word.trim()){element.append(document.createTextNode(word));return;}
      const mask=document.createElement('span'),inner=document.createElement('span');
      mask.className='copy-mask';mask.setAttribute('aria-hidden','true');inner.className='copy-word';inner.textContent=word;
      inner.style.setProperty('--word-delay',`${Math.min(index*.022,.38)}s`);mask.append(inner);element.append(mask);
    });
    element.classList.add('motion-copy');
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.target.classList.toggle('copy-visible',entry.isIntersecting));
  },{threshold:.05,rootMargin:'0px 0px -5% 0px'});
  copy.forEach(element=>observer.observe(element));
  if(reduced.matches)copy.forEach(element=>element.classList.add('copy-visible'));
  return ()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);resize.disconnect();observer.disconnect();};
}
