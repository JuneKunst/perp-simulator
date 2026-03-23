import { useMemo } from 'react'
import { useTradingStore } from '@/stores/tradingStore'
import { PositionEngine } from '@/services/trading/PositionEngine'

export function usePosition() {
  const positions = useTradingStore((s) => s.positions)
  const priceData = useTradingStore((s) => s.priceData)
  const openPosition = useTradingStore((s) => s.openPosition)
  const closePosition = useTradingStore((s) => s.closePosition)
  const balance = useTradingStore((s) => s.balance)

  const openPositions = useMemo(
    () => positions.filter((p) => p.status === 'open'),
    [positions]
  )

  const closedPositions = useMemo(
    () => positions.filter((p) => p.status !== 'open'),
    [positions]
  )

  const totalUnrealizedPnl = useMemo(() => {
    if (!priceData) return 0
    return openPositions.reduce((acc, p) => {
      const { unrealizedPnl } = PositionEngine.getPnL(p, priceData.price)
      return acc + unrealizedPnl
    }, 0)
  }, [openPositions, priceData])

  const getPositionPnL = (positionId: string) => {
    const position = positions.find((p) => p.id === positionId)
    if (!position || !priceData) return null
    return PositionEngine.getPnL(position, priceData.price)
  }

  return {
    openPositions,
    closedPositions,
    totalUnrealizedPnl,
    balance,
    openPosition,
    closePosition,
    getPositionPnL,
  }
}
