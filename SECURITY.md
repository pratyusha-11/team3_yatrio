# Security notes — Yatrio payment integration

## Resolved: Razorpay key secret exposed to the browser

**Date:** 2026-10-03
**Severity:** High
**Status:** Configuration fixed. Key rotation outstanding.

### What happened

The Razorpay test key secret was placed in `Frontend/.env` as
`VITE_RAZORPAY_KEY_SECRET`.

Vite inlines **every** variable prefixed `VITE_` into the JavaScript bundle,
whether or not any source file reads it. The secret was therefore published to
every visitor. This was confirmed by building and grepping the output:

```
dist/assets/index-BoeVQDf7.js  ->  contained the key secret
```

### Impact

Anyone who could load the built bundle could:

- mint Razorpay orders
- compute valid `razorpay_signature` values for orders they did not pay for
- forge a "captured" payment response to `POST /api/payment/verify`

This is the exact failure the team assignment calls out under Team 5
*Security*: *"Never expose secret keys to React."*

### Resolution

1. The secret was removed from `Frontend/.env`. Only `VITE_RAZORPAY_KEY_ID`
   remains there — that value is public by design, because Razorpay's Checkout
   modal requires it in the browser.
2. Both keys now live in `backend/.env`, which is gitignored.
3. Signature verification remains server-side in `backend/src/utils/signature.js`.

### Outstanding — rotate the secret

**The secret must be rotated in the Razorpay dashboard before any non-test use.**
It has been present in a build artifact and may have been seen by anyone with
access to that machine or a shared screenshot of the console.

Rotation steps:

1. Razorpay Dashboard → Account & Settings → API Keys → Generate Key.
2. Put the new secret in `backend/.env` as `RAZORPAY_KEY_SECRET`.
3. Leave `RAZORPAY_KEY_ID` unchanged unless the key pair itself is regenerated.
4. Restart the backend. The frontend needs no change — `VITE_RAZORPAY_KEY_ID`
   stays as-is.

These are **test mode** keys, so no real money is at risk. Rotate before going
live.

## Rules for this repository

| Rule | Why |
|---|---|
| Only `VITE_RAZORPAY_KEY_ID` may appear in `Frontend/.env` | It is the one value Razorpay requires in the browser |
| `RAZORPAY_KEY_SECRET` lives in `backend/.env` only | Any `VITE_*` var is published in the bundle |
| Never put an amount in a payment request and trust it | The server derives the fare from the booking record — see `services/fareService.js` |
| Verify `razorpay_signature` against the **stored** `order_id` | The client controls the `razorpay_order_id` it echoes back |
| Compare signatures with `crypto.timingSafeEqual` | A `===` comparison can be probed byte by byte |
| The database password lives in `backend/.env` only, as `DB_PASSWORD` | Same reason as the Razorpay secret — any `VITE_*` var is published in the bundle |
| Raw `razorpay_signature` values are never stored | A signature is replayable next to its payment id; `payments.signature_fingerprint` holds its SHA-256 instead |
| `gateway_response` is redacted before it is written | It carries the gateway's own view of the transaction |
| `.env` and `.env.*` stay gitignored; only `.env.example` is committed | Keeps secrets out of history |
| The CA at `backend/database/certs/aiven-ca.pem` may be committed; the password may not | A root CA is public material — it identifies the server, it does not let anyone in |

## Database credentials

The MySQL password is `DB_PASSWORD` in `backend/.env`, gitignored at
`.gitignore:27`. Before committing anything under `backend/`, confirm with:

```bash
git check-ignore -v backend/.env
git diff --cached --name-only | grep -i "\.env$" && echo "LEAK" || echo "clean"
```

There is **one credential for the whole project** — all seven teams share it.
Rotating it in the Aiven console breaks every team's connection at once, so
announce it before doing it.

### The CA certificate may be committed; keys may not

`backend/database/certs/aiven-ca.pem` is a **certificate**, and a certificate is
public material — the same kind of file a website serves during a TLS
handshake. It holds a name, a validity window and a signature, and no private
key. It cannot decrypt traffic, authenticate anyone to the database, or
impersonate the server, so committing it puts nothing at risk. It is committed
so nobody has to retrieve it from the Aiven console by hand.

What must never reach the repository is any private key — the CA's own key, a
client certificate paired with its key, an SSH key — and any `my.cnf`/`my.ini`
that carries the password:

```bash
grep -rlE "BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY" --exclude-dir=node_modules . \
  && echo "REVIEW" || echo "clean"
```

The connection is TLS and **verified**: `DB_SSL_CA` points at Aiven's root CA
and `DB_SSL_REJECT_UNAUTHORIZED` defaults to `true` whenever a CA is configured,
so the server's certificate is checked rather than merely trusted. Turning that
off (`DB_SSL_REJECT_UNAUTHORIZED=false`) means an attacker who can intercept the
connection can present any certificate and read every payment row — set it only
while debugging, and never in a deployed environment.

## Checking for a leak

```bash
cd Frontend
npm run build
grep -r "RAZORPAY_KEY_SECRET\|YOUR_KEY_SECRET" dist/ && echo "LEAK" || echo "clean"
```

Any hit is a stop-the-line problem, not a warning.