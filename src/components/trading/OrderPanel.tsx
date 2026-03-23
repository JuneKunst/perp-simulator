'use client'

import { useState } from 'react'
import { useTradingStore } from '@/stores/tradingStore'
import { usePosition } from '@/hooks/usePosition'
import { PositionEngine } from '@/services/trading/PositionEngine'
import { formatPrice, cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/education/InfoTooltip'

const LEVERAGE_PRESETS = [1, 2, 5, 10, 20, 50]

function getLeverageRisk(leverage: number) {
  if (leverage <= 5)  return { label: 'Low risk',  color: 'var(--long)' }
  if (leverage <= 15) return { label: 'Medium',    color: '#F5A623' }
  if (leverage <= 30) return { label: 'High risk', color: '#F07523' }
  return               { label: 'Extreme',         color: 'var(--short)' }
}

export function OrderPanel() {
  const priceData         = useTradingStore((s) => s.priceData)
  const selectedSide      = useTradingStore((s) => s.selectedSide)
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
    <div
      className="flex flex-col h-full p-4 gap-4 overflow-y-auto"
      style={{ background: 'var(--surface)' }}
    >
      {/* Balance */}
      <div className="flex justify-between items-center">
        <span
          className="text-[10px] uppercase tracking-wide font-sans"
          style={{ color: 'var(--text-secondary)' }}
        >
          Paper Balance
        </span>
        <span
          className="font-mono tabular-nums text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {formatPrice(balance)}
        </span>
      </div>

      {/* Long / Short toggle */}
      <div
        className="flex rounded-xl overflow-hidden border"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => setSelectedSide('long')}
          className="flex-1 py-2.5 text-sm font-semibold transition-all duration-150"
          style={{
            background: selectedSide === 'long' ? 'var(--long)' : 'var(--surface-2)',
            color: selectedSide === 'long' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Long
        </button>
        <button
          onClick={() => setSelectedSide('short')}
          className="flex-1 py-2.5 text-sm font-semibold transition-all duration-150"
          style={{
            background: selectedSide === 'short' ? 'var(--short)' : 'var(--surface-2)',
            color: selectedSide === 'short' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Short
        </button>
      </div>

      {/* Collateral input */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-[10px] uppercase tracking-wide font-sans flex items-center gap-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Collateral (USD) <InfoTooltip termKey="collateral" />
        </label>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border)',
          }}
        >
          <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>$</span>
          <input
            type="number"
            value={collateralInput}
            onChange={(e) => setCollateralInput(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-sm font-mono tabular-nums outline-none"
            style={{
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Leverage */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label
            className="text-[10px] uppercase tracking-wide font-sans flex items-center gap-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Leverage <InfoTooltip termKey="leverage" />
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono transition-colors duration-200" style={{ color: risk.color }}>
              {risk.label}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums transition-colors duration-200" style={{ color: risk.color }}>
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
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex gap-1.5">
          {LEVERAGE_PRESETS.map((lev) => (
            <button
              key={lev}
              onClick={() => setSelectedLeverage(lev)}
              className="flex-1 py-1 text-xs font-mono rounded-lg transition-all duration-150 border"
              style={{
                background:  selectedLeverage === lev ? 'var(--accent)' : 'var(--surface-2)',
                color:       selectedLeverage === lev ? 'var(--accent-fg)' : 'var(--text-secondary)',
                borderColor: selectedLeverage === lev ? 'var(--accent)' : 'var(--border)',
                fontWeight:  selectedLeverage === lev ? 600 : 400,
              }}
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
          className="flex items-center justify-between text-[10px] uppercase tracking-wide font-sans transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="flex items-center gap-1">
            Take Profit / Stop Loss <InfoTooltip termKey="tpsl" />
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{showTPSL ? '▲' : '▼'}</span>
        </button>

        {showTPSL && (
          <div className="flex flex-col gap-2">
            {/* TP */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide font-sans" style={{ color: 'var(--long)' }}>
                Take Profit
              </label>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: tpInput && !tpValid ? 'var(--short)' : 'var(--border)',
                }}
              >
                <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>$</span>
                <input
                  type="number"
                  value={tpInput}
                  onChange={(e) => setTpInput(e.target.value)}
                  placeholder={priceData
                    ? selectedSide === 'long'
                      ? `> ${Math.round(priceData.price).toLocaleString()}`
                      : `< ${Math.round(priceData.price).toLocaleString()}`
                    : '0.00'}
                  className="flex-1 bg-transparent text-sm font-mono tabular-nums outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              {tpInput && !tpValid && (
                <p className="text-[10px] font-sans" style={{ color: 'var(--short)' }}>
                  TP must be {selectedSide === 'long' ? 'above' : 'below'} entry
                </p>
              )}
            </div>

            {/* SL */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide font-sans" style={{ color: 'var(--short)' }}>
                Stop Loss
              </label>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: slInput && !slValid ? 'var(--short)' : 'var(--border)',
                }}
              >
                <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>$</span>
                <input
                  type="number"
                  value={slInput}
                  onChange={(e) => setSlInput(e.target.value)}
                  placeholder={priceData
                    ? selectedSide === 'long'
                      ? `< ${Math.round(priceData.price).toLocaleString()}`
                      : `> ${Math.round(priceData.price).toLocaleString()}`
                    : '0.00'}
                  className="flex-1 bg-transparent text-sm font-mono tabular-nums outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              {slInput && !slValid && (
                <p className="text-[10px] font-sans" style={{ color: 'var(--short)' }}>
                  SL must be {selectedSide === 'long' ? 'below' : 'above'} entry
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div
        className="flex flex-col gap-2 rounded-xl p-3 border"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <Row label="Position Size" value={collateral > 0 ? formatPrice(positionSize) : '—'} />
        <Row
          label={<span className="flex items-center gap-1">Liq. Price <InfoTooltip termKey="liquidation" /></span>}
          value={liquidationPrice
            ? <span className="font-mono tabular-nums" style={{ color: 'var(--short)' }}>{formatPrice(liquidationPrice)}</span>
            : '—'}
        />
        <Row label="Entry Fee" value={collateral > 0 ? formatPrice(fee) : '—'} />
        <Row label="Entry Price" value={priceData ? formatPrice(priceData.price) : '—'} />
        {tpPrice && tpValid && (
          <Row label="Take Profit" value={<span className="font-mono tabular-nums" style={{ color: 'var(--long)' }}>{formatPrice(tpPrice)}</span>} />
        )}
        {slPrice && slValid && (
          <Row label="Stop Loss" value={<span className="font-mono tabular-nums" style={{ color: 'var(--short)' }}>{formatPrice(slPrice)}</span>} />
        )}
      </div>

      {/* Open button */}
      <button
        onClick={handleOpen}
        disabled={!collateral || collateral <= 0 || !priceData}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 font-sans tracking-wide disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: selectedSide === 'long' ? 'var(--long)' : 'var(--short)',
          color: '#fff',
        }}
      >
        {selectedSide === 'long' ? 'Open Long' : 'Open Short'}
      </button>
    </div>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] uppercase tracking-wide font-sans" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span className="font-mono tabular-nums text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  )
}
