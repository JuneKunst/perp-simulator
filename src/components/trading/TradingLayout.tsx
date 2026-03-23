'use client'

import { usePriceFeed } from '@/hooks/usePriceFeed'
import { Header } from '@/components/ui/Header'
import { PriceBar } from '@/components/trading/PriceBar'
import { TradingChart } from '@/components/chart/TradingChart'
import { OrderPanel } from '@/components/trading/OrderPanel'
import { PositionPanel } from '@/components/trading/PositionPanel'

export function TradingLayout() {
  usePriceFeed('BTCUSDT')

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Header />
      <PriceBar />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <TradingChart symbol="BTCUSDT" />
          <PositionPanel />
        </div>

        {/* Order panel — subtle accent left border */}
        <div
          className="w-80 flex-shrink-0 border-l-2"
          style={{ borderColor: 'var(--accent-dim)' }}
        >
          <OrderPanel />
        </div>
      </div>
    </div>
  )
}
