'use client'

import { useState } from 'react'
import { useTradingStore } from '@/stores/tradingStore'
import { usePosition } from '@/hooks/usePosition'
import { PositionEngine } from '@/services/trading/PositionEngine'
import { formatPrice, cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/education/InfoTooltip'

const LEVERAGE_PRESETS = [1, 2, 5, 10, 20, 50]

export function OrderPanel() {
  const priceData = useTradingStore((s) => s.priceData)
  const selectedSide = useTradingStore((s) => s.selectedSide)
  const setSelectedSide = useTradingStore((s) => s.setSelectedSide)
  const selectedLeverage = useTradingStore((s) => s.selectedLeverage)
  const setSelectedLeverage = useTradingStore((s) => s.setSelectedLeverage)
  const collateralInput = useTradingStore((s) => s.collateralInput)
  const setCollateralInput = useTradingStore((s) => s.setCollateralInput)

  const [tpInput, setTpInput] = useState('')
  const [slInput, setSlInput] = useState('')
  const [showTPSL, setShowTPSL] = useState(false)

  const { balance, openPosition } = usePosition()

  const collateral = parseFloat(collateralInput) || 0
  const positionSize = PositionEngine.getPositionSize(collateral, selectedLeverage)
  const fee = PositionEngine.getOpenFee(collateral, selectedLeverage)
  const liquidationPrice =
    priceData && collateral > 0
      ? PositionEngine.getLiquidationPrice(selectedSide, priceData.price, selectedLeverage)
      : null

  const tpPrice = parseFloat(tpInput) || undefined
  const slPrice = parseFloat(slInput) || undefined

  // Validate TP/SL direction
  const tpValid = !tpPrice || !priceData || (
    selectedSide === 'long' ? tpPrice > priceData.price : tpPrice < priceData.price
  )
  const slValid = !slPrice || !priceData || (
    selectedSide === 'long' ? slPrice < priceData.price : slPrice > priceData.price
  )

  const handleOpen = () => {
    if (!collateral || collateral <= 0) return
    openPosition({
      side: selectedSide,
      collateral,
      leverage: selectedLeverage,
      takeProfitPrice: tpValid ? tpPrice : undefined,
      stopLossPrice: slValid ? slPrice : undefined,
    })
    setCollateralInput('')
    setTpInput('')
    setSlInput('')
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 p-4 gap-4 overflow-y-auto">
      {/* Balance */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Paper Balance</span>
        <span className="text-white font-medium">{formatPrice(balance)}</span>
      </div>

      {/* Long / Short toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-700">
        <button
          onClick={() => setSelectedSide('long')}
          className={cn(
            'flex-1 py-2.5 text-sm font-semibold transition-colors',
            selectedSide === 'long'
              ? 'bg-green-500 text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Long
        </button>
        <button
          onClick={() => setSelectedSide('short')}
          className={cn(
            'flex-1 py-2.5 text-sm font-semibold transition-colors',
            selectedSide === 'short'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Short
        </button>
      </div>

      {/* Collateral input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400 flex items-center gap-1">
          Collateral (USD)
          <InfoTooltip termKey="collateral" />
        </label>
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus-within:border-blue-500 transition-colors">
          <span className="text-gray-400 text-sm">$</span>
          <input
            type="number"
            value={collateralInput}
            onChange={(e) => setCollateralInput(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Leverage */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-gray-400 flex items-center gap-1">
            Leverage
            <InfoTooltip termKey="leverage" />
          </label>
          <span className="text-white text-sm font-semibold">{selectedLeverage}x</span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={selectedLeverage}
          onChange={(e) => setSelectedLeverage(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex gap-1.5">
          {LEVERAGE_PRESETS.map((lev) => (
            <button
              key={lev}
              onClick={() => setSelectedLeverage(lev)}
              className={cn(
                'flex-1 py-1 text-xs rounded transition-colors',
                selectedLeverage === lev
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* TP / SL */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowTPSL((v) => !v)}
          className="flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          <span className="flex items-center gap-1">
            Take Profit / Stop Loss
            <InfoTooltip termKey="tpsl" />
          </span>
          <span className="text-gray-600">{showTPSL ? '▲' : '▼'}</span>
        </button>

        {showTPSL && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-blue-400">Take Profit (USD)</label>
              <div className={cn(
                'flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border transition-colors',
                tpInput && !tpValid ? 'border-red-500' : 'border-gray-700 focus-within:border-blue-500'
              )}>
                <span className="text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={tpInput}
                  onChange={(e) => setTpInput(e.target.value)}
                  placeholder={priceData ? (
                    selectedSide === 'long'
                      ? `> ${Math.round(priceData.price).toLocaleString()}`
                      : `< ${Math.round(priceData.price).toLocaleString()}`
                  ) : '0.00'}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                />
              </div>
              {tpInput && !tpValid && (
                <p className="text-xs text-red-400">
                  TP must be {selectedSide === 'long' ? 'above' : 'below'} entry price
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-purple-400">Stop Loss (USD)</label>
              <div className={cn(
                'flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border transition-colors',
                slInput && !slValid ? 'border-red-500' : 'border-gray-700 focus-within:border-purple-500'
              )}>
                <span className="text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={slInput}
                  onChange={(e) => setSlInput(e.target.value)}
                  placeholder={priceData ? (
                    selectedSide === 'long'
                      ? `< ${Math.round(priceData.price).toLocaleString()}`
                      : `> ${Math.round(priceData.price).toLocaleString()}`
                  ) : '0.00'}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                />
              </div>
              {slInput && !slValid && (
                <p className="text-xs text-red-400">
                  SL must be {selectedSide === 'long' ? 'below' : 'above'} entry price
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="flex flex-col gap-2 bg-gray-800 rounded-lg p-3 text-xs">
        <Row label="Position Size" value={collateral > 0 ? formatPrice(positionSize) : '—'} />
        <Row
          label={
            <span className="flex items-center gap-1">
              Liq. Price <InfoTooltip termKey="liquidation" />
            </span>
          }
          value={
            liquidationPrice
              ? <span className="text-red-400">{formatPrice(liquidationPrice)}</span>
              : '—'
          }
        />
        <Row label="Entry Fee" value={collateral > 0 ? formatPrice(fee) : '—'} />
        <Row
          label="Entry Price"
          value={priceData ? formatPrice(priceData.price) : '—'}
        />
        {tpPrice && tpValid && (
          <Row label="Take Profit" value={<span className="text-blue-400">{formatPrice(tpPrice)}</span>} />
        )}
        {slPrice && slValid && (
          <Row label="Stop Loss" value={<span className="text-purple-400">{formatPrice(slPrice)}</span>} />
        )}
      </div>

      {/* Open button */}
      <button
        onClick={handleOpen}
        disabled={!collateral || collateral <= 0 || !priceData}
        className={cn(
          'w-full py-3 rounded-lg font-semibold text-sm transition-all',
          selectedSide === 'long'
            ? 'bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:text-green-700'
            : 'bg-red-500 hover:bg-red-400 disabled:bg-red-900 disabled:text-red-700',
          'disabled:cursor-not-allowed text-white'
        )}
      >
        {selectedSide === 'long' ? 'Open Long' : 'Open Short'}
      </button>
    </div>
  )
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
  )
}
