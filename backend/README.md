# Yatrio — Backend

One Express server for all seven teams. The API is versioned under `/api/v1`,
and each team owns its own slice of `src/` and its own part of the schema.

| Team | Module | Lives in | Base path |
| --- | --- | --- | --- |
| T1 | Auth & Users | `src/controllers/authController.js` | `/api/v1/auth`, `/api/v1/users` |
| T2 | Railway Search | `src/controllers/stationController.js`, `trainController.js` | `/api/v1/stations`, `/api/v1/trains` |
| T5 | Payment | `src/controllers/paymentController.js` | `/api/v1/payments` |
| T7 | Admin & Analytics | `src/controllers/adminController.js`, `analyticsController.js`, `reportController.js`, `monitoringController.js` | `/api/v1/admin` |
| all | Health | `src/server.js` | `/api/v1/health` |

Teams 3, 4 and 6 have not landed their API work yet. The payment module depends
on Team 4's booking service; until it exists, `src/services/payment/bookingService.js`
serves two seeded bookings from memory.

## Running it

```bash
cd backend
npm install
npm start          # or: npm run dev  (nodemon)
```

```bash
GET http://localhost:5000/api/v1/health
```

Copy `.env.example` to `.env` and fill it in. It needs `DB_*` for the database,
`JWT_SECRET` for auth, and the Razorpay test keys for payment.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the server |
| `npm run dev` | Start with nodemon |
| `npm test` | Team 5 payment flow — 10 cases, no database needed |
| `npm run test:db` | Team 5 schema — 21 cases against the live MySQL |
| `npm run db:migrate` | Apply **both** schemas — raw SQL first, then Sequelize |
| `npm run db:migrate:raw` | Just the raw SQL migrations |
| `npm run db:seed` | Railway data, admin user and payment demo data |
| `npm run db:reset` | Migrate and seed from scratch |
| `npm run db:shell` | MySQL client on this database, TLS already set up |

## One database layer

Every team reads and writes through a single Sequelize instance in
`src/config/database.js` — one connection pool, one TLS configuration, one
place credentials are read. Sequelize drives the `mysql2` driver, so the whole
project shares both.

`src/config/db.js` sits on top of it and keeps the mysql2-shaped surface the
other teams already call:

```js
const pool = require('../config/db');
const [rows] = await pool.query('SELECT ... WHERE id = ?', [id]);
```

Two details it handles, so no call site has to:

- **Stored procedures.** Sequelize's query API flattens a `CALL`'s result sets
  to the first row. Procedures run on the connection Sequelize manages, so
  callers get the driver's original `[results, fields]` back.
- **Transactions.** `db.transactionHandle(t)` gives a connection-shaped handle
  with `beginTransaction` / `commit` / `rollback` / `release`; Sequelize's
  `transaction()` wrapper still decides when to commit or roll back.

The only place that opens a connection outside Sequelize is
`src/scripts/runMigrations.js`, and only because it has to `CREATE DATABASE`
before a schema exists and needs `multipleStatements` for the raw SQL files —
a flag the application's own pool should not carry.

### Two migration systems, deliberately

There is one database and two ways of evolving it, because the teams arrived at
it independently:

| | Teams 1, 2, 7 | Team 5 |
| --- | --- | --- |
| Migrations | `migrations/0NN_*.sql`, raw SQL | `database/migrations/*.js`, Sequelize |
| Runner | `src/scripts/runMigrations.js` | `sequelize-cli` |
| History table | none | `sequelize_meta` |
| Charset | declared per table | inherited, then aligned by migration |

`npm run db:migrate` runs both, in that order. They never touch the same
folder, so running one cannot disturb the other. But they do share a schema, so
**two rules matter**:

1. **Never edit an applied migration, in either system.** Add a new one.
2. **Mind the numbering.** Team 5's migrations are named `2026010100000N` so
   they sort after anything the other teams add later.

### Charset and collation

The schema is `utf8mb4_unicode_ci` throughout. That is not cosmetic: a stored
procedure captures the database's collation when it is *created*, so if the
tables and the procedures disagree, every comparison inside fails with
`Illegal mix of collations`. Two places enforce it —
`src/scripts/runMigrations.js` sets the database default, and migration
`20260101000008` converts the payment tables and rebuilds their procedures,
triggers and views. If you add DDL that compares text, rebuild it after any
collation change.

### Against the hosted database

`backend/database/README.md` is the full guide: connection details, table
ownership across all seven teams, and how to connect with MySQL Workbench or
the `mysql` client.

## Layout

```
backend/
├── src/
│   ├── server.js              # Express app: middleware, mounts, error handler
│   ├── config/
│   │   ├── database.js        # the shared Sequelize instance (all teams)
│   │   ├── db.js              # mysql2-shaped query surface over it
│   │   ├── env.js             # env loading and validation
│   │   └── redis.js
│   ├── controllers/           # one per team module
│   ├── routes/                # <name>Routes.js, mounted under /api/v1
│   ├── middleware/            # auth, admin, rate limiting, request logging
│   ├── models/                # Team 5 Sequelize models
│   ├── services/
│   │   ├── payment/           # fare, booking, razorpay, store (Team 5)
│   │   └── railway/           # search adapter and cache (Team 2)
│   ├── utils/                 # error envelope, HMAC signature, validation
│   ├── validators/
│   └── scripts/               # runMigrations, seedAdmin, seedRailwayData
├── migrations/                # Teams 1, 2, 7 — numbered raw SQL
├── database/                  # Team 5 — Sequelize migrations, seeders, SQL, certs
│   ├── README.md              # the shared database guide
│   ├── migrations/
│   ├── seeders/
│   ├── sql/                   # procedures, triggers, views
│   └── certs/
├── scripts/db-shell.js
├── tests/
│   ├── auth_profile.test.js   # Team 1
│   ├── team2.test.js          # Team 2
│   ├── payment.test.js        # Team 5, offline
│   └── db.test.js             # Team 5, needs MySQL
└── package.json
```

## Errors

Every failure returns the same envelope, so a client never has to guess:

```json
{ "success": false,
  "error": { "code": "NOT_FOUND", "message": "…", "field": null } }
```

The global handler honours a thrown error's own status and code, which is how
Team 5 returns a `409 SIGNATURE_MISMATCH` rather than a blanket 500. A 500 never
leaks internals — it always says "An unexpected internal error occurred".

## Tests

```bash
npm test              # Team 5 payment flow, fully offline
npm run test:db       # Team 5 schema, against the configured database
node tests/team2.test.js        # Team 2 — needs stations/trains tables present
node tests/auth_profile.test.js # Team 1 — needs the users table present
```

Teams 1 and 2's tests read tables created by `src/scripts/runMigrations.js`.
Point `DB_*` at a database where `npm run db:migrate` has been run, or they will
fail with `ER_NO_SUCH_TABLE` — that is a missing-migration problem, not a code
one.

`tests/auth_profile.test.js` additionally expects a user
`hrutujak1910@gmail.com` to already exist. It was written against one
developer's local database, so it fails on a shared one until that row is
seeded. Seed it yourself, or change the fixture to create the user first.