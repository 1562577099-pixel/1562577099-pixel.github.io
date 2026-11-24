import * as T from '../vendor/three/three.module.js';
import {createTrio} from './characters.mjs';

export function mountCharacters(container) {
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.1,50);
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
  renderer.domElement.setAttribute('aria-label','三个低模角色，眼睛会跟随你的鼠标');renderer.domElement.setAttribute('role','img');
  container.append(renderer.domElement);
  scene.add(new T.HemisphereLight('#fff5df','#9b978e',2.6));
  const key=new T.DirectionalLight('#fff3df',3.5);key.position.set(-4,7,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.025;scene.add(key);
  const fill=new T.DirectionalLight('#dfe9ff',1.5);fill.position.set(5,3,2);scene.add(fill);
  const {root,rigs}=createTrio();root.position.y=-.80;scene.add(root);
  const shadow=new T.Mesh(new T.PlaneGeometry(15,8),new T.ShadowMaterial({opacity:.11}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.40;shadow.receiveShadow=true;scene.add(shadow);
  camera.position.set(0,.38,8);camera.lookAt(0,.55,0);
  const pointer=new T.Vector2(),target=new T.Vector2(),prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last=0,visible=true,raf=0;
  function resize(){const r=container.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=Math.max(8,7.2/(2*Math.tan(Math.PI/12)*camera.aspect));camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function move(event){const r=container.getBoundingClientRect();target.set(T.MathUtils.clamp((event.clientX-r.left)/r.width*2-1,-1.3,1.3),T.MathUtils.clamp(-((event.clientY-r.top)/r.height*2-1),-1.1,1.1));}
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('pointerleave',()=>target.set(0,0));
  const visibility=new IntersectionObserver(([e])=>{visible=e.isIntersecting;},{rootMargin:'100px'});visibility.observe(container);
  function animate(time){raf=requestAnimationFrame(animate);if(!visible||document.hidden||time-last<1000/45)return;last=time;pointer.lerp(target,.085);
    rigs.forEach((c,i)=>{
      c.head.rotation.y=T.MathUtils.clamp(pointer.x*.115-(i-1)*.015,-.18,.18);c.head.rotation.x=-pointer.y*.065;
      if(!prefersReduced)c.root.position.y=(i===1?.12:0)+Math.sin(time*.0008+i*1.7)*.025;
      c.eyes.forEach(eye=>{eye.position.x=pointer.x*.068-(i-1)*.009;eye.position.y=pointer.y*.038;});
    });
    renderer.domElement.dataset.gazeX=pointer.x.toFixed(3);renderer.domElement.dataset.gazeY=pointer.y.toFixed(3);
    renderer.render(scene,camera);
  }
  raf=requestAnimationFrame(animate);container.classList.add('scene-ready');
  return ()=>{cancelAnimationFrame(raf);observer.disconnect();visibility.disconnect();window.removeEventListener('pointermove',move);renderer.dispose();};
}
