'use client'

import { useState } from 'react'
import { usePosition } from '@/hooks/usePosition'
import { useTradingStore } from '@/stores/tradingStore'
import { formatPrice, formatPnl, formatPct } from '@/lib/utils'
import type { Position, CloseReason } from '@/types/trading'

type Tab = 'open' | 'history'

const REASON_LABEL: Record<CloseReason, { label: string; color: string }> = {
  manual:     { label: 'Closed',     color: 'var(--text-secondary)' },
  tp:         { label: 'Take Profit', color: 'var(--long)' },
  sl:         { label: 'Stop Loss',   color: 'var(--short)' },
  liquidated: { label: 'Liquidated',  color: '#F97316' },
}

function formatDuration(openedAt: number, closedAt: number): string {
  const ms = closedAt - openedAt
  const m  = Math.floor(ms / 60000)
  const h  = Math.floor(m / 60)
  const d  = Math.floor(h / 24)
  if (d > 0)  return `${d}d ${h % 24}h`
  if (h > 0)  return `${h}h ${m % 60}m`
  if (m > 0)  return `${m}m`
  return `<1m`
}

export function PositionPanel() {
  const [tab, setTab] = useState<Tab>('open')

  const { openPositions, closedPositions, totalUnrealizedPnl, getPositionPnL, closePosition } =
    usePosition()
  const priceData = useTradingStore((s) => s.priceData)

  const totalRealizedPnl = closedPositions.reduce(
    (sum, p) => sum + (p.realizedPnl ?? 0), 0
  )

  return (
    <div
      className="border-t h-44 flex flex-col"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <TabButton active={tab === 'open'} onClick={() => setTab('open')}>
          Positions ({openPositions.length})
        </TabButton>
        <TabButton active={tab === 'history'} onClick={() => setTab('history')}>
          History ({closedPositions.length})
        </TabButton>

        {/* Trailing PnL summary */}
        <div className="ml-auto flex items-center gap-3">
          {tab === 'open' && openPositions.length > 0 && (
            <PnlBadge label="Unrealized" value={totalUnrealizedPnl} />
          )}
          {tab === 'history' && closedPositions.length > 0 && (
            <PnlBadge label="Realized" value={totalRealizedPnl} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'open' ? (
          openPositions.length === 0 ? (
            <EmptyState text="No open positions" />
          ) : (
            <table className="w-full text-xs">
              <TableHead cols={['Side', 'Size', 'Entry', 'Liq. Price', 'PnL', '']} />
              <tbody>
                {openPositions.map((pos) => (
                  <OpenRow
                    key={pos.id}
                    position={pos}
                    pnl={priceData ? getPositionPnL(pos.id) : null}
                    onClose={() => priceData && closePosition(pos.id, priceData.price, 'manual')}
                  />
                ))}
              </tbody>
            </table>
          )
        ) : (
          closedPositions.length === 0 ? (
            <EmptyState text="No closed positions yet" />
          ) : (
            <table className="w-full text-xs">
              <TableHead cols={['Side', 'Entry', 'Exit', 'PnL', 'Duration', 'Reason']} />
              <tbody>
                {[...closedPositions].reverse().map((pos) => (
                  <HistoryRow key={pos.id} position={pos} />
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function TabButton({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] uppercase tracking-wide py-2.5 border-b-2 font-medium font-sans mr-3 transition-colors"
      style={{
        color:       active ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderColor: active ? 'var(--accent)' : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

function TableHead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
        {cols.map((h) => (
          <th
            key={h}
            className="px-4 py-2 text-left font-normal text-[10px] uppercase tracking-wide font-sans"
            style={{ color: 'var(--text-secondary)' }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="flex items-center justify-center h-full text-xs font-mono"
      style={{ color: 'var(--text-muted)' }}
    >
      — {text} —
    </div>
  )
}

function PnlBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[10px] font-sans uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span
        className="text-xs font-mono tabular-nums font-semibold"
        style={{ color: value >= 0 ? 'var(--long)' : 'var(--short)' }}
      >
        {formatPnl(value)}
      </span>
    </span>
  )
}

function OpenRow({
  position, pnl, onClose,
}: {
  position: Position
  pnl: ReturnType<ReturnType<typeof usePosition>['getPositionPnL']>
  onClose: () => void
}) {
  return (
    <tr
      className="border-b transition-colors"
      style={{ borderColor: 'var(--border)' }}
    >
      <td className="px-4 py-2">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
          style={{
            color:      position.side === 'long' ? 'var(--long)' : 'var(--short)',
            background: position.side === 'long' ? 'var(--long-dim)' : 'var(--short-dim)',
          }}
        >
          {position.side.toUpperCase()} {position.leverage}x
        </span>
      </td>
      <td className="px-4 py-2 font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {formatPrice(position.size)}
      </td>
      <td className="px-4 py-2 font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {formatPrice(position.entryPrice)}
      </td>
      <td className="px-4 py-2 font-mono tabular-nums" style={{ color: 'var(--short)' }}>
        {formatPrice(position.liquidationPrice)}
      </td>
      <td className="px-4 py-2">
        {pnl ? (
          <span
            className="font-mono tabular-nums"
            style={{ color: pnl.unrealizedPnl >= 0 ? 'var(--long)' : 'var(--short)' }}
          >
            {formatPnl(pnl.unrealizedPnl)} ({formatPct(pnl.unrealizedPnlPct)})
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        )}
      </td>
      <td className="px-4 py-2">
        <button
          onClick={onClose}
          className="text-[10px] font-sans uppercase tracking-wide px-2 py-0.5 rounded border transition-colors"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
        >
          Close
        </button>
      </td>
    </tr>
  )
}

function HistoryRow({ position }: { position: Position }) {
  const reason = REASON_LABEL[position.closeReason ?? 'manual']
  const pnl    = position.realizedPnl ?? 0
  const duration = position.closedAt
    ? formatDuration(position.openedAt, position.closedAt)
    : '—'

  return (
    <tr
      className="border-b transition-colors"
      style={{ borderColor: 'var(--border)' }}
    >
      <td className="px-4 py-2">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
          style={{
            color:      position.side === 'long' ? 'var(--long)' : 'var(--short)',
            background: position.side === 'long' ? 'var(--long-dim)' : 'var(--short-dim)',
          }}
        >
          {position.side.toUpperCase()} {position.leverage}x
        </span>
      </td>
      <td className="px-4 py-2 font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
        {formatPrice(position.entryPrice)}
      </td>
      <td className="px-4 py-2 font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {position.exitPrice ? formatPrice(position.exitPrice) : '—'}
      </td>
      <td className="px-4 py-2">
        <span
          className="font-mono tabular-nums font-semibold"
          style={{ color: pnl >= 0 ? 'var(--long)' : 'var(--short)' }}
        >
          {formatPnl(pnl)}
        </span>
      </td>
      <td className="px-4 py-2 font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
        {duration}
      </td>
      <td className="px-4 py-2">
        <span className="text-[10px] font-sans" style={{ color: reason.color }}>
          {reason.label}
        </span>
      </td>
    </tr>
  )
}
