import {spring,springSamples,stopMotion,reducedMotion} from './motion-core.js?v=9';

export const windowDesigns=[
  {id:'mint-window',room:'portfolio',name:'薄荷绿木窗',width:1147,height:1371,pane:{left:.275,right:.727,top:.425,bottom:.92,rise:0}},
  {id:'blue-window',room:'form',name:'蓝色雕花木窗',width:1024,height:1536,pane:{left:.252,right:.75,top:.27,bottom:.817,rise:.02}},
  {id:'aqua-window',room:'motion',name:'青白雕花木窗',width:1254,height:1254,pane:{left:.289,right:.711,top:.48,bottom:.918,rise:0}},
  {id:'sage-window',room:'paper',name:'鼠尾草绿雕花木窗',width:1041,height:1510,pane:{left:.255,right:.736,top:.272,bottom:.78,rise:0}}
];
const physics={stiffness:195,damping:23,maxDuration:1.4},curve=springSamples(physics),angle=78;
const svgNamespace='http://www.w3.org/2000/svg';
const round=value=>Number(value.toFixed(6));

export function windowPaths({left:l,right:r,top:t,bottom:b,rise=0}){
  if(!(0<l&&l<r&&r<1&&0<t-rise&&t<b&&b<1&&rise>=0))throw new RangeError('Invalid window opening');
  const m=round((l+r)/2),peak=round(t-rise);
  return {
    opening:`M${l} ${t}Q${m} ${round(t-rise*2)} ${r} ${t}V${b}H${l}Z`,
    left:`M${l} ${t}Q${round((l+m)/2)} ${peak} ${m} ${peak}V${b}H${l}Z`,
    right:`M${m} ${peak}Q${round((m+r)/2)} ${peak} ${r} ${t}V${b}H${m}Z`
  };
}

export function windowMotionValue(motion,now){
  const elapsed=Math.max(0,now-motion.started),index=Math.min(1,elapsed/curve.duration)*(curve.values.length-1);
  const low=Math.floor(index),high=Math.min(curve.values.length-1,low+1);
  const value=curve.values[low]+(curve.values[high]-curve.values[low])*(index-low);
  return motion.from+(motion.to-motion.from)*value;
}

function image(src){const node=document.createElement('img');node.src=src;node.alt='';node.draggable=false;node.decoding='async';return node;}
function svgNode(name,attributes={}){const node=document.createElementNS(svgNamespace,name);for(const [key,value]of Object.entries(attributes))node.setAttribute(key,value);return node;}

export function setupRoomWindows(){
  const states=[];
  for(const design of windowDesigns){
    const button=document.querySelector(`[data-window="${design.id}"]`);if(!button)continue;
    const paths=windowPaths(design.pane),src=`assets/windows/${design.id}.png`;
    button.style.setProperty('--window-ratio',String(design.width/design.height));
    const visual=document.createElement('span');visual.className='window-visual';visual.setAttribute('aria-hidden','true');
    const masks=svgNode('svg',{class:'window-masks',width:0,height:0}),defs=svgNode('defs');
    for(const [name,path]of Object.entries({...paths,surround:`M0 0H1V1H0Z ${paths.opening}`})){
      const clip=svgNode('clipPath',{id:`${design.id}-${name}`,clipPathUnits:'objectBoundingBox'});
      clip.append(svgNode('path',{d:path,'clip-rule':'evenodd','fill-rule':'evenodd'}));defs.append(clip);
    }
    masks.append(defs);visual.append(masks);
    const sky=document.createElement('span');sky.className='window-sky';sky.style.clipPath=`url(#${design.id}-opening)`;visual.append(sky);
    const frame=image(src);frame.className='window-frame';frame.style.clipPath=`url(#${design.id}-surround)`;visual.append(frame);
    const leaves=['left','right'].map((side,index)=>{
      const leaf=document.createElement('span');leaf.className=`window-casement window-${side}`;
      leaf.style.clipPath=`url(#${design.id}-${side})`;
      leaf.style.transformOrigin=`${(index?design.pane.right:design.pane.left)*100}% ${(design.pane.top+design.pane.bottom)*50}%`;
      leaf.append(image(src));visual.append(leaf);return leaf;
    });
    button.replaceChildren(visual);
    const state={button,design,leaves,open:false,progress:0,motion:null,ticket:0};states.push(state);
    const paint=value=>leaves.forEach((leaf,index)=>leaf.style.transform=`rotateY(${(index?1:-1)*angle*value}deg)`);
    state.settle=()=>{state.ticket++;leaves.forEach(stopMotion);state.motion=null;state.progress=Number(state.open);paint(state.progress);button.classList.remove('is-moving');};
    button.addEventListener('click',()=>{
      const now=performance.now(),from=state.motion?windowMotionValue(state.motion,now):state.progress;
      const ticket=++state.ticket;state.open=!state.open;const to=Number(state.open);leaves.forEach(stopMotion);
      button.setAttribute('aria-expanded',String(state.open));button.setAttribute('aria-label',`${state.open?'关闭':'打开'}${design.name}`);
      button.classList.toggle('is-open',state.open);paint(to);
      if(reducedMotion()||Math.abs(from-to)<.0001){state.progress=to;state.motion=null;button.classList.remove('is-moving');return;}
      state.motion={from,to,started:now};button.classList.add('is-moving');
      Promise.all(leaves.map((leaf,index)=>spring(leaf,p=>({transform:`rotateY(${(index?1:-1)*angle*(from+(to-from)*p)}deg)`}),physics))).then(()=>{
        if(ticket!==state.ticket)return;state.progress=to;state.motion=null;button.classList.remove('is-moving');
      });
    });
  }
  document.addEventListener('portfolio:roomchange',event=>states.forEach(state=>{if(state.design.room!==event.detail.section.id&&state.motion)state.settle();}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)states.forEach(state=>state.settle());});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>states.forEach(state=>state.settle()));
}
