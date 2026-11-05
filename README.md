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

Pour le test réel dans Chrome, lancer `npm run dev`, puis `npm run test:browser` dans un autre terminal. Chrome doit être installé sur l’ordinateur, ou son chemin renseigné dans `CHROME_PATH`.

## Architecture

- `src/content.ts` : les 50 niveaux et leurs activités.
- `src/progress.ts` : règles de déblocage, récompenses uniques et indices de maîtrise.
- `src/storage.ts` : sauvegarde IndexedDB, migration et import/export.
- `src/App.tsx` : carte, aventure, maison et espace parent.

Les activités validées sont enregistrées séparément pour chaque niveau. Rejouer un niveau permet de s'entraîner sans regagner ses récompenses. Les commandes de déplacement fonctionnent au clavier, au toucher et à la souris. Chaque monde propose un guide avec lequel parler et un coffre à découvrir une seule fois.

## Publication

Le projet produit un site statique (`npm run build` → `dist/`). Le workflow `.github/workflows/pages.yml` teste, compile et déploie `main` sur GitHub Pages lorsque la source Pages du dépôt est configurée sur **GitHub Actions**. Utiliser une origine HTTPS stable : le stockage local est lié à l'origine du site. Exporter la sauvegarde depuis l'espace parent avant de changer de navigateur ou d'appareil.

Cette première version comporte les 50 niveaux jouables et les cinq mondes. Les illustrations sont des SVG créés pour le projet. Une revue pédagogique avec une enseignante de CP reste recommandée avant une utilisation régulière, notamment pour l’ordre d’introduction des graphies et des mots.
