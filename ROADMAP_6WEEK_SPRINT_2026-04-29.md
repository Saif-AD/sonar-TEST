# Sonar Tracker — 6-Week Sprint Roadmap

> **Sprint window:** Wed 29 Apr 2026 → Tue 9 Jun 2026 (6 weeks)
> **Cofounders:** Eduardo Sanchez (CEO / full-stack / growth) · Saif Aldhaheri (CTO / AI-ML / data)
> **Document role:** single source of truth. Every item below is owned, scoped, and has a definition of done. We update this file at the end of each week.
> **Last updated:** 29 Apr 2026 — re-baselined to 6 weeks after looking at real time availability + Vercel analytics.

---

## 0. Where we actually are (honest snapshot, 29 Apr 2026)

### Traction reality check
- **750 registered users** (Supabase truth, not the "600+" we still quote in pitch docs).
- **Vercel analytics, last 90 days:** 2,705 unique visitors, 10,477 page views, 59% bounce rate. That's ~30 visitors/day.
- **Hidden insight: visitor → signup conversion is ~14-25%** (because part of those 750 came before the 90-day window, but even discounting that, the rate is 5-10x SaaS benchmark of 2-3%).
- **Two visible traffic spikes:**
  - Mar 1-15 (~60 visitors/day) — early launch buzz / Reddit moment.
  - Apr 12 (~95 visitors/day, a 3x spike) — Colosseum Frontier hackathon Week 1 update.
- **The Apr 12 spike proves the playbook:** we publish content → traffic triples. We just don't publish enough.
- **A chunk of "real" visitors are missing from analytics** because cookie consent (`CookieConsent.jsx` + `ConsentGatedScripts.jsx`) gates GA + Vercel. EU traffic = 30-50% under-counted. True visitor count probably 4,000-5,000 in the 90-day window.

### What this means
> **The product converts. The site doesn't get seen.**
>
> Don't change the product roadmap (dashboard V2, wallet sign-in, personalisation) — those make conversion even better. But **shift Saif's lane harder onto top-of-funnel** (X bot, Telegram, Lookonchain-style content) because that's the actual bottleneck.
>
> **For every pitch / VC email / accelerator app, lead with the conversion ratio, not the absolute user count.** "750 users on ~30 visitors/day = 14-25% visitor-to-signup, 5-10x SaaS benchmark, zero marketing spend." That sentence is more persuasive than "we have 750 users."

### Product (live at sonartracker.io)
- **Whale tracker** across Ethereum, Bitcoin, Solana, Polygon, Arbitrum, Optimism, BSC, Avalanche, Tron + Base. Solana now via **Alchemy Yellowstone gRPC** (sub-second), shipped Week 1 of Colosseum Frontier.
- **Wallet leaderboard** — 70k+ wallets, smart-money score 0–100, tags, filter by chain, custom watchlists.
- **Backtest engine** — proportional capital allocation replay against `all_whale_transactions`, equity curve, PnL / win-rate / best-worst trade. Live at `/backtest`.
- **Signal engine** — 4-tier composite (`app/lib/signalEngine.ts`), 15-min cron. Per-token `TIER1_SIGN_BY_TOKEN` calibration shipped 22 Apr after pooled-IC blow-up. Output **muted to NEUTRAL on the public API** (`HIDE_BULLISH_SIGNALS = true`) until IC re-audit confirms positive T1 IC.
- **ORCA** — AI advisor (OpenAI), grounded on whale + price + news context. Regulatory guardrails wired (no advice, no buy/sell labels, no "smart money" framing).
- **News terminal + Social Pulse + Macro Factors + Key Voices** (Grok web search).
- **Dashboard** (existing) — KPIs, watchlist, net inflows/outflows, buy/sell pressure, top whales, social pulse. **Not yet rebuilt to V2 spec.**
- **Auth** — Supabase email/OAuth only. **No wallet sign-in yet.**
- **Billing** — Stripe live. Free + £/$7.99 Pro + £/$19.99 tier.
- **Legal remediation** — second pass complete 21 Apr. Forbidden vocab purged. ~97-98% safe.
- **Email** — Brevo welcome + 4-email sequence + Weekly Whale Pulse templates ready. Double opt-in not yet live.

### Open commitments
- **Colosseum Frontier hackathon** — Week 1 update shipped 12 Apr. Weeks 2-4 still owed.
- **King's Startup Accelerator** — application + questions due (this sprint).
- **VC applications** — Alliance DAO, YC S26 (deadline 4 May), a16z CSX drafts ready in `VC_APPLICATIONS_MARCH_2026.md`. Blocked on Twitter handle, LinkedIn URLs, incorporation status, 1-min videos.
- **Dashboard V2** — full prompt written in `DASHBOARD_V2_PROMPT.md`. Not built.

### Honest weaknesses (no sugarcoating)
1. **Top of funnel is tiny.** ~30 visitors/day means 750 users took us months. Need 10x traffic.
2. **Signal accuracy is admittedly mid.** T1 IC went negative for 7 alts. Patched per-token, awaiting re-audit. Until then, can't market signals.
3. **No wallet sign-in.** Every "Web3-native" competitor has it. We look like a Web2 SaaS.
4. **Dashboard is a "data display"**, not a destination. People don't keep it open all day.
5. **Wallet tracker is a leaderboard + profile pages.** No graph view, no copy-trade auto-execution, no clustering UI surfaced.
6. **No social proof on the site** — no testimonials, no live signup ticker.
7. **No public Telegram alert channel running yet** — single biggest organic crypto growth lever, untapped.
8. **No X bot running yet** — same story.
9. **VC outreach is paperwork-blocked**, not idea-blocked.

---

## 1. Competitive landscape — the deep cut

### 1.1 Direct competitors (who steals our oxygen)

| Player | Pricing | Users (est) | Funding | What they're great at | How they got users | Why people pay |
|---|---|---|---|---|---|---|
| **Nansen** | $150 → $1,800/mo (Alpha) | ~25k paying | $75M Series B (a16z, Tiger) | Wallet labelling depth (200+ smart-money labels), historical god-mode dataset, brand authority | (a) a16z/Tiger amplification; (b) endless free reports ranking on every "Bitcoin holders" search; (c) Twitter intel from @nansen_ai with screenshots people screenshot; (d) integrations with Coinbase, Binance research desks | Trading desks pay because labels save them 40h/week. Funds pay because LP reports demand "Nansen Smart Money holdings" |
| **Arkham** | Free + $50/mo Ultra + Intel exchange | 600k+ free, ~5k paying | $12M (Founders Fund, Wintermute) | Entity doxxing, Intel marketplace (bounties), wallet graph viz | (a) Doxxed bin Salman's wallet → 18M Twitter impressions overnight; (b) ARKM token airdrop = 200k wallets; (c) genuinely better free product than Zerion; (d) bounty market is recurring PR | Free product is sticky → 1% convert for advanced filters and bounty access |
| **Whale Alert** | Free + $30/mo + API ($500-$5k/mo) | 2.4M Twitter followers | Bootstrapped | Twitter bot — *the* whale alert format crypto Twitter knows | Twitter bot IS the product. 12 years of "🚨 5,000 BTC moved" tweets = ambient brand awareness | API customers (Coindesk, CoinTelegraph, every aggregator) pay for the firehose. Retail rarely pays |
| **Lookonchain** | Free | 700k Twitter | Bootstrapped (1-2 person) | Storytelling. "This whale bought $X yesterday and is now up $Y" | Pure Twitter: human-written, dramatic, screenshotted by every newsletter. Became *the* on-chain narrative source | Doesn't monetise — attention business funded by a16z grant + sponsored threads |
| **Glassnode** | Free + $39 + $799/mo | ~50k paying | $20M Series A | Bitcoin macro on-chain (MVRV, SOPR, NUPL). PhD-tier metrics | Long-form research reports + insights newsletter (60k subs). Charts quoted by Bloomberg / FT | Funds pay because their research is in the chart caption of every CIO note |
| **Dune** | Free + $390/mo Plus + $999 Premium | 60k paying | $69M Series B | SQL-native. Community dashboards | Invited every protocol foundation to publish their own dashboard. Foundations now market Dune for them | Protocols pay for access to their own data + faster queries |
| **DeBank / Zerion** | Free + tokenised airdrops | 5M+ wallets | DeBank: $23M · Zerion: $20M | DeFi-native portfolio tracker. Mobile-first. **Wallet sign-in only — no email** | Connected wallet = identity. Every CT user has both bookmarked. Airdrop incentives drove 2M+ wallets | Stream: $3-5/mo for advanced. Mostly funded by tokens / treasury |
| **Spot On Chain** | Free + $$$ | small | undisclosed | AI-summary version of whale alerts. Closest direct competitor in *concept* | New (2024). Twitter-first | AI summaries + alerts |

### 1.2 The one-line summary of how they got users
- **Nansen:** authority by association (a16z / Tiger / Coinbase quote them).
- **Arkham:** virality stunts (Saudi prince doxx, ARKM airdrop) + a free product genuinely better than Zerion.
- **Whale Alert:** automated Twitter content compounding for 12 years.
- **Lookonchain:** storytelling — humans write the Twitter, no bot. Bloomberg's morning brief for on-chain.
- **DeBank / Zerion:** wallet-as-identity = zero-friction onboarding.
- **Dune:** UGC. Foundations build dashboards. Foundations market Dune.
- **Glassnode:** research as marketing.

### 1.3 Why people *pay* (the only question that matters)
Across all of them, paid customers fall into 3 buckets:
1. **Trading desks / funds** — pay because their LP / CIO expects "we use Nansen / Glassnode" in the deck. **Defensibility against scrutiny** is the product.
2. **Bounty hunters / power users** — pay for filters, exports, faster queries. **Speed and depth** is the product.
3. **Active retail traders ($10k+ portfolio)** — pay $30-150/mo if it saves them ONE bad trade per quarter. **Loss avoidance** is the product.

Sonar today is priced at $7.99 — bucket 3. We don't compete with Nansen for bucket 1 yet. **Our job for the next 6 weeks is to dominate bucket 3.**

### 1.4 Where Sonar can actually win
- **Speed of insight, not depth of label.** Open Sonar → 3 seconds → know what matters today. Dashboard V2 is the play.
- **Wallet sign-in + personalised feed.** Connect your wallet → we know your bag → we surface only the whales touching tokens you hold. Nansen does **not** do this. Single biggest differentiator we can ship.
- **Telegram billboarding (Whale Alert's playbook, sharper).** We post **classified, scored, contextualised** moves with a one-line ORCA-style summary. Every alert is a free ad.
- **Storytelling (Lookonchain's playbook, automated).** Daily 280-char "on-chain story of the day" pulled from our own data. Lookonchain does this manually — we automate it.

---

## 2. The 6-week sprint plan

Three phases, two weeks each:
- **Phase 1 (Wks 1-2):** Paperwork & growth foundations — unblock VC pipeline, King's app, X strategy + Telegram, dashboard V2 skeleton, wallet sign-in spec.
- **Phase 2 (Wks 3-4):** Personalisation & growth machine — ship wallet sign-in, personalised dashboard widget, X bot live, counterparty graph, ChainSpeak content.
- **Phase 3 (Wks 5-6):** Distribution & polish — conversion optimisation, copy-trade paper sim, clustering UI, VC cold round, demo Loom, launch wave.

---

### WEEK 1 — Paperwork & foundations (Wed 29 Apr → Tue 5 May)

#### Edu lane

**E1.1 Re-baseline traction numbers (Wed, 1h)**
- Pull from Supabase: total users (truth = 750), weekly signup curve, % active in 30d, paid count, free→paid conv rate.
- Pair with Vercel analytics: visitor count, page views, bounce, top traffic sources from GA4.
- Write `traction_snapshot_2026-04-29.md` with **conversion ratio** front and centre.
- DoD: file exists, numbers match Supabase, ratio used in every pitch from now on.

**E1.2 King's Startup Accelerator application (Thu, 3-4h, BLOCK THE MORNING)**
- Use answers from `VC_APPLICATIONS_MARCH_2026.md` as base.
- Specific to King's: KCL students, AI prediction LLM, Microsoft + Core42 background.
- **Lead with conversion-rate story.**
- Build attachment checklist: deck, demo video, financials.
- DoD: application submitted OR `KINGS_ACCELERATOR_TODO.md` with numbered blockers + ETAs.

**E1.3 VC paperwork unblock (Thu, 2h)**
- Fill every `⚠️` in `VC_APPLICATIONS_MARCH_2026.md`:
  - Create / confirm @sonartracker on X.
  - LinkedIn URLs (yours + Saif's).
  - Decide incorporation answer.
  - Record 1-min founder video on phone, no edits, upload unlisted YouTube.
- DoD: zero `⚠️` in VC doc.

**E1.4 Submit Alliance DAO + a16z CSX (Fri)**
- Both drafts ready, submit once E1.3 done.
- DoD: confirmation emails received.

**E1.5 Submit YC S26 by Sun 3 May (HARD DEADLINE: 4 May)**
- DoD: submitted, confirmation received.

**E1.6 Hackathon Week-2 update for Colosseum (Fri, 2h)**
- Topics: dashboard V2 starting, Telegram + X strategy, Solana signal enrichment.
- DoD: published to repo + posted to Colosseum Discord. *(Bonus: published = traffic spike, see Apr 12.)*

**E1.7 Wallet sign-in spec doc (Fri, 3h, no code)**
- `WALLET_SIGNIN_SPEC.md`. Cover: SIWE for EVM + Solana wallet adapter, Supabase JWT minting, multi-wallet linking, holdings fetch via Alchemy + Helius, privacy rules.
- DoD: spec reviewed by Saif before EOW.

**E1.8 SEO backlink batch 1 (Wed eve, 90min)**
- Tier 1 + Tier 2 from `SEO_LAUNCH_KIT.md`: AlternativeTo (vs Nansen, vs Arkham, vs Whale Alert), SaaSHub, BetaList, CryptoSlate, CryptoMinded, AItoolnet, theresanaiforthat, Toolify.
- DoD: 12+ submissions logged in `BACKLINKS_LOG.md`.

#### Saif lane

**S1.1 X / Twitter alerts strategy doc (Wed–Thu, 4h)**
- `X_ALERTS_STRATEGY.md`. Pattern after Whale Alert + Lookonchain.
- Cadence: 6-10 posts/day mixing auto-alerts (>$5M classified moves), 8am UTC digest thread, 5pm UTC "story of the day".
- Reserve handle, write bio, design pinned tweet (Sonar 30-sec demo).
- DoD: doc done, handle reserved, bio + pinned tweet ready.

**S1.2 Wallet-tracker competitive deep-dive (Wed–Fri, 8h)**
- `WALLET_TRACKER_DEEP_RESEARCH.md`.
- Feature matrix: Sonar vs Nansen vs Arkham vs Zerion vs DeBank vs Spot On Chain. Identify the 3 reds we should fix.
- What they do that we don't (Nansen Wallet Profiler, Arkham entity graph, Zerion DeFi position decomposition, DeBank Stream).
- What they do badly that we should beat (Nansen useless free tier, nobody does mobile well, nobody surfaces "whales holding what YOU hold").
- 3 concrete features Saif will ship in Wks 3-5.
- User acquisition tactics each competitor used at sub-1k stage.
- DoD: doc shipped Fri.

**S1.3 Wallet-tracker bug audit (Fri, 2h)**
- Sweep `/wallet-tracker` and `/whale/[address]` — log bugs in `WALLET_TRACKER_BUGS.md` with reproduction steps.
- DoD: 10+ specific bugs logged.

#### Shared
- **Daily standup** 10am UK on Discord, 15 min.
- **Friday review** 5pm. Walk doc top to bottom. Mark ✅ / ⚠️ / ❌.

---

### WEEK 2 — Dashboard V2 + Telegram launch (Wed 6 May → Tue 12 May)

#### Edu lane

**E2.1 Dashboard V2 skeleton (Wed–Sat, ~12h split across evenings)**
- Implement layout from `DASHBOARD_V2_PROMPT.md` — sections 1, 2, 5, 6, 8 first (Live Whale Feed ticker, Market Pulse chart, Whale Heat Map, Smart Money Consensus gauge, Blockchain Distribution).
- Skip section 3 (AI Signal Cards) until IC re-audit positive — `HIDE_BULLISH_SIGNALS=true` stays on.
- Skip section 9 (Activity Summary) — stub as "Coming soon".
- DoD: `/dashboard` looks like new layout, KPIs + ticker + heat map + gauge + chart all live.

**E2.2 Navbar redesign (Mon–Tue, ~5h)**
- Modernise `src/components/Navbar.js`: tighter, command-palette inspired bar.
- Add `Connect Wallet` button (stub for now — "coming soon" modal).
- Add global `Cmd/Ctrl+K` → search modal (reuse existing search logic).
- DoD: consistent navbar across `/`, `/dashboard`, `/wallet-tracker`, `/token/*`. Mobile works.

**E2.3 Telegram channel launch (Wed, 3h)**
- Create `t.me/sonartracker_whales` (public).
- Bot: same data feed Saif builds for X, Telegram format (longer, image embed).
- Post 6-10/day starting Wed.
- Cross-promote: link in `/dashboard` footer, `/wallet-tracker` header, Brevo welcome email, every blog post.
- DoD: channel live, first 24h gets 20+ subs from cross-promo.

**E2.4 SEO backlink batch 2 + new blog post (Tue + Thu, 3h)**
- Tier 3 + Tier 4 directories from SEO kit.
- Write 1 new programmatic-SEO post: "Best Whale Tracker for Solana Memecoins (May 2026)".
- DoD: 8+ new backlinks, 1 new blog post live.

**E2.5 VC follow-ups (Fri, 1h)**
- Email everyone who acknowledged Wk1 applications with "here's what shipped this week" 4-bullet update.
- Ship every Friday — VCs respond to momentum.
- DoD: emails sent.

#### Saif lane

**S2.1 X bot infra build (Wed–Thu, 6h)**
- Twitter API v2 paid tier ($100/mo). Charge to founder card.
- Wire to `all_whale_transactions` view: filter `usd_value > 5_000_000`, classification in `('BUY','SELL')`, post within 60s.
- Format: `🐋 {SIDE} ALERT — {amount} {token} (${usd}M) on {chain}\n{entity_or_short_addr}\n→ sonartracker.io/tx/{hash}`
- **Compliance check:** must say "deposit/withdrawal" or "inflow/outflow", not "BUY/SELL". Edu reviews before live.
- 7-day warm-up: post manually first to avoid spam flag.
- DoD: bot deployed (Vercel cron or Railway worker), dry-run for 24h to private test account.

**S2.2 Wallet tracker — counterparty graph v2 (Mon–Wed, ~12h)**
- Upgrade `WalletFlowGraph.jsx` to force-directed graph (`react-force-graph` or `cytoscape.js`).
- Nodes = wallets, edges = transfers. Node size = USD volume. Colour = entity tag.
- Click node → `/whale/[address]`. Time slider: 7d / 30d / 90d.
- DoD: graph renders for any wallet with >5 counterparties, performant up to 200 nodes.

**S2.3 Saif's first ChainSpeak script (Tue, 2h)**
- Write 60-sec script: "What Yellowstone is and why Solana whales are now visible in real-time."
- Record voiceover, hand to Edu for editing.
- DoD: script + voiceover delivered.

#### Shared
- **Mid-week sync (Wed eve)**: review wallet sign-in spec end-to-end before Phase 2 build starts.
- **Friday review.**

---

### WEEK 3 — Wallet sign-in (Wed 13 May → Tue 19 May)

#### Edu lane (THIS IS THE BIG ONE — protect time)

**E3.1 Wallet sign-in implementation (Mon–Thu, ~14h)**
- Per spec from E1.7.
- `app/api/auth/wallet/nonce` (issues nonce) + `app/api/auth/wallet/verify` (verifies SIWE/Solana sig, mints Supabase JWT).
- `<ConnectWalletButton />` component, swap navbar stub.
- `user_wallets` and `user_wallet_holdings` tables via Supabase migration.
- Background job: refresh holdings every 30 min for opted-in users (Alchemy + Helius). Cache in Supabase.
- **Ship EVM (MetaMask) Mon-Tue, Solana (Phantom) Wed-Thu** — split risk.
- DoD: sign in with MetaMask + Phantom on fresh browser, session persists, wallet shows on `/profile`.

**E3.2 X bot goes live (Mon, 1h with Saif)**
- Compliance review with Edu, then flip dry-run to live.
- Monitor for 48h.
- DoD: live, posting, 0 wording incidents.

**E3.3 Hackathon Week-3 update (Fri, 2h)**
- Topics: dashboard V2 ship, Telegram + X live, wallet sign-in shipping.
- DoD: published Fri.

**E3.4 VC follow-ups round 2 (Fri, 1h)**

#### Saif lane

**S3.1 Story-of-the-day automation (Mon–Wed, 5h)**
- Cron 5pm UTC. Picks largest narrative-worthy tx of past 24h (heuristic: known entity, >$5M, single token, position change >20%).
- Generates 280-char post via OpenAI with **strict prompt** (no advice vocab). Edu reviews prompt before live.
- Posts to X + Telegram with screenshot from `/tx/[hash]` (Vercel OG image gen).
- Manual approval Wk3, auto-publish from Wk4.
- DoD: 5 posts manually approved by Friday.

**S3.2 Wallet tracker — entity tag display polish (Wed–Fri, 5h)**
- Surface existing entity tags from `app/lib/entityHelpers.ts` more prominently on wallet pages.
- Hover tooltips, colour coding by tag type.
- DoD: tags visible everywhere wallets are listed.

**S3.3 X bot tuning (Fri, 2h)**
- After 5 days live, review what's getting engagement. Tweak format / cadence.
- DoD: notes in `X_ALERTS_STRATEGY.md`, format updated.

---

### WEEK 4 — Personalisation goes live (Wed 20 May → Tue 26 May)

#### Edu lane

**E4.1 Personalised dashboard widget (Mon–Tue, ~6h)**
- New section on `/dashboard` for wallet-connected users: **"Whales touching YOUR bag"**.
- Query: top 10 whale txs (last 24h, `usd_value > $1M`) where `token_symbol IN (user_holdings.tokens)`.
- Card list: token, side, amount, whale entity, time. Click → tx page.
- For users without connected wallet: CTA "Connect your wallet → see whales moving YOUR tokens".
- DoD: widget renders for connected users, CTA fallback otherwise.

**E4.2 ChainSpeak content push (Wed–Thu, ~4h)**
- Edit + publish Saif's Yellowstone short.
- Write + record 1 more: "Why $7.99 is enough and $150 isn't" (Sonar vs Nansen).
- Post to TikTok + YouTube Shorts + X with sonartracker.io in bio.
- DoD: 2 ChainSpeak shorts live, all platforms.

**E4.3 Hackathon Week-4 update (Fri, 2h)**
- Topics: wallet sign-in shipped, personalisation live, Telegram + X growth metrics.
- DoD: published.

**E4.4 SEO blog post + Reddit value drop (Thu, 3h)**
- 1 new blog: "Sonar vs Arkham 2026" (high-intent comparison).
- 1 Reddit post in r/CryptoCurrency or r/CryptoTechnology — *value first, link last*. Format: "I analysed the 50 biggest whale txs in May, here are the 5 patterns" with our data.
- DoD: post + Reddit up.

#### Saif lane

**S4.1 Holdings-aware whale feed (Mon–Wed, 6h)**
- Sister to E4.1 but on `/wallet-tracker` hub: "Wallets accumulating tokens YOU hold."
- Smart-money wallets (score >70) net-buying tokens in user's holdings (last 7d).
- DoD: live for wallet-connected users.

**S4.2 X/Telegram volume push (rolling)**
- Push to 8-10 posts/day on both channels.
- Daily 8am UTC digest thread now automated.
- DoD: 56+ posts/week each channel.

**S4.3 Story-of-the-day flips to auto (Mon, 30min)**
- After 5+ successful manual posts in Wk3, flip cron to auto.
- Edu compliance review of past week's posts before flipping.
- DoD: live, posting daily 5pm UTC.

---

### WEEK 5 — Conversion & polish (Wed 27 May → Tue 2 Jun)

#### Edu lane

**E5.1 Conversion optimisation pass (Mon–Tue, 8h)**
- Free→paid funnel:
  - Fix upgrade modal copy. Lead with "what you get" + "vs Nansen $150" comparison.
  - Per-feature paywall hover tooltip: "Want this? Pro · $7.99/mo →" on every locked card.
  - "You're saving £142/mo vs Nansen" banner on upgrade page.
  - Stripe checkout success → `/dashboard?just_upgraded=1` → one-time welcome modal.
- **Referral codes**: every Pro user gets a code; 1 month free for them + their referee. Stripe coupon API + `/profile/referral` page.
- DoD: 4 of 5 above shipped. Funnel measurable in GA4.

**E5.2 Final dashboard V2 sections (Wed, 6h)**
- Sections 4 (Breaking News sidebar), 7 (Top High-Value Transactions), 10 (Alert Configuration Widget — premium).
- DoD: full dashboard matches V2 spec layout.

**E5.3 Hackathon Week-5 update (Fri, 2h)**

**E5.4 Backlinks final push (Mon eve, 90min)**
- Reach 25+ total. Hit any remaining Tier 3/4 directories.
- DoD: `BACKLINKS_LOG.md` shows 25+ live backlinks.

#### Saif lane

**S5.1 Copy-trade paper-trading simulator (Mon–Wed, ~14h)**
- Extend backtest engine: forward mode where users "follow" a wallet → all future trades simulated against virtual $10k → equity curve updates daily.
- Notification when followed wallet trades (in-app + Telegram for Pro).
- DoD: user picks wallet, clicks "Paper trade with $10k", sees curve grow over 7 days.

**S5.2 QA pass on everything shipped Wks 2-4 (Thu–Fri, 4h)**
- Click every new flow as a fresh user. Log regressions in `WALLET_TRACKER_BUGS.md`.
- DoD: bug list updated, P0 bugs fixed before Week 6.

---

### WEEK 6 — Launch wave (Wed 3 Jun → Tue 9 Jun)

#### Edu lane

**E6.1 3-min Loom demo video (Mon, 3h)**
- "Sonar in 3 minutes" — sign-in with wallet → personalised dashboard → counterparty graph → ORCA → alerts.
- Goes everywhere: Product Hunt prep, VC emails, X pinned, every accelerator app.
- DoD: video uploaded, linked in 5+ places.

**E6.2 VC cold round (Tue, 2h)**
- Cold email 10 named partners at top crypto VCs (Variant, Multicoin, Dragonfly, Hack VC, 1confirmation, Castle Island, Slow Ventures, Ribbit). Subject: "London student team, 1k+ users zero spend, building prediction LLM on whale flows." 4 sentences, link to Loom.
- Track in `VC_OUTREACH_LOG.md`.
- DoD: 10 emails sent.

**E6.3 Reddit + Twitter wave (Wed–Thu, 4h)**
- 3 Reddit data-driven posts (r/CryptoCurrency, r/CryptoTechnology, r/SideProject).
- 1 long X thread: "What we learned shipping a whale tracker to 1k+ users with zero marketing."
- DoD: posts live, traffic measurable.

**E6.4 Hackathon final submission (Thu, 3h)**
- Final Colosseum demo video + write-up.
- DoD: submitted.

**E6.5 New blog post (Fri, 2h)**
- "How to Find Smart Money Wallets on Solana" — programmatic SEO.
- DoD: live.

#### Saif lane

**S6.1 Entity clustering UI ships (Mon–Wed, 8h)**
- Surface `app/api/whales/patterns` + `PodDetection.jsx` in new tab on `/wallet-tracker`: "Coordinated wallet groups."
- Each cluster: list of wallets, shared tokens, lead wallet.
- Compliance pass: framing must be descriptive, not "insider group".
- DoD: tab live, 3+ real clusters detected.

**S6.2 Final wallet-tracker QA + research write-up update (Fri, 3h)**
- Update `WALLET_TRACKER_DEEP_RESEARCH.md` with what shipped vs original gap list. Mark new gaps for next sprint.
- DoD: doc updated.

---

## 3. Metrics — what we measure end-of-sprint (9 Jun)

| Metric | Today (29 Apr) | Target (9 Jun) | Why it matters |
|---|---|---|---|
| Total registered users | 750 | 1,500 | Validates marketing engine |
| Weekly signups | ~50 | 200 | Trajectory matters more than absolute |
| Daily site visitors | ~30 | 200 | Top-of-funnel is the real bottleneck |
| Visitor → signup conversion | ~15-25% | hold ≥10% | If this drops, new traffic is lower-quality |
| Paying users | <20 | 50 | First real revenue signal |
| MRR | <£200 | £500 | Numbers VCs actually look at |
| X followers | 0 | 1,500 | The new growth channel |
| Telegram subs | 0 | 800 | The compounding channel |
| Backlinks (DR>40) | unknown | +25 | SEO foundation |
| Wallet sign-ins | 0 | 200 | Differentiation proof |
| VC replies | 0 | 5+ meetings booked | Funding pipeline |
| Hackathon weekly updates published | 1 | 6 | Hackathon hygiene + traffic spikes |
| Blog posts shipped | n/a | +4 | Compounding SEO |

We baseline now, target end-of-sprint, put it on the wall.

---

## 4. Risks & contingencies

1. **Signal IC re-audit comes back negative for 3-4 alts.** Mitigation: keep `HIDE_BULLISH_SIGNALS=true`. Don't market signals. Lean on whale-tracking + alerts + ORCA framing.
2. **Wallet sign-in buggier than expected (Solana adapter quirks).** Mitigation: ship EVM-only first (Wk3 Mon-Tue), Solana second (Wed-Thu), behind feature flag if it slips.
3. **X bot account flagged as spam.** Mitigation: warm account 7 days with manual posts before automating. Vary copy. Never repost same image.
4. **VC outreach gets 0 replies.** Plan for it. Apply to micro-funds + emerging-manager fellowships in parallel (Boost VC, Antler, Tachyon, Outlier Ventures) as cushion.
5. **Saif blocked by university coursework / Edu blocked by Microsoft work.** Both will happen. Sprint plan = ~25-35h/week each. Protect 4 evenings + 1 full weekend day per week. If a week slips, kill lowest-priority item before pushing other lanes back. Killable in priority order: E2.4 (extra blog post), S2.3 (ChainSpeak script), E5.4 (backlinks final push), E6.5 (final blog post).
6. **Compliance regression.** Every X / Telegram post the bot generates checked against forbidden-vocab list (`/memories/repo/legal-remediation-2026-04-21.md`). Server-side filter that rejects posts with any forbidden word. Edu owns the filter.
7. **Apr 12 spike was content-driven; if we publish less, traffic drops.** Mitigation: every Friday hackathon update is a content drop. X bot adds daily content. Telegram adds daily content. Plan has built-in content cadence.

---

## 5. Out of scope (deliberate nos)

- Mobile native app (RN/Expo) — too big.
- Prediction LLM productionisation — Saif keeps researching, no production ship in 6 weeks.
- Token / airdrop strategy — pre-revenue, premature, regulatory minefield.
- Discord community launch — Telegram first, Discord next sprint.
- Payment via crypto — Stripe is fine.
- New chains beyond what we have — depth, not breadth.
- Localisation (Spanish, Portuguese) — `SONAR_INFO_ES.md` exists but no SEO bandwidth this sprint.
- Any "AI advisor" framing changes — wait for next legal pass.

---

## 6. Cadence & doc hygiene

- This file is source of truth. Update at every Friday review with ✅ / ⚠️ / ❌ next to each line.
- New docs created during sprint live in repo root: `WALLET_SIGNIN_SPEC.md`, `WALLET_TRACKER_DEEP_RESEARCH.md`, `X_ALERTS_STRATEGY.md`, `traction_snapshot_2026-04-29.md`, `BACKLINKS_LOG.md`, `VC_OUTREACH_LOG.md`, `KINGS_ACCELERATOR_TODO.md`, `WALLET_TRACKER_BUGS.md`.
- Standup non-negotiable. 15 min daily before either of us opens a code editor.
- End-of-sprint retro Wed 10 Jun. Lessons → `/memories/repo/sprint-retro-2026-06-09.md`.

---

## Appendix A — Edu's personal to-do list (re-stated, cleanly)

1. **Re-design dashboard** → E2.1 + E5.2 (skeleton Wk2, finish Wk5).
2. **Re-design navbar** → E2.2 (Wk2).
3. **Sign-in with wallet + personalisation** → E1.7 (spec) + E3.1 (ship) + E4.1 (personalised widget).
4. **King's Startup Accelerator** → E1.2 (Thu Wk1).
5. **Hackathon weekly updates** → E1.6, E3.3, E4.3, E5.3, E6.4 (every Friday).
6. **SEO backlinks + content** → E1.8, E2.4, E4.4, E5.4, E6.5 (rolling).
7. **VC outreach** → E1.3 + E1.4 + E1.5 (paperwork + applications Wk1) → E2.5 + E3.4 (follow-ups Wks 2-3) → E6.2 (cold round Wk6).
8. **ChainSpeak for user acquisition** → E4.2 (Wk4).
9. **Conversion optimisation + referral** → E5.1 (Wk5).
10. **Demo Loom + launch wave** → E6.1 + E6.3 (Wk6).

## Appendix B — Saif's personal to-do list (re-stated, cleanly)

1. **User acquisition via X channel** → S1.1 (strategy) → S2.1 (build) → E3.2 (live, with Edu) → S3.1 (story-of-day manual) → S4.3 (auto) → S4.2 (volume push).
2. **Wallet tracker — make it perfect** → S1.2 (research) + S1.3 (bug audit) + S2.2 (graph v2) + S3.2 (entity tags) + S4.1 (holdings-aware feed) + S5.1 (copy-trade paper sim) + S6.1 (clustering UI) + S6.2 (final QA).
3. **Competitor + market research** → S1.2 deliverable `WALLET_TRACKER_DEEP_RESEARCH.md` + competitive matrix in section 1, kept current.
