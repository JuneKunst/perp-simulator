'use client'

import { usePosition } from '@/hooks/usePosition'
import { useTradingStore } from '@/stores/tradingStore'
import { formatPrice, formatPnl, formatPct } from '@/lib/utils'
import type { Position } from '@/types/trading'

export function PositionPanel() {
  const { openPositions, closedPositions, totalUnrealizedPnl, getPositionPnL, closePosition } =
    usePosition()
  const priceData = useTradingStore((s) => s.priceData)

  return (
    <div
      className="border-t h-44 flex flex-col"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Tabs */}
      <div className="flex items-center gap-4 px-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          className="text-[10px] uppercase tracking-wide py-2.5 border-b-2 font-medium font-sans"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--accent)' }}
        >
          Positions ({openPositions.length})
        </button>
        <button
          className="text-[10px] uppercase tracking-wide py-2.5 border-b-2 border-transparent font-sans transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          History ({closedPositions.length})
        </button>

        {openPositions.length > 0 && (
          <span
            className="ml-auto text-xs font-mono tabular-nums font-semibold"
            style={{ color: totalUnrealizedPnl >= 0 ? 'var(--long)' : 'var(--short)' }}
          >
            {formatPnl(totalUnrealizedPnl)}
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {openPositions.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-xs font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            — no open positions —
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Side', 'Size', 'Entry Price', 'Liq. Price', 'PnL', ''].map((h) => (
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
            <tbody>
              {openPositions.map((pos) => (
                <PositionRow
                  key={pos.id}
                  position={pos}
                  pnl={priceData ? getPositionPnL(pos.id) : null}
                  onClose={() => priceData && closePosition(pos.id, priceData.price)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function PositionRow({
  position,
  pnl,
  onClose,
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
          style={{
            color: 'var(--text-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          Close
        </button>
      </td>
    </tr>
  )
}
