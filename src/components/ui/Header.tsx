'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#252830] bg-[#111316]">
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="w-6 h-6 rounded bg-[#E8FF47] flex items-center justify-center">
          <span className="text-[#0B0C0E] text-xs font-bold font-mono">P</span>
        </div>
        <span className="font-semibold text-white tracking-tight text-sm font-sans">
          Perp Simulator
        </span>
        <span className="text-[10px] text-gray-600 bg-[#181B1F] border border-[#252830] px-2 py-0.5 rounded-full font-mono tracking-wide">
          PAPER
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/JuneKunst/perp-simulator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors font-sans tracking-wide uppercase"
        >
          GitHub
        </a>
        <ConnectButton />
      </div>
    </header>
  )
}
