import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.min.js';
import {GLTFLoader} from './dist/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from './dist/utils/SkeletonUtils.js';
import {createGallopClip,GALLOP_CYCLE_SECONDS} from './dist/stag-gallop.js';

// Test actual imported GLB skinning + authored gallop without a GPU/browser.
// Node does not have DOM bitmaps; these stubs only let texture loading parse.
// Real image decoding/rendering is NOT tested here.
globalThis.self=globalThis;
globalThis.createImageBitmap=async ()=>({width:1,height:1});
const stagSource=await import('node:fs').then(fs=>fs.readFileSync(new URL('./dist/stag-real.js',import.meta.url),'utf8'));
const source=stagSource.match(/const ASSET_URL = '([^']+)'/)?.[1];
assert.ok(source);
const response=await fetch(source,{signal:AbortSignal.timeout(30000)});
assert.equal(response.ok,true);
const glb=await response.arrayBuffer();
const gltf=await new GLTFLoader().parseAsync(glb,'');
assert.ok(gltf.scene,'GLTF scene');
assert.ok(gltf.animations.length>=2,'Imported original animation clips');
const deer=cloneSkinned(gltf.scene);
deer.updateMatrixWorld(true);
const bones=[],skins=[];
deer.traverse(o=>{if(o.isBone)bones.push(o);if(o.isSkinnedMesh)skins.push(o)});
assert.ok(bones.length>16,'Real import has articulated Rigify skeleton');
assert.ok(skins.length>0&&skins[0].skeleton.bones.length>16,'Real skin is bound to deformer joints');
const clip=createGallopClip(bones);
assert.equal(clip.tracks.length,22,'16 quadruped limb joints + neck/spine/tail');
const tracked=clip.tracks.map(t=>t.name.split('.')[0]);
const fore=bones.find(b=>(b.userData.name||b.name)==='DEF-upper_arm.L');
const hind=bones.find(b=>(b.userData.name||b.name)==='DEF-thigh.L');
assert.ok(fore&&hind&&tracked.includes(fore.uuid)&&tracked.includes(hind.uuid));
const mixer=new T.AnimationMixer(deer);
const action=mixer.clipAction(clip);
action.play();
const before=fore.quaternion.clone(),hindBefore=hind.quaternion.clone();
mixer.update(GALLOP_CYCLE_SECONDS*.23);
assert.ok(fore.quaternion.angleTo(before)>.04,'Actual skinned foreleg rotates under gallop');
assert.ok(hind.quaternion.angleTo(hindBefore)>.04,'Actual skinned hindleg rotates under gallop');
// Check skinning matrices after mixer update, not only object transforms.
deer.updateMatrixWorld(true);
skins[0].skeleton.update();
const floats=skins[0].skeleton.boneMatrices;
assert.ok(Array.from(floats).every(Number.isFinite),'All GPU skinning matrices finite');
console.log('PASS: real '+bones.length+'-bone deer GLB imported, skeletal clone, 22-track gallop and finite skinning matrices');
