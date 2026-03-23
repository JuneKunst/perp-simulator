import { useEffect } from 'react'
import { PriceFeedService } from '@/services/price/PriceFeedService'
import { useTradingStore } from '@/stores/tradingStore'
import { PositionEngine } from '@/services/trading/PositionEngine'

export function usePriceFeed(symbol: string = 'BTCUSDT') {
  useEffect(() => {
    const service = new PriceFeedService(symbol)

    const unsubscribe = service.subscribe((data) => {
      // Always read fresh state via getState — avoids stale closure
      const { setPriceData, positions, liquidatePosition, closePosition } =
        useTradingStore.getState()

      setPriceData(data)

      positions
        .filter((p) => p.status === 'open')
        .forEach((p) => {
          if (PositionEngine.isLiquidated(p, data.price)) {
            liquidatePosition(p.id)
            return
          }

          const trigger = PositionEngine.checkTPSL(p, data.price)
          if (trigger) closePosition(p.id, data.price, trigger)
        })
    })

    return () => {
      unsubscribe()
      service.destroy()
    }
  }, [symbol])

  return useTradingStore((s) => s.priceData)
}
