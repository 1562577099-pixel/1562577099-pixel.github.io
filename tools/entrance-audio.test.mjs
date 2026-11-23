import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createEntranceAudio} from '../dist/entrance-audio.js';

for(const name of ['key-unlock','door-open']){
  const wav=readFileSync(`dist/assets/audio/${name}.wav`);
  assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
  assert.equal(wav.readUInt16LE(22),1);assert.equal(wav.readUInt32LE(24),44100);assert.equal(wav.readUInt16LE(34),16);
  const length=(wav.length-44)/2,samples=Array.from({length},(_,i)=>wav.readInt16LE(44+i*2)/32768);
  const peak=Math.max(...samples.slice(0,44100));
  const fullPeak=samples.reduce((max,s)=>Math.max(max,Math.abs(s)),0);
  const rms=Math.sqrt(samples.reduce((sum,s)=>sum+s*s,0)/length);
  assert.ok(length/44100>.5&&length/44100<2.5,'Effects should be short, complete cues');
  assert.ok(fullPeak>.5&&fullPeak<.8,'Effects must have headroom and an audible level');
  assert.ok(rms>.03&&rms<.25);assert.ok(peak>0);
  assert.equal(samples[0],0);assert.equal(samples.at(-1),0);
}

const originalFetch=globalThis.fetch,originalStorage=globalThis.localStorage;
const storage=new Map([['yuxin-music-muted','1']]);
globalThis.localStorage={getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)};
globalThis.fetch=async url=>{const data=readFileSync(fileURLToPath(url));return {ok:true,arrayBuffer:async()=>data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)};};
const sources=[],attributes={},handlers={};let decoded=0;
const button={setAttribute:(key,value)=>attributes[key]=value,querySelector:()=>({set textContent(value){attributes.text=value;}}),addEventListener:(name,handler)=>handlers[name]=handler};
const context={state:'running',currentTime:1,destination:{},resume:async()=>{},decodeAudioData:async data=>{decoded++;return {data};},createBufferSource:()=>{const source={connect(){},disconnect(){},start(){sources.push(this);},stop(){this.stopped=true;this.onended?.();}};return source;},createGain:()=>({gain:{value:0,setTargetAtTime(){}},connect(){},disconnect(){}})};
try{
  const player=createEntranceAudio(()=>context,button);
  assert.equal(player.enabled,true,'Muting music must not disable entrance effects');
  assert.equal(await player.prepare(),true);assert.equal(sources.length,0,'Priming audio must be silent');
  assert.equal(await player.lock(),true);assert.equal(sources.length,1);
  handlers.click();assert.equal(player.enabled,false);assert.equal(sources[0].stopped,true);
  assert.equal(await player.door(),false);assert.equal(sources.length,1);
  assert.equal(attributes['aria-pressed'],'false');assert.equal(storage.get('yuxin-music-muted'),'1');
  handlers.click();assert.equal(await player.door(),true);assert.equal(sources.length,2);
  assert.equal(decoded,2,'Replay must reuse decoded audio');
  const pending=player.lock();player.stop();assert.equal(await pending,false,'Skipping must cancel queued playback');
  assert.equal(sources.length,2);assert.equal(sources[1].stopped,true);
  const unavailable=createEntranceAudio(()=>{throw new Error('Audio unavailable');},null);
  assert.equal(await unavailable.lock(),false,'Audio failure must not block entering the portfolio');
}finally{globalThis.fetch=originalFetch;globalThis.localStorage=originalStorage;}
console.log('Verified entrance audio headroom, independent muting, silent preload, replay and cancellation.');
