import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, arbitrum, optimism, base } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'Perp Simulator',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo',
  chains: [mainnet, arbitrum, optimism, base],
  ssr: false,
})
