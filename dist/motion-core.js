// Damped oscillator sampled for native, compositor-driven Web Animations.
export function springSamples({stiffness=170,damping=20,mass=1,velocity=0,maxDuration=2.2}={}){
  if(stiffness<=0||damping<=0||mass<=0)throw new RangeError('Spring parameters must be positive.');
  const w=Math.sqrt(stiffness/mass),z=damping/(2*Math.sqrt(stiffness*mass));
  function at(t){
    if(z<1){const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+(z*w-velocity)/wd*Math.sin(wd*t));}
    if(Math.abs(z-1)<1e-5)return 1-Math.exp(-w*t)*(1+(w-velocity)*t);
    const r1=-w*(z-Math.sqrt(z*z-1)),r2=-w*(z+Math.sqrt(z*z-1)),a=(-velocity-r2)/(r1-r2);
    return 1-a*Math.exp(r1*t)-(1-a)*Math.exp(r2*t);
  }
  const values=[0];let stable=0,last=0;
  for(let i=1;i<=Math.ceil(maxDuration*120);i++){const value=at(i/120),speed=(value-last)*120;values.push(value);last=value;stable=Math.abs(1-value)<.0015&&Math.abs(speed)<.015?stable+1:0;if(stable>=8)break;}
  values[values.length-1]=1;return {values,duration:(values.length-1)/120*1000};
}
export const reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
const running=new WeakMap();
export function stopMotion(element){const animation=running.get(element);if(animation){running.delete(element);animation.cancel();}}
export function playFrames(element,keyframes,options={}){
  if(!element)return Promise.resolve(true);stopMotion(element);
  if(reducedMotion()||!element.animate)return Promise.resolve(true);
  const animation=element.animate(keyframes,{fill:'both',...options});running.set(element,animation);
  return animation.finished.then(()=>{if(running.get(element)!==animation)return false;running.delete(element);animation.cancel();return true;},()=>false);
}
export function spring(element,frame,{delay=0,...physics}={}){
  const curve=springSamples(physics);return playFrames(element,curve.values.map((v,i)=>({...frame(v),offset:i/(curve.values.length-1)})),{duration:curve.duration,delay,easing:'linear'});
}
export function fade(element,from=0,to=1,{duration=180,delay=0,fromTransform='none',toTransform='none'}={}){
  return playFrames(element,[{opacity:from,transform:fromTransform},{opacity:to,transform:toTransform}],{duration,delay,easing:'cubic-bezier(.2,.65,.3,1)'});
}
export function enterSurface(element,kind='panel'){
  const x=kind==='drawer'?64:0,y=kind==='drawer'?0:kind==='preview'?11:25,scale=kind==='drawer'?1:.975;
  return spring(element,p=>({opacity:Math.min(1,Math.max(0,p*1.3)),transform:`translate3d(${x*(1-p)}px,${y*(1-p)}px,0) scale(${scale+(1-scale)*p})`}),{stiffness:230,damping:25});
}
export function leaveSurface(element,kind='panel'){
  return fade(element,Number.parseFloat(getComputedStyle(element).opacity)||1,0,{duration:kind==='drawer'?210:165,toTransform:kind==='drawer'?'translate3d(35px,0,0)':'translate3d(0,9px,0) scale(.985)'});
}
