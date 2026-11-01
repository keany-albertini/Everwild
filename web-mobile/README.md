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
- **Limite d'animation vérifiée :** les paramètres d'import Godot de la source déclarent des animations `deer_male_idle` et `deer_male_walk`, mais pas de galop. La fuite accélère actuellement une marche, elle ne doit pas être présentée comme une animation native de course. La chute après la chasse utilise une pose de repli si le modèle n'a pas de clip de mort.
- Les interactions de chasse à la lance, récupération de viande et de peaux et l'état des ressources épuisées sont conservés.

## Licence de l'animal
La version de travail utilise un **modèle tiers récupéré dans un dépôt GitHub public**. La présence sur GitHub ne suffit pas à autoriser sa redistribution. L'auteur original et la licence de cette conversion doivent être confirmés avant toute diffusion commerciale. Il existe une alternative documentée CC0 chez CDmir (*Old Deer Male*, OpenGameArt, .blend avec rig/animations), à convertir en GLB si le modèle actuel ne peut être licencié. Voir `MOONROOT_STAG.md`.

## Tests
Depuis la racine du dépôt :
- `node web-mobile/qa.mjs` : économie/survie
- `node web-mobile/qa-motion.mjs` : déplacement, obstacles, fuite, mort
- `node web-mobile/qa-real.mjs` : branchement du véritable modèle squeletté
- `node web-mobile/qa-glb.mjs` : téléchargement et inspection des skins/clips du GLB ; **nécessite un accès réseau**
- Les vérifications syntaxiques et les tests sont inscrits dans `.github/workflows/web-mobile-stag-ci.yml`.

**Tests non réalisés ici :** chargement réel sur Chrome Android, rendu GPU, qualité de skinning, clipping des bois, performances FPS et textures. Une vraie animation de galop, une animation de mort et des textures PBR haut de gamme restent à produire/valider.

Les textures de forêt et icônes sont des ressources du prototype ; Three.js est distribué avec sa licence MIT dans le dossier `dist/vendor`. Aucun contenu d'ARK n'a été copié.
