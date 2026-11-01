# Everwild Mobile — Moonroot Stag (rigged GLB proof of concept)

This branch replaces the old spheroid/cylinder deer used by the playable 3D forest.
The new creature renderer **loads an actual UV-meshed, skinned, animated glTF/GLB asset**, creates four independent skeletal copies using `SkeletonUtils.clone`, drives `AnimationMixer`, and adds a separate fantasy Moonroot crown with emissive runes.

## Asset provenance and release status
- Prototype model: `https://github.com/Alexander-Jordan/mitt-spel-om-bibeln/tree/eedee2ecb19019f90bad7aa71cc9679aa0665bb9/assets/models/animals/deer`.
- The repo is publicly reachable; the original artist and redistributable license **have not been verified** for this specific conversion. Do not treat public hosting as an asset license. Do not ship commercially until the source's license is confirmed or substitute a verifiably CC0 model.
- Verified CC0 alternatives to evaluate: CDmir's *Old Deer Male* (rigged, textured, animated .blend) on https://opengameart.org/content/old-deer-male ; Quaternius' *Ultimate Animated Animal Pack* (glTF) on https://quaternius.com/packs/ultimateanimatedanimals.html .
- Current loader expects at least 1 skinned mesh, 4 bones, and an animation. Failing the external load leaves wildlife absent instead of reverting to geometric fake deer. Other survival systems continue.
- This is a **rigged integration prototype**, not a fully custom-sculpted AAA-quality model. Its skin weight quality, UV maps, skeleton hierarchy and live mobile rendering still need direct inspection in Blender/browser.

## Runtime
`dist/stag-real.js` provides `prepareStagAsset()` and `createStag()`. Loading must complete before spawning animals in `dist/world.js`; original harvest/hunt interactions still target their meshes. GLTFLoader, SkeletonUtils and BufferGeometryUtils are vendored from Three.js r180, matching the project's Three.js 0.180 package.

## Test scope
`node qa-real.mjs` checks the connection at source level. It cannot prove the binary glTF loads, animations move correctly, or mobile FPS; verify these in a browser and replace/optimize the base model if necessary.
