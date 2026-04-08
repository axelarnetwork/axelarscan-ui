'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import { wagmiConfig } from '@/lib/provider/wagmi';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Client-only: wagmi and its dependencies
// reference browser globals like `window` at module scope, so WagmiProvider
// cannot render during SSR. We defer with useSyncExternalStore instead of
// next/dynamic({ ssr: false }) because dynamic() wraps children in a
// React.lazy Suspense boundary, which can cause downstream hooks (wagmi,
// @mysten/dapp-kit) to lose the QueryClientProvider context during
// concurrent re-renders — surfacing as errors after
// wallet transactions.
export default function WagmiConfigProvider({
  children,
}: {
  children: ReactNode;
}) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!mounted) return null;

  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
