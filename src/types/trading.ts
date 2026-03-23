export type Side = 'long' | 'short'

export type PositionStatus = 'idle' | 'open' | 'closed' | 'liquidated'

export type TransactionStatus =
  | 'idle'
  | 'signing'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed'

export interface Position {
  id: string
  side: Side
  entryPrice: number
  size: number         // USD value
  collateral: number   // USD value
  leverage: number
  liquidationPrice: number
  takeProfitPrice?: number
  stopLossPrice?: number
  openedAt: number     // timestamp
  status: PositionStatus
}

export interface PnL {
  unrealizedPnl: number
  unrealizedPnlPct: number
  fees: number
}

export interface OpenPositionParams {
  side: Side
  collateral: number
  leverage: number
  takeProfitPrice?: number
  stopLossPrice?: number
}

export interface PriceData {
  symbol: string
  price: number
  timestamp: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: number
  fundingRate: number
  openInterest: number
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}
