import * as T from './vendor/three.module.min.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { clone as cloneSkinned } from './utils/SkeletonUtils.js';
import {createGallopClip,gallopTimeScale,gallopBob} from './stag-gallop.js';

// Anatomically modelled, UV-textured, skinned deer; not the previous primitive-mesh stag.
// External prototype mesh from a public repository snapshot; provenance must be verified for commercial distribution.
// As an external asset it is cached once per session, then SkeletonUtils clones its skins.
const ASSET_URL = 'https://raw.githubusercontent.com/Alexander-Jordan/mitt-spel-om-bibeln/eedee2ecb19019f90bad7aa71cc9679aa0665bb9/assets/models/animals/deer/deer_male.glb';
let template = null;
const groundHeight = 0;
const antlerBone = new T.MeshStandardMaterial({ color: 0x837b6b, metalness: 0.18, roughness: 0.76 });
const luminous = new T.MeshStandardMaterial({ color: 0x92cbb3, emissive: 0x266854, emissiveIntensity: 1.2, metalness: 0.22, roughness: 0.42 });
const moonstone = new T.MeshPhysicalMaterial({ color: 0xadddd4, emissive: 0x286c65, emissiveIntensity: 0.7, metalness: 0.35, roughness: 0.25, clearcoat: 0.6 });
function jewel(parent, at, radius) {
  const o = new T.Mesh(new T.IcosahedronGeometry(radius, 1), moonstone);
  o.position.set(...at);
  o.castShadow = false; parent.add(o); return o;
}
function tube(parent, path, material, radius) {
  const curve = new T.CatmullRomCurve3(path.map(p => new T.Vector3(...p)));
  const mesh = new T.Mesh(new T.TubeGeometry(curve, 18, radius, 5, false), material);
  parent.add(mesh); return mesh;
}
function createArcaneCrown(parent) {
  const crown = new T.Group(); crown.name = 'Everwild_Moonroot_Crown'; parent.add(crown);
  const runeGlow=luminous.clone();crown.userData.runeGlow=runeGlow;
  for (const s of [-1, 1]) {
    const branch = [[s*.13,.06,0],[s*.18,.24,-.02],[s*.31,.42,-.08],[s*.44,.57,-.12]];
    tube(crown, branch, antlerBone, .024);
    tube(crown, [[s*.22,.26,-.04],[s*.32,.35,.12],[s*.39,.49,.18]], antlerBone, .012);
    tube(crown, [[s*.30,.42,-.08],[s*.48,.54,-.02],[s*.55,.69,-.05]], antlerBone, .012);
    tube(crown, [[s*.13,.08,0],[s*.18,.22,-.02],[s*.25,.31,-.055]], runeGlow, .006);
    jewel(crown, [s*.44,.57,-.12], .034);
    jewel(crown, [s*.55,.69,-.05], .02);
  }
  return crown;
}
export async function prepareStagAsset() {
  if (template) return template;
  const gltf = await new GLTFLoader().loadAsync(ASSET_URL);
  const animated = gltf.animations || [];
  let bones = 0, skins = 0, meshes = 0;
  gltf.scene.traverse(o => {
    if (o.isBone) bones++;
    if (o.isSkinnedMesh) skins++;
    if (o.isMesh) meshes++;
  });
  if (skins < 1 || bones < 4 || animated.length < 1) {
    throw new Error('Le cerf importé ne contient pas un squelette skinné et animé valide.');
  }
  template = { scene:gltf.scene, animations:animated, bones, skins, meshes };
  console.info('[Everwild] Native stag model loaded', { bones, skins, meshes, animations:animated.map(a=>a.name) });
  return template;
}
function findClip(clips, keywords, fallback = null) {
  return clips.find(c => keywords.some(word => c.name.toLowerCase().includes(word))) || fallback;
}
export function createStag() {
  if (!template) throw new Error('prepareStagAsset() must finish before createStag().');
  const root = new T.Group(); root.name = 'Everwild_Moonroot_Stag';
  const pivot = new T.Group(); root.add(pivot);
  const animal = cloneSkinned(template.scene);
  animal.name = 'Rigged_Deer_Original_AnatomicalMesh';
  pivot.add(animal);
  animal.updateMatrixWorld(true);
  const bound = new T.Box3().setFromObject(animal);
  const dimension = new T.Vector3(); bound.getSize(dimension);
  const scale = 2.9 / Math.max(1e-3,dimension.y);
  animal.scale.multiplyScalar(scale);
  animal.updateMatrixWorld(true);
  const recentered = new T.Box3().setFromObject(animal);
  const center = new T.Vector3(); recentered.getCenter(center);
  animal.position.x -= center.x;
  animal.position.z -= center.z;
  animal.position.y -= recentered.min.y - groundHeight;
  animal.traverse(o => {
    if(o.isMesh) {
      o.castShadow = true; o.receiveShadow = true;
      o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();
      const mats=Array.isArray(o.material)?o.material:[o.material];
      for(const m of mats) {
        if(!m || !m.isMeshStandardMaterial)continue;
        m.roughness=Math.max(.78,m.roughness || .8);
        if(m.color)m.color.multiplyScalar(.9);
        m.needsUpdate=true;
      }
    }
  });
  const rigBones=[];
  animal.traverse(o => {if(o.isBone)rigBones.push(o)});
  // GLB deer uses Rigify names like DEF-head, not plain 'head'.
  const head = rigBones.find(b=>(b.userData?.name||b.name)==='DEF-head')
    || rigBones.find(b=>/^(?:DEF[-_])?(?:head|skull)/i.test(b.userData?.name||b.name)) || null;
  // Crown is independent of the source antlers. Its own node follows the source's head
  // bone where the source rig exposes one; otherwise it follows the whole animal root.
  const crown = createArcaneCrown(head || animal);
  if(head) crown.position.set(0,.14,.08);
  else {
    const bounds = new T.Box3().setFromObject(animal);
    crown.position.set(0,(bounds.max.y-bounds.min.y)*.76, bounds.max.z*.42);
  }
  const mixer = new T.AnimationMixer(animal);
  const clips = template.animations;
  const idleClip = findClip(clips,['idle','stand','breathe','rest'],clips[0]);
  const walkClip = findClip(clips,['walk','gait','step'],clips[0]);
  // Author the bounding gait on the original skinned anatomical limb joints.
  // The supplied GLB has only idle/walk; do not fake the run by speeding walk.
  const runClip = createGallopClip(rigBones);
  const grazeClip = findClip(clips,['eat','graze','feed'],idleClip);
  const hitClip = findClip(clips,['hit','hurt','damage'],null);
  const deathClip = findClip(clips,['death','dead','die'],null);
  const clipFor = { idle:idleClip, walk:walkClip, run:runClip, graze:grazeClip, hit:hitClip, dead:deathClip };
  const actions = new Map();
  for(const clip of new Set(Object.values(clipFor).filter(Boolean))) {
    const a=mixer.clipAction(clip);a.enabled=true;
    a.setLoop(T.LoopRepeat,Infinity);
    actions.set(clip,a);
  }
  let selected = null, dead = 0;
  function update(t,dt,state='idle',phase=0,metersPerSecond=0) {
    const target = state==='idle' && Math.sin(t*.31+phase)>.72 ? 'graze' : state;
    // Never keep a breathing/walking animation running through a corpse pose.
    const clip = target==='dead' ? deathClip : (clipFor[target] || idleClip);
    if(clip!==selected) {
      const old=actions.get(selected), next=actions.get(clip);
      if(old && old!==next)old.fadeOut(.25);
      if(next){next.reset().setEffectiveTimeScale(target==='run'?gallopTimeScale(metersPerSecond):1).fadeIn(.20).play();}
      selected=clip;
    }
    if(target==='dead') {
      dead=Math.min(1,dead+dt*2.2);
      if(!deathClip) pivot.rotation.z=-dead*1.13;
      pivot.position.y=-dead*.23;
      if(deathClip) {
        const a=actions.get(deathClip);
        a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true;
      }
    } else {
      dead=0;pivot.rotation.z=0;
      const a=actions.get(clip);
      if(a)a.setEffectiveTimeScale(target==='run'?gallopTimeScale(metersPerSecond):1);
      // Tiny aerodynamic suspension, synchronized to the actual gallop cycle.
      pivot.position.y=target==='run'&&a?gallopBob(a.time):0;
    }
    mixer.update(Math.max(0,Math.min(.07,dt)));
    crown.userData.runeGlow.emissiveIntensity=(target==='dead'?.1:1.15)+.25*Math.sin(t*1.7+phase);
    crown.rotation.z=Math.sin(t*.7+phase)*.008;
  }
  update(0,0,'idle');
  return { mesh:root, update, bones:rigBones, mixer, clipNames:[...clips.map(c=>c.name),runClip.name], gallopClip:runClip, hasSkinnedMesh:true };
}
