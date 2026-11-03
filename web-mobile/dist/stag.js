import * as T from './vendor/three.module.min.js';

// Everwild forest guardian: lightweight, entirely procedural 3D skeleton.
// No remote downloads, 2D wildlife billboards, or copyrighted game assets.
const coat=new T.MeshStandardMaterial({color:0x614639,roughness:.98});
const flank=new T.MeshStandardMaterial({color:0x7d5943,roughness:1});
const shade=new T.MeshStandardMaterial({color:0x463b30,roughness:1});
const cream=new T.MeshStandardMaterial({color:0xb4a183,roughness:1});
const nose=new T.MeshStandardMaterial({color:0x272725,roughness:.75});
const hoofMat=new T.MeshStandardMaterial({color:0x292925,roughness:.9});
const eye=new T.MeshStandardMaterial({color:0x201d18,roughness:.22});
const amber=new T.MeshStandardMaterial({color:0xcbbd91,roughness:.5});
const antler=new T.MeshStandardMaterial({color:0x97846b,roughness:.85});
const magic=new T.MeshStandardMaterial({color:0x80c5b5,emissive:0x256a62,emissiveIntensity:1.35,roughness:.58});
const sphere=new T.SphereGeometry(1,14,10);
// Deterministic warm fur microtexture, generated locally and shared by all deer.
let furReady=false;
function prepareFur(){
 if(furReady||typeof document==='undefined')return;
 furReady=true;
 const c=document.createElement('canvas');c.width=c.height=256;
 const ctx=c.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#d2c4a9';ctx.fillRect(0,0,256,256);
 let seed=28461;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<5800;i++){
  const x=rand()*256,y=rand()*256;
  ctx.strokeStyle=rand()>.5?'rgba(86,62,41,.16)':'rgba(251,236,198,.23)';
  ctx.lineWidth=.3+rand()*.75;ctx.beginPath();ctx.moveTo(x,y);
  ctx.lineTo(x+(rand()-.5)*2,y+2+rand()*9);ctx.stroke();
 }
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
 t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=4;
 coat.map=t;flank.map=t;cream.map=t;
 coat.needsUpdate=flank.needsUpdate=cream.needsUpdate=true;
}

const toV=(x,y,z)=>new T.Vector3(x,y,z);

function oval(parent,material,position,scale,rz=0){
 const m=new T.Mesh(sphere,material);
 m.position.set(...position);m.scale.set(...scale);m.rotation.x=rz;
 m.castShadow=true;parent.add(m);return m;
}
function limbSegment(parent,material,a,b,r0,r1,sides=7){
 const p=toV(...a),q=toV(...b),v=q.clone().sub(p);
 const m=new T.Mesh(new T.CylinderGeometry(r1,r0,v.length(),sides,1),material);
 m.position.copy(p).add(q).multiplyScalar(.5);
 m.quaternion.setFromUnitVectors(toV(0,1,0),v.normalize());
 m.castShadow=false;parent.add(m);return m;
}
function line(parent,material,coords,r=.012){
 const curve=new T.CatmullRomCurve3(coords.map(p=>toV(...p)));
 const m=new T.Mesh(new T.TubeGeometry(curve,Math.max(6,coords.length*5),r,4,false),material);
 m.castShadow=false;parent.add(m);return m;
}
function makeAntlers(head,side){
 const s=side,origin=[s*.18,.19,.07];
 const stem=[[s*.18,.19,.07],[s*.24,.40,.08],[s*.36,.63,.13],[s*.46,.91,.12],[s*.58,1.15,.06]];
 for(let i=1;i<stem.length;i++)limbSegment(head,antler,stem[i-1],stem[i],.064-(i-1)*.012,.064-i*.012);
 const sprigs=[
  [[s*.31,.53,.11],[s*.57,.64,.37],[s*.66,.79,.52]],
  [[s*.40,.76,.12],[s*.69,.85,.28],[s*.82,1.02,.33]],
  [[s*.49,.98,.1],[s*.64,1.14,-.14],[s*.72,1.37,-.16]],
  [[s*.59,1.14,.06],[s*.71,1.34,.03]]
 ];
 for(const branch of sprigs)for(let i=1;i<branch.length;i++)limbSegment(head,antler,branch[i-1],branch[i],.032-(i-1)*.009,.013,5);
 // Few restrained magical marks, no excessive neon or mobile-costly lights.
 line(head,magic,[[s*.23,.34,.095],[s*.29,.48,.115],[s*.37,.64,.135]],.009);
 oval(head,magic,[s*.51,1.01,.1],[.025,.034,.025]);
}

function makeSkinnedLeg(parent,x,z,back=false){
 // Single deforming leg surface; its three connected bones give actual skinning.
 const hip=new T.Bone();hip.name=back?'hind_hip':'front_shoulder';
 const knee=new T.Bone();knee.name=back?'hock':'knee';knee.position.y=-.52;hip.add(knee);
 const ankle=new T.Bone();ankle.name='ankle';ankle.position.y=-.56;knee.add(ankle);
 const vertices=[],uv=[],index=[],weights=[],faces=[];
 const rings=12,sides=8,total=1.08;
 for(let j=0;j<=rings;j++){
  const d=j/rings*total,bulge=back?1.1:1;
  const radius=(d<.48?.15-(d/.48)*.043:.107-(d-.48)*.075)*bulge;
  for(let k=0;k<sides;k++){
   const a=k/sides*Math.PI*2;
   vertices.push(Math.cos(a)*radius,-d,Math.sin(a)*radius*.84);
   uv.push(k/sides,j/rings);
   const wHip=Math.max(0,Math.min(1,(.63-d)/.25));
   const wAnkle=Math.max(0,Math.min(1,(d-.67)/.24));
   const wKnee=Math.max(0,1-wHip-wAnkle);
   index.push(0,1,2,0);weights.push(wHip,wKnee,wAnkle,0);
  }
 }
 for(let j=0;j<rings;j++)for(let k=0;k<sides;k++){
  const a=j*sides+k,b=j*sides+(k+1)%sides,c=(j+1)*sides+k,d=(j+1)*sides+(k+1)%sides;
  faces.push(a,c,b,b,c,d);
 }
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 g.setAttribute('skinIndex',new T.Uint16BufferAttribute(index,4));
 g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
 g.setIndex(faces);g.computeVertexNormals();
 const skin=new T.SkinnedMesh(g,back?coat:flank);skin.name=back?'hind_leg':'front_leg';
 skin.position.set(x,1.24,z);skin.add(hip);skin.updateMatrixWorld(true);
 skin.bind(new T.Skeleton([hip,knee,ankle]));skin.castShadow=true;
 const foot=new T.Group();foot.position.set(0,-.015,.04);ankle.add(foot);
 oval(foot,hoofMat,[-.065,0,.13],[.075,.09,.19]);
 oval(foot,hoofMat,[.065,0,.13],[.075,.09,.19]);
 parent.add(skin);
 return {hip,knee,ankle,skin};
}

/** Build a 3D fantasy stag with a real four-leg skeleton, not a sprite. */
export function createStag(){
 prepareFur();
 const root=new T.Group();root.name='Everwild_Stag_Guardian';
 const body=new T.Group();root.add(body);
 oval(body,coat,[0,1.39,-.05],[.47,.47,.98]);
 oval(body,flank,[0,1.39,-.62],[.47,.48,.46]);
 oval(body,coat,[0,1.4,.55],[.46,.52,.41]);
 oval(body,cream,[0,1.12,.27],[.33,.25,.60]);
 oval(body,cream,[0,1.13,-.84],[.18,.19,.20]); // short tail base
 oval(body,shade,[0,1.14,-1.00],[.14,.13,.21]);
 // Separate neck and head bones for grazing, alert stance and hit reactions.
 const neck=new T.Bone();neck.name='neck';neck.position.set(0,1.49,.57);body.add(neck);
 oval(neck,coat,[0,.24,.15],[.29,.49,.33],-.36);
 oval(neck,cream,[0,.06,.37],[.19,.33,.13],-.30);
 const head=new T.Bone();head.name='head';head.position.set(0,.54,.31);neck.add(head);
 oval(head,flank,[0,.04,.13],[.235,.23,.32]);
 oval(head,cream,[0,-.11,.40],[.155,.135,.29]);
 oval(head,nose,[0,-.105,.63],[.15,.095,.105]);
 for(const s of [-1,1]){
  oval(head,coat,[s*.235,.16,.02],[.15,.22,.09],s*.3);
  oval(head,cream,[s*.28,.17,.045],[.09,.17,.045],s*.3);
  oval(head,amber,[s*.208,.11,.306],[.062,.056,.025]);
  oval(head,eye,[s*.226,.115,.318],[.031,.036,.021]);
  makeAntlers(head,s);
 }
 // Faint arcane marks follow the torso contours and remain readable from afar.
 for(const s of [-1,1]){
  line(body,magic,[[s*.463,1.49,.48],[s*.478,1.52,.15],[s*.46,1.60,-.23],[s*.38,1.59,-.58]],.011);
  line(body,magic,[[s*.47,1.33,.43],[s*.47,1.22,.10],[s*.41,1.22,-.31]],.007);
  for(let j=0;j<6;j++){
   const z=-.73+j*.22;
   oval(body,j%3===0?cream:flank,[s*(.455-(Math.abs(z+.05)*.05)),1.65+Math.sin(j*2.4)*.04,z],[.013,.02,.038]);
  }
 }
 const legs=[
  makeSkinnedLeg(body,-.30,.63,false),
  makeSkinnedLeg(body,.30,.63,false),
  makeSkinnedLeg(body,-.33,-.69,true),
  makeSkinnedLeg(body,.33,-.69,true)
 ];
 // Static skeleton is checked by the game tests before the wildlife is shipped.
 const allBones=[neck,head,...legs.flatMap(l=>[l.hip,l.knee,l.ankle])];
 let fall=0;
 function update(t,dt,state='idle',phase=0){
  if(state==='dead'){
   fall=Math.min(1,fall+Math.max(0,dt)*2.4);
   root.rotation.z=-fall*1.22;body.position.y=-fall*.70;
   for(const l of legs){l.hip.rotation.x=.13;l.knee.rotation.x=.45}
   neck.rotation.x=.15;head.rotation.x=.16;return;
  }
  fall=0;root.rotation.z=0;body.position.y=0;
  const moving=state==='run'||state==='walk';
  const run=state==='run',power=run?.67:.28,cadence=run?11.2:5.1;
  const tick=t*cadence+phase;
  for(let i=0;i<legs.length;i++){
   const l=legs[i],cycle=tick+((i===0||i===3)?0:Math.PI);
   l.hip.rotation.x=moving?Math.sin(cycle)*power:Math.sin(t*.83+i)*.015;
   l.knee.rotation.x=moving?Math.max(0,-Math.sin(cycle+.52))*(run?.92:.49):.1;
   l.ankle.rotation.x=-l.knee.rotation.x*.65;
  }
  const graze=!moving&&Math.sin(t*.35+phase)> .55;
  neck.rotation.x=graze?.56:Math.sin(t*1.4+phase)*.027+(run?.055:0);
  head.rotation.x=graze?.18:Math.sin(t*.95+phase)*.04;
  head.rotation.y=Math.sin(t*.48+phase)*.07;
  body.position.y=moving?Math.sin(tick*2)* (run?.055:.018):Math.sin(t*1.8+phase)*.018;
 }
 update(0,0);
 return {mesh:root,update,legs,bones:allBones};
}
