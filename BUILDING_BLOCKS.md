# Building Blocks and What I Would Do to Get More Subscribers

## Part 1 — Building Blocks

Scramblr is a timed word-unscramble game with a built-in subscription-conversion experiment, inspired by the NYT Games CASH squad's approach to monetization. Unscramble the shuffled word before the timer runs out; difficulty ramps up as your score climbs. Behind the scenes, an **Engagement Debt Model** tracks how much value a player has gotten from the free tier and decides *when* to show a subscription prompt and *which* surface to point them at — a free trial, a paid subscription, or the mobile app — based on how engaged they actually are.

### The Engagement Debt Model

Every action earns **Value Points (VP)**, which accumulate forever until reset:

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

Higher windows take priority — a player who jumps from 5 to 30 VP in one session skips Window 1 and goes straight to Window 2. Thresholds and VP weights live in `src/lib/value-engine.ts`.

### What's shipped

- **Core game** — 15-second rounds, four difficulty tiers (Easy → Expert), hints, streaks, personal bests.
- **PIN-protected profiles** — multiple players can share one device. Each profile is a name + a 4-digit PIN (no signup, no password); history persists per profile, profiles can be switched or deleted (PIN required to delete), and score/VP/history can be reset independently per profile.
- **Simulated checkout** — picking a paid plan walks through a mock card-entry flow (from the Window 2 prompt or the manual Upgrade button); no real payment is processed.
- **Share score card** — the end-of-game screen generates a canvas-rendered score card (score, personal best, VP, difficulty) that can be downloaded as a PNG or shared via the native share sheet / X / Facebook / WhatsApp. Sharing awards the "score shared" VP once per game.
- **Analytics dashboard** — VP distribution, conversion rate per window vs. target, destination/platform breakdown, with a demo-wide reset.

### Tech stack

- **Frontend**: React 18 + TypeScript, Tailwind CSS, Vite
- **API**: Express, served as a Vercel serverless function in production (`api/[...path].js` → `server/index.js`)
- **Persistence**: local JSON file in dev, Upstash Redis (via Vercel's Marketplace integration) in production (`server/store.js`)
- **Testing**: Jest, covering the VP engine and window logic

This is the foundation — a working game, a real (if simulated) monetization funnel, and an analytics loop to measure it. Everything below is what would turn that foundation into something built to actually grow a subscriber base.

## Part 2 — What I Would Do to Get More Subscribers

### Scramblr Daily

The single highest-impact addition would be a daily format where all players get the same 10 scrambled words in the same order, resetting at midnight. The word set would be determined client-side using a date-seeded random function, so no backend changes are needed. At the end of the daily game, players would get a shareable score card:

```
Scramblr Daily #47
Score: 8/10
🟩🟩🟩🟨🟩🟩🟩⬜🟩🟩
```

Green for solved, yellow for solved with a hint, white for timeout. A one-tap copy button lets players share anywhere. This mechanic is the backbone of NYT Games' growth engine. The daily constraint creates habit formation, the shareable card creates social proof and FOMO, and the fixed word set means players can compare scores with friends. Building it into Scramblr would take it from a portfolio demo to something that feels like a real product.

### Accessibility-first Keyboard Navigation

NYT Games takes accessibility seriously across their entire portfolio. A future version of Scramblr would be fully playable with keyboard only and screen reader compatible: auto-focus on the input when a new word appears, logical tab order across all interactive elements, ARIA live regions that announce new words and timer warnings at 10, 5, and 3 seconds remaining without reading every tick, focus trapping inside the subscription modal, and all animations wrapped in a `prefers-reduced-motion` media query. Every interactive element would meet WCAG AA contrast ratios. Most portfolio projects skip accessibility entirely. Getting this right would be a meaningful signal to a team that ships products used by millions of people daily.

### Streak Protection

Miss a day and your streak resets. A future version would offer one streak freeze per week — a safety net that makes the streak feel worth protecting. This is psychologically powerful because losing a streak feels worse than gaining one feels good. For subscribers, streak data would be backed up server-side so it survives app reinstalls and device switches. Free players store streaks in localStorage only, making this a natural and honest reason to subscribe.

### Word Categories

Instead of random words, theme each day's set — Animals, Food, Sports, Science. Players who recognize their category quickly feel smart. Players who struggle are more likely to return tomorrow to improve. Categories also give a natural copy hook for the subscription prompt: "Unlock Expert categories: Architecture, Philosophy, Etymology." The category reveal at the end of each game is also a low-effort shareable moment that drives social distribution.

### Ghost Score

Show a faint ghost of the player's personal best running alongside their current game in real time. Competing against your past self is more motivating than competing against an abstract leaderboard. No backend required — pull the personal best from localStorage and render it as a secondary score indicator. Simple to implement, high psychological impact, and keeps players in flow longer.

### End Screen Momentum

Right after a good game, show more than just the score. Show: "Your best is 12. The top 10% of players score 15+. Play again?" The comparison nudges an immediate retry and deepens session length without any additional feature complexity.

### The Locked Category Tease

Show a padlock on the Expert category with a preview of one scrambled word from it. The player can see the letters but cannot play. Seeing something just out of reach is more effective than describing it abstractly. When the player clicks the locked category, the subscription prompt fires — not as an interruption but as the natural resolution of a frustration they created themselves. This is the highest-converting prompt placement because the desire to unlock is already active before the modal appears.

### Progress Toward Expert

Show a progress bar toward the Expert difficulty threshold with the label "You're at score 12. Expert unlocks at 15." When the player hits 15 and Expert is still locked behind a subscription, the prompt feels earned rather than forced. This mechanic is exactly what the Engagement Debt Model's Window 2 is built around — the player has demonstrated skill, and the subscription is framed as the natural next step for someone at their level.

### Streak Milestone Prompt

When a player hits a 7-day return streak, show: "You've played 7 days in a row. Subscribers never lose their streak data — even if they miss a day." This reframes the subscription as streak insurance rather than feature access. It works because the player has already demonstrated the behavior the subscription is designed to protect.

### Social Proof on the Modal

Add a line to the subscription prompt: "Join 50,000 word lovers who play Scramblr Daily." This signals that subscribing is a normal thing people do, not a significant decision. For a portfolio demo the number is illustrative, but in a real product this would pull from actual subscriber counts and update dynamically.

### Soft Paywall on the Share Card

Let free players share their score card, but append a subtle "Play Scramblr Daily at scramblr.app" link to the shared text. Subscribers get a clean card without the link — a small but meaningful status signal. This turns every share into a distribution channel and gives subscribers something tangible to show for their subscription beyond feature access.

### Statistical Significance Testing

The current Engagement Debt Model measures conversion rates per window but does not account for sample size or variance. A future version would add p-value calculation and confidence intervals to the analytics dashboard, so it is clear when a conversion rate difference between windows is statistically meaningful versus noise. This would make the A/B testing engine genuinely production-grade rather than illustrative.
