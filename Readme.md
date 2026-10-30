# EVERWILD — Les Derniers Bastions

Prototype Godot 4.3+ de survie 2D de profil, direction artistique médiéval-fantastique sombre.

## Lancer

1. Télécharger ou cloner ce dépôt.
2. Ouvrir `project.godot` avec Godot 4.3 ou une version 4.x récente.
3. Lancer la scène principale `scenes/Main.tscn` avec F5.

**État actuel :** les scripts et la scène ont été importés, mais les ressources graphiques PNG n'ont pas été fournies dans l'envoi. Le projet n'a pas encore été testé dans Godot ; il peut afficher des erreurs liées aux textures manquantes.

## Structure

```text
assets/
  sprites/     # à ajouter : idle_00.png, walk_00.png, etc.
  tilesets/    # à ajouter : grass.png, dirt.png, stone.png, wood.png
scenes/
  Main.tscn
scripts/
  Main.gd
  Player.gd
  Survival.gd
  Terrain.gd
project.godot
.gitignore
```

## Commandes

- Clavier : flèches gauche/droite pour marcher, Maj pour courir, bas pour s'accroupir, E miner, F placer, R manger, Espace sauter.
- Mobile : glisser dans la zone inférieure gauche pour se déplacer (haut pour sauter, bas pour s'accroupir) ; boutons d'action à droite.
- Survie : endurance consommée par course et saut ; faim et énergie diminuent ; la santé baisse à zéro de faim ou d'énergie.

## Graphismes et droits

La planche de référence validée n'est pas un spritesheet de cellules uniformes. Des extractions de PNG devront être ajoutées et vérifiées, notamment pour l'alignement des animations et les tuiles 32x32. Aucun statut CC0 n'est présumé pour les visuels ; vérifier leurs droits avant redistribution.

## Statut technique

Scripts présents, sans dépendance tierce déclarée. Exécution réelle dans Godot non confirmée. Le code est réservé au projet Everwild tant qu'aucune licence explicite n'est choisie.
