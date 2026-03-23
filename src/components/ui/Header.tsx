'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-xs font-bold">
          P
        </div>
        <span className="font-semibold text-white tracking-tight">
          Perp Simulator
        </span>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
          Paper Trading
        </span>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://github.com/JuneKunst"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          by June
        </a>
        <ConnectButton />
      </div>
    </header>
  )
}
