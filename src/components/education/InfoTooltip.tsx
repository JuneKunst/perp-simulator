'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const GLOSSARY: Record<string, { title: string; body: string }> = {
  collateral: {
    title: 'Collateral',
    body: 'The amount of money you put up as a deposit to open a position. Think of it as your "skin in the game." If the trade goes against you, this is what you can lose.',
  },
  leverage: {
    title: 'Leverage',
    body: 'A multiplier on your position size. 10x leverage means $100 collateral controls a $1,000 position. Profits are amplified — but so are losses. High leverage = closer liquidation price.',
  },
  liquidation: {
    title: 'Liquidation Price',
    body: 'If the price hits this level, your position is automatically closed and you lose your collateral. This happens when losses exceed ~90% of your deposit. Always watch this number.',
  },
  'funding-rate': {
    title: 'Funding Rate',
    body: 'A fee paid every 8 hours between long and short traders. Positive rate = longs pay shorts. Negative = shorts pay longs. It keeps perpetual prices close to spot price.',
  },
  pnl: {
    title: 'Unrealized P&L',
    body: 'Your profit or loss if you closed the position right now. "Unrealized" means the trade is still open — nothing is actually gained or lost until you close.',
  },
  tpsl: {
    title: 'Take Profit / Stop Loss',
    body: 'Automatic orders that close your position at a target price. Take Profit locks in gains. Stop Loss limits your downside. Both trigger automatically when price reaches your level — no need to watch the screen.',
  },
}

export function InfoTooltip({ termKey }: { termKey: string }) {
  const [visible, setVisible] = useState(false)
  const term = GLOSSARY[termKey]
  if (!term) return null

  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="w-3.5 h-3.5 rounded-full bg-gray-700 text-gray-400 text-[9px] flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
      >
        ?
      </button>

      {visible && (
        <div className="absolute left-5 top-0 z-50 w-56 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-white text-xs font-semibold mb-1">{term.title}</p>
          <p className="text-gray-300 text-xs leading-relaxed">{term.body}</p>
        </div>
      )}
    </span>
  )
}
