'use client';

import clsx from 'clsx';
import {
  useConnect,
  useCosmosWalletStore,
  useSyncState,
} from './CosmosWallet.hooks';
import { walletStyles } from './Wallet.styles';

interface CosmosWalletProps {
  connectChainId?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CosmosWallet({
  connectChainId,
  children,
  className,
}: CosmosWalletProps) {
  const { chainId, provider } = useCosmosWalletStore();

  useSyncState();

  const { connect, disconnect } = useConnect({ connectChainId });

  if (!provider) {
    return (
      <button onClick={() => connect(connectChainId)} className={clsx(className)}>
        {children || (
          <div className={clsx(walletStyles.button.base, walletStyles.button.connect)}>
            Connect
          </div>
        )}
      </button>
    );
  }

  if (connectChainId && connectChainId !== chainId) {
    return (
      <button onClick={() => connect(connectChainId)} className={clsx(className)}>
        {children || (
          <div className={clsx(walletStyles.button.base, walletStyles.button.switch)}>
            Switch Network
          </div>
        )}
      </button>
    );
  }

  return (
    <button onClick={() => disconnect()} className={clsx(className)}>
      {children || (
        <div className={clsx(walletStyles.button.base, walletStyles.button.disconnect)}>
          Disconnect
        </div>
      )}
    </button>
  );
}
