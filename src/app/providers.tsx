'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import type { Config } from 'wagmi'

import '@rainbow-me/rainbowkit/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient())
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null)

  useEffect(() => {
    import('@/lib/wagmi').then((mod) => {
      setWagmiConfig(mod.wagmiConfig)
      setMounted(true)
    })
  }, [])

  // Show minimal shell while providers load — avoids wagmi hook errors
  if (!mounted || !wagmiConfig) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
