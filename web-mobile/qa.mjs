import assert from 'node:assert/strict';
import {createStag} from './dist/stag.js';import {Survival} from './dist/economy.js';
const s=new Survival();const n={id:'a',kind:'ore',amount:10};assert.ok(s.harvest(n).error);assert.equal(n.amount,10);for(const k of ['wood','stone','fiber'])s.bag[k]=10;assert.ok(s.craft('pick'));assert.equal(s.bag.wood,5);assert.equal(s.bag.stone,5);assert.equal(s.bag.fiber,7);assert.ok(!s.craft('pick'));assert.ok(!s.harvest(n).error);assert.equal(s.bag.ore,1);assert.equal(n.amount,9);const b={id:'b',kind:'bush',amount:2};s.harvest(b);assert.equal(s.bag.berries,2);assert.equal(b.amount,0);assert.ok(s.harvest(b).error);s.hunger=30;assert.ok(s.eat());assert.equal(s.hunger,42);const restored=new Survival();assert.ok(restored.restore(s.snapshot()));assert.deepEqual(restored.bag,s.bag);assert.deepEqual(restored.depleted,s.depleted);s.stamina=100;s.tick(1,true);assert.equal(s.stamina,86);console.log('PASS: harvest, tool gating, depletion, crafting costs, food, survival, save roundtrip');

const stag=createStag();
assert.equal(stag.legs.length,4,'four legs with skeletons');
assert.equal(stag.bones.length,14,'neck + head + twelve leg bones');
assert.ok(stag.legs.every(l=>l.skin.isSkinnedMesh&&l.skin.skeleton.bones.length===3),'GPU-skinned 3D legs');
assert.ok(stag.mesh.getObjectByName('head'),'head bone present');
stag.update(.11,.016,'run',0);
assert.ok(Math.abs(stag.legs[0].hip.rotation.x)>.2,'run gait actually moves a leg');
stag.update(.22,.016,'walk',0);
assert.ok(stag.legs[0].hip.rotation.x!==stag.legs[1].hip.rotation.x,'alternating walk gait');
stag.update(0,.016,'idle',0);
assert.ok(stag.mesh.rotation.z===0,'idle upright');
stag.update(.5,.30,'dead',0);
assert.ok(stag.mesh.rotation.z<-.4,'death pose animation');
console.log('PASS: fantasy stag skeleton, skinning and idle/walk/run/death animation states');
