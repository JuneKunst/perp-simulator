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
    <div className="flex flex-col h-screen bg-[#0B0C0E] overflow-hidden">
      <Header />
      <PriceBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Chart — takes most of the space */}
        <div className="flex-1 flex flex-col min-w-0">
          <TradingChart symbol="BTCUSDT" />
          <PositionPanel />
        </div>

        {/* Order panel — 2px accent border separates from chart */}
        <div className="w-80 border-l-2 border-[rgba(232,255,71,0.08)] flex-shrink-0">
          <OrderPanel />
        </div>
      </div>
    </div>
  )
}
