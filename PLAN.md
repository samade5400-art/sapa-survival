# Sapa Survival: 30 Days in Lagos — Plan

## Concept
A single-player, mobile-first survival card game. Your ₦250,000 salary just landed, and you have to survive 30 days of Lagos life: danfo vs Bolt, NEPA, landlords, aso-ebi, black tax, LASTMA, owambe, scams. It takes the fun of *Lagos Life* and drops what went wrong there: **no chat, no paid currency, no shared economy to glitch, no server to crash.**

## Core loop
1. Start a run: **Daily** (same seeded cards for everyone that date, like Wordle) or **Free Play** (random seed).
2. Each day gives 1–2 event cards. Each card has 2–3 choices that change your stats.
3. End of day: −₦3,500 for food and transport, +6 Energy, +1 Family Pressure.
4. The run ends at Day 30, after 3 days in a row with Money below ₦0, or when Peace hits 0.
5. End screen: score, Sapa Level with a title, Share (1080×1920 PNG + emoji text), Play again.

## Stats
| Stat | Start | Notes |
|---|---|---|
| Money ₦ | 250,000 | 3 days in a row below 0 = game over. Each broke day also costs −5 Peace |
| Energy | 70 | At 0, you lose 8 Peace a day |
| Peace of Mind | 70 | At 0 = game over |
| Respect/Status | 50 | Adds to score |
| Family Pressure | 30 | Higher is worse. At 90+, you lose 8 Peace a day |

## Scoring
`score = day×100 + money/1000 + peace + respect + energy − family (+500 if you survive all 30 days)`
**Sapa Level** (0 = Big Boss, 10 = Sapa Generational Champion) comes from money left (up to ₦150k), Peace, and whether you survived. Each level has an English and a Pidgin title. Your best score is saved in localStorage.

## MVP (done)
- 65 bilingual event cards in `events.js`
- Daily seed + Free Play
- EN/Pidgin toggle
- Share card + copy text
- Simple beep sounds
- Best score saved in localStorage

## Later features
1. **Leaderboard (Supabase):** a `scores` table (date, nickname, score, choices log). Re-run the choices log against the daily seed on the server (an Edge Function) so nobody can fake a score. Nicknames only, filtered by a word list.
2. **Friend challenge links:** `?seed=abc123` puts a friend on the same cards. "Beat my 3,868."
3. **Creator-submitted cards:** a form leads to a moderation queue (Supabase + a Notion/Airtable review step). Approved cards are credited "Card by @handle".
4. **Sponsored cards:** clearly labelled "Sponsored" cards, at most 1 per run, never a scam or gambling brand, and never pay-to-win.
5. More: monthly events (rent day, salary day), achievements, PWA offline install, Yoruba/Igbo/Hausa text, music.

## Tech stack
Plain HTML/CSS/JS with no build step and no framework. Files: `index.html`, `style.css`, `game.js`, `events.js`. A non-programmer can edit cards in `events.js`: copy any line and change the text and numbers.

## Deploy free
- **Netlify Drop:** go to app.netlify.com/drop and drag the `sapa` folder in. It's live in about 30 seconds.
- **Vercel:** push to GitHub, click "Import Project", choose Framework: Other, then Deploy.
- **GitHub Pages:** create a repo, upload the files, then Settings → Pages → Branch: main / root.

## Safety choices
- No chat, no DMs, no user-generated text in the game, so no scams or adult content can show up.
- No real money and no loot boxes. Sponsored cards (later) are labelled and limited.
- No accounts or personal data. Only localStorage.
- Cards make fun of the situation, never of a tribe, religion, or the poor. Some cards teach good habits (report the BVN scam SMS, know your rights at checkpoints, report loan-app harassment to FCCPC).
- Leaderboard (later): nicknames only, profanity filter, scores checked on the server.

## 7-day YouTube build series
1. **Day 1 – The Idea:** why Lagos Life went viral and what broke. Sketch the game on paper.
2. **Day 2 – AI builds the prototype:** first playable version. Play it live and react.
3. **Day 3 – Writing the cards:** a Pidgin writing session with friends/family. Funniest-card contest.
4. **Day 4 – Make it pretty:** danfo-yellow design, sounds, share card.
5. **Day 5 – Daily mode + launch:** deploy on Netlify, post the link, and get viewers to share their Sapa Level.
6. **Day 6 – Leaderboard:** Supabase, plus stopping cheaters.
7. **Day 7 – Community cards:** viewers submit cards. Reveal the stats (plays, most-chosen choices) and what comes next.

## v2 — Lagos World (Oct 2026)
Root `index.html` + `world.js` + `world.css`: 2D top-down canvas life-sim across Yaba, VI, Lekki. v1 card game moved to `challenge/` (Sapa Challenge, opened from in-game phone); `events.js` shared.

## v3 — 3D Lagos Life (Three.js r160 via importmap, no build step)
- `r3d.js`: renderer (low-poly procedural city, instanced palms/lamps, merged-geometry danfos/okadas, water shader, sky/sun/moon/stars, shadows, interiors + furniture).
- `world.js`: game logic (ES module). Save key `sapa_world_v3`; v2 saves (`sapa_world_v2`) are migrated automatically.
- New: vehicle collisions (death → General Hospital respawn with bill, death counter), zebra crossings (drivers stop), honk + brake, walkable interiors, title/loading screens, WebAudio SFX, speech bubbles, tutorial, minimap, graphics quality setting.
- Test: `node /workspace/t/v3.js [url]`.
