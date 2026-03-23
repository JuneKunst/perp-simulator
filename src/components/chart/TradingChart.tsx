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
import { useTheme } from '@/hooks/useTheme'

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

// Theme-specific chart colors
function getChartTheme(isDark: boolean) {
  return {
    bg:          isDark ? '#030712' : '#FFFFFF',
    textColor:   isDark ? '#6B7280' : '#8B95A1',
    gridLines:   isDark ? '#111827' : '#F2F4F6',
    borderColor: isDark ? '#1f2937' : '#E5E8EB',
    upColor:     isDark ? '#26A17B' : '#0DA878',
    downColor:   isDark ? '#E05252' : '#F04452',
    liqColor:    isDark ? '#f97316' : '#F07523',
    tpColor:     isDark ? '#3b82f6' : '#3182F6',
    slColor:     isDark ? '#a855f7' : '#9333ea',
  }
}

export function TradingChart({ symbol }: Props) {
  const containerRef    = useRef<HTMLDivElement>(null)
  const chartRef        = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const positionLinesRef = useRef<Map<string, PositionLines>>(new Map())
  const liveCandleRef   = useRef<LiveCandle | null>(null)

  const priceData      = useTradingStore((s) => s.priceData)
  const { openPositions } = usePosition()
  const { theme }      = useTheme()
  const isDark         = theme === 'dark'

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return
    const colors = getChartTheme(isDark)

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.bg },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridLines },
        horzLines: { color: colors.gridLines },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: colors.borderColor },
      timeScale: { borderColor: colors.borderColor, timeVisible: true },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor:        colors.upColor,
      downColor:      colors.downColor,
      borderUpColor:  colors.upColor,
      borderDownColor: colors.downColor,
      wickUpColor:    colors.upColor,
      wickDownColor:  colors.downColor,
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    PriceFeedService.getCandles(symbol, '1h', 200).then((candles) => {
      candleSeries.setData(candles as unknown as CandlestickData[])
      chart.timeScale().fitContent()
    })

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

  // Update chart colors when theme changes
  useEffect(() => {
    const chart = chartRef.current
    const series = candleSeriesRef.current
    if (!chart || !series) return
    const colors = getChartTheme(isDark)

    chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: colors.bg },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridLines },
        horzLines: { color: colors.gridLines },
      },
      rightPriceScale: { borderColor: colors.borderColor },
      timeScale: { borderColor: colors.borderColor },
    })

    series.applyOptions({
      upColor:         colors.upColor,
      downColor:       colors.downColor,
      borderUpColor:   colors.upColor,
      borderDownColor: colors.downColor,
      wickUpColor:     colors.upColor,
      wickDownColor:   colors.downColor,
    })
  }, [isDark])

  // Sync position lines
  useEffect(() => {
    const series = candleSeriesRef.current
    if (!series) return
    const colors = getChartTheme(isDark)
    const linesMap = positionLinesRef.current
    const openIds = new Set(openPositions.map((p) => p.id))

    for (const [id, lines] of linesMap) {
      if (!openIds.has(id)) {
        series.removePriceLine(lines.entry)
        series.removePriceLine(lines.liquidation)
        if (lines.takeProfit) series.removePriceLine(lines.takeProfit)
        if (lines.stopLoss)   series.removePriceLine(lines.stopLoss)
        linesMap.delete(id)
      }
    }

    for (const pos of openPositions) {
      if (linesMap.has(pos.id)) continue

      const entryColor = pos.side === 'long' ? colors.upColor : colors.downColor

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
        color: colors.liqColor,
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Liq.',
      })

      const lines: PositionLines = { entry, liquidation }

      if (pos.takeProfitPrice) {
        lines.takeProfit = series.createPriceLine({
          price: pos.takeProfitPrice,
          color: colors.tpColor,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: 'TP',
        })
      }

      if (pos.stopLossPrice) {
        lines.stopLoss = series.createPriceLine({
          price: pos.stopLossPrice,
          color: colors.slColor,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: 'SL',
        })
      }

      linesMap.set(pos.id, lines)
    }
  }, [openPositions, isDark])

  // Live candle OHLC streaming
  useEffect(() => {
    if (!candleSeriesRef.current || !priceData) return

    const now = Math.floor(Date.now() / 1000)
    const hourTs = Math.floor(now / 3600) * 3600
    const price = priceData.price
    const live = liveCandleRef.current

    if (!live || live.time !== hourTs) {
      liveCandleRef.current = { time: hourTs, open: price, high: price, low: price, close: price }
    } else {
      liveCandleRef.current = {
        time: hourTs,
        open: live.open,
        high: Math.max(live.high, price),
        low:  Math.min(live.low, price),
        close: price,
      }
    }

    candleSeriesRef.current.update({
      time:  liveCandleRef.current.time as unknown as CandlestickData['time'],
      open:  liveCandleRef.current.open,
      high:  liveCandleRef.current.high,
      low:   liveCandleRef.current.low,
      close: liveCandleRef.current.close,
    })
  }, [priceData])

  return (
    <div className="relative flex-1 min-h-0">
      <div ref={containerRef} className="w-full h-full" />

      {openPositions.length > 0 && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {openPositions.map((pos) => (
            <div
              key={pos.id}
              className="text-xs px-2 py-0.5 rounded font-mono border"
              style={{
                color:       pos.side === 'long' ? 'var(--long)' : 'var(--short)',
                background:  pos.side === 'long' ? 'var(--long-dim)' : 'var(--short-dim)',
                borderColor: pos.side === 'long' ? 'var(--long)' : 'var(--short)',
                opacity: 0.9,
              }}
            >
              {pos.side.toUpperCase()} {pos.leverage}x · {pos.entryPrice.toLocaleString()} → Liq {pos.liquidationPrice.toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
