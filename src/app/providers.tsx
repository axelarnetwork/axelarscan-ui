'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
// @ts-expect-error — no type declarations available
import TagManager from 'react-gtm-module';
import { IntercomProvider } from 'react-use-intercom';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAppKitTheme } from '@reown/appkit/react';
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider as SuiWalletProvider,
} from '@mysten/dapp-kit';
import { WalletProvider as XRPLWalletProvider } from '@xrpl-wallet-standard/react';
import { CrossmarkWallet } from '@xrpl-wallet-adapter/crossmark';
import { WalletConnectWallet as XRPLWalletConnectWallet } from '@xrpl-wallet-adapter/walletconnect';
import { XamanWallet } from '@xrpl-wallet-adapter/xaman';
import { MetaMaskWallet } from '@/lib/wallets/MetaMaskEIP6963Wallet';
import { useMetaMaskProvider } from '@/lib/wallets/eip6963';

import { Global } from '@/components/Global.component';
import WagmiConfigProvider from '@/lib/provider/WagmiConfigProvider';
import { queryClient, xrplConfig } from '@/lib/provider/wagmi';
import * as ga from '@/lib/ga';
import { ENVIRONMENT } from '@/lib/config';

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

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rendered, setRendered] = useState(false);
  const [tagManagerInitiated, setTagManagerInitiated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [xrplRegisterWallets, setXRPLlRegisterWallets] = useState<any[] | null>(null);
  const [client] = useState(() => queryClient);

  useEffect(() => {
    setRendered(true);
  }, []);

  // google tag manager
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GTM_ID && rendered && !tagManagerInitiated) {
      TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID });
      setTagManagerInitiated(true);
    }
  }, [rendered, tagManagerInitiated, setTagManagerInitiated]);

  // google analytics
  useEffect(() => {
    if (pathname && searchParams) {
      const qs = searchParams.toString();
      ga.pageview(`${pathname}${qs ? `?${qs}` : ''}`);
    }
  }, [pathname, searchParams]);

  // sui
  const { networkConfig } = createNetworkConfig({
    testnet: {
      url: 'https://sui-testnet-rpc.publicnode.com',
    },
    mainnet: {
      url: 'https://sui-rpc.publicnode.com',
    },
  });

  // xrpl - with EIP-6963 support for MetaMask
  const metamaskProvider = useMetaMaskProvider();
  useEffect(() => {
    if (!rendered) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wallets: any[] = [
      new CrossmarkWallet(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new XRPLWalletConnectWallet(xrplConfig as any),
      new XamanWallet(process.env.NEXT_PUBLIC_XAMAN_API_KEY!),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new MetaMaskWallet(metamaskProvider as any),
    ];

    setXRPLlRegisterWallets(wallets);
  }, [rendered, setXRPLlRegisterWallets, metamaskProvider]);

  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <IntercomProvider
        appId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID!}
        autoBoot={true}
      >
        <ThemeWatcher />
        <QueryClientProvider client={client}>
          <Global />
          <WagmiConfigProvider>
            <XRPLWalletProvider
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              registerWallets={xrplRegisterWallets as any}
              autoConnect={false}
            >
              <SuiClientProvider
                networks={networkConfig}
                defaultNetwork={
                  ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet'
                }
              >
                <SuiWalletProvider>{children}</SuiWalletProvider>
              </SuiClientProvider>
            </XRPLWalletProvider>
          </WagmiConfigProvider>
        </QueryClientProvider>
      </IntercomProvider>
    </ThemeProvider>
  );
}
