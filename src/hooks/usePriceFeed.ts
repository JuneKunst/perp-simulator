import { useEffect, useRef } from 'react'
import { PriceFeedService } from '@/services/price/PriceFeedService'
import { useTradingStore } from '@/stores/tradingStore'

export function usePriceFeed(symbol: string = 'BTCUSDT') {
  const serviceRef = useRef<PriceFeedService | null>(null)
  const setPriceData = useTradingStore((s) => s.setPriceData)
  const positions = useTradingStore((s) => s.positions)
  const liquidatePosition = useTradingStore((s) => s.liquidatePosition)
  const closePosition = useTradingStore((s) => s.closePosition)

  useEffect(() => {
    const service = new PriceFeedService(symbol)
    serviceRef.current = service

    const unsubscribe = service.subscribe((data) => {
      setPriceData(data)

      // Check liquidation and TP/SL for all open positions
      positions
        .filter((p) => p.status === 'open')
        .forEach((p) => {
          const { PositionEngine } = require('@/services/trading/PositionEngine')

          if (PositionEngine.isLiquidated(p, data.price)) {
            liquidatePosition(p.id)
            return
          }

          const trigger = PositionEngine.checkTPSL(p, data.price)
          if (trigger) closePosition(p.id, data.price)
        })
    })

    return () => {
      unsubscribe()
      service.destroy()
    }
  }, [symbol])

  return useTradingStore((s) => s.priceData)
}
