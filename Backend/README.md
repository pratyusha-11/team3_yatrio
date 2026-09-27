# Yatrio — Backend

Express 4 backend for **Yatrio** — currently the express-generator scaffold with a `redis/` folder scaffolded for the booking queue and caching layer.

## Prerequisites

- **Node.js** (18+ recommended for Express 4)
- npm (comes with Node)

## Getting started

All commands below assume your terminal is inside the `Backend` folder:

```bash
# 0. From the repo root, enter the backend folder
cd Backend

# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

The server listens on **http://localhost:3000** (default). Override with the `PORT` env var:

```bash
PORT=4000 npm start
```

Visit http://localhost:3000 — you should see the Express welcome page (rendered by the Jade view engine).

> Hot reload is not wired up yet. If you want auto-restart on file changes, run `npx nodemon` or add a `dev` script with `node --watch ./bin/www` (built into Node 18.11+).

## Scripts

| Command     | What it does                        |
| ----------- | ----------------------------------- |
| `npm start` | Start the server via `./bin/www`    |

## Project structure

```
Backend/
├── app.js               # Express app: middleware + routers + error handling
├── bin/www              # HTTP server bootstrap (reads PORT env var)
├── routes/
│   ├── index.js         # GET / — welcome page
│   └── users.js         # /users router
├── redis/
│   ├── cache.js         # (scaffold) caching layer
│   └── bookingQueue.js  # (scaffold) booking queue
├── views/               # Jade templates
└── public/              # Static assets
```

## API routes

| Method | Path     | Description                          |
| ------ | -------- | ------------------------------------ |
| GET    | `/`      | Express welcome page (Jade template) |
| GET    | `/users` | Users router (stub)                  |

## Notes

- **View engine:** Jade is set up in `app.js`. If the backend will be API-only, the `views/` folder and `jade` dependency can be dropped.
- **Redis:** `redis/cache.js` and `redis/bookingQueue.js` are placeholders — wire up a Redis client and add `redis` to `package.json` when implementing the caching/booking layers.
- **Environment:** `PORT` is currently the only env var read. Secrets/config should live in a `.env` file (gitignored — see repo root `.gitignore`).
