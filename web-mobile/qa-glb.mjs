import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./dist/stag-real.js',import.meta.url),'utf8');
const url=source.match(/const ASSET_URL = '([^']+)'/)?.[1];
assert.ok(url?.startsWith('https://raw.githubusercontent.com/'),'Asset must use pinned public URL');
const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
assert.ok(response.ok,'Deer GLB HTTP status '+response.status);
const data=Buffer.from(await response.arrayBuffer());
assert.ok(data.length>1000,'GLB empty');
assert.equal(data.toString('ascii',0,4),'glTF','Valid glTF magic');
assert.equal(data.readUInt32LE(4),2,'glTF 2.0');
assert.equal(data.readUInt32LE(8),data.length,'Valid binary length');
const jsonBytes=data.readUInt32LE(12);
assert.equal(data.readUInt32LE(16),0x4e4f534a,'JSON chunk');
const gltf=JSON.parse(data.toString('utf8',20,20+jsonBytes));
const skins=gltf.skins||[],animations=gltf.animations||[];
const names=animations.map(a=>a.name||'').join(', ');
assert.ok(skins.length>=1,'At least one skinned rig');
assert.ok(Math.max(...skins.map(s=>s.joints?.length||0))>=4,'At least 4 animated bones');
assert.ok(animations.length>=1,'At least one clip');
assert.ok(animations.some(a=>/walk|run|trot|gallop/i.test(a.name||'')),'Missing real gait clip');
console.log('PASS: fetched original GLB '+data.length+' bytes; '+skins.length+' skins, '+animations.length+' clips');
console.log('Animations: '+names);


const requiredSkinningBones=[
 'DEF-upper_arm.L','DEF-forearm.L','DEF-forefoot.L','DEF-f_hoof.L',
 'DEF-upper_arm.R','DEF-forearm.R','DEF-forefoot.R','DEF-f_hoof.R',
 'DEF-thigh.L','DEF-lower_leg.L','DEF-hind_foot.L','DEF-r_hoof.L',
 'DEF-thigh.R','DEF-lower_leg.R','DEF-hind_foot.R','DEF-r_hoof.R',
 'DEF-head','DEF-neck.001','DEF-spine.004'
];
const joints=new Set(gltf.skins.flatMap(s=>s.joints).map(i=>gltf.nodes[i]?.name));
for(const name of requiredSkinningBones){
 assert.ok(joints.has(name),'Gallop has no weighted skinning bone: '+name);
}
assert.ok(gltf.animations.some(a=>a.name==='deer_male_idle'),'Source idle clip');
assert.ok(gltf.animations.some(a=>a.name==='deer_male_walk'),'Source walk clip');
assert.ok(!gltf.animations.some(a=>/gallop|run/i.test(a.name||'')),
 'Gallop is an original Everwild JS clip, not a source GLB clip');
console.log('PASS: 19 required anatomical deer skinning bones verified in original GLB');
