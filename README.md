# 🥊 Boxing Training App

App de timer pour sessions de boxe intensive avec suivi de progression multi-joueurs.

## Fonctionnalités

- **Timer de boxe** — 12 rounds de 3 min avec 1m30 de repos
- **Countdown rouge** — les 5 dernières secondes de repos avec décompte visuel + cloche de reprise
- **Sons intégrés** — cloche de fin de round, ticks de countdown, double cloche de reprise
- **Liens Spotify** — chaque round a un lien vers le morceau sur Spotify
- **Suivi de progression** — log tes séances et records
- **Multi-joueurs** — ajoute des membres (ex: Théo) et suis leur progression
- **Courbes** — graphiques de progression cumulée, séances/semaine, répartition par type, évolution des records
- **Données persistantes** — tout est sauvegardé entre les sessions

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'app s'ouvre sur http://localhost:3000

## Build production

```bash
npm run build
```

Les fichiers sont générés dans le dossier `dist/`.

## Structure

```
boxing-training-app/
├── index.html          # Point d'entrée HTML
├── package.json        # Dépendances
├── vite.config.js      # Config Vite
├── public/             # Assets statiques
│   └── music/          # <- Déposer les MP3 ici (à venir)
├── src/
│   ├── main.jsx        # Bootstrap React + polyfill storage
│   └── App.jsx         # Application complète
└── README.md
```

## Musique (à venir)

Un dossier `public/music/` est prévu pour accueillir les fichiers MP3.
Dépose tes fichiers et ils seront intégrés directement dans le player.

## Stack

- React 18
- Recharts (graphiques)
- Vite (bundler)
- Web Audio API (sons)
