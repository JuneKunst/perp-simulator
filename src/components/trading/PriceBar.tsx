'use client'

import { useEffect, useRef, useState } from 'react'
import { useTradingStore } from '@/stores/tradingStore'
import { formatPrice, formatPct, cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/education/InfoTooltip'

export function PriceBar() {
  const priceData = useTradingStore((s) => s.priceData)

  if (!priceData) {
    return (
      <div
        className="flex items-center gap-6 px-4 py-2.5 border-b text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <span className="animate-pulse font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          Connecting...
        </span>
      </div>
    )
  }

  const isPositive = priceData.change24h >= 0

  return (
    <div
      className="flex items-center gap-0 px-4 py-2.5 border-b text-sm overflow-x-auto"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Primary: symbol + price + change */}
      <div
        className="flex items-center gap-3 flex-shrink-0 pr-4 mr-4 border-r"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-xs font-sans tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          BTC/USDT
        </span>
        <LivePrice price={priceData.price} />
        <span
          className="text-xs font-mono tabular-nums px-1.5 py-0.5 rounded"
          style={{
            color: isPositive ? 'var(--long)' : 'var(--short)',
            background: isPositive ? 'var(--long-dim)' : 'var(--short-dim)',
          }}
        >
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
          valueStyle={{ color: priceData.fundingRate >= 0 ? 'var(--long)' : 'var(--short)' }}
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
      className="font-mono text-base font-semibold tabular-nums transition-colors duration-300"
      style={{
        color: flash === 'up'
          ? 'var(--long)'
          : flash === 'down'
          ? 'var(--short)'
          : 'var(--text-primary)',
      }}
    >
      {formatPrice(price)}
    </span>
  )
}

function Stat({
  label,
  value,
  tooltipKey,
  valueStyle,
}: {
  label: string
  value: string
  tooltipKey?: string
  valueStyle?: React.CSSProperties
}) {
  return (
    <div className="flex flex-col flex-shrink-0 gap-0.5">
      <span
        className="text-[10px] font-sans tracking-wide uppercase flex items-center gap-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
        {tooltipKey && <InfoTooltip termKey={tooltipKey} />}
      </span>
      <span
        className="text-sm font-mono tabular-nums font-medium"
        style={{ color: 'var(--text-primary)', ...valueStyle }}
      >
        {value}
      </span>
    </div>
  )
}
