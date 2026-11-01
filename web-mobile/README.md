# Everwild — forêt des brumes (web mobile 3D)

Première tranche jouable indépendante de la base Godot existante. Three.js 0.180.0 (MIT), JavaScript modulaire et ressources locales. Aucun compte de jeu ni serveur requis. Pas de ressource distante nécessaire au fonctionnement.

## Jouer

Servir le dossier `dist/` avec un serveur HTTP statique (ex. `python3 -m http.server 8080 --directory dist`). Ouvrir le lien dans Chrome Android ou un navigateur de bureau compatible WebGL 2. Le fichier ne s'exécute pas directement sous `file://` à cause des modules JavaScript.

Mobile : joystick gauche, glisser sur le décor pour regarder, Récolter pour exploiter la cible, Saut et Courir. Paysage recommandé. PC : WASD/ZQSD, glisser pour regarder, E pour récolter, Maj pour courir, Espace pour sauter, I pour le sac, 1–4 pour les outils, Échap pour la pause.

## Cette version

- Terrain 3D en relief, arbres et rochers texturés, feuillage alpha, brume, éclairage et ombres.
- Collisions horizontales avec troncs et roches, gravité et saut.
- Bois et pierre à mains nues ; fibres et baies sur les buissons ; minerai de fer avec une pioche.
- Hache, pioche et lance fabriquées avec des coûts réels. Récolte plus efficace avec l'outil adapté.
- Cerfs en fuite, chasse à la lance, viande et peaux ; feu de camp et cuisson.
- Vie, endurance, faim, soif, poids ; eau à la source. Sauvegarde locale automatique toutes les 30 secondes et manuelle. Continuer recharge les ressources épuisées, outils, statistiques et feux.
- Trois résolutions de rendu, commandes tactiles, interface compacte.

## Validation et limites

`npm test` vérifie les règles de récolte, l'exigence de pioche, les coûts de fabrication, l'épuisement des ressources, la nourriture, l'endurance et la restauration des sauvegardes. Les fichiers JavaScript passent le contrôle syntaxique Node.

Le navigateur de QA de cette session a WebGL désactivé. Le démarrage de l'interface et la récolte vers l'inventaire sont vérifiés dans un banc de test qui remplace uniquement le renderer (banc non livré). Le rendu GPU, les performances, le toucher multipoint réel et la compatibilité Android physique restent à confirmer. Aucune promesse de 60 FPS.

Il s'agit d'un prototype jouable, pas d'un jeu AAA achevé. Faune en cartes 2D animées placées dans la scène 3D, sans modèles squelettiques ; outils géométriques temporaires, pas de bras humains animés. Pas encore de construction de maisons, ennemis, multijoueur, terrain destructible ou monde à biomes. Le minerai est récoltable mais la forge n'est pas encore intégrée. Le feu utilise une flamme simplifiée. Les arbres épuisés disparaissent, sans animation d'abattage. Le repos et la cuisson sont instantanés. Mort : retour à la clairière avec inventaire conservé.

## Sources des ressources

Textures de sol, écorce, bouleau, roche et feuillage générées pour ce projet avec l'outil de création d'images OpenAI. Brief : atlas quatre matériaux forestiers photoréalistes et feuillage de chêne détouré, palette désaturée. Fougères, buissons, icônes d'outils et cerfs : ressources générées lors des étapes précédentes de Survival Test 1. Aucun asset d'ARK ou du jeu Everwild de Rare n'est utilisé. Bibliothèque Three.js sous licence MIT incluse dans `dist/vendor/THREE-LICENSE.txt`.

Les fichiers `dist/main.js`, `world.js`, `economy.js` séparent l'orchestration, le monde et les règles de survie. `dist/` contient la version navigateur prête à servir. `prepare.cjs` était un script de préparation local et n'est pas nécessaire à l'exécution.
