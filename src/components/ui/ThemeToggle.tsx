'use client'

import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to Light (Toss)' : 'Switch to Dark (Terminal)'}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-sans transition-all duration-200',
        isDark
          ? 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
      )}
    >
      <span>{isDark ? '☀' : '◑'}</span>
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
