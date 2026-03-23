'use client'

import { useEffect, useRef } from 'react'
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type IPriceLine,
  ColorType,
  CrosshairMode,
  LineStyle,
} from 'lightweight-charts'
import { PriceFeedService } from '@/services/price/PriceFeedService'
import { useTradingStore } from '@/stores/tradingStore'
import { usePosition } from '@/hooks/usePosition'

interface Props {
  symbol: string
}

interface PositionLines {
  entry: IPriceLine
  liquidation: IPriceLine
  takeProfit?: IPriceLine
  stopLoss?: IPriceLine
}

interface LiveCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export function TradingChart({ symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const positionLinesRef = useRef<Map<string, PositionLines>>(new Map())
  const liveCandleRef = useRef<LiveCandle | null>(null)

  const priceData = useTradingStore((s) => s.priceData)
  const { openPositions } = usePosition()

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#030712' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#111827' },
        horzLines: { color: '#111827' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#1f2937' },
      timeScale: { borderColor: '#1f2937', timeVisible: true },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    // Load historical candles
    PriceFeedService.getCandles(symbol, '1h', 200).then((candles) => {
      candleSeries.setData(candles as unknown as CandlestickData[])
      chart.timeScale().fitContent()
    })

    // Resize observer
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
      positionLinesRef.current.clear()
    }
  }, [symbol])

  // Sync position lines whenever openPositions changes
  useEffect(() => {
    const series = candleSeriesRef.current
    if (!series) return

    const linesMap = positionLinesRef.current
    const openIds = new Set(openPositions.map((p) => p.id))

    // Remove lines for positions that are no longer open
    for (const [id, lines] of linesMap) {
      if (!openIds.has(id)) {
        series.removePriceLine(lines.entry)
        series.removePriceLine(lines.liquidation)
        if (lines.takeProfit) series.removePriceLine(lines.takeProfit)
        if (lines.stopLoss) series.removePriceLine(lines.stopLoss)
        linesMap.delete(id)
      }
    }

    // Add or update lines for current open positions
    for (const pos of openPositions) {
      if (linesMap.has(pos.id)) continue // already drawn

      const isLong = pos.side === 'long'
      const entryColor = isLong ? '#22c55e' : '#ef4444'

      const entry = series.createPriceLine({
        price: pos.entryPrice,
        color: entryColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Entry ${pos.side.toUpperCase()} ${pos.leverage}x`,
      })

      const liquidation = series.createPriceLine({
        price: pos.liquidationPrice,
        color: '#f97316',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Liq.',
      })

      const lines: PositionLines = { entry, liquidation }

      if (pos.takeProfitPrice) {
        lines.takeProfit = series.createPriceLine({
          price: pos.takeProfitPrice,
          color: '#3b82f6',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: 'TP',
        })
      }

      if (pos.stopLossPrice) {
        lines.stopLoss = series.createPriceLine({
          price: pos.stopLossPrice,
          color: '#a855f7',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: 'SL',
        })
      }

      linesMap.set(pos.id, lines)
    }
  }, [openPositions])

  // Stream live candle updates — maintain running OHLC for current hour
  useEffect(() => {
    if (!candleSeriesRef.current || !priceData) return

    const now = Math.floor(Date.now() / 1000)
    const hourTs = Math.floor(now / 3600) * 3600
    const price = priceData.price
    const live = liveCandleRef.current

    if (!live || live.time !== hourTs) {
      // New hour — start a fresh candle
      liveCandleRef.current = { time: hourTs, open: price, high: price, low: price, close: price }
    } else {
      liveCandleRef.current = {
        time: hourTs,
        open: live.open,
        high: Math.max(live.high, price),
        low: Math.min(live.low, price),
        close: price,
      }
    }

    candleSeriesRef.current.update({
      time: liveCandleRef.current.time as unknown as CandlestickData['time'],
      open: liveCandleRef.current.open,
      high: liveCandleRef.current.high,
      low: liveCandleRef.current.low,
      close: liveCandleRef.current.close,
    })
  }, [priceData])

  return (
    <div className="relative flex-1 min-h-0">
      <div ref={containerRef} className="w-full h-full" />

      {/* Position badge overlays (legend) */}
      {openPositions.length > 0 && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {openPositions.map((pos) => (
            <div
              key={pos.id}
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                pos.side === 'long'
                  ? 'bg-green-950 text-green-400 border border-green-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {pos.side.toUpperCase()} {pos.leverage}x · Entry {pos.entryPrice.toLocaleString()} · Liq{' '}
              {pos.liquidationPrice.toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
