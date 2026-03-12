'use client';

import {
  ConnectButton as SuiConnectButton,
  useCurrentAccount as useSuiCurrentAccount,
} from '@mysten/dapp-kit';
import clsx from 'clsx';
import { useEffect } from 'react';

import '@mysten/dapp-kit/dist/index.css';

import { useSuiWalletStore } from './SuiWallet.stores';
import { walletStyles } from './Wallet.styles';
import type { SuiAccount, SuiWalletProps } from './Wallet.types';

export function SuiWallet({ children, className }: SuiWalletProps) {
  const { address, setAddress } = useSuiWalletStore();
  const account: SuiAccount | null = useSuiCurrentAccount();

  useEffect(() => {
    const address = account?.address;

    if (address) {
      setAddress(address);
    } else {
      setAddress(null);
    }
  }, [account, setAddress]);

  const connect = () => {
    const address = account?.address;

    if (address) {
      setAddress(address);
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  if (address) {
    return (
      <button onClick={() => disconnect()} className={clsx(className)}>
        {children || <SuiConnectButton /> || (
          <div
            className={clsx(
              walletStyles.button.base,
              walletStyles.button.disconnect
            )}
          >
            Disconnect
          </div>
        )}
      </button>
    );
  }

  return (
    <button onClick={() => connect()} className={clsx(className)}>
      {children || <SuiConnectButton /> || (
        <div
          className={clsx(
            walletStyles.button.base,
            walletStyles.button.connect
          )}
        >
          Connect
        </div>
      )}
    </button>
  );
}
