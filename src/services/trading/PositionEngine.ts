import type { Side, Position, OpenPositionParams, PnL } from '@/types/trading'

const TAKER_FEE_RATE = 0.0006  // 0.06%
const MAKER_FEE_RATE = 0.0002  // 0.02%
const LIQUIDATION_THRESHOLD = 0.9  // 90% of collateral lost

export class PositionEngine {
  /**
   * Calculate liquidation price based on side, entry, leverage.
   * Long:  liquidates when price drops enough to lose 90% of collateral
   * Short: liquidates when price rises enough to lose 90% of collateral
   */
  static getLiquidationPrice(
    side: Side,
    entryPrice: number,
    leverage: number
  ): number {
    const liquidationPct = LIQUIDATION_THRESHOLD / leverage

    if (side === 'long') {
      return entryPrice * (1 - liquidationPct)
    } else {
      return entryPrice * (1 + liquidationPct)
    }
  }

  /**
   * Calculate unrealized P&L for an open position.
   */
  static getPnL(position: Position, currentPrice: number): PnL {
    const priceDelta =
      position.side === 'long'
        ? currentPrice - position.entryPrice
        : position.entryPrice - currentPrice

    const pricePct = priceDelta / position.entryPrice
    const unrealizedPnl = position.size * pricePct
    const unrealizedPnlPct = pricePct * position.leverage * 100
    const fees = position.size * TAKER_FEE_RATE

    return { unrealizedPnl, unrealizedPnlPct, fees }
  }

  /**
   * Calculate position size in USD from collateral + leverage.
   */
  static getPositionSize(collateral: number, leverage: number): number {
    return collateral * leverage
  }

  /**
   * Calculate required collateral for a given position size and leverage.
   */
  static getRequiredCollateral(positionSize: number, leverage: number): number {
    return positionSize / leverage
  }

  /**
   * Check if a position should be liquidated at current price.
   */
  static isLiquidated(position: Position, currentPrice: number): boolean {
    if (position.side === 'long') {
      return currentPrice <= position.liquidationPrice
    } else {
      return currentPrice >= position.liquidationPrice
    }
  }

  /**
   * Check if TP or SL should trigger.
   */
  static checkTPSL(
    position: Position,
    currentPrice: number
  ): 'tp' | 'sl' | null {
    if (position.takeProfitPrice) {
      if (position.side === 'long' && currentPrice >= position.takeProfitPrice) return 'tp'
      if (position.side === 'short' && currentPrice <= position.takeProfitPrice) return 'tp'
    }
    if (position.stopLossPrice) {
      if (position.side === 'long' && currentPrice <= position.stopLossPrice) return 'sl'
      if (position.side === 'short' && currentPrice >= position.stopLossPrice) return 'sl'
    }
    return null
  }

  /**
   * Build a full Position object from open params + current price.
   */
  static buildPosition(
    params: OpenPositionParams,
    currentPrice: number
  ): Position {
    const size = this.getPositionSize(params.collateral, params.leverage)
    const liquidationPrice = this.getLiquidationPrice(
      params.side,
      currentPrice,
      params.leverage
    )

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      side: params.side,
      entryPrice: currentPrice,
      size,
      collateral: params.collateral,
      leverage: params.leverage,
      liquidationPrice,
      takeProfitPrice: params.takeProfitPrice,
      stopLossPrice: params.stopLossPrice,
      openedAt: Date.now(),
      status: 'open',
    }
  }

  /**
   * Entry fee for opening a position.
   */
  static getOpenFee(collateral: number, leverage: number): number {
    return this.getPositionSize(collateral, leverage) * TAKER_FEE_RATE
  }
}
