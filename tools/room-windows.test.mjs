import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setupRoomWindows,windowDesigns,windowPaths,windowMotionValue} from '../dist/room-windows.js';

for(const design of windowDesigns){
  const image=readFileSync(`dist/assets/windows/${design.id}.png`);
  assert.equal(image.readUInt32BE(16),design.width);assert.equal(image.readUInt32BE(20),design.height);
  assert.equal(image[25],6,'Window cutouts must retain their alpha channel');
  for(const path of Object.values(windowPaths(design.pane)))assert.ok(!path.includes('NaN'));
}
assert.throws(()=>windowPaths({left:.8,right:.2,top:.2,bottom:.8}),RangeError);
const opening={from:.2,to:1,started:100};
assert.equal(windowMotionValue(opening,100),.2);
assert.equal(windowMotionValue(opening,10000),1);
assert.ok(windowMotionValue(opening,200)>.2&&windowMotionValue(opening,200)<1);

const originalDocument=globalThis.document,originalMedia=globalThis.matchMedia,originalPerformance=globalThis.performance;
const animations=[],listeners=new Map();let clock=100,reduced=false;
class Node{
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.events={};this.classes=new Set();this.style={setProperty:(key,value)=>this.style[key]=value};this.classList={add:key=>this.classes.add(key),remove:key=>this.classes.delete(key),toggle:(key,value)=>value?this.classes.add(key):this.classes.delete(key)};}
  setAttribute(key,value){this.attributes[key]=String(value);}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  addEventListener(name,listener){this.events[name]=listener;}
  animate(frames,options){
    let resolve,reject;const finished=new Promise((a,b)=>{resolve=a;reject=b;});
    const animation={node:this,frames,options,finished,cancelled:false,cancel(){this.cancelled=true;reject(new Error('cancelled'));},finish:resolve};animations.push(animation);return animation;
  }
}
const buttons=new Map(windowDesigns.map(design=>[design.id,new Node('button')]));
globalThis.document={querySelector:selector=>buttons.get(selector.match(/data-window="([^"]+)"/)[1]),createElement:tag=>new Node(tag),createElementNS:(_,tag)=>new Node(tag),addEventListener:(name,listener)=>listeners.set(name,listener),hidden:false};
globalThis.matchMedia=()=>({matches:reduced,addEventListener(){}});
globalThis.performance={now:()=>clock};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
try{
  setupRoomWindows();
  for(const button of buttons.values()){
    button.events.click();assert.equal(button.attributes['aria-expanded'],'true');
    const current=animations.slice(-2);
    assert.equal(current[0].frames[0].transform,'rotateY(0deg)');
    assert.equal(current[0].frames.at(-1).transform,'rotateY(-78deg)');
    assert.equal(current[1].frames.at(-1).transform,'rotateY(78deg)');
    current.forEach(animation=>animation.finish());await flush();assert.equal(button.classes.has('is-moving'),false);
  }
  const first=buttons.get('mint-window');clock+=10;first.events.click();
  const closing=animations.slice(-2);clock+=120;first.events.click();
  const reversed=animations.slice(-2);
  assert.ok(closing.every(animation=>animation.cancelled),'Reversal must cancel the old hinge motion');
  const startingAngle=Number(reversed[0].frames[0].transform.match(/rotateY\(([-.\d]+)deg\)/)[1]);
  assert.ok(startingAngle<0&&startingAngle>-78,'Reversal must continue from the current angle');
  assert.equal(first.attributes['aria-expanded'],'true');
  document.hidden=true;listeners.get('visibilitychange')();await flush();
  assert.ok(reversed.every(animation=>animation.cancelled));
  const leaves=first.children[0].children.filter(node=>node.className?.includes('window-casement'));
  assert.equal(leaves[0].style.transform,'rotateY(-78deg)');
  reduced=true;const before=animations.length;first.events.click();await flush();
  assert.equal(animations.length,before);assert.equal(first.attributes['aria-expanded'],'false');assert.equal(leaves[0].style.transform,'rotateY(0deg)');
}finally{globalThis.document=originalDocument;globalThis.matchMedia=originalMedia;globalThis.performance=originalPerformance;}
console.log('Verified four transparent window assets, outward hinge directions, rapid reversal and reduced motion.');
