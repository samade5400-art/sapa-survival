# Naija Republic server (Phase 0)

Colyseus 0.16 realtime server for the online mode of Sapa Survival 3D.

* Room `lagos` (instance cap 50, more instances open automatically). District (`yaba`/`vi`/`lekki`) is a player field; district chat goes to everyone in your district in the instance.
* Server-authoritative movement: speed limit (115 u/s × 1.6 + slack), map bounds, teleports only to known doors (`anchors.json`, max 1 per 8 s). Bad moves get a `correct` message.
* Server wallet: `job` (pays entry-level career pay × score, must be at the workplace, cooldown), `buy` (server price list), `spend` (positive debits only). Every change goes to `data/ledger.jsonl` — append-only, hash-chained; balances are rebuilt from it at boot. Wallet key = random device id in the browser (no accounts yet).
* Chat: proximity (400 u ≈ 20 m) + district channel (slow mode), quick phrases, emotes. Filters (`src/filter.js`): URLs/"dot com", Nigerian phones (+234…, 0[789][01]…, spaced or spelled out), any 7+ digit run (NUBAN), crypto addresses, @handles, WhatsApp/Telegram/"drop your number", EN+Pidgin scam phrases, profanity/sexual list. Rate limit 1 msg/2 s & 5/10 s; new players: quick phrases only for `TRUST_SECS`. Display-name filter + reserved names.
* Reports → `data/reports.jsonl` (with the target's last 50 messages incl. blocked attempts). Blocked messages → `data/moderation.jsonl`. Joins/leaves → `data/sessions.jsonl`.
* Message flood guard (40 msg/s, kick after repeated floods). 20 s reconnect grace.

## Run
    npm ci && npm start          # ws://localhost:2567, health at /health
    npm test                     # filter unit tests
Env: `PORT`, `DATA_DIR`, `MAX_PLAYERS` (50), `TRUST_SECS` (120), `DISTRICT_SLOW_SECS` (30), `JOB_COOLDOWN_SECS` (90).

Client: `https://samade5400-art.github.io/sapa-survival/?server=wss://YOUR-HOST` (remembered in localStorage). Default is `wss://naija-republic-server.onrender.com` (see `online.js`).

## Deploy free (Render, sign in with GitHub)
1. https://dashboard.render.com → **Sign in with GitHub** (no card needed for the free plan).
2. **New → Blueprint** → choose repo `samade5400-art/sapa-survival` → it finds `render.yaml` → **Apply**.
3. When live, open `https://naija-republic-server.onrender.com/health`. If Render gave another name, play with `?server=wss://<that-name>.onrender.com`.

Free-plan caveats: sleeps after ~15 min idle (first join then takes ~30–60 s), and the disk is ephemeral so the ledger resets on each deploy/restart. Phase 1 moves the ledger to Supabase Postgres.

Alternatives: Docker image (`Dockerfile`) works on Koyeb/Fly/Railway (most now ask for a card), or Colyseus Cloud (paid, from $15/mo).
