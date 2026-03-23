# Perp Simulator

An interactive perpetuals trading simulator built for learning DeFi futures concepts hands-on — without risking real money.

**Live Demo → [perp-simulator.vercel.app](https://perp-simulator.vercel.app)**

---

## What It Does

Real-time BTC/USDT perpetuals simulation using live Binance price data. Open long/short positions, set take profit and stop loss levels, and watch your PnL move with the market.

Built from first-hand experience with centralized exchange failures — forced liquidations from SL non-execution, withdrawal restrictions during volatile markets, and counterparty risk. This simulator teaches how on-chain perpetuals solve those problems by making every settlement trustless and transparent.

---

## Features

- **Live price feed** — BTC/USDT via Binance WebSocket, 1H candlestick chart
- **Leverage trading** — 1x to 50x, instant liquidation price calculation
- **Position price lines** — Entry, liquidation, TP, and SL rendered directly on chart
- **Auto-liquidation & TP/SL** — Triggers fire automatically when price hits your levels
- **Paper balance** — Start with $10,000 USDT, no wallet needed to practice
- **Educational tooltips** — Every key concept explained inline (collateral, leverage, liquidation, funding rate, TP/SL)
- **Wallet connect** — RainbowKit + Wagmi integration (Ethereum, Arbitrum, Optimism, Base)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Chart | lightweight-charts v5 |
| State | Zustand + Immer |
| Web3 | Wagmi v2 + RainbowKit |
| Price Feed | Binance WebSocket + REST API |
| Deploy | Vercel |

---

## Architecture

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── chart/              # TradingChart — lightweight-charts, position lines
│   ├── trading/            # OrderPanel, PositionPanel, PriceBar, TradingLayout
│   ├── education/          # InfoTooltip glossary
│   └── ui/                 # Header
├── services/
│   ├── price/              # PriceFeedService — Binance WS + REST
│   └── trading/            # PositionEngine — PnL, liquidation, TP/SL logic
├── stores/                 # tradingStore (Zustand)
├── hooks/                  # usePriceFeed, usePosition
└── types/                  # Position, PriceData, Candle types
```

**Key design decisions:**
- `PositionEngine` is a pure static class — all trading math is side-effect free and easily testable
- `usePriceFeed` reads store state via `getState()` on each tick to avoid stale closure bugs in position monitoring
- Position price lines use `createPriceLine` from lightweight-charts, not DOM overlays — they move correctly with chart pan/zoom
- Wagmi config is lazy-loaded client-side to avoid SSR hydration issues with wallet hooks

---

## Why Perpetuals Matter

Centralized exchange risks are real:
- Stop-loss orders that don't execute during liquidation cascades
- Withdrawal locks during high-volatility periods
- Counterparty risk (FTX, Bithumb incidents)

On-chain perpetuals (GMX, dYdX, Hyperliquid) solve this: positions and settlements are transparent, self-custodied, and not subject to exchange discretion. This simulator demonstrates the core mechanics before users touch real funds.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No `.env` required for basic usage. To enable WalletConnect:

```bash
cp .env.example .env.local
# Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get a free project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com).

---

## Roadmap

- [ ] Funding rate live display + accrual simulation
- [ ] Multiple positions / partial close
- [ ] Mobile responsive layout
- [ ] Historical PnL chart
- [ ] On-chain integration (GMX v2 read-only price feeds)
