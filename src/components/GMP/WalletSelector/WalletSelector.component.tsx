import React from 'react';

import { CosmosWallet, EVMWallet, StellarWallet, SuiWallet, XRPLWallet } from '@/components/Wallet';
import { getChainData } from '@/lib/config';
import { isNumber } from '@/lib/number';
import { headString } from '@/lib/string';

import { ChainMetadata } from '../GMP.types';

export interface WalletSelectorProps {
  targetChain: string | undefined;
  targetChainType: string | undefined;
  chains: ChainMetadata[] | null;
}

export function WalletSelector({
  targetChain,
  targetChainType,
  chains,
}: WalletSelectorProps): React.ReactNode {
  const { chain_id: chainIdentifier } = {
    ...getChainData(targetChain, chains),
  };

  if (targetChainType === 'cosmos') {
    return (
      <CosmosWallet
        connectChainId={
          typeof chainIdentifier === 'string' ? chainIdentifier : undefined
        }
      />
    );
  }

  if (isNumber(chainIdentifier)) {
    return <EVMWallet connectChainId={chainIdentifier as number} />;
  }

  const normalizedChain = targetChain ? headString(targetChain) : '';
  if (normalizedChain === 'sui') return <SuiWallet />;
  if (normalizedChain === 'stellar') return <StellarWallet />;
  if (normalizedChain === 'xrpl') return <XRPLWallet />;

  return null;
}
