/**
 * ARCHIVED — original Whale icon SVG used in WalletTrackerWrapper.
 *
 * Pulled out of the live wrapper on purpose (the section title was simplified
 * to match the hub aesthetic) but kept in the codebase because we love this
 * little guy and may want to reuse him later (loading states, easter eggs,
 * empty states, etc.). Drop in like:
 *
 *   import WhaleIcon from '@/components/wallet-tracker/_archive/WhaleIcon'
 *   <WhaleIcon />
 */
'use client'
import React from 'react'

export default function WhaleIcon({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <path
        d="M52 28c0-11-9-20-20-20S12 17 12 28c0 4.5 1.5 8.6 4 12l-4 8h8c3.5 2.5 7.6 4 12 4s8.5-1.5 12-4h8l-4-8c2.5-3.4 4-7.5 4-12z"
        fill="url(#wg)"
      />
      <circle cx="24" cy="26" r="3" fill="#0a1621" />
      <circle cx="24.5" cy="25.5" r="1" fill="#fff" />
      <path
        d="M14 36c4 3 8 4.5 12 4.5"
        stroke="#0a1621"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path d="M48 18c2-4 6-6 10-5-2 3-5 6-10 5z" fill="url(#wg2)" opacity="0.7" />
      <defs>
        <linearGradient id="wg" x1="12" y1="8" x2="52" y2="52">
          <stop stopColor="#00e5ff" />
          <stop offset="1" stopColor="#00d4aa" />
        </linearGradient>
        <linearGradient id="wg2" x1="48" y1="13" x2="58" y2="18">
          <stop stopColor="#00e5ff" />
          <stop offset="1" stopColor="#36a6ba" />
        </linearGradient>
      </defs>
    </svg>
  )
}
