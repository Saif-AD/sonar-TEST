/**
 * Upstream Label Sanity Audit (v2 — descriptive)
 *
 * v1 tried to validate `classification` against a hard-coded rule. That
 * failed because most BUY/SELL rows are NOT CEX transfers (the schema's
 * `is_cex_transaction` flag is false on the majority), and the upstream
 * pipeline uses non-trivial heuristics (Stage 1/2 reasoning) we can't
 * reverse-engineer.
 *
 * v2 takes the empirical approach: forget the rule, ask the data.
 *
 *   1. Profile the BUY/SELL universe by (a) CEX flag, (b) which side the
 *      whale is on, (c) which side has a `*_label` annotation. Surface the
 *      counts so we know what categories actually exist.
 *
 *   2. For tokens with enough volume, compute the empirical "directional
 *      hit rate" per category by joining each transaction's timestamp to
 *      that token's price 24h later (via `price_snapshots`). If a category
 *      systematically fails to predict price direction, that category is
 *      where the upstream label noise is concentrated.
 *
 * No prescription: this script tells you which COMBINATION of categories
 * has predictive power, so the upstream repo can rewrite its rules with
 * evidence instead of intuition.
 *
 * Read-only.
 *
 * Usage:
 *   node scripts/audit_label_sanity.js              # last 24h
 *   node scripts/audit_label_sanity.js 72           # last 72h
 *   node scripts/audit_label_sanity.js 24 --json
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

const HOURS = parseInt(process.argv[2] || '72', 10)
const JSON_OUT = process.argv.includes('--json')
const PAGE = 1000
const MAX_PAGES = 30

function log(...args) { if (!JSON_OUT) console.log(...args) }
function pct(n, d) { return d > 0 ? `${((n / d) * 100).toFixed(1)}%` : '—' }

async function loadTxns() {
  // Need ≥24h of look-ahead → cap window so most recent rows are at least 24h old.
  const sinceMs = Date.now() - HOURS * 3600 * 1000
  const untilMs = Date.now() - 24 * 3600 * 1000
  const since = new Date(sinceMs).toISOString()
  const until = new Date(untilMs).toISOString()

  const out = []
  for (let p = 0; p < MAX_PAGES; p++) {
    const { data, error } = await supabase
      .from('all_whale_transactions')
      .select('id, timestamp, token_symbol, classification, usd_value, whale_address, counterparty_address, counterparty_type, is_cex_transaction, from_address, to_address, from_label, to_label')
      .gte('timestamp', since)
      .lte('timestamp', until)
      .in('classification', ['BUY', 'SELL'])
      .range(p * PAGE, p * PAGE + PAGE - 1)
    if (error) { console.error('txn query failed:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    out.push(...data)
    if (data.length < PAGE) break
  }
  return out
}

async function forwardReturn(token, ts) {
  const tsMs = new Date(ts).getTime()
  const baseStart = new Date(tsMs - 2 * 3600 * 1000).toISOString()
  const baseEnd   = new Date(tsMs + 30 * 60 * 1000).toISOString()
  const fwdStart  = new Date(tsMs + 23 * 3600 * 1000).toISOString()
  const fwdEnd    = new Date(tsMs + 25 * 3600 * 1000).toISOString()
  const [b, f] = await Promise.all([
    supabase.from('price_snapshots').select('price_usd').eq('ticker', token)
      .gte('timestamp', baseStart).lte('timestamp', baseEnd)
      .order('timestamp', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('price_snapshots').select('price_usd').eq('ticker', token)
      .gte('timestamp', fwdStart).lte('timestamp', fwdEnd)
      .order('timestamp', { ascending: true }).limit(1).maybeSingle(),
  ])
  const pBase = b.data?.price_usd
  const pFwd  = f.data?.price_usd
  if (!pBase || !pFwd) return null
  return { change_pct: ((pFwd - pBase) / pBase) * 100 }
}

function bucket(tx) {
  const whale = (tx.whale_address || '').toLowerCase()
  const from  = (tx.from_address  || '').toLowerCase()
  const to    = (tx.to_address    || '').toLowerCase()
  const isCex = !!tx.is_cex_transaction
  const ct    = (tx.counterparty_type || '').toUpperCase() || 'UNK'
  let side = 'unknown'
  if (whale && whale === from) side = 'whale_from'
  else if (whale && whale === to) side = 'whale_to'
  return `${isCex ? 'CEX' : 'OFF'}|${ct}|${side}`
}

async function main() {
  log(`\n=== Upstream Label Sanity Audit (descriptive) ===`)
  log(`Window: txns from ${HOURS}h ago up to 24h ago (need 24h look-ahead).`)
  log(`Method: profile categories, then check each category's 24h hit rate.\n`)

  const txns = await loadTxns()
  log(`Loaded ${txns.length} BUY/SELL transactions with sufficient look-ahead.\n`)
  if (!txns.length) { log('No transactions in window.'); return }

  const buckets = new Map()
  for (const tx of txns) {
    const b = bucket(tx)
    if (!buckets.has(b)) buckets.set(b, { total: 0, buy: 0, sell: 0 })
    const o = buckets.get(b)
    o.total++
    if (tx.classification === 'BUY') o.buy++; else o.sell++
  }

  log('Structural breakdown (cex_flag | counterparty_type | whale_side):')
  log('bucket'.padEnd(38) + 'n'.padStart(8) + 'BUY%'.padStart(8) + 'SELL%'.padStart(8))
  log('─'.repeat(62))
  const sortedBuckets = [...buckets.entries()].sort((a, b) => b[1].total - a[1].total)
  for (const [name, v] of sortedBuckets) {
    log(name.padEnd(38) + String(v.total).padStart(8) + pct(v.buy, v.total).padStart(8) + pct(v.sell, v.total).padStart(8))
  }
  log()

  const topBuckets = sortedBuckets.slice(0, 5).map(([name]) => name)
  log(`Computing 24h directional accuracy on top ${topBuckets.length} buckets...\n`)

  const results = []
  for (const bName of topBuckets) {
    const rows = txns.filter(tx => bucket(tx) === bName)
    const byTok = new Map()
    for (const tx of rows) {
      const t = tx.token_symbol || 'UNK'
      if (!byTok.has(t)) byTok.set(t, [])
      byTok.get(t).push(tx)
    }
    const topTokens = [...byTok.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 8)
    for (const [token, txList] of topTokens) {
      const sample = txList.slice(0, 30)
      let wins = 0, losses = 0
      for (const tx of sample) {
        const fr = await forwardReturn(token, tx.timestamp)
        if (!fr) continue
        if (Math.abs(fr.change_pct) < 0.05) continue
        const isBullish = tx.classification === 'BUY'
        const correct = isBullish ? fr.change_pct > 0 : fr.change_pct < 0
        if (correct) wins++; else losses++
      }
      const decided = wins + losses
      results.push({ bucket: bName, token, decided, wins, losses,
        hit_rate: decided > 0 ? wins / decided : null })
    }
  }

  log('Per-bucket × per-token 24h directional hit rate:')
  log('bucket'.padEnd(38) + 'token'.padEnd(10) + 'n'.padStart(5) + 'wins'.padStart(6) + 'loss'.padStart(6) + 'hit%'.padStart(8) + '  verdict')
  log('─'.repeat(85))
  results.sort((a, b) => (a.hit_rate ?? 0) - (b.hit_rate ?? 0))
  for (const r of results) {
    if (r.hit_rate === null) continue
    let verdict = 'ok'
    if (r.hit_rate < 0.35) verdict = '!! INVERTED — flag for upstream review'
    else if (r.hit_rate < 0.45) verdict = '⚠ near-random'
    else if (r.hit_rate > 0.65) verdict = '★ strong predictor'
    log(
      r.bucket.padEnd(38) + r.token.padEnd(10) +
      String(r.decided).padStart(5) + String(r.wins).padStart(6) +
      String(r.losses).padStart(6) + pct(r.wins, r.decided).padStart(8) +
      '  ' + verdict
    )
  }
  log()

  log('Bucket-level aggregate (all tokens combined):')
  const byBucket = new Map()
  for (const r of results) {
    if (r.decided === 0) continue
    if (!byBucket.has(r.bucket)) byBucket.set(r.bucket, { wins: 0, decided: 0 })
    byBucket.get(r.bucket).wins += r.wins
    byBucket.get(r.bucket).decided += r.decided
  }
  log('bucket'.padEnd(38) + 'n'.padStart(6) + 'hit%'.padStart(8) + '  verdict')
  log('─'.repeat(60))
  for (const [name, v] of [...byBucket.entries()].sort((a, b) => (a[1].wins / a[1].decided) - (b[1].wins / b[1].decided))) {
    const hr = v.wins / v.decided
    let verdict = 'ok'
    if (hr < 0.35) verdict = '!! BUCKET-WIDE INVERSION — fix upstream classifier here'
    else if (hr < 0.45) verdict = '⚠ near-random — does not predict direction'
    else if (hr > 0.6) verdict = '★ strong — keep / weight up'
    log(name.padEnd(38) + String(v.decided).padStart(6) + pct(v.wins, v.decided).padStart(8) + '  ' + verdict)
  }
  log()
  log('Action guide:')
  log('  Buckets ≥ 65% hit rate    → high-quality labels, keep at full weight')
  log('  Buckets 45-55%            → noise, the classification rule isn\'t adding info')
  log('  Buckets ≤ 35% hit rate    → INVERTED labels — open issue in whale-transactions repo')
  log()

  if (JSON_OUT) {
    process.stdout.write(JSON.stringify({
      window_hours: HOURS,
      total_txns: txns.length,
      buckets: sortedBuckets.map(([n, v]) => ({ name: n, ...v })),
      per_token_results: results,
      per_bucket_aggregate: [...byBucket.entries()].map(([n, v]) => ({ name: n, ...v, hit_rate: v.wins / v.decided })),
    }, null, 2) + '\n')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
