'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import TagManager from 'react-gtm-module'
import { IntercomProvider } from 'react-use-intercom'
import { QueryClientProvider } from '@tanstack/react-query'
import { useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'

import { Global } from '@/components/Global'
import WagmiConfigProvider from '@/lib/provider/WagmiConfigProvider'
import { queryClient } from '@/lib/provider/wagmi'
import * as ga from '@/lib/ga'
import { ENVIRONMENT } from '@/lib/config'

function ThemeWatcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const { setThemeMode } = useWeb3ModalTheme()

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function onMediaChange() {
      const systemTheme = media.matches ? 'dark' : 'light'
      if (resolvedTheme === systemTheme) setTheme('system')
      setThemeMode(resolvedTheme)
    }

    onMediaChange()
    media.addEventListener('change', onMediaChange)
    return () => media.removeEventListener('change', onMediaChange)
  }, [resolvedTheme, setTheme, setThemeMode])

  return null
}

export function Providers({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rendered, setRendered] = useState(false)
  const [tagManagerInitiated, setTagManagerInitiated] = useState(false)
  const [client] = useState(() => queryClient)

  useEffect(() => {
    setRendered(true)
  }, [])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GTM_ID && rendered && !tagManagerInitiated) {
      TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID })
      setTagManagerInitiated(true)
    }
  }, [rendered, tagManagerInitiated, setTagManagerInitiated])

  useEffect(() => {
    if (pathname && searchParams) {
      const qs = searchParams.toString()
      ga.pageview(`${pathname}${qs ? `?${qs}` : ''}`)
    }
  }, [pathname, searchParams])

  const { networkConfig } = createNetworkConfig({
    testnet: { url: 'https://sui-testnet-rpc.publicnode.com' || getFullnodeUrl('testnet') },
    mainnet: { url: 'https://sui-rpc.publicnode.com' || getFullnodeUrl('mainnet') },
  })

  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <IntercomProvider appId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID} autoBoot={true}>
        <ThemeWatcher />
        <Global />
        <QueryClientProvider client={client}>
          <WagmiConfigProvider>
            <SuiClientProvider networks={networkConfig} defaultNetwork={ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet'}>
              <WalletProvider>
                {children}
              </WalletProvider>
            </SuiClientProvider>
          </WagmiConfigProvider>
        </QueryClientProvider>
      </IntercomProvider>
    </ThemeProvider>
  )
}
