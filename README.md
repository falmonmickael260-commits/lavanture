# Les Mondes de Nour

Jeu d'aventure éducatif local pour le CP, construit avec React, TypeScript et Vite. Les sauvegardes restent sur cet appareil dans IndexedDB. Aucune synchronisation entre appareils n'est active.

## Développement

```bash
npm install
npm run dev
```

## Vérification

```bash
npm test
npm run build
```

## Architecture

- `src/content.ts` : les 50 niveaux et leurs activités.
- `src/progress.ts` : règles de déblocage, récompenses et maîtrise.
- `src/storage.ts` : sauvegarde IndexedDB, migration et import/export.
- `src/App.tsx` : carte, aventure, maison et espace parent.

Les activités validées sont enregistrées séparément pour chaque niveau. Rejouer un niveau permet de s'entraîner sans regagner ses récompenses. Les commandes de déplacement fonctionnent au clavier, au toucher et à la souris.

## Publication

Le projet produit un site statique (`npm run build` → `dist/`). Il peut être hébergé sur GitHub Pages ou un autre hébergeur statique. Utiliser une origine HTTPS stable : le stockage local est lié à l'origine du site. Exporter la sauvegarde depuis l'espace parent avant de changer de navigateur ou d'appareil.
