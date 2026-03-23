'use client'

import { useState } from 'react'
import { useTradingStore } from '@/stores/tradingStore'
import { usePosition } from '@/hooks/usePosition'
import { PositionEngine } from '@/services/trading/PositionEngine'
import { formatPrice, cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/education/InfoTooltip'

const LEVERAGE_PRESETS = [1, 2, 5, 10, 20, 50]

function getLeverageRisk(leverage: number) {
  if (leverage <= 5)  return { label: 'Low risk',  color: 'text-[#26A17B]' }
  if (leverage <= 15) return { label: 'Medium',    color: 'text-yellow-400' }
  if (leverage <= 30) return { label: 'High risk', color: 'text-orange-400' }
  return               { label: 'Extreme',         color: 'text-[#E05252]' }
}

export function OrderPanel() {
  const priceData    = useTradingStore((s) => s.priceData)
  const selectedSide = useTradingStore((s) => s.selectedSide)
  const setSelectedSide   = useTradingStore((s) => s.setSelectedSide)
  const selectedLeverage  = useTradingStore((s) => s.selectedLeverage)
  const setSelectedLeverage = useTradingStore((s) => s.setSelectedLeverage)
  const collateralInput   = useTradingStore((s) => s.collateralInput)
  const setCollateralInput = useTradingStore((s) => s.setCollateralInput)

  const [tpInput, setTpInput] = useState('')
  const [slInput, setSlInput] = useState('')
  const [showTPSL, setShowTPSL] = useState(false)

  const { balance, openPosition } = usePosition()

  const collateral   = parseFloat(collateralInput) || 0
  const positionSize = PositionEngine.getPositionSize(collateral, selectedLeverage)
  const fee          = PositionEngine.getOpenFee(collateral, selectedLeverage)
  const liquidationPrice =
    priceData && collateral > 0
      ? PositionEngine.getLiquidationPrice(selectedSide, priceData.price, selectedLeverage)
      : null

  const tpPrice = parseFloat(tpInput) || undefined
  const slPrice = parseFloat(slInput) || undefined

  const tpValid = !tpPrice || !priceData || (
    selectedSide === 'long' ? tpPrice > priceData.price : tpPrice < priceData.price
  )
  const slValid = !slPrice || !priceData || (
    selectedSide === 'long' ? slPrice < priceData.price : slPrice > priceData.price
  )

  const risk = getLeverageRisk(selectedLeverage)

  const handleOpen = () => {
    if (!collateral || collateral <= 0) return
    openPosition({
      side: selectedSide,
      collateral,
      leverage: selectedLeverage,
      takeProfitPrice: tpValid ? tpPrice : undefined,
      stopLossPrice:   slValid ? slPrice : undefined,
    })
    setCollateralInput('')
    setTpInput('')
    setSlInput('')
  }

  return (
    <div className="flex flex-col h-full bg-[#111316] p-4 gap-4 overflow-y-auto">
      {/* Balance */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-600 uppercase tracking-wide font-sans">Paper Balance</span>
        <span className="text-white font-mono tabular-nums text-sm font-semibold">{formatPrice(balance)}</span>
      </div>

      {/* Long / Short toggle */}
      <div className="flex rounded-lg overflow-hidden border border-[#252830]">
        <button
          onClick={() => setSelectedSide('long')}
          className={cn(
            'flex-1 py-2.5 text-sm font-semibold transition-all duration-150',
            selectedSide === 'long'
              ? 'bg-[#26A17B] text-white'
              : 'text-gray-500 hover:text-gray-300 bg-[#181B1F]'
          )}
        >
          Long
        </button>
        <button
          onClick={() => setSelectedSide('short')}
          className={cn(
            'flex-1 py-2.5 text-sm font-semibold transition-all duration-150',
            selectedSide === 'short'
              ? 'bg-[#E05252] text-white'
              : 'text-gray-500 hover:text-gray-300 bg-[#181B1F]'
          )}
        >
          Short
        </button>
      </div>

      {/* Collateral input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-gray-600 uppercase tracking-wide font-sans flex items-center gap-1">
          Collateral (USD)
          <InfoTooltip termKey="collateral" />
        </label>
        <div className="flex items-center gap-2 bg-[#181B1F] rounded-lg px-3 py-2.5 border border-[#252830] focus-within:border-[rgba(232,255,71,0.5)] transition-colors">
          <span className="text-gray-600 text-sm font-mono">$</span>
          <input
            type="number"
            value={collateralInput}
            onChange={(e) => setCollateralInput(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-white text-sm font-mono tabular-nums outline-none placeholder:text-gray-700"
          />
        </div>
      </div>

      {/* Leverage */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-gray-600 uppercase tracking-wide font-sans flex items-center gap-1">
            Leverage
            <InfoTooltip termKey="leverage" />
          </label>
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-mono transition-colors duration-200', risk.color)}>
              {risk.label}
            </span>
            <span className={cn('font-mono text-sm font-semibold transition-colors duration-200 tabular-nums', risk.color)}>
              {selectedLeverage}x
            </span>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={selectedLeverage}
          onChange={(e) => setSelectedLeverage(Number(e.target.value))}
          className="w-full accent-[#E8FF47]"
        />
        <div className="flex gap-1.5">
          {LEVERAGE_PRESETS.map((lev) => (
            <button
              key={lev}
              onClick={() => setSelectedLeverage(lev)}
              className={cn(
                'flex-1 py-1 text-xs font-mono rounded transition-all duration-150',
                selectedLeverage === lev
                  ? 'bg-[#E8FF47] text-[#0B0C0E] font-semibold'
                  : 'bg-[#181B1F] text-gray-500 hover:text-gray-300 border border-[#252830]'
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
          className="flex items-center justify-between text-[10px] text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-wide font-sans"
        >
          <span className="flex items-center gap-1">
            Take Profit / Stop Loss
            <InfoTooltip termKey="tpsl" />
          </span>
          <span>{showTPSL ? '▲' : '▼'}</span>
        </button>

        {showTPSL && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#26A17B] uppercase tracking-wide font-sans">Take Profit</label>
              <div className={cn(
                'flex items-center gap-2 bg-[#181B1F] rounded-lg px-3 py-2.5 border transition-colors',
                tpInput && !tpValid
                  ? 'border-[#E05252]'
                  : 'border-[#252830] focus-within:border-[rgba(38,161,123,0.5)]'
              )}>
                <span className="text-gray-600 text-sm font-mono">$</span>
                <input
                  type="number"
                  value={tpInput}
                  onChange={(e) => setTpInput(e.target.value)}
                  placeholder={priceData
                    ? selectedSide === 'long'
                      ? `> ${Math.round(priceData.price).toLocaleString()}`
                      : `< ${Math.round(priceData.price).toLocaleString()}`
                    : '0.00'}
                  className="flex-1 bg-transparent text-white text-sm font-mono tabular-nums outline-none placeholder:text-gray-700"
                />
              </div>
              {tpInput && !tpValid && (
                <p className="text-[10px] text-[#E05252] font-sans">
                  TP must be {selectedSide === 'long' ? 'above' : 'below'} entry
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#E05252] uppercase tracking-wide font-sans">Stop Loss</label>
              <div className={cn(
                'flex items-center gap-2 bg-[#181B1F] rounded-lg px-3 py-2.5 border transition-colors',
                slInput && !slValid
                  ? 'border-[#E05252]'
                  : 'border-[#252830] focus-within:border-[rgba(224,82,82,0.5)]'
              )}>
                <span className="text-gray-600 text-sm font-mono">$</span>
                <input
                  type="number"
                  value={slInput}
                  onChange={(e) => setSlInput(e.target.value)}
                  placeholder={priceData
                    ? selectedSide === 'long'
                      ? `< ${Math.round(priceData.price).toLocaleString()}`
                      : `> ${Math.round(priceData.price).toLocaleString()}`
                    : '0.00'}
                  className="flex-1 bg-transparent text-white text-sm font-mono tabular-nums outline-none placeholder:text-gray-700"
                />
              </div>
              {slInput && !slValid && (
                <p className="text-[10px] text-[#E05252] font-sans">
                  SL must be {selectedSide === 'long' ? 'below' : 'above'} entry
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="flex flex-col gap-2 bg-[#181B1F] rounded-lg p-3 border border-[#252830]">
        <Row label="Position Size" value={collateral > 0 ? formatPrice(positionSize) : '—'} />
        <Row
          label={<span className="flex items-center gap-1">Liq. Price <InfoTooltip termKey="liquidation" /></span>}
          value={liquidationPrice
            ? <span className="text-[#E05252] font-mono tabular-nums">{formatPrice(liquidationPrice)}</span>
            : '—'}
        />
        <Row label="Entry Fee" value={collateral > 0 ? formatPrice(fee) : '—'} />
        <Row label="Entry Price" value={priceData ? formatPrice(priceData.price) : '—'} />
        {tpPrice && tpValid && (
          <Row label="Take Profit" value={<span className="text-[#26A17B] font-mono tabular-nums">{formatPrice(tpPrice)}</span>} />
        )}
        {slPrice && slValid && (
          <Row label="Stop Loss" value={<span className="text-[#E05252] font-mono tabular-nums">{formatPrice(slPrice)}</span>} />
        )}
      </div>

      {/* Open button */}
      <button
        onClick={handleOpen}
        disabled={!collateral || collateral <= 0 || !priceData}
        className={cn(
          'w-full py-3 rounded-lg font-semibold text-sm transition-all duration-150 font-sans tracking-wide',
          selectedSide === 'long'
            ? 'bg-[#26A17B] hover:bg-[#2dba8e] disabled:bg-[#1a3d30] disabled:text-[#2d5c47]'
            : 'bg-[#E05252] hover:bg-[#e86060] disabled:bg-[#3d1a1a] disabled:text-[#5c2d2d]',
          'disabled:cursor-not-allowed text-white'
        )}
      >
        {selectedSide === 'long' ? 'Open Long' : 'Open Short'}
      </button>
    </div>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 text-[10px] uppercase tracking-wide font-sans">{label}</span>
      <span className="text-gray-200 font-mono tabular-nums text-xs font-medium">{value}</span>
    </div>
  )
}
