'use client'

import { useTradingStore } from '@/stores/tradingStore'
import { formatPrice, formatPct } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function PriceBar() {
  const priceData = useTradingStore((s) => s.priceData)

  if (!priceData) {
    return (
      <div className="flex items-center gap-6 px-4 py-2 border-b border-gray-800 bg-gray-900 text-sm">
        <span className="text-gray-500 animate-pulse">Connecting to price feed...</span>
      </div>
    )
  }

  const isPositive = priceData.change24h >= 0

  return (
    <div className="flex items-center gap-6 px-4 py-2 border-b border-gray-800 bg-gray-900 text-sm overflow-x-auto">
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-semibold text-white text-base">
          {formatPrice(priceData.price)}
        </span>
        <span className={cn('text-xs', isPositive ? 'text-green-400' : 'text-red-400')}>
          {formatPct(priceData.change24h)}
        </span>
      </div>

      <Stat label="24h High" value={formatPrice(priceData.high24h)} />
      <Stat label="24h Low" value={formatPrice(priceData.low24h)} />
      <Stat
        label="Funding Rate"
        value={`${(priceData.fundingRate * 100).toFixed(4)}%`}
        tooltip="funding-rate"
      />
      <Stat
        label="Volume (24h)"
        value={`$${(priceData.volume24h / 1_000_000).toFixed(1)}M`}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  tooltip,
}: {
  label: string
  value: string
  tooltip?: string
}) {
  return (
    <div className="flex flex-col flex-shrink-0">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-200 text-sm font-medium">{value}</span>
    </div>
  )
}
