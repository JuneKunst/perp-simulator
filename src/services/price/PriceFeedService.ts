import type { PriceData, Candle } from '@/types/trading'

type PriceCallback = (data: PriceData) => void

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws'
const BINANCE_REST_URL = 'https://api.binance.com/api/v3'

export class PriceFeedService {
  private ws: WebSocket | null = null
  private symbol: string
  private callbacks: Set<PriceCallback> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isDestroyed = false

  constructor(symbol: string = 'BTCUSDT') {
    this.symbol = symbol.toUpperCase()
  }

  subscribe(cb: PriceCallback): () => void {
    this.callbacks.add(cb)
    if (!this.ws) this.connect()
    return () => this.callbacks.delete(cb)
  }

  private connect() {
    const stream = `${this.symbol.toLowerCase()}@ticker`
    this.ws = new WebSocket(`${BINANCE_WS_URL}/${stream}`)

    this.ws.onmessage = (event) => {
      const raw = JSON.parse(event.data)
      const data: PriceData = {
        symbol: this.symbol,
        price: parseFloat(raw.c),
        timestamp: raw.E,
        change24h: parseFloat(raw.P),
        high24h: parseFloat(raw.h),
        low24h: parseFloat(raw.l),
        volume24h: parseFloat(raw.v),
        fundingRate: 0,  // fetched separately
        openInterest: 0,
      }
      this.callbacks.forEach((cb) => cb(data))
    }

    this.ws.onclose = () => {
      if (!this.isDestroyed) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000)
      }
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  destroy() {
    this.isDestroyed = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
    this.callbacks.clear()
  }

  /**
   * Fetch historical klines (candles) from Binance REST API.
   */
  static async getCandles(
    symbol: string,
    interval: string = '1h',
    limit: number = 200
  ): Promise<Candle[]> {
    const url = `${BINANCE_REST_URL}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`
    const res = await fetch(url)
    const raw: number[][] = await res.json()

    return raw.map((k) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(String(k[1])),
      high: parseFloat(String(k[2])),
      low: parseFloat(String(k[3])),
      close: parseFloat(String(k[4])),
      volume: parseFloat(String(k[5])),
    }))
  }

  /**
   * Fetch current funding rate from Binance Futures.
   */
  static async getFundingRate(symbol: string): Promise<number> {
    try {
      const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol.toUpperCase()}&limit=1`
      const res = await fetch(url)
      const data = await res.json()
      return parseFloat(data[0]?.fundingRate ?? '0')
    } catch {
      return 0
    }
  }
}
