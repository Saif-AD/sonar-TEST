import React, { Suspense } from 'react'
import AuthGuard from '@/app/components/AuthGuard'
import WalletTrackerTabs from '@/app/components/wallet-tracker/WalletTrackerTabs'
import WatchlistClient from './WatchlistClient'
import HubPageHeader from '@/app/components/wallet-tracker/HubPageHeader'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Wallet watchlist | Sonar',
  description:
    'Your tracked figures, entities, and wallets in one place. Follow whales, institutions, and public figures on Sonar.',
  alternates: { canonical: 'https://www.sonartracker.io/watchlist' },
  openGraph: {
    title: 'Your watchlist | Sonar',
    description:
      'Your unified watchlist across figures, entities, and wallets.',
    url: 'https://www.sonartracker.io/watchlist',
    type: 'website',
  },
}

export default function WatchlistPage() {
  return (
    <AuthGuard>
      <main
        style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.5rem 2rem 2rem',
          color: 'var(--text-primary)',
        }}
      >
        <HubPageHeader
          title="Wallet watchlist"
          subtitle="Everything you track across Sonar — figures, entities, and wallets."
        />

        <WalletTrackerTabs activeOverride="following" />

        {/* WatchlistClient reads ?tab= via useSearchParams, which Next.js
            requires be wrapped in Suspense in the app router. */}
        <Suspense fallback={null}>
          <WatchlistClient />
        </Suspense>
      </main>
    </AuthGuard>
  )
}
