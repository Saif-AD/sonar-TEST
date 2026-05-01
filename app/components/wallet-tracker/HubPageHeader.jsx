'use client'

import React from 'react'

/**
 * Shared flat page header used by the Wallet Tracker hub and its sub-pages
 * (entities, figures, watchlist). Renders a gradient title + subtitle line
 * with no card chrome — keeps all four routes visually aligned.
 */
export default function HubPageHeader({ title, subtitle, right }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 auto' }}>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 3.4vw, 2.1rem)',
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            background:
              'linear-gradient(135deg, #7af8ff 0%, #22d3ee 60%, #36a6ba 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <div
            style={{
              marginTop: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {right ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
    </div>
  )
}
