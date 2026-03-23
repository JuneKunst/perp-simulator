'use client'

import { useEffect, useRef, useState } from 'react'
import { useTradingStore } from '@/stores/tradingStore'
import { formatPrice, formatPct, cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/education/InfoTooltip'

export function PriceBar() {
  const priceData = useTradingStore((s) => s.priceData)

  if (!priceData) {
    return (
      <div className="flex items-center gap-6 px-4 py-2.5 border-b border-[#252830] bg-[#111316] text-sm">
        <span className="text-gray-600 animate-pulse font-mono text-xs">Connecting to price feed...</span>
      </div>
    )
  }

  const isPositive = priceData.change24h >= 0

  return (
    <div className="flex items-center gap-0 px-4 py-2.5 border-b border-[#252830] bg-[#111316] text-sm overflow-x-auto">
      {/* Primary: price + 24h change */}
      <div className="flex items-center gap-3 flex-shrink-0 pr-4 mr-4 border-r border-[#252830]">
        <span className="text-xs text-gray-500 font-sans tracking-wide">BTC/USDT</span>
        <LivePrice price={priceData.price} />
        <span className={cn(
          'text-xs font-mono tabular-nums px-1.5 py-0.5 rounded',
          isPositive
            ? 'text-[#26A17B] bg-[rgba(38,161,123,0.1)]'
            : 'text-[#E05252] bg-[rgba(224,82,82,0.1)]'
        )}>
          {isPositive ? '+' : ''}{formatPct(priceData.change24h)}
        </span>
      </div>

      {/* Supporting stats */}
      <div className="flex items-center gap-6">
        <Stat label="24h High" value={formatPrice(priceData.high24h)} />
        <Stat label="24h Low" value={formatPrice(priceData.low24h)} />
        <Stat
          label="Funding Rate"
          value={`${(priceData.fundingRate * 100).toFixed(4)}%`}
          tooltipKey="funding-rate"
          valueColor={priceData.fundingRate >= 0 ? 'text-[#26A17B]' : 'text-[#E05252]'}
        />
        <Stat
          label="Volume 24h"
          value={`$${(priceData.volume24h / 1_000_000).toFixed(1)}M`}
        />
      </div>
    </div>
  )
}

function LivePrice({ price }: { price: number }) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const prevPrice = useRef(price)

  useEffect(() => {
    if (price === prevPrice.current) return
    const direction = price > prevPrice.current ? 'up' : 'down'
    prevPrice.current = price
    setFlash(direction)
    const t = setTimeout(() => setFlash(null), 500)
    return () => clearTimeout(t)
  }, [price])

  return (
    <span
      className={cn(
        'font-mono text-base font-semibold tabular-nums transition-colors duration-300',
        flash === 'up' && 'text-[#26A17B]',
        flash === 'down' && 'text-[#E05252]',
        flash === null && 'text-white'
      )}
    >
      {formatPrice(price)}
    </span>
  )
}

function Stat({
  label,
  value,
  tooltipKey,
  valueColor = 'text-gray-200',
}: {
  label: string
  value: string
  tooltipKey?: string
  valueColor?: string
}) {
  return (
    <div className="flex flex-col flex-shrink-0 gap-0.5">
      <span className="text-gray-600 text-[10px] font-sans tracking-wide uppercase flex items-center gap-1">
        {label}
        {tooltipKey && <InfoTooltip termKey={tooltipKey} />}
      </span>
      <span className={cn('text-sm font-mono tabular-nums font-medium', valueColor)}>
        {value}
      </span>
    </div>
  )
}
