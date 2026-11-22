// Small SVG motion layers sit over the existing illustration; original bitmaps stay intact.
const wrap=(id,content)=>`<g class="object-effect" data-effect="${id}">${content}</g>`;
const drawings={
mint:`<defs><clipPath id="globe-sea"><circle cx="1004" cy="330" r="71"/></clipPath><radialGradient id="flash-light"><stop stop-color="#fffde4" stop-opacity=".98"/><stop offset="1" stop-color="#fffde4" stop-opacity="0"/></radialGradient></defs>`+
wrap('film-10',`<circle class="camera-halo" cx="526" cy="350" r="105" fill="url(#flash-light)"/><path class="camera-flash" d="M520 292l11 43 42 7-42 9-11 43-9-43-42-9 42-7Z" fill="#fffde3"/><circle class="lens-glint" cx="574" cy="421" r="25" fill="#fffce4"/>`)+
wrap('film-11',`<g class="flower-light" fill="none" stroke="#e2ce77" stroke-width="3" stroke-linecap="round"><path d="M714 196l-15-4m28-30-8-14m97 47 16-5m-30-29 7-14"/></g><circle class="pollen pollen-one" cx="766" cy="182" r="4" fill="#fff0a1"/><circle class="pollen pollen-two" cx="794" cy="207" r="3" fill="#fff6b5"/><path class="stem-breeze" d="M746 230q-20 21-9 43m65-37q17 22 6 38" fill="none" stroke="#819e7799" stroke-width="2"/>`)+
wrap('film-02',`<circle cx="1004" cy="330" r="71" fill="#beddef" stroke="#98a78d" stroke-width="2"/><g clip-path="url(#globe-sea)"><g class="globe-land" fill="#c6e7b1" stroke="#98ad87" stroke-width="2"><path d="M934 265l35-12 16 17-8 17 25 12 9 22-13 13-30 2-14 19-14-11-13-32Z M1040 334l28-10 15 12-6 27-20 18-5 31-28-6-11-24 14-14-8-18Z"/><path transform="translate(160)" d="M934 265l35-12 16 17-8 17 25 12 9 22-13 13-30 2-14 19-14-11-13-32Z M1040 334l28-10 15 12-6 27-20 18-5 31-28-6-11-24 14-14-8-18Z"/></g><ellipse cx="1004" cy="330" rx="31" ry="70" fill="none" stroke="#f7ffe2" stroke-opacity=".25"/><path d="M934 331h140" stroke="#f7ffe2" stroke-opacity=".25"/></g>`),
lemon:
wrap('film-01',`<g class="vessel-shine" fill="none" stroke="#fffde4" stroke-linecap="round"><path d="M555 202v160" stroke-width="7"/><path d="M563 202v145" stroke-width="2"/></g><g class="vessel-bubbles" fill="none" stroke="#b1bd95" stroke-width="2"><circle cx="574" cy="72" r="6"/><circle cx="604" cy="49" r="4"/><circle cx="591" cy="30" r="3"/></g>`)+
wrap('film-08',`<g class="jug-steam" fill="none" stroke="#a8ba8e" stroke-width="3" stroke-linecap="round"><path d="M726 192c-13-18 13-25 0-45"/><path d="M751 188c-13-18 13-25 0-45"/></g><g class="jug-droplet" fill="#b8d7df" stroke="#94afb3" stroke-width="1.5"><path d="M699 234q-12 18 0 19q12-1 0-19Z"/></g>`)+
wrap('film-04',`<g class="plant-glimmer" fill="#e8d48c"><path d="M1012 108l4 11 12 4-12 4-4 12-4-12-11-4 11-4Z"/><path d="M1098 234l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/></g><g class="plant-breeze" fill="none" stroke="#a2b39a" stroke-width="2" stroke-linecap="round"><path d="M1055 175q21-24 24-42m13 64q26-12 32-28"/></g>`),
rose:`<defs><clipPath id="record-ellipse"><ellipse cx="640" cy="351" rx="253" ry="70"/></clipPath></defs>`+
wrap('film-06',`<ellipse cx="640" cy="351" rx="258" ry="72" fill="#eac8de"/><g clip-path="url(#record-ellipse)"><g transform="translate(640 351) scale(1 .277)"><g class="record-spin"><path d="M-233 0c0-120 465-120 465 0s-390 110-390 0 315-91 315 0-242 76-242 0 170-55 170 0-98 32-98 0 42-12 42 0" fill="none" stroke="#f3ed81" stroke-width="16" stroke-linecap="round"/><path d="M-233 0c0-120 465-120 465 0s-390 110-390 0 315-91 315 0-242 76-242 0 170-55 170 0-98 32-98 0 42-12 42 0" fill="none" stroke="#bdba7e" stroke-width="1.8"/></g></g></g>`)+
wrap('film-07',`<g class="headphone-wave wave-one" fill="none" stroke="#9eae8d" stroke-width="3" stroke-linecap="round"><path d="M976 305q-18 20-3 45m189-35q18 20 3 45"/></g><g class="headphone-wave wave-two" fill="none" stroke="#acb99a" stroke-width="2" stroke-linecap="round"><path d="M957 302q-23 24-4 54m227-44q24 27 5 55"/></g>`)+
wrap('film-09',`<g class="mouse-whiskers" fill="none" stroke="#9eaa8c" stroke-width="2" stroke-linecap="round"><path d="M1015 861l-42-10m43 18-47 2m49 6-36 16"/></g><g class="mouse-step" fill="none" stroke="#a8b78e" stroke-width="2.5" stroke-linecap="round"><path d="M1183 910l10-2m-2 18 10 2"/></g>`),
lavender:
wrap('film-05',`<g class="book-page" transform="translate(485 465)"><path d="M0 0q58-42 121-31v-10q-60-17-121 41Z" fill="#fffde8" stroke="#a7ac8f" stroke-width="2"/></g><g class="book-windows" fill="#fff9a1"><path d="M447 386h17v17h-17Z M505 409h12v12h-12Z"/></g><path class="book-spark" d="M559 344l4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" fill="#e7d184"/>`)+
wrap('brand',`<g class="card-hello"><rect x="671" y="187" width="181" height="64" fill="#fbf8df"/><text x="761" y="231" text-anchor="middle" fill="#76876b" font-family="Fell,serif" font-size="38" font-style="italic">hello.</text></g><g class="card-wave" fill="none" stroke="#a8b699" stroke-width="2.5" stroke-linecap="round"><path d="M865 194q16 12 0 24m13-30q24 20 0 39"/></g>`)+
wrap('film-03',`<path class="projector-beam" d="M969 410L775 337V492L969 427Z" fill="#fff5ba"/><g transform="translate(1016 341)"><circle r="35" fill="#cae8b9" stroke="#a0af8b" stroke-width="2"/><g class="reel-spin" fill="#8fa58b"><path d="M-8-25l14 2 2 12-10 3Z M24-7l-2 14-12 2-3-10Z M7 25l-14-2-2-12 10-3Z M-25 7l2-14 12-2 3 10Z"/></g></g><g transform="translate(1088 352)"><circle r="27" fill="#cae8b9" stroke="#a0af8b" stroke-width="2"/><g class="reel-spin" fill="#8fa58b"><path d="M-6-19l11 2 1 9-8 2Z M19-5l-2 11-9 1-2-8Z M5 19l-11-2-1-9 8-2Z M-19 5l2-11 9-1 2 8Z"/></g></g>`)
};
export function animateObjects(){
  const timers=new Map();
  for(const [name,content]of Object.entries(drawings)){
    const figure=document.querySelector(`[data-table="${name}"]`);if(!figure)continue;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1536 1024');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','object-life');svg.innerHTML=content;figure.append(svg);
    figure.querySelectorAll('.hotspot').forEach(button=>{
      const effect=svg.querySelector(`[data-effect="${button.dataset.work}"]`);if(!effect)return;
      const start=()=>{if(effect.dataset.held==='1')return;clearTimeout(timers.get(effect));effect.classList.add('is-playing');};
      const stop=()=>{if(effect.dataset.held==='1')return;clearTimeout(timers.get(effect));effect.classList.remove('is-playing');};
      button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')start();});button.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')stop();});
      button.addEventListener('focus',start);button.addEventListener('blur',stop);
      button.addEventListener('click',()=>{clearTimeout(timers.get(effect));start();effect.dataset.held='1';timers.set(effect,setTimeout(()=>{delete effect.dataset.held;stop();},2800));});
    });
  }
  const stopAll=()=>document.querySelectorAll('.object-effect.is-playing').forEach(e=>{clearTimeout(timers.get(e));delete e.dataset.held;e.classList.remove('is-playing');});
  document.addEventListener('portfolio:roomchange',stopAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
}
