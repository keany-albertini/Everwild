import assert from 'node:assert/strict';
import {stepStagAI} from './dist/stag-motion.js';
const finite=a=>[a.x,a.z,a.heading,a.vx,a.vz].every(Number.isFinite);
const a={id:'stag-a',x:0,z:0,homeX:0,homeZ:0,phase:1.4,heading:0,hp:60};
const obstacle={x:2.1,z:1.5,r:1.15,amount:1};
let t=0;
for(let i=0;i<900;i++){
 const out=stepStagAI(a,{x:100,z:100},[obstacle],t,1/60);
 assert.ok(finite(a),'Wildlife physics must stay finite');
 assert.ok(a.x>=-98&&a.x<=98&&a.z>=-98&&a.z<=98,'Stay inside world');
 assert.ok(Math.hypot(a.x-obstacle.x,a.z-obstacle.z)>=obstacle.r+.65,'No stag inside rock');
 assert.ok(['idle','walk','graze','run'].includes(out.animation),'Valid motion state');
 t+=1/60;
}
const before={x:a.x,z:a.z};
const p={x:before.x+1,z:before.z+1};
let panic=false;
for(let i=0;i<90;i++){
 const move=stepStagAI(a,p,[obstacle],t,1/60);
 panic ||= move.animation==='run';
 t+=1/60;
}
assert.ok(panic,'Nearby player must trigger escape');
assert.ok(Math.hypot(a.x-before.x,a.z-before.z)>1,'Stag must flee physically');
a.hp=0;
const dead=stepStagAI(a,{x:a.x,z:a.z},[obstacle],t,1/60);
assert.equal(dead.animation,'dead');
assert.equal(dead.speed,0);
console.log('PASS: wildlife idle/graze/walk, flee, avoidance, bounds, death');
