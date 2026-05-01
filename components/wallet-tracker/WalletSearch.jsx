'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { shortenAddress } from '@/lib/wallet-tracker'

/**
 * Leaderboard wallet search.
 * Visually distinct from the top-bar token search — sharper rectangle (not
 * pill), darker bg, leading magnifying-glass glyph, mono input text. Reads as
 * a "find a row in this leaderboard" tool rather than the global token search.
 */
const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 520px;
`

const SearchShell = styled.form`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.85rem;
  background: rgba(6, 14, 22, 0.6);
  border: 1px solid rgba(34, 211, 238, 0.18);
  border-radius: 8px;
  transition: border-color 160ms ease;

  &:focus-within {
    border-color: rgba(34, 211, 238, 0.4);
  }

  .leading-icon {
    flex-shrink: 0;
    color: var(--neon-bright);
    display: flex;
    align-items: center;
    opacity: 0.8;
  }
`

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.65rem 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-family: var(--font-mono);
  outline: none;

  &::placeholder {
    color: var(--text-secondary);
    font-family: var(--font-mono);
    letter-spacing: 0.01em;
  }
`

const Dropdown = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: rgba(4, 12, 20, 0.98);
  border: 1px solid rgba(34, 211, 238, 0.2);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(34, 211, 238, 0.06);
  border-radius: 10px;
  list-style: none;
  padding: 0.25rem;
  margin: 0;
  z-index: 200;
  max-height: 320px;
  overflow-y: auto;
`

const DropdownItem = styled.li`
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const AddrText = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.9rem;
`

const EntityText = styled.span`
  color: var(--text-secondary);
  font-size: 0.85rem;
`

const ChainBadge = styled.span`
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: rgba(54, 166, 186, 0.15);
  color: var(--primary);
  text-transform: uppercase;
`

export default function WalletSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const timerRef = useRef(null)
  const containerRef = useRef(null)

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/wallet-tracker/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setResults(json.data || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const onChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setShowDropdown(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val.trim()), 300)
  }

  const onSelect = (address) => {
    setShowDropdown(false)
    setQuery('')
    router.push(`/wallet-tracker/${encodeURIComponent(address)}`)
  }

  const looksLikeAddress = (q) => {
    if (q.startsWith('0x') && q.length >= 10) return true   // EVM
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q)) return true // Solana/base58
    if (q.startsWith('r') && q.length >= 25) return true     // XRP
    if (q.startsWith('bc1') || q.startsWith('1') || q.startsWith('3')) return q.length >= 26 // BTC
    return false
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (looksLikeAddress(q)) {
      onSelect(q)
    }
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <SearchContainer ref={containerRef}>
      <SearchShell onSubmit={onSubmit}>
        <span className="leading-icon" aria-hidden>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <SearchInput
          placeholder="Search by wallet or entity"
          aria-label="Search by wallet address or entity name"
          value={query}
          onChange={onChange}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
        />
      </SearchShell>
      {showDropdown && results.length > 0 && (
        <Dropdown>
          {results.map((r) => (
            <DropdownItem key={r.address} onClick={() => onSelect(r.address)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <AddrText>{shortenAddress(r.address, 8)}</AddrText>
                {r.entity_name && <EntityText>{r.entity_name}</EntityText>}
              </div>
              {r.chain && <ChainBadge>{r.chain}</ChainBadge>}
            </DropdownItem>
          ))}
        </Dropdown>
      )}
      {showDropdown && !loading && results.length === 0 && query.length >= 2 && (
        <Dropdown>
          {looksLikeAddress(query.trim()) ? (
            <DropdownItem onClick={() => onSelect(query.trim())}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <AddrText>{shortenAddress(query.trim(), 8)}</AddrText>
                <EntityText>View this wallet</EntityText>
              </div>
            </DropdownItem>
          ) : (
            <li style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No results found
            </li>
          )}
        </Dropdown>
      )}
    </SearchContainer>
  )
}
