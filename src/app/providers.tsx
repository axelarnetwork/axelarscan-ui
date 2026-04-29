'use client';

import { Global } from '@/components/Global.component';
import { ENVIRONMENT } from '@/lib/config';
import * as ga from '@/lib/ga';
import WagmiConfigProvider from '@/lib/provider/WagmiConfigProvider';
import { queryClient, xrplConfig } from '@/lib/provider/wagmi';
import { MetaMaskWallet } from '@/lib/wallets/MetaMaskEIP6963Wallet';
import { useMetaMaskProvider } from '@/lib/wallets/eip6963';
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider as SuiWalletProvider,
} from '@mysten/dapp-kit';
import { useAppKitTheme } from '@reown/appkit/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { CrossmarkWallet } from '@xrpl-wallet-adapter/crossmark';
import { WalletConnectWallet as XRPLWalletConnectWallet } from '@xrpl-wallet-adapter/walletconnect';
import { XamanWallet } from '@xrpl-wallet-adapter/xaman';
import type { XRPLWallet } from '@xrpl-wallet-standard/core';
import { WalletProvider as XRPLWalletProvider } from '@xrpl-wallet-standard/react';
import { ThemeProvider, useTheme } from 'next-themes';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
// @ts-expect-error — no type declarations available
import TagManager from 'react-gtm-module';
import { IntercomChat } from '@/components/IntercomChat';

const { networkConfig: suiNetworkConfig } = createNetworkConfig({
  testnet: {
    url: 'https://sui-testnet-rpc.publicnode.com',
  },
  mainnet: {
    url: 'https://sui-rpc.publicnode.com',
  },
});

function ThemeWatcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const { setThemeMode } = useAppKitTheme();

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function onMediaChange() {
      const systemTheme = media.matches ? 'dark' : 'light';

      if (resolvedTheme === systemTheme) {
        setTheme('system');
      }

      setThemeMode(resolvedTheme as 'dark' | 'light');
    }

    onMediaChange();

    media.addEventListener('change', onMediaChange);
    return () => media.removeEventListener('change', onMediaChange);
  }, [resolvedTheme, setTheme, setThemeMode]);

  return null;
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && searchParams) {
      const qs = searchParams.toString();
      ga.pageview(`${pathname}${qs ? `?${qs}` : ''}`);
    }
  }, [pathname, searchParams]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);
  const tagManagerInitRef = useRef(false);

  // google tag manager
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GTM_ID && !tagManagerInitRef.current) {
      tagManagerInitRef.current = true;
      TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID });
    }
  }, []);

  // xrpl - with EIP-6963 support for MetaMask
  // Wallet adapters are constructed in useEffect to avoid calling third-party
  // constructors during SSR — they may access browser globals like `window`.
  const metamaskProvider = useMetaMaskProvider();
  const [xrplRegisterWallets, setXrplRegisterWallets] = useState<
    XRPLWallet[] | undefined
  >();
  useEffect(() => {
    // Wallet adapter constructors may access browser globals; must defer to client via effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setXrplRegisterWallets([
      new CrossmarkWallet(),
      new XRPLWalletConnectWallet(
        xrplConfig as ConstructorParameters<typeof XRPLWalletConnectWallet>[0]
      ),
      new XamanWallet(process.env.NEXT_PUBLIC_XAMAN_API_KEY!),
      new MetaMaskWallet(
        metamaskProvider as ConstructorParameters<typeof MetaMaskWallet>[0]
      ),
    ] as XRPLWallet[]);
  }, [metamaskProvider]);

  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      enableColorScheme={false}
    >
      <IntercomChat />
      <ThemeWatcher />
      <Suspense>
        <AnalyticsTracker />
      </Suspense>
      <QueryClientProvider client={client}>
        <Global />
        <WagmiConfigProvider>
          <XRPLWalletProvider
            registerWallets={xrplRegisterWallets}
            autoConnect={false}
          >
            <SuiClientProvider
              networks={suiNetworkConfig}
              defaultNetwork={ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet'}
            >
              <SuiWalletProvider>{children}</SuiWalletProvider>
            </SuiClientProvider>
          </XRPLWalletProvider>
        </WagmiConfigProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
