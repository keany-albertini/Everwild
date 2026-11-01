import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.min.js';
import {createGallopClip,gallopPose,gallopTimeScale,gallopBob,GALLOP_CYCLE_SECONDS} from './dist/stag-gallop.js';

const jointNames=[
 'DEF-upper_arm.L','DEF-forearm.L','DEF-forefoot.L','DEF-f_hoof.L',
 'DEF-upper_arm.R','DEF-forearm.R','DEF-forefoot.R','DEF-f_hoof.R',
 'DEF-thigh.L','DEF-lower_leg.L','DEF-hind_foot.L','DEF-r_hoof.L',
 'DEF-thigh.R','DEF-lower_leg.R','DEF-hind_foot.R','DEF-r_hoof.R',
 'DEF-neck.001','DEF-neck.003','DEF-spine.004','DEF-spine.005','DEF-head','DEF-tail.001'
];
const rig=new T.Group(),bones=[],byName=new Map();
for(const name of jointNames){
 const bone=new T.Bone();
 bone.name=name.replace(/\./g,'_');
 bone.userData.name=name;
 bone.position.y=.1;
 rig.add(bone);
 bones.push(bone);
 byName.set(name,bone);
}
rig.updateMatrixWorld(true);
const clip=createGallopClip(bones);
assert.equal(clip.name,'Everwild_Stag_Gallop');
assert.equal(clip.duration,GALLOP_CYCLE_SECONDS);
assert.equal(clip.tracks.length,22,'16 limb joints + 6 spine/head/tail joints');
assert.ok(clip.tracks.every(t=>t.times.length===25),'Keyframes must cover seamless loop');
assert.equal(gallopTimeScale(3.7),1,'Reference speed sync');
assert.equal(gallopTimeScale(7.4),1.9,'High speed is capped');
assert.ok(Math.abs(gallopBob(0)-gallopBob(.2))>.005,'Suspension changes through cycle');
assert.notDeepEqual(gallopPose(.2,'fL'),gallopPose(.2,'fR'),'L/R timing must not be identical');
assert.notDeepEqual(gallopPose(.2,'fL'),gallopPose(.2,'hL'),'Hind legs drive before forelegs');
const mixer=new T.AnimationMixer(rig),action=mixer.clipAction(clip);
action.setLoop(T.LoopRepeat,Infinity).play();
const upper=byName.get('DEF-upper_arm.L');
const opposite=byName.get('DEF-upper_arm.R');
const hind=byName.get('DEF-thigh.L');
const before=upper.quaternion.clone();
mixer.update(.08);
const early=upper.quaternion.clone();
assert.ok(before.angleTo(early)>.03,'Skinned forelimb upper joint must rotate');
assert.ok(upper.quaternion.angleTo(opposite.quaternion)>.02,'Asynchronous left and right forelimbs');
assert.ok(upper.quaternion.angleTo(hind.quaternion)>.03,'Independent hind propulsion');
mixer.update(.16);
assert.ok(upper.quaternion.angleTo(early)>.1,'Gallop clip must be a moving animation');
mixer.update(GALLOP_CYCLE_SECONDS);
assert.ok(upper.quaternion.angleTo(early)>.1,'Gallop should keep cycling');
// Each hoof must be targeted, not just the torso bob.
for(const name of ['DEF-f_hoof.L','DEF-f_hoof.R','DEF-r_hoof.L','DEF-r_hoof.R']){
 assert.ok(clip.tracks.some(t=>t.name.startsWith(byName.get(name).uuid)),'No missing hoof '+name);
}
console.log('PASS: new true four-leg gallop, 22 rigged bone tracks, lead/trail offsets, looping and speed sync');
