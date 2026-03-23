'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <span className="text-[var(--accent-fg)] text-xs font-bold font-mono">P</span>
        </div>
        <span className="font-semibold text-[var(--text-primary)] tracking-tight text-sm font-sans">
          Perp Simulator
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-mono tracking-wide border"
          style={{
            color: 'var(--text-muted)',
            background: 'var(--surface-2)',
            borderColor: 'var(--border)',
          }}
        >
          {isDark ? 'PAPER' : 'Paper Trading'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <a
          href="https://github.com/JuneKunst/perp-simulator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-wide font-sans transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          GitHub
        </a>
        <ConnectButton />
      </div>
    </header>
  )
}
