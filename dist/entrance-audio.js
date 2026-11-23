const clips={
  unlock:new URL('./assets/audio/key-unlock.wav',import.meta.url),
  open:new URL('./assets/audio/door-open.wav',import.meta.url)
};

export function createEntranceAudio(getContext,button){
  let enabled=true,context,buffers,generation=0;
  const voices=new Set();
  try{enabled=localStorage.getItem('yuxin-effects-muted')!=='1';}catch{}
  const files=Promise.all(Object.entries(clips).map(async([name,url])=>{
    try{const response=await fetch(url);if(!response.ok)return [name,null];return [name,await response.arrayBuffer()];}catch{return [name,null];}
  }));
  function render(){
    if(!button)return;
    button.setAttribute('aria-pressed',String(enabled));
    button.setAttribute('aria-label',enabled?'关闭开门音效':'开启开门音效');
    button.querySelector('span').textContent=enabled?'音效 开':'音效 关';
  }
  function decode(){
    return buffers??=files.then(entries=>Promise.all(entries.map(async([name,data])=>{
      try{return [name,data?await context.decodeAudioData(data.slice(0)):null];}catch{return [name,null];}
    }))).then(Object.fromEntries);
  }
  async function prepare(){
    if(!enabled)return false;
    try{context=getContext();const wake=context.resume();await Promise.all([wake,decode()]);return context.state==='running';}catch{return false;}
  }
  async function play(name){
    const ticket=generation;
    if(!await prepare()||!enabled||ticket!==generation)return false;
    const buffer=(await decode())[name];if(!buffer||ticket!==generation)return false;
    const source=context.createBufferSource(),gain=context.createGain();
    source.buffer=buffer;gain.gain.value=.38;source.connect(gain);gain.connect(context.destination);
    const voice={source,gain};voices.add(voice);
    source.onended=()=>{voices.delete(voice);source.disconnect();gain.disconnect();};
    source.start();return true;
  }
  function stop(){
    generation++;
    for(const voice of voices){voice.gain.gain.setTargetAtTime(0,context.currentTime,.012);voice.source.stop(context.currentTime+.045);}
    voices.clear();
  }
  function set(value){enabled=Boolean(value);if(!enabled)stop();try{localStorage.setItem('yuxin-effects-muted',enabled?'0':'1');}catch{}render();}
  button?.addEventListener('click',()=>{set(!enabled);if(enabled)prepare();});
  render();
  return {prepare,stop,set,lock:()=>play('unlock'),door:()=>play('open'),get enabled(){return enabled;}};
}
