import * as T from './vendor/three.module.min.js';

/**
 * Authored quadruped bound/gallop for the Rigify DEF deformation bones of
 * deer_male.glb. Runs on the real skinned deer joints (not separate props).
 * One complete bound ~= 2.3m at reference speed 3.7m/s.
 *
 * Limb angular excursions are smooth and phase-shifted: the hind pair
 * compresses then pushes off before the two forelimbs extend and land.
 * L/R have a slight offset rather than exact robotic symmetry.
 */
export const GALLOP_CYCLE_SECONDS = .62;
export const GALLOP_REFERENCE_SPEED = 3.7;
const TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const phase01=x=>((x%1)+1)%1;
const swing=p=>Math.sin(TAU*p);
const lift=p=>Math.max(0,Math.sin(TAU*p));

/** Radians of swing and flex for a real four-legged bound, defined by limb. */
export function gallopPose(phase, limb) {
 const front=limb[0]==='f';
 const side=limb.endsWith('R')?.055:0;
 const p=phase01(phase+(front?.06:.56)+side);
 const reach=swing(p);
 const fold=lift(p+.10);
 return {
  upper:(front?.51:.65)*reach+(front?-.06:.09),
  lower:(front?-.74:.76)*fold+(front?-.045:.055),
  foot:(front?.20:-.22)*reach+(front?.12:-.11)*fold,
  hoof:(front?-.15:.14)*reach
 };
}
function originalName(b){return b.userData?.name || b.name}
/**
 * A real animation clip containing 12+ independent bone quaternion tracks.
 * The DEF joints have baked skinning weights in the source GLB. We rotate
 * about transverse X in *parent space* so the model's local Rigify bone
 * axes do not turn a forward stride into sideways splaying.
 */
export function createGallopClip(bones, opts={}) {
 const boneBySource=new Map(bones.map(b=>[originalName(b),b]));
 const needed=[
  ['fL','upper','DEF-upper_arm.L'],['fL','lower','DEF-forearm.L'],['fL','foot','DEF-forefoot.L'],['fL','hoof','DEF-f_hoof.L'],
  ['fR','upper','DEF-upper_arm.R'],['fR','lower','DEF-forearm.R'],['fR','foot','DEF-forefoot.R'],['fR','hoof','DEF-f_hoof.R'],
  ['hL','upper','DEF-thigh.L'],['hL','lower','DEF-lower_leg.L'],['hL','foot','DEF-hind_foot.L'],['hL','hoof','DEF-r_hoof.L'],
  ['hR','upper','DEF-thigh.R'],['hR','lower','DEF-lower_leg.R'],['hR','foot','DEF-hind_foot.R'],['hR','hoof','DEF-r_hoof.R']
 ];
 const missing=needed.filter(a=>!boneBySource.has(a[2]));
 if(missing.length)throw new Error('Galop : os de déformation manquants : '+missing.map(x=>x[2]).join(', '));
 const joints=[...needed];
 for(const name of ['DEF-neck.001','DEF-neck.003','DEF-spine.004','DEF-spine.005','DEF-head','DEF-tail.001']){
  if(boneBySource.has(name))joints.push(['torso',name,name]);
 }
 // Matrix update from parent is required to derive the local yaw-independent
 // sagittal hinge axis for each skinning bone.
 const axis=new T.Vector3(1,0,0);
 const times=Array.from({length:25},(_,i)=>i/24*GALLOP_CYCLE_SECONDS);
 const tracks=[];
 const debug={};
 for(const [limb,part,name] of joints){
  const bone=boneBySource.get(name);
  const rest=bone.quaternion.clone();
  const parentQ=new T.Quaternion();
  bone.parent?.getWorldQuaternion(parentQ);
  const hinge=axis.clone().applyQuaternion(parentQ.invert()).normalize();
  const quats=[];
  for(let i=0;i<times.length;i++){
   const p=i/24;
   const rad=limb==='torso'
    ? (name.includes('neck')?.048:name.includes('tail')?.075:.03)*Math.sin(TAU*(p+.18))
    :gallopPose(p,limb)[part];
   // qLocal(deltaWorld) * qBind, stable even for rolled clavicle/hip bones.
   const q=new T.Quaternion().setFromAxisAngle(hinge,rad).multiply(rest).normalize();
   quats.push(q.x,q.y,q.z,q.w);
  }
  tracks.push(new T.QuaternionKeyframeTrack(bone.uuid+'.quaternion',times,quats));
  debug[name]={bone:bone.name,rest:[rest.x,rest.y,rest.z,rest.w],axis:[hinge.x,hinge.y,hinge.z]};
 }
 const clip=new T.AnimationClip('Everwild_Stag_Gallop',GALLOP_CYCLE_SECONDS,tracks);
 clip.userData={source:'authored-gallop-2026',limbs:['fL','fR','hL','hR'],strideMeters:GALLOP_CYCLE_SECONDS*GALLOP_REFERENCE_SPEED,rigBones:debug};
 return clip;
}
export function gallopTimeScale(metersPerSecond){
 return clamp(metersPerSecond/GALLOP_REFERENCE_SPEED,.4,1.9);
}
export function gallopBob(gaitSeconds){
 // Two gentle suspension beats per bound, no large unrealistic vertical leap.
 const p=phase01(gaitSeconds/GALLOP_CYCLE_SECONDS);
 return .032+.055*(.5+.5*Math.cos(TAU*(p-.38)));
}
