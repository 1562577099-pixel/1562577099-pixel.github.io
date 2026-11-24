import * as T from '../vendor/three/three.module.js';

const materials = new Map();
function mat(color, roughness=.86) {
  const key=color+':'+roughness;
  if(!materials.has(key)) materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness:0,flatShading:true}));
  return materials.get(key);
}
function mesh(parent,geometry,color,position=[0,0,0],scale=[1,1,1],name='') {
  const m=new T.Mesh(geometry,typeof color==='string'?mat(color):color);
  m.position.set(...position);m.scale.set(...scale);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function ellipsoid(parent,color,position,scale,detail=2,name='') {
  return mesh(parent,new T.IcosahedronGeometry(1,detail),color,position,scale,name);
}
function tube(parent,points,color,radius=.025,segments=12,name='') {
  return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,radius,5,false),color,[0,0,0],[1,1,1],name);
}
function polygon(parent,points,color,z,depth=.09,name='') {
  const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  return mesh(parent,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:1,curveSegments:2}),color,[0,0,z],[1,1,1],name);
}
function cylinder(parent,color,pos,top,bottom,height,name='') {
  return mesh(parent,new T.CylinderGeometry(top,bottom,height,10),color,pos,[1,1,1],name);
}
function limb(parent,a,b,r,color,name='') {
  const start=new T.Vector3(...a),end=new T.Vector3(...b),mid=start.clone().add(end).multiplyScalar(.5);
  const m=mesh(parent,new T.CylinderGeometry(r*.82,r,start.distanceTo(end),8),color,mid.toArray(),[1,1,1],name);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());return m;
}
function faceFeatures(head,{skin,iris='#38342b',eyeY=.12,wide=1,sleepy=false,doll=false,brow='#61503e',mouth='#8c6457'}) {
  const eyes=[];
  for(const side of [-1,1]) {
    const x=side*(doll?.29:.265)*wide,y=eyeY,z=doll?.61:.565;
    const eye=new T.Group();eye.name=side<0?'Eye_Left':'Eye_Right';eye.position.set(x,y,z);head.add(eye);
    ellipsoid(eye,'#fff7ec',[0,0,0],[doll?.245:.23,sleepy?.105:.16,.105],2,'Sclera');
    const gaze=new T.Group();gaze.name='Gaze_'+(side<0?'Left':'Right');eye.add(gaze);
    ellipsoid(gaze,iris,[0,-.008,.099],[doll?.125:.109,sleepy?.087:.125,.038],2,'Iris');
    ellipsoid(gaze,'#181b18',[0,-.008,.132],[.052,sleepy?.075:.078,.018],2,'Pupil');
    ellipsoid(gaze,'#fffefa',[-.032,.041,.15],[.023,.026,.011],1,'Eye_Catchlight');
    tube(eye,[[-.23,.015,.04],[-.12,.115,.10],[.04,.13,.11],[.22,.025,.04]],sleepy?'#242624':'#6b5236',sleepy?.021:.016,10,'Upper_Lid');
    if(sleepy) for(let i=0;i<3;i++)tube(eye,[[side*.14,.055-i*.02,.07],[side*(.24+i*.012),.07-i*.012,.075]],'#272624',.011,3,'Lash');
    tube(head,[[x-.18,y+.27,z-.035],[x-.015,y+.32,z+.005],[x+.16,y+.275,z-.045]],brow,.021,8,'Brow');
    ellipsoid(head,'#e5a494',[x*1.35,y-.19,z-.025],[.14,.062,.018],1,'Cheek_Blush');
    eyes.push(gaze);
  }
  const nose=mesh(head,new T.ConeGeometry(doll?.085:.063,doll?.20:.26,4),skin,[0,-.10,doll?.705:.65],[1,1,1],'Nose');nose.rotation.x=.18;
  tube(head,doll?[[-.09,-.36,.62],[0,-.365,.64],[.09,-.36,.62]]:[[-.12,-.365,.50],[0,-.35,.53],[.12,-.365,.50]],mouth,doll?.017:.014,8,'Mouth');
  return eyes;
}
function baseCharacter(name,skin,shirt,{round=false}={}) {
  const root=new T.Group();root.name=name;
  root.userData={assetType:'low-poly-character',gazeNodes:['Gaze_Left','Gaze_Right'],units:'metres',style:'faceted clay'};
  const body=new T.Group();body.name='Costume';root.add(body);
  cylinder(body,shirt,[0,-.12,0],round?.39:.34,round?.45:.43,.88,'Torso');
  ellipsoid(body,shirt,[0,.23,-.015],[.58,.28,.32],1,'Shoulders');
  cylinder(body,skin,[0,.57,0],.16,.19,.43,'Neck');
  for(const s of [-1,1]) {
    limb(body,[s*.46,.22,0],[s*.63,-.42,.04],.15,shirt,s<0?'Sleeve_Left':'Sleeve_Right');
    ellipsoid(body,skin,[s*.64,-.48,.05],[.13,.19,.12],1,'Hand');
  }
  const head=new T.Group();head.name='Head';head.position.y=1.32;root.add(head);
  ellipsoid(head,skin,[0,0,.03],round?[.76,.77,.60]:[.66,.88,.56],2,'Face');
  for(const s of [-1,1])ellipsoid(head,skin,[s*.64,-.03,-.01],[.14,.22,.12],1,'Ear');
  return {root,body,head};
}
export function createBobGirl() {
  const skin='#f2cbb6',hair='#292b2a',c=baseCharacter('Bob_And_Olive_Scarf',skin,'#7b9191');
  ellipsoid(c.head,hair,[0,.07,-.22],[.79,.96,.64],2,'Bob_Hair_Back');
  for(const s of [-1,1]) {
    polygon(c.head,[[s*.60,.64],[s*.79,.70],[s*.83,-.53],[s*.65,-.67],[s*.61,-.24]],hair,-.12,.50,'Bob_Side');
    for(let i=0;i<3;i++)tube(c.head,[[s*(.68+i*.04),.38,.40],[s*(.70+i*.045),-.15,.40],[s*(.73+i*.04),-.56,.28]],i===1?'#373a37':hair,.015,9,'Bob_Strand');
  }
  polygon(c.head,[[-.67,.76],[-.18,.91],[.08,.84],[.045,.46],[-.10,.34],[-.62,.32]],hair,.43,.10,'Fringe_Left');
  polygon(c.head,[[.08,.84],[.62,.73],[.67,.28],[.15,.34],[.05,.43]],hair,.43,.10,'Fringe_Right');
  polygon(c.head,[[.10,.87],[.03,1.10],[.32,.89],[.46,.81]],hair,-.04,.19,'Cowlick');
  c.eyes=faceFeatures(c.head,{skin,iris:'#252b29',sleepy:true,brow:hair,mouth:'#5c5b50'});
  const olive='#59634e';cylinder(c.body,olive,[0,.58,0],.30,.35,.25,'Scarf_Collar');
  polygon(c.body,[[-.42,.62],[.34,.56],[.54,.01],[-.25,-.18],[-.53,.03]],olive,.28,.06,'Scarf_Drape');
  tube(c.body,[[-.3,.60,.31],[.04,.49,.39],[.30,.58,.32]],'#454f40',.036,10,'Scarf_Fold');
  tube(c.body,[[-.44,.12,.34],[-.11,.03,.37],[.37,.09,.35]],'#4e5945',.035,9,'Scarf_Hem');
  return {...c,name:'黑发围巾女孩',id:'bob-girl'};
}
export function createBlondeGirl() {
  const skin='#f0bda9',gold='#d4bf45',light='#e8d25f',c=baseCharacter('Blonde_And_Rose_Choker',skin,'#eee9d4');
  ellipsoid(c.head,gold,[0,.08,-.30],[.89,1.02,.66],2,'Long_Hair_Back');
  for(const s of [-1,1]) {
    ellipsoid(c.head,gold,[s*.65,-.45,-.10],[.33,.83,.38],2,'Long_Hair_Mass');
    for(let i=0;i<5;i++) {
      const off=i*.035;
      tube(c.head,[[s*(.18+off),.89,.24],[s*(.62+off),.65,.32],[s*(.65+off),.02,.43],[s*(.85+off),-.92,.30],[s*(.65+off),-1.19,.39]],i%2?light:gold,.078-i*.005,16,'Golden_Lock');
    }
  }
  polygon(c.head,[[-.68,.63],[-.45,.94],[-.14,.91],[0,.72],[-.10,.56],[-.28,.72],[-.60,.42]],gold,.42,.09,'Centre_Part_Left');
  polygon(c.head,[[.68,.63],[.45,.94],[.14,.91],[0,.72],[.10,.56],[.28,.72],[.60,.42]],gold,.42,.09,'Centre_Part_Right');
  c.eyes=faceFeatures(c.head,{skin,iris:'#707d49',brow:'#a58c39',mouth:'#b98466',eyeY:.08});
  cylinder(c.body,'#b97f7d',[0,.66,0],.184,.19,.12,'Rose_Choker');
  polygon(c.body,[[-.37,.30],[-.13,.40],[0,.04],[-.24,.13]],'#fff8df',.31,.03,'Blouse_Collar_Left');
  polygon(c.body,[[.37,.30],[.13,.40],[0,.04],[.24,.13]],'#fff8df',.31,.03,'Blouse_Collar_Right');
  return {...c,name:'金发女孩',id:'blonde-girl'};
}
export function createYarnDoll() {
  const skin='#edc7b1',hair='#a89e48',c=baseCharacter('Yarn_Doll_With_Red_Ties',skin,'#447f6c',{round:true});
  ellipsoid(c.head,hair,[0,.10,-.27],[1.03,1.01,.74],2,'Yarn_Hair_Mass');
  let seed=7253;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<72;i++) {
    const angle=rand()*Math.PI*2,side=Math.sin(angle),crown=Math.cos(angle);
    let x=side*(.80+rand()*.18),y=crown*(.79+rand()*.17)+.02,z=-.06+rand()*.34;
    if(y<-.6)y=-.6+rand()*.12;
    const r=.075+rand()*.06,points=[];
    for(let j=0;j<=10;j++){const t=j/10,a=t*Math.PI*3.5;points.push([x+Math.cos(a)*r,y+(t-.5)*.42,z+Math.sin(a)*r]);}
    tube(c.head,points,i%5===0?'#d8ce91':i%3===0?'#c0b16b':hair,.025+rand()*.012,18,'Yarn_Curl_'+i);
  }
  for(let i=-3;i<=3;i++) {
    const points=[];
    for(let j=0;j<=12;j++){const a=j/12*Math.PI*2.2;points.push([i*.18+Math.cos(a)*.095,.58+Math.sin(a)*.12+Math.abs(i)*.025,.57]);}
    tube(c.head,points,i%2?'#c0b16b':hair,.035,15,'Curly_Fringe');
  }
  c.eyes=faceFeatures(c.head,{skin,iris:'#8a9a62',doll:true,eyeY:.10,brow:'#827b4c',mouth:'#a47937'});
  for(let i=-6;i<=6;i++) {
    const x=i*.053,z=Math.sqrt(Math.max(0,.43*.43-x*x))+.015;
    mesh(c.body,new T.BoxGeometry(.023,.73,.025),i%2?'#a5a653':'#679357',[x,-.11,z],[1,1,1],'Woven_Vest_Stripe');
  }
  for(const s of [-1,1])for(let i=0;i<7;i++) {
    const band=cylinder(c.body,['#b35476','#b68c75','#797c4d','#bba773'][i%4],[s*(.51+i*.018),.13-i*.082,.015],.153,.153,.068,'Sleeve_Woven_Band');band.rotation.z=s*.23;
  }
  for(let i=0;i<3;i++) {
    const y=.15-i*.19;
    tube(c.body,[[-.13,y+.065,.45],[.13,y-.045,.45]],'#b93131',.026,3,'Red_Tie_A');
    tube(c.body,[[.13,y+.065,.45],[-.13,y-.045,.45]],'#b93131',.026,3,'Red_Tie_B');
  }
  for(const s of [-1,1])limb(c.body,[s*.32,.40,.27],[s*.35,-.44,.30],.055,'#7d5638','Vest_Edge');
  return {...c,name:'毛线卷发偶',id:'yarn-doll'};
}
export const characterFactories=[createBobGirl,createBlondeGirl,createYarnDoll];
export function createTrio() {
  const root=new T.Group();root.name='Three_Characters';
  const rigs=characterFactories.map((fn,i)=>{const c=fn();c.root.position.set((i-1)*2.05,i===1?.12:0, i===1?-.30:0);c.root.rotation.y=[.12,0,-.12][i];root.add(c.root);return c;});
  return {root,rigs};
}
