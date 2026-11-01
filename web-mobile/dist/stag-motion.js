// Everwild Mobile — deterministic wildlife steering. Pure logic, testable in Node.
// Unit convention: x/z in metres, dt in seconds, yaw=atan2(vx,vz).
const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
const hypot=Math.hypot;
const smooth=(a,b,rate,dt)=>a+(b-a)*(1-Math.exp(-rate*dt));
export function stepStagAI(a,player,colliders,t,dt){
  dt=clamp(Number.isFinite(dt)?dt:0,0,.08);
  if(a.hp<=0){
    a.vx=0;a.vz=0;a.behavior='dead';
    return {x:a.x,z:a.z,heading:a.heading||0,speed:0,animation:'dead'};
  }
  const px=Number.isFinite(player?.x)?player.x:1e6;
  const pz=Number.isFinite(player?.z)?player.z:1e6;
  const distance=hypot(a.x-px,a.z-pz);
  // Fear persists after a hit or close encounter, then decays over time.
  if(distance<9)a.fear=Math.max(a.fear||0,3.6);
  else a.fear=Math.max(0,(a.fear||0)-dt);
  const escaping=a.fear>.03;
  const age=t+(a.phase||0)*8;
  const homeX=Number.isFinite(a.homeX)?a.homeX:a.x;
  const homeZ=Number.isFinite(a.homeZ)?a.homeZ:a.z;
  let tx,tz,speed;
  if(escaping){
    const awayX=a.x-px, awayZ=a.z-pz;
    const l=hypot(awayX,awayZ)||1;
    tx=awayX/l;tz=awayZ/l;
    // When safe, flee toward the home range instead of wandering off-map.
    if(distance>18){
      const hx=homeX-a.x,hz=homeZ-a.z,hl=hypot(hx,hz)||1;
      tx=tx*.65+hx/hl*.35;tz=tz*.65+hz/hl*.35;
    }
    speed=3.7;
  }else{
    // Stable, slowly moving home-range targets. No per-frame random jumps.
    const radius=6.5+Math.sin((a.phase||0)*1.7)*2;
    const wx=homeX+Math.sin(age*.14)*radius;
    const wz=homeZ+Math.cos(age*.105)*radius;
    const dx=wx-a.x,dz=wz-a.z,dist=hypot(dx,dz)||1;
    tx=dx/dist;tz=dz/dist;
    const resting=Math.sin(age*.28)>-.05;
    speed=resting?0:.72;
    // Return to home range if displaced by a collision or a long chase.
    const leash=hypot(homeX-a.x,homeZ-a.z);
    if(leash>22){tx=(homeX-a.x)/leash;tz=(homeZ-a.z)/leash;speed=1.25}
  }
  let steerX=tx,steerZ=tz;
  // Anticipatory separation: steer around rocks/trees instead of walking into them.
  for(const c of colliders){
    if(c.amount<=0)continue;
    const dx=a.x-c.x,dz=a.z-c.z;
    const d=hypot(dx,dz);
    const range=(c.r||.5)+2.1;
    if(d<range){
      const strength=(range-d)/range;
      const inv=1/Math.max(.08,d);
      steerX+=dx*inv*strength*2.8;
      steerZ+=dz*inv*strength*2.8;
    }
  }
  let len=hypot(steerX,steerZ)||1;
  const targetX=steerX/len*speed,targetZ=steerZ/len*speed;
  const response=escaping?7.5:3.5;
  a.vx=smooth(a.vx||0,targetX,response,dt);
  a.vz=smooth(a.vz||0,targetZ,response,dt);
  const rawX=a.x+a.vx*dt,rawZ=a.z+a.vz*dt;
  let nx=clamp(rawX,-98,98),nz=clamp(rawZ,-98,98);
  for(const c of colliders){
    if(c.amount<=0)continue;
    const dx=nx-c.x,dz=nz-c.z;
    const d=hypot(dx,dz);
    const min=(c.r||.5)+.67;
    if(d<min){
      const ux=d>.001?dx/d:Math.sin((a.phase||1)*3.1);
      const uz=d>.001?dz/d:Math.cos((a.phase||1)*3.1);
      nx=c.x+ux*min;nz=c.z+uz*min;
    }
  }
  const actualX=nx-a.x,actualZ=nz-a.z;
  a.x=clamp(nx,-98,98);a.z=clamp(nz,-98,98);
  const moved=hypot(actualX,actualZ);
  const actualSpeed=moved/Math.max(.001,dt);
  if(moved>.001){
    const desired=Math.atan2(actualX,actualZ);
    const from=a.heading||0;
    const delta=Math.atan2(Math.sin(desired-from),Math.cos(desired-from));
    a.heading=from+delta*(1-Math.exp(-5*dt));
  }
  let animation;
  if(escaping&&actualSpeed>.1)animation='run';
  else if(actualSpeed>.17)animation='walk';
  else animation=Math.sin(age*.29)>.15?'graze':'idle';
  a.behavior=animation;
  return {x:a.x,z:a.z,heading:a.heading||0,speed:actualSpeed,animation};
}
