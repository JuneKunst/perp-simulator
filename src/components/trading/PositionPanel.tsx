'use client'

import { usePosition } from '@/hooks/usePosition'
import { useTradingStore } from '@/stores/tradingStore'
import { formatPrice, formatPnl, formatPct, cn } from '@/lib/utils'
import type { Position } from '@/types/trading'

export function PositionPanel() {
  const { openPositions, closedPositions, totalUnrealizedPnl, getPositionPnL, closePosition } =
    usePosition()
  const priceData = useTradingStore((s) => s.priceData)

  return (
    <div className="border-t border-[#252830] bg-[#111316] h-44 flex flex-col">
      {/* Tab */}
      <div className="flex items-center gap-4 px-4 border-b border-[#252830]">
        <button className="text-[10px] uppercase tracking-wide text-white py-2.5 border-b-2 border-[#E8FF47] font-medium font-sans">
          Positions ({openPositions.length})
        </button>
        <button className="text-[10px] uppercase tracking-wide text-gray-600 py-2.5 hover:text-gray-400 font-sans">
          History ({closedPositions.length})
        </button>
        {openPositions.length > 0 && (
          <span
            className={cn(
              'ml-auto text-xs font-semibold',
              totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            Total PnL: {formatPnl(totalUnrealizedPnl)}
          </span>
        )}
      </div>

      {/* Positions list */}
      <div className="flex-1 overflow-y-auto">
        {openPositions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-700 text-xs font-mono">
            — no open positions —
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#252830]">
                {['Side', 'Size', 'Entry Price', 'Liq. Price', 'PnL', ''].map((h) => (
                  <th key={h} className="px-4 py-2 text-left font-normal text-[10px] uppercase tracking-wide text-gray-600 font-sans">
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
    <tr className="border-b border-[#252830]/60 hover:bg-[#181B1F] transition-colors">
      <td className="px-4 py-2">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-mono font-semibold',
            position.side === 'long'
              ? 'bg-[rgba(38,161,123,0.15)] text-[#26A17B]'
              : 'bg-[rgba(224,82,82,0.15)] text-[#E05252]'
          )}
        >
          {position.side.toUpperCase()} {position.leverage}x
        </span>
      </td>
      <td className="px-4 py-2 text-gray-300 font-mono tabular-nums text-xs">{formatPrice(position.size)}</td>
      <td className="px-4 py-2 text-gray-300 font-mono tabular-nums text-xs">{formatPrice(position.entryPrice)}</td>
      <td className="px-4 py-2 text-[#E05252] font-mono tabular-nums text-xs">{formatPrice(position.liquidationPrice)}</td>
      <td className="px-4 py-2">
        {pnl ? (
          <span className={cn(
            'font-mono tabular-nums text-xs',
            pnl.unrealizedPnl >= 0 ? 'text-[#26A17B]' : 'text-[#E05252]'
          )}>
            {formatPnl(pnl.unrealizedPnl)} ({formatPct(pnl.unrealizedPnlPct)})
          </span>
        ) : (
          <span className="text-gray-700 font-mono text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-2">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-white border border-[#252830] hover:border-[#3a3f4a] px-2 py-0.5 rounded text-[10px] font-sans uppercase tracking-wide transition-colors"
        >
          Close
        </button>
      </td>
    </tr>
  )
}
