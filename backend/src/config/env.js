'use strict'

require('dotenv').config()

/**
 * Env loading with validation.
 *
 * RAZORPAY_KEY_SECRET must never leave the server. It is deliberately absent
 * from every VITE_* variable — Vite inlines those into the browser bundle, so
 * a secret there would be public. See ../../SECURITY.md.
 *
 * A missing key is a WARNING, not a process exit. One server now serves all
 * seven teams, and the payment routes are mounted alongside auth, stations and
 * admin — killing the process here would take every other team's API down
 * because Team 5's keys were not filled in. Payment requests fail loudly
 * instead; the rest of the backend carries on working.
 */

const required = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']

const missing = required.filter((key) => !process.env[key])

if (missing.length) {
  console.warn(
    '\n  [Yatrio] Razorpay keys are not configured:\n' +
      missing.map((k) => `    - ${k}`).join('\n') +
      '\n  Payment endpoints will refuse to work until you fill them in.\n' +
      '  Copy backend/.env.example to backend/.env and get test keys from\n' +
      '  Razorpay Dashboard > Account & Settings > API Keys.\n' +
      '  Every other endpoint is unaffected.\n',
  )
}

const isPlaceholder = (v) => !v || /XXXX|your_|placeholder/i.test(v)

const placeholderKeys = required.filter((k) => isPlaceholder(process.env[k]))

if (placeholderKeys.length) {
  console.warn(
    `\n  [Yatrio] Razorpay keys still look like placeholders (${placeholderKeys.join(', ')}).` +
      ' Payments will fail until you paste real test keys into backend/.env\n',
  )
}

module.exports = {
  port: Number(process.env.PORT ?? 5000),

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  cors: {
    origins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  /** Razorpay recommends capping retries; the frontend mirrors this. */
  maxAttempts: Number(process.env.MAX_PAYMENT_ATTEMPTS ?? 4),

  /** Yatrio's order lifetime, aligned with Team 4's reservation window. */
  orderTtlMinutes: Number(process.env.ORDER_TTL_MINUTES ?? 30),

  /** 'pretty' (boxed) or 'json' (one line per event). */
  paymentLogFormat: process.env.PAYMENT_LOG_FORMAT === 'json' ? 'json' : 'pretty',

  /**
   * The project's shared MySQL.
   *
   * Discrete variables rather than one DATABASE_URL, so each is greppable and
   * overridable on its own. The host hands out a Service URI — split it across
   * these five and drop the `?ssl-mode=REQUIRED`, which the driver does not
   * understand. DB_SSL and DB_SSL_CA below do that job instead.
   *
   * The password is only ever read from .env, which is gitignored; nothing here
   * reaches a VITE_* variable.
   */
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME || 'yatrio',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    dialect: process.env.DB_DIALECT || 'mysql',

    /** TLS on by default: managed MySQL hosts (Aiven included) require it. */
    ssl: process.env.DB_SSL ? /^(1|true|yes)$/i.test(process.env.DB_SSL) : null,
    /**
     * Managed providers hand out a private CA that is not in Node's trust
     * store, so verification fails until you point DB_SSL_CA at the PEM. With a
     * CA configured we can and do verify; without one we cannot, and saying so
     * is better than a connection error nobody can explain.
     */
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED
      ? /^(1|true|yes)$/i.test(process.env.DB_SSL_REJECT_UNAUTHORIZED)
      : Boolean(process.env.DB_SSL_CA),
    sslCa: process.env.DB_SSL_CA || null,

    poolMax: Number(process.env.DB_POOL_MAX ?? 5),
    /** Off by default — services/paymentStore.js already emits payment events. */
    logging: process.env.DB_LOGGING ? /^(1|true|yes)$/i.test(process.env.DB_LOGGING) : false,
  },

  isMockRazorpay: placeholderKeys.length > 0,
}