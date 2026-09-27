# Yatrio — Frontend

React 19 + Vite 8 frontend for **Yatrio**, styled with Tailwind CSS v4 and the Yatrio brand kit (Poppins, Yatrio blues, official logos).

## Prerequisites

- **Node.js 20.19+** (or 22.12+) — required by Vite 8
- npm (comes with Node)

## Getting started

All commands below assume your terminal is inside the `Frontend` folder:

```bash
# 0. From the repo root, enter the frontend folder
cd Frontend

# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Vite starts on **http://localhost:5173** by default. If the port is taken, Vite automatically picks the next free one — check the terminal output for the actual URL.

> The backend (`../Backend`) runs separately on port 3000. The frontend doesn't depend on it yet, so you can run the frontend standalone.

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start dev server with hot module reload   |
| `npm run build`   | Production build → `dist/`                |
| `npm run preview` | Serve the production build locally        |
| `npm run lint`    | Lint the codebase with ESLint             |

## Project structure

```
Frontend/
├── index.html              # Entry HTML (loads /src/main.jsx)
├── vite.config.js          # Vite + React + Tailwind plugins
├── public/
│   └── favicon.png         # Azure Yatrio monogram
└── src/
    ├── main.jsx            # React root
    ├── App.jsx             # Welcome / setup-verification page
    ├── index.css           # Tailwind import + Yatrio brand tokens
    └── assets/brand/       # Brandkit assets (logos + Poppins woff2)
```

## Brand kit (`@/brandkit`)

The shared brand kit lives at repo root in [`../brandkit`](../brandkit) — it holds the full brand boards (logo rules, color system, typography) plus source assets. The assets the app needs are copied into `src/assets/brand/` so Vite can bundle them:

- **Logos** — `logo-white.png` (dark surfaces), `logo-mono-navy.png` (light surfaces), `logo-azure.png` (favicon)
- **Fonts** — Poppins 400/500/600/700, self-hosted and declared in `index.css`

Brand colors are defined as Tailwind v4 `@theme` tokens in `src/index.css`, so they work as regular utility classes:

| Token            | Class example   | Hex       | Role (brand board 03)       |
| ---------------- | --------------- | --------- | --------------------------- |
| `--color-ink`    | `bg-ink`        | `#071426` | Headlines / dark background |
| `--color-navy`   | `bg-navy`       | `#04275B` | Foundation                  |
| `--color-royal`  | `bg-royal`      | `#014CA9` | Primary action              |
| `--color-azure`  | `text-azure`    | `#0080F8` | Accent — max 10% of layout  |
| `--color-sky`    | `text-sky`      | `#3BB3FD` | Highlight / dot             |
| `--color-fog`    | `bg-fog`        | `#E9EEF4` | Surfaces / dividers         |
| `--color-paper`  | `bg-paper`      | `#F7F9FC` | Light canvas                |

Typography: use `font-display` for the Poppins stack. Logo rules (which variant on which surface, minimum sizes, do/don'ts) are documented in `../brandkit/board2-logo.html`.
