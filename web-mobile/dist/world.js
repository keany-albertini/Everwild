import * as T from './vendor/three.module.min.js';
import {prepareStagAsset,createStag} from './stag-real.js';
import {stepStagAI} from './stag-motion.js';
export const height=(x,z)=>Math.sin(x*.055)*1.5+Math.cos(z*.045)*1.2+Math.sin((x+z)*.09)*.45;
export async function createWorld(scene){
 const loader=new T.TextureLoader(),names=['ground','bark','stone','birch','leaves','nature1','nature2'];
 const textures=Object.fromEntries(await Promise.all(names.map(async n=>{const t=await loader.loadAsync('assets/'+n+'.webp');t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return[n,t]})));
 const mat=(n,color=0xffffff)=>new T.MeshStandardMaterial({map:textures[n],color,roughness:1});for(const n of ['ground','bark','stone','birch']){textures[n].wrapS=textures[n].wrapT=T.RepeatWrapping}textures.ground.repeat.set(55,55);textures.bark.repeat.set(2,3);textures.birch.repeat.set(2,4);
 const groundGeo=new T.PlaneGeometry(230,230,120,120);groundGeo.rotateX(-Math.PI/2);const pos=groundGeo.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,height(pos.getX(i),pos.getZ(i)));groundGeo.computeVertexNormals();const ground=new T.Mesh(groundGeo,mat('ground',0x9a9e87));ground.receiveShadow=true;scene.add(ground);
 const nodes=[],colliders=[],animals=[],leaves=[];let seed=1437;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const bark=mat('bark'),birch=mat('birch'),stone=mat('stone'),ore=mat('stone',0x807264);ore.metalness=.35;
 const leafmat=new T.MeshStandardMaterial({map:textures.leaves,alphaTest:.45,side:T.DoubleSide,roughness:1,color:0x8d9d6c});
 const leafGeo=new T.PlaneGeometry(1,1),matrix=new T.Object3D();const canopy=new T.InstancedMesh(leafGeo,leafmat,1500);let li=0;
 function leaf(x,y,z,size,ry,rx){matrix.position.set(x,y,z);matrix.scale.set(size,size,1);matrix.rotation.set(rx,ry,rand());matrix.updateMatrix();canopy.setMatrixAt(li++,matrix.matrix)}
 function tree(x,z,i){const firstLeaf=li;const h=8+rand()*8,r=.25+rand()*.34;const group=new T.Group();group.position.set(x,height(x,z),z);const trunk=new T.Mesh(new T.CylinderGeometry(r*.38,r,h,9,4),i%4===0?birch:bark);trunk.position.y=h/2;trunk.castShadow=true;group.add(trunk);for(let j=0;j<4;j++){let a=rand()*6.28;const branch=new T.Mesh(new T.CylinderGeometry(.05,r*.38,3.5,6),bark);branch.position.set(Math.cos(a)*.7,h*(.55+j*.07),Math.sin(a)*.7);branch.rotation.set(Math.cos(a)*.8,0,Math.sin(a)*.8);group.add(branch)}for(let j=0;j<9;j++){let a=rand()*6.28,d=rand()*2.6;leaf(x+Math.cos(a)*d,group.position.y+h-1+rand()*3,z+Math.sin(a)*d,4+rand()*3,a,j%3===0?Math.PI/2:.1)}scene.add(group);const node={id:'tree'+i,kind:'wood',amount:18,mesh:group,x,z,r:r+.18,firstLeaf,lastLeaf:li};nodes.push(node);trunk.userData.node=node;colliders.push(node)}
 tree(-2,-4,0);tree(4,-9,1);for(let i=2;i<115;i++){const x=(rand()-.5)*180,z=(rand()-.5)*180;if(Math.hypot(x,z)<7||Math.hypot(x-15,z+12)<8)continue;tree(x,z,i)}canopy.count=li;canopy.castShadow=true;scene.add(canopy);
 function rock(x,z,i,kind='stone',size=1){const geometry=new T.IcosahedronGeometry(1,2);const p=geometry.attributes.position;for(let j=0;j<p.count;j++){const y=p.getY(j),x=p.getX(j),z=p.getZ(j);const f=1+.11*Math.sin(x*19+y*13+z*17);p.setXYZ(j,x*f,y*f,z*f)}geometry.computeVertexNormals();const m=new T.Mesh(geometry,kind==='ore'?ore:stone);m.scale.set(size,size*.7,size*.8);m.rotation.y=rand()*6.28;m.position.set(x,height(x,z)+size*.28,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);const n={id:'rock'+i,kind,amount:kind==='ore'?12:15,mesh:m,x,z,r:size*.75};m.userData.node=n;nodes.push(n);colliders.push(n);if(kind==='ore'){for(let j=0;j<5;j++){const crystal=new T.Mesh(new T.OctahedronGeometry(.13),new T.MeshStandardMaterial({color:0x958775,metalness:.75,roughness:.4}));crystal.position.set((rand()-.5)*1.2,.65,(rand()-.5)*.8);m.add(crystal)}}}
 rock(1.5,-3.3,0,'stone',.75);rock(5,-6,1,'ore',1.2);for(let i=2;i<50;i++){
  const size=.5+rand()*1.8;
  let x=0,z=0,free=false;
  for(let tries=0;tries<28;tries++){
   x=(rand()-.5)*130;z=(rand()-.5)*130;
   if(!colliders.some(c=>c.kind==='wood'&&Math.hypot(c.x-x,c.z-z)<c.r+size*.8+.35)){free=true;break}
  }
  if(free)rock(x,z,i,i%5===0?'ore':'stone',size);
 }
 const fernMat=new T.MeshStandardMaterial({map:textures.nature1,alphaTest:.4,side:T.DoubleSide,color:0x99a586,roughness:1});const ferns=new T.InstancedMesh(new T.PlaneGeometry(1,1),fernMat,1000);for(let i=0;i<1000;i++){const x=(rand()-.5)*150,z=(rand()-.5)*150,s=.5+rand()*1.1;matrix.position.set(x,height(x,z)+s*.35,z);matrix.scale.set(s*1.7,s,1);matrix.rotation.set(0,rand()*6.28,0);matrix.updateMatrix();ferns.setMatrixAt(i,matrix.matrix)}scene.add(ferns);
 const bushMat=new T.MeshStandardMaterial({map:textures.nature2,alphaTest:.35,side:T.DoubleSide,roughness:1});for(let i=0;i<35;i++){const x=i===0?-1:(rand()-.5)*90,z=i===0?-2:(rand()-.5)*90;const g=new T.Group();g.position.set(x,height(x,z),z);for(let j=0;j<3;j++){const m=new T.Mesh(new T.PlaneGeometry(2.1,1.6),bushMat);m.position.y=.65;m.rotation.y=j*Math.PI/3;g.add(m)}scene.add(g);const n={id:'bush'+i,kind:'bush',amount:10,mesh:g,x,z,r:0};g.children.forEach(m=>m.userData.node=n);nodes.push(n)}
 const water=new T.Mesh(new T.CircleGeometry(7,64),new T.MeshPhysicalMaterial({color:0x536f6a,metalness:.2,roughness:.22,transparent:true,opacity:.85}));water.rotation.x=-Math.PI/2;water.position.set(15,height(15,-12)+.12,-12);scene.add(water);const spring={id:'water',kind:'water',amount:Infinity,mesh:water,x:15,z:-12,r:0};water.userData.node=spring;nodes.push(spring);
 // Rigged and animated 3D wildlife: coat, horns, skinning, head and limb bones.
 let stagReady=true;
 try{await prepareStagAsset()}catch(err){console.error('Rigged deer load failed',err);stagReady=false}
 for(let i=0;i<(stagReady?4:0);i++){
  let x=8+i*12,z=-15-i*8;
  for(let tries=0;tries<18;tries++){
   if(!colliders.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+2))break;
   x+=2.5+rand()*1.5;z+=1.5+rand()*2;
  }
  const stag=createStag(),m=stag.mesh;
  m.position.set(x,height(x,z),z);
  scene.add(m);
  const n={id:'deer'+i,kind:'deer',amount:2,hp:60,mesh:m,animation:stag,x,z,homeX:x,homeZ:z,r:1,phase:i*1.73,heading:0};
  m.traverse(child=>{if(child.isMesh)child.userData.node=n});
  nodes.push(n);animals.push(n);
 }
 function addFire(x,z){const g=new T.Group();g.position.set(x,height(x,z),z);for(let i=0;i<9;i++){const m=new T.Mesh(new T.IcosahedronGeometry(.22,1),stone);m.position.set(Math.cos(i*6.28/9)*.6,.1,Math.sin(i*6.28/9)*.6);g.add(m)}for(let i=0;i<4;i++){const m=new T.Mesh(new T.CylinderGeometry(.08,.1,1.1,6),bark);m.rotation.z=Math.PI/2;m.rotation.y=i*.8;m.position.y=.16;g.add(m)}const light=new T.PointLight(0xffa849,5,10);light.position.y=.6;g.add(light);const flame=new T.Mesh(new T.ConeGeometry(.25,.75,7),new T.MeshBasicMaterial({color:0xffb45e,transparent:true,opacity:.8}));flame.position.y=.5;g.add(flame);scene.add(g);return g}
 return {nodes,colliders,animals,stagReady,textures,water,addFire,deplete(n){n.mesh.visible=false;if(n.kind==='wood'){matrix.scale.set(0,0,0);matrix.updateMatrix();for(let i=n.firstLeaf;i<n.lastLeaf;i++)canopy.setMatrixAt(i,matrix.matrix);canopy.instanceMatrix.needsUpdate=true}},update(t,dt,player){
  water.material.opacity=.78+Math.sin(t)*.04;
  for(const a of animals){
   const motion=stepStagAI(a,player,colliders,t,dt);
   a.mesh.position.set(a.x,height(a.x,a.z),a.z);
   a.mesh.rotation.y=motion.heading;
   a.animation.update(t,dt,motion.animation,a.phase);

  }
 }
};
}
