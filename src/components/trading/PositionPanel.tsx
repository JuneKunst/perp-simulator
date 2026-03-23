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
    <div className="border-t border-gray-800 bg-gray-900 h-44 flex flex-col">
      {/* Tab */}
      <div className="flex items-center gap-4 px-4 border-b border-gray-800">
        <button className="text-xs text-white py-2 border-b-2 border-blue-500 font-medium">
          Open Positions ({openPositions.length})
        </button>
        <button className="text-xs text-gray-500 py-2 hover:text-gray-300">
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
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            No open positions
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                {['Side', 'Size', 'Entry Price', 'Liq. Price', 'PnL', ''].map((h) => (
                  <th key={h} className="px-4 py-2 text-left font-normal">
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
    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
      <td className="px-4 py-2">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-semibold',
            position.side === 'long'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          )}
        >
          {position.side.toUpperCase()} {position.leverage}x
        </span>
      </td>
      <td className="px-4 py-2 text-gray-200">{formatPrice(position.size)}</td>
      <td className="px-4 py-2 text-gray-200">{formatPrice(position.entryPrice)}</td>
      <td className="px-4 py-2 text-red-400">{formatPrice(position.liquidationPrice)}</td>
      <td className="px-4 py-2">
        {pnl ? (
          <span className={cn(pnl.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400')}>
            {formatPnl(pnl.unrealizedPnl)} ({formatPct(pnl.unrealizedPnlPct)})
          </span>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </td>
      <td className="px-4 py-2">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2 py-0.5 rounded text-xs transition-colors"
        >
          Close
        </button>
      </td>
    </tr>
  )
}
