# Boxing Training App

App de timer pour sessions de boxe avec musique integree, suivi de progression multi-joueurs et graphiques.

---

## Comment ca marche (vue d'ensemble)

```
+-------------------+
|    NAVIGATEUR     |
|                   |
|  HomePage         |   -- Page d'accueil avec selection d'entrainement
|  BoxingTimerPage  |   -- Timer avec musique et rounds
|  TrackingPage     |   -- Suivi des seances et records
|                   |
|  localStorage     |   -- Sauvegarde des donnees dans le navigateur
+-------------------+
```

L'application tourne **entierement dans le navigateur**. Il n'y a pas de serveur, pas de base de donnees externe. Toutes les donnees (seances, records, membres) sont sauvegardees dans le `localStorage` du navigateur (un petit espace de stockage integre a Chrome/Firefox/Safari).

---

## Structure du projet

```
sport/
├── index.html          # Page HTML d'entree (charge React)
├── package.json        # Liste des dependances npm
├── vite.config.js      # Configuration du bundler Vite
├── src/
│   ├── main.jsx        # Point d'entree : initialise React + stockage
│   └── App.jsx         # Toute l'application (1843 lignes)
└── public/             # Fichiers statiques (musique, icones)
```

---

## Explication de chaque fichier

### `index.html` — Le point d'entree

C'est le fichier que le navigateur charge en premier. Il est tres simple :

- Definit le fond noir du site (`background: #0a0a0a`)
- Cree une `<div id="root">` vide ou React va injecter l'application
- Charge `src/main.jsx` via une balise `<script>`

Quand tu ouvres `http://localhost:3000`, le navigateur telecharge ce fichier, puis Vite (le bundler) se charge de compiler et injecter le code React.

### `vite.config.js` — La configuration du bundler

**Vite**, c'est un outil qui :
- Compile le code React (JSX) en JavaScript que le navigateur comprend
- Recharge automatiquement la page quand tu modifies un fichier
- Genere un dossier `dist/` optimise pour la production

Ce fichier dit a Vite :
- Utilise le plugin React
- Le chemin de base est `/sport/` (pour le deploiement)
- Le serveur de dev tourne sur le port 3000 et s'ouvre automatiquement

### `package.json` — Les dependances

Liste des librairies utilisees :

| Librairie | A quoi elle sert |
|-----------|-----------------|
| `react` | La librairie pour construire l'interface |
| `react-dom` | Le lien entre React et le navigateur |
| `recharts` | Librairie de graphiques (courbes, barres, etc.) |
| `vite` | Le bundler/serveur de dev |
| `@vitejs/plugin-react` | Plugin pour que Vite comprenne React |

Les commandes disponibles :
- `npm run dev` : lance le serveur de dev
- `npm run build` : compile pour la production
- `npm run preview` : previsualise la version de production

### `src/main.jsx` — L'initialisation

Ce fichier fait 2 choses :

1. **Cree un systeme de stockage** (`window.storage`) : C'est un "wrapper" autour de `localStorage` qui :
   - Prefixe toutes les cles avec `boxing_` pour eviter les conflits avec d'autres apps
   - Fournit des methodes `get`, `set`, `delete`, `list` qui imitent une base de donnees
   - Stocke tout en JSON (JavaScript Object Notation, un format texte pour les donnees)

2. **Lance React** : Rend le composant `<App />` dans la `<div id="root">` du HTML

### `src/App.jsx` — L'application complete (1843 lignes)

C'est le gros fichier. Toute l'app est dedans : les composants, la logique, le style. Voici comment il est organise :

---

#### Les donnees de configuration (lignes du debut)

```javascript
const ROUNDS = [
  { title: "Nothin' On You", artist: "B.o.B ft. Bruno Mars", bpm: 100, ... },
  { title: "Eye Of The Tiger", artist: "Survivor", bpm: 109, ... },
  // ... 10 rounds au total
]
```

Chaque round de boxe a une chanson associee avec son titre, artiste, BPM, genre, fichier MP3 et lien Spotify.

Autres constantes :
- `WORKOUTS` : Les types d'entrainement (Boxing actif, HIIT/Rope/Strength "coming soon")
- `SESSION_TYPES` : Les 6 types de seances (Boxing, Running, HIIT, Strength, Jump Rope, Other)
- `REST_DURATION` : 90 secondes de repos entre les rounds
- `AVATAR_COLORS` : 8 couleurs pour les avatars des membres

---

#### Le hook audio `useAudio()` — Le systeme de sons

C'est un **hook React custom** (une fonction reutilisable). Il utilise la **Web Audio API** du navigateur pour generer des sons :

- `playBell()` : Son de cloche (fin de round) — onde triangulaire a 830Hz
- `playTick()` : Son de tick (countdown) — onde carree a 1200Hz
- `playStart()` : Triple sweep de frequences (debut de session)
- `playGoBell()` : Double cloche (fin du repos, on repart !)
- `playMusic(file)` / `pauseMusic()` / `resumeMusic()` / `stopMusic()` : Lecture de la musique MP3 en boucle

**Comment ca marche :**
La Web Audio API cree un "oscillateur" (un generateur de signal sonore) et le connecte aux haut-parleurs. On controle la frequence (grave/aigu), le type d'onde (triangle = doux, carre = agressif) et la duree. Pas besoin de fichiers audio pour les sons d'interface.

---

#### `HomePage` — La page d'accueil

Ce que tu vois en ouvrant l'app :

- Un titre avec effet de degrader vert ("Tes seances. Ton rythme.")
- 3 stats en haut (programme, duree, repos)
- Des cartes pour chaque type d'entrainement (seul Boxing est actif, les autres sont verrouilles)
- Un bouton "Suivi des seances" pour acceder au tracking

---

#### `BoxingTimerPage` — Le timer de boxe

Le coeur de l'app. C'est un chronometre circulaire avec :

**L'affichage :**
- Un anneau de progression circulaire (`ProgressRing`) qui se remplit
- Le temps restant au centre en gros
- Vert pendant le travail, rouge pendant le repos
- Un badge "Round X" ou "Repos"
- L'equalizer anime quand la musique joue
- Les infos de la chanson en cours (titre, artiste, BPM, lien Spotify)
- La file des 10 rounds en bas (cliquable pour sauter a un round)

**La logique (le `useEffect` principal) :**
```
Toutes les secondes :
  1. Diminue le compteur de 1
  2. Si le compteur atteint 0 :
     - Si c'etait un round de travail → joue la cloche, passe en repos
     - Si c'etait un repos → joue la cloche "go", passe au round suivant
     - Si c'etait le dernier round → arrete tout
  3. Si on est en repos et il reste < 5 secondes → joue un tick
  4. Met a jour le temps total ecoule
```

**Les controles :**
- Play/Pause : demarre ou met en pause
- Skip avant/arriere : passe au round suivant/precedent
- Reset : remet tout a zero

---

#### `TrackingPage` — Le suivi de progression

3 onglets :

1. **Graphiques** (`ChartSection`) :
   - Courbe cumulative des seances par membre (AreaChart)
   - Barres des seances par semaine (BarChart)
   - Repartition par type de seance (barres horizontales)
   - Evolution des records (LineChart)

2. **Seances** :
   - Formulaire pour enregistrer une seance (membre, type, notes)
   - Liste des seances passees avec date relative ("Aujourd'hui", "Hier", etc.)

3. **Records** :
   - Formulaire pour enregistrer un record (membre, categorie, valeur, unite)
   - Liste des records avec emoji trophee

**La persistance :**
Toutes les donnees (membres, seances, records) sont sauvegardees dans `localStorage` via `window.storage`. Quand tu recharges la page, tout est restaure grace au `useEffect` qui lit le stockage au demarrage.

---

#### Le design (CSS inline)

Tout le style est ecrit directement dans le JSX avec l'attribut `style={{...}}`. Le theme :

- **Fond** : Noir/gris tres fonce (`#0a0a0a`, `#0d0d0d`, `#111`)
- **Couleur accent** : Vert Spotify (`#1DB954`)
- **Texte** : Blanc et gris
- **Polices** : Space Mono (monospace) pour le timer, Outfit pour le reste
- **Style** : Minimaliste sombre, inspiration Spotify

---

## Installation

### Prerequis

- **Node.js 18+** installe ([telecharger ici](https://nodejs.org/))
- Un terminal (Terminal sur Mac, CMD/PowerShell sur Windows)

### Etape 1 : Cloner le projet

```bash
git clone https://github.com/sylv1SENG/sport.git
cd sport
```

### Etape 2 : Installer les dependances

```bash
npm install
```

Ca telecharge React, Recharts, Vite et tout ce qu'il faut dans le dossier `node_modules/`.

### Etape 3 : Ajouter la musique (optionnel)

Place tes fichiers MP3 a la racine du projet. Les noms doivent correspondre a ceux definis dans la constante `ROUNDS` de `App.jsx`.

### Etape 4 : Lancer l'app

```bash
npm run dev
```

L'app s'ouvre automatiquement sur **http://localhost:3000**

### Etape 5 : Build pour la production

```bash
npm run build
```

Les fichiers optimises sont generes dans `dist/`.

---

## Stack technique

| Technologie | Role |
|-------------|------|
| React 18 | Interface utilisateur |
| Recharts | Graphiques de progression |
| Vite 5 | Bundler et serveur de dev |
| Web Audio API | Sons (cloches, ticks, sweeps) |
| HTML5 Audio | Lecture de la musique MP3 |
| localStorage | Persistance des donnees |

---

## Comment le code est organise

```
App.jsx
├── Donnees (ROUNDS, WORKOUTS, SESSION_TYPES, AVATAR_COLORS)
├── Utilitaires (formatTime, generateId, formatDate)
├── useAudio() ─── Hook custom pour tous les sons
├── Equalizer ──── Animation visuelle du son
├── ProgressRing ─ Anneau circulaire SVG
├── HomePage ───── Accueil + selection d'entrainement
├── ChartSection ─ Graphiques Recharts (courbes, barres)
├── TrackingPage ─ Suivi des seances + records + membres
├── BoxingTimerPage ─ Timer de boxe avec musique
└── App (principal) ─ Gere la navigation entre les pages
```

Tout passe par le **state React** (via `useState`). La navigation entre les pages se fait en changeant la valeur de `page` ("home", "boxing", "tracking"). Pas de routeur — juste un `if/else` qui affiche le bon composant.
