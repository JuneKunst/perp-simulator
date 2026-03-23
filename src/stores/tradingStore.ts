import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Position, PriceData, OpenPositionParams } from '@/types/trading'
import { PositionEngine } from '@/services/trading/PositionEngine'

interface TradingState {
  // Price
  priceData: PriceData | null
  setPriceData: (data: PriceData) => void

  // Balance (paper trading)
  balance: number
  setBalance: (balance: number) => void

  // Positions
  positions: Position[]
  openPosition: (params: OpenPositionParams) => void
  closePosition: (id: string, currentPrice: number) => void
  liquidatePosition: (id: string) => void

  // UI state
  selectedLeverage: number
  setSelectedLeverage: (leverage: number) => void
  selectedSide: 'long' | 'short'
  setSelectedSide: (side: 'long' | 'short') => void
  collateralInput: string
  setCollateralInput: (value: string) => void

  // Education overlay
  activeTooltip: string | null
  setActiveTooltip: (key: string | null) => void
}

const INITIAL_BALANCE = 10_000  // $10,000 paper balance

export const useTradingStore = create<TradingState>()(
  immer((set, get) => ({
    priceData: null,
    setPriceData: (data) => set((state) => { state.priceData = data }),

    balance: INITIAL_BALANCE,
    setBalance: (balance) => set((state) => { state.balance = balance }),

    positions: [],

    openPosition: (params) => {
      const { priceData, balance } = get()
      if (!priceData) return

      const fee = PositionEngine.getOpenFee(params.collateral, params.leverage)
      const totalCost = params.collateral + fee

      if (totalCost > balance) return  // insufficient balance

      const position = PositionEngine.buildPosition(params, priceData.price)

      set((state) => {
        state.positions.push(position)
        state.balance -= totalCost
      })
    },

    closePosition: (id, currentPrice) => {
      set((state) => {
        const idx = state.positions.findIndex((p) => p.id === id)
        if (idx === -1) return

        const position = state.positions[idx]
        const { unrealizedPnl, fees } = PositionEngine.getPnL(position, currentPrice)
        const returned = position.collateral + unrealizedPnl - fees

        state.balance += Math.max(returned, 0)
        state.positions[idx].status = 'closed'
      })
    },

    liquidatePosition: (id) => {
      set((state) => {
        const idx = state.positions.findIndex((p) => p.id === id)
        if (idx !== -1) state.positions[idx].status = 'liquidated'
        // collateral is lost — no balance returned
      })
    },

    selectedLeverage: 10,
    setSelectedLeverage: (leverage) =>
      set((state) => { state.selectedLeverage = leverage }),

    selectedSide: 'long',
    setSelectedSide: (side) =>
      set((state) => { state.selectedSide = side }),

    collateralInput: '',
    setCollateralInput: (value) =>
      set((state) => { state.collateralInput = value }),

    activeTooltip: null,
    setActiveTooltip: (key) =>
      set((state) => { state.activeTooltip = key }),
  }))
)
