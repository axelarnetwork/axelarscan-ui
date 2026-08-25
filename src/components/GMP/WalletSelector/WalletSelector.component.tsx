import React from 'react';

import {
  CosmosWallet,
  EVMWallet,
  StellarWallet,
  SuiWallet,
  XRPLWallet,
} from '@/components/Wallet';
import { getChainData } from '@/lib/config';

import { resolveChainKind } from '../GMP.utils';
import { UnsupportedWalletNotice } from './UnsupportedWalletNotice.component';
import type { WalletSelectorProps } from './WalletSelector.types';

export function WalletSelector({
  targetChain,
  targetChainType,
  chains,
}: WalletSelectorProps): React.ReactNode {
  const { chain_id: chainIdentifier } = {
    ...getChainData(targetChain, chains),
  };

  switch (resolveChainKind(targetChain, targetChainType, chains)) {
    case 'cosmos':
      return (
        <CosmosWallet
          connectChainId={
            typeof chainIdentifier === 'string' ? chainIdentifier : undefined
          }
        />
      );
    case 'evm':
      return <EVMWallet connectChainId={chainIdentifier as number} />;
    case 'sui':
      return <SuiWallet />;
    case 'stellar':
      return <StellarWallet />;
    case 'xrpl':
      return <XRPLWallet />;
    default:
      // `chains` is null until the chain-config query resolves, and every
      // chain looks unresolvable until then. Rendering the notice here would
      // flash "not supported" on ordinary chains on every page load, so stay
      // silent - as this component did before - until we actually know.
      // `chains?.length`, not just `chains`: the config query resolves to null
      // while loading and could resolve to an empty array, and in both cases
      // every chain looks unresolvable. Showing the notice then would flash
      // "not supported" on ordinary chains like ethereum.
      return chains?.length ? (
        <UnsupportedWalletNotice targetChain={targetChain} />
      ) : null;
  }
}
