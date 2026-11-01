# Everwild — forêt des brumes (prototype WebGL mobile)

Une tranche jouable de survie 3D en navigateur (Three.js 0.180, WebGL 2) avec exploration, collecte, artisanat, faim/soif, chasse, feux et sauvegarde locale. La direction artistique demeure médiéval-fantastique semi-réaliste. Ceci n'est **pas** un jeu AAA achevé.

## Jouer / tester
Servir `web-mobile/dist/` avec un serveur statique, par exemple depuis `web-mobile` : `python3 -m http.server 8080 --directory dist`. Dans le navigateur : `http://localhost:8080`. En mobile, utiliser une URL HTTP(S) accessible au téléphone, avec WebGL 2. Ouvrir directement `index.html` via `file://` ne fonctionne pas avec les modules.

Téléphone : joystick gauche, glisser sur le décor à droite pour regarder, courir/sauter/récolter. PC : ZQSD/WASD, E pour interagir, Maj pour courir, Espace sauter, I sac, Échap pause.

## Faune 3D — branche feature/rigged-fantasy-stag
- L'ancien cerf construit avec sphères et cylindres reste dans `dist/stag.js` comme archive, mais **n'est plus utilisé par le monde**.
- `dist/stag-real.js` charge un véritable modèle GLB (maillage, peaux, os et animations) depuis une URL GitHub externe figée, cloné avec `SkeletonUtils`; des ramures Moonroot légèrement lumineuses sont ajoutées.
- `dist/stag-motion.js` pilote la fuite face au joueur, l'évitement des obstacles, la marche lente, le repos et le retour dans son territoire.
- Le chargement du GLB est asynchrone, limité à 12 secondes : si le modèle est indisponible, le jeu de survie démarre quand même, sans cerfs, au lieu de rester bloqué.
- **Nouveau véritable cycle de galop original Everwild :** `dist/stag-gallop.js` génère un `AnimationClip` sur 16 articulations anatomiques de déformation (épaules, cuisses, genoux, pieds et sabots), plus six os du dos, de la tête et de la queue. Les membres postérieurs prennent de l'avance sur les antérieurs, avec légère dissymétrie gauche/droite et une suspension discrète. La cadence de l'animation est liée à la vitesse de fuite mesurée (`motion.speed`, référence 3,7 m/s). Le fichier source GLB ne contient toujours que `deer_male_idle` et `deer_male_walk` : **le galop est une animation propre au jeu**, pas un clip issu du modèle tiers. Le rendu en situation doit encore être contrôlé pour détecter des déformations ou des glissements de sabots. La chute après la chasse utilise une pose de repli faute de clip natif de mort.
- Les interactions de chasse à la lance, récupération de viande et de peaux et l'état des ressources épuisées sont conservés.

## Licence de l'animal
La version de travail utilise un **modèle tiers récupéré dans un dépôt GitHub public**. La présence sur GitHub ne suffit pas à autoriser sa redistribution. L'auteur original et la licence de cette conversion doivent être confirmés avant toute diffusion commerciale. Il existe une alternative documentée CC0 chez CDmir (*Old Deer Male*, OpenGameArt, .blend avec rig/animations), à convertir en GLB si le modèle actuel ne peut être licencié. Voir `MOONROOT_STAG.md`.

## Tests
Depuis la racine du dépôt :
- `node web-mobile/qa.mjs` : économie/survie
- `node web-mobile/qa-motion.mjs` : déplacement, obstacles, fuite, mort
- `node web-mobile/qa-gallop.mjs` : animation 3D de galop, quatre pattes, 22 articulations et synchronisation des foulées
- `node web-mobile/qa-real.mjs` : branchement du véritable modèle squeletté
- `node web-mobile/qa-glb.mjs` : téléchargement et inspection des skins/clips du GLB ; **nécessite un accès réseau**
- Les vérifications syntaxiques et les tests sont inscrits dans `.github/workflows/web-mobile-stag-ci.yml`.

**Tests non réalisés ici :** chargement réel sur Chrome Android, rendu GPU, qualité de skinning, clipping des bois, performances FPS et textures. Le nouveau galop squelettique est créé et testé côté moteur, mais sa qualité visuelle sur un vrai cerf ne peut pas encore être garantie. Une animation de mort complète et des textures PBR haut de gamme restent à produire/valider.

Les textures de forêt et icônes sont des ressources du prototype ; Three.js est distribué avec sa licence MIT dans le dossier `dist/vendor`. Aucun contenu d'ARK n'a été copié.
