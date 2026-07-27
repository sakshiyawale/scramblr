# Scramblr

A timed word-unscramble game with a built-in subscription-conversion experiment, inspired by the NYT Games CASH squad's approach to monetization.

Unscramble the shuffled word before the timer runs out. Difficulty ramps up as your score climbs. Behind the scenes, an **Engagement Debt Model** tracks how much value you've gotten from the free tier and decides *when* to show a subscription prompt and *which* surface to point you at — a free trial, a paid subscription, or the mobile app — based on how engaged you actually are.

## How the Engagement Debt Model works

Every action earns **Value Points (VP)**, which accumulate forever (until reset):

| Action | VP |
|---|---|
| Game completed | +2 |
| Personal best beaten | +5 |
| 3-day return streak | +8 |
| Hint used | +1 |
| Expert mode attempted (locked) | +10 |
| Score shared | +3 |

Crossing a VP threshold opens a **conversion window** — a one-time prompt shown at the next natural game-end moment, open for 3 days before it expires unseen:

| Window | Threshold | Prompt | Destination |
|---|---|---|---|
| 1 — Early Engagement | 10 VP | "Try Games+ Free" | Free trial signup |
| 2 — Deep Engagement | 25 VP | "Unlock Expert Mode" | Subscription checkout |
| 3 — Power User | 50 VP | "Get the App" | App Store / Play Store |

Higher windows take priority — a player who jumps from 5 to 30 VP in one session skips Window 1 and goes straight to Window 2. Thresholds and VP weights live in [`src/lib/value-engine.ts`](src/lib/value-engine.ts).

## Features

- **Core game**: 15-second rounds, four difficulty tiers (Easy → Expert), hints, streaks, personal bests.
- **PIN-protected profiles**: multiple players can share one device. Each profile is a name + a 4-digit PIN (no signup, no password) — history persists per profile, profiles can be switched or deleted (PIN required to delete), and any profile's score/VP/history can be reset independently.
- **Simulated checkout**: picking a paid plan walks through a mock card-entry flow (Window 2 prompt or the manual Upgrade button) — no real payment is processed.
- **Share score card**: end-of-game screen generates a canvas-rendered score card (score, best, VP, difficulty) that can be downloaded as a PNG or shared via the native share sheet / X / Facebook / WhatsApp; sharing awards the "score shared" VP once per game.
- **Analytics dashboard**: VP distribution, conversion rate per window vs. target, destination/platform breakdown, with a demo-wide reset.

## Tech stack

- **Frontend**: React 18 + TypeScript, Tailwind CSS, Vite
- **API**: Express, served as a Vercel serverless function in production ([`api/[...path].js`](api/[...path].js) → [`server/index.js`](server/index.js))
- **Persistence**: local JSON file in dev, Upstash Redis (via Vercel's Marketplace integration) in production — see [`server/store.js`](server/store.js)
- **Testing**: Jest, covering the VP engine and window logic ([`tests/value-engine.test.ts`](tests/value-engine.test.ts))

## Running locally

```bash
npm install
npm run dev:all   # starts the Vite dev server (5173) and the Express API (4000) together
```

Other scripts:

```bash
npm run dev      # frontend only
npm run server   # API only
npm run build    # type-check + production build
npm test         # run the Jest suite
npm run lint     # ESLint
```

No environment variables are required locally — without Redis credentials set, the API falls back to a local JSON file at `data/store.json`.

## Deploying

The app deploys as a single Vercel project — the React build and the API function share one domain, so there's no CORS or cross-origin proxy to configure.

1. Import the repo into Vercel (framework and build settings are picked up from `vercel.json`).
2. Add a Redis database from the Vercel Storage tab (Upstash's Marketplace integration has a free tier) and connect it to the project. This injects `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, which `server/store.js` picks up automatically.
3. Deploy. Without a connected Redis database, the API still runs but state won't persist between serverless invocations.

## Project structure

```
src/
  components/Game/       ScrambledWord, Timer, ScoreBoard, Keyboard, GameScreen
  components/Prompt/     PromptModal, Window1/2/3Prompt, UpgradeModal, PaymentForm
  components/Dashboard/  ExperimentStats, VPHistogram, WindowConversion
  components/Profile/    ProfilePicker, ProfileSetup
  components/Share/      ShareModal
  context/GameContext    game state, score, streak, difficulty
  context/ValueContext   VP accumulation, window eligibility, per-profile persistence
  lib/value-engine.ts    VP scoring, window thresholds and priority logic
  lib/profile.ts         local-storage-backed multi-profile store (name + 4-digit PIN, no real auth)
  lib/shareCard.ts       canvas-rendered shareable score card
  lib/signals.ts         behavioral event tracking
  lib/words.ts           word list by difficulty tier
  lib/scramble.ts        word shuffling
server/
  index.js                Express routes (events, scores, results, reset)
  store.js                storage abstraction: local JSON file (dev) or Upstash Redis (prod)
api/
  [...path].js            Vercel serverless entry point, wraps the Express app
```
