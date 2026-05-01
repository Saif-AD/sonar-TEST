'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { supabaseBrowser } from '@/app/lib/supabaseBrowserClient'
import { FONT_SANS } from '@/src/styles/fontStacks'

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ $tone }) => ($tone === 'shell' ? '0.35rem' : '0')};
  background: ${({ $tone }) => ($tone === 'shell' ? 'rgba(4, 12, 20, 0.92)' : 'var(--background-card)')};
  border: 1px solid ${({ $tone }) => ($tone === 'shell' ? 'var(--neon-line)' : 'var(--secondary)')};
  box-shadow: ${({ $tone }) => ($tone === 'shell' ? '0 0 18px rgba(34, 211, 238, 0.08)' : 'none')};
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  min-width: 0;
  width: 100%;
  max-width: ${({ $tone }) => ($tone === 'shell' ? '440px' : '320px')};
  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 0.95rem;
    padding: 0.2rem 0.4rem;
    font-family: ${FONT_SANS};
  }
`

const Suggestions = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: ${({ $tone }) => ($tone === 'shell' ? 'rgba(4, 14, 22, 0.98)' : 'var(--background-card)')};
  border: 1px solid ${({ $tone }) => ($tone === 'shell' ? 'var(--neon-line)' : 'var(--secondary)')};
  box-shadow: ${({ $tone }) => ($tone === 'shell' ? '0 14px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(34, 211, 238, 0.1)' : '0 8px 24px rgba(0, 0, 0, 0.35)')};
  border-radius: 10px;
  list-style: none;
  padding: 0.25rem;
  margin: 0;
  z-index: 1000;
  max-height: 320px;
  overflow: auto;
  li {
    padding: 0.5rem 0.6rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
  }
  li:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  .sym {
    font-weight: 600;
    color: var(--text-primary);
  }
  .meta {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }
`

const CollapsedSearchBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin: 0 auto;
  border-radius: 10px;
  border: 1px solid var(--neon-line);
  background: rgba(4, 12, 20, 0.88);
  color: var(--neon-bright);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.1);
  &:hover {
    background: var(--neon-fill-strong);
    border-color: rgba(34, 211, 238, 0.5);
    color: #ecfeff;
    box-shadow: 0 0 22px rgba(34, 211, 238, 0.22);
  }
`

const TOP_TOKENS = [
  'BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'USDC', 'XRP', 'DOGE', 'ADA', 'TRX',
  'AVAX', 'SHIB', 'DOT', 'LINK', 'MATIC', 'UNI', 'LTC', 'BCH', 'NEAR', 'LEO',
  'DAI', 'ATOM', 'ETC', 'XLM', 'ICP', 'FIL', 'HBAR', 'APT', 'VET', 'OP',
  'ARB', 'STX', 'IMX', 'MKR', 'AAVE', 'ALGO', 'INJ', 'RNDR', 'GRT', 'CRO',
  'SAND', 'MANA', 'FTM', 'SNX', 'RUNE', 'THETA', 'AXS', 'EOS', 'XTZ', 'FLOW',
  'KAVA', 'ZEC', 'XMR', 'DASH', 'NEO', 'WAVES', 'ONE', 'CELO', 'ROSE', 'GLMR',
  'EGLD', 'TFUEL', 'HT', 'KCS', 'OKB', 'KLAY', 'ZIL', 'BAT', 'ENJ', 'LRC',
  'CHZ', '1INCH', 'COMP', 'SUSHI', 'CRV', 'YFI', 'ZRX', 'OMG', 'ANKR', 'NMR',
  'ALICE', 'FET', 'OCEAN', 'BLUR', 'PEPE', 'FLOKI', 'GALA', 'APE', 'LDO', 'RPL',
  'SUI', 'SEI', 'TIA', 'WLD', 'PYTH', 'BONK', 'ORDI', 'JTO', 'ONDO', 'PENDLE',
]

function SearchGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function TokenSearchField({ className, tone = 'default', collapsed, onRequestExpand }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const [loadingSug, setLoadingSug] = useState(false)

  const fetchSuggestions = async (text) => {
    const t = (text || '').trim().toUpperCase()
    if (!t) {
      setSuggestions([])
      return
    }
    try {
      setLoadingSug(true)
      const topMatches = TOP_TOKENS.filter((sym) => sym.startsWith(t)).slice(0, 5).map((sym) => ({ token: sym, count: 0, isTop: true }))
      const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const sb = supabaseBrowser()
      const { data, error } = await sb
        .from('all_whale_transactions')
        .select('token_symbol, blockchain', { count: 'exact' })
        .ilike('token_symbol', `${t}%`)
        .gte('timestamp', sinceIso)
        .limit(20)

      const map = new Map()
      if (!error && data) {
        for (const r of data) {
          const sym = String(r.token_symbol || '').trim().toUpperCase()
          if (!sym) continue
          map.set(sym, (map.get(sym) || 0) + 1)
        }
      }

      const whaleMatches = Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sym, cnt]) => ({ token: sym, count: cnt, isTop: false }))

      const combined = new Map()
      for (const match of whaleMatches) combined.set(match.token, match)
      for (const match of topMatches) {
        if (!combined.has(match.token)) combined.set(match.token, match)
      }
      setSuggestions(Array.from(combined.values()).slice(0, 10))
    } finally {
      setLoadingSug(false)
    }
  }

  const onChangeQuery = (e) => {
    const v = e.target.value.toUpperCase()
    setQuery(v)
    setShowSug(true)
    fetchSuggestions(v)
  }

  const goToToken = (token) => {
    if (!token) return
    router.push(`/token/${encodeURIComponent(token)}?sinceHours=24`)
    setShowSug(false)
  }

  const onSubmitSearch = (e) => {
    e.preventDefault()
    if (query.trim()) goToToken(query.trim().toUpperCase())
  }

  if (collapsed) {
    return (
      <CollapsedSearchBtn
        type="button"
        className={className}
        title="Expand sidebar to search tokens"
        aria-label="Expand sidebar to search tokens"
        onClick={() => onRequestExpand?.()}
      >
        <SearchGlyph />
      </CollapsedSearchBtn>
    )
  }

  return (
    <form className={className} onSubmit={onSubmitSearch} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <SearchBox $tone={tone}>
        {tone === 'shell' ? <SearchGlyph /> : null}
        <input
          aria-label="Search token"
          placeholder="Search token (e.g., BTC, ETH)"
          value={query}
          onChange={onChangeQuery}
          onFocus={() => setShowSug(true)}
        />
        {showSug && suggestions.length > 0 && (
          <Suggestions $tone={tone} onMouseLeave={() => setShowSug(false)}>
            {suggestions.map((s) => (
              <li key={s.token} onClick={() => goToToken(s.token)}>
                <span className="sym">{s.token}</span>
                <span className="meta">{s.count > 0 ? `${s.count} whale txs` : 'Top Token'}</span>
              </li>
            ))}
          </Suggestions>
        )}
        {showSug && !loadingSug && suggestions.length === 0 && query && (
          <Suggestions $tone={tone}>
            <li>
              <span className="meta">No matches</span>
            </li>
          </Suggestions>
        )}
      </SearchBox>
    </form>
  )
}
