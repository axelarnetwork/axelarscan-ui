'use client';

import {
  ConnectButton as SuiConnectButton,
  useCurrentAccount as useSuiCurrentAccount,
} from '@mysten/dapp-kit';
import clsx from 'clsx';
import { useEffect } from 'react';
import { create } from 'zustand';

import '@mysten/dapp-kit/dist/index.css';

import { walletStyles } from './Wallet.styles';

interface SuiAccount {
  address?: string;
}

interface SuiWalletState {
  address: string | null;
  setAddress: (address: string | null) => void;
}

export const useSuiWalletStore = create<SuiWalletState>()(set => ({
  address: null,
  setAddress: data => set(state => ({ ...state, address: data })),
}));

interface SuiWalletProps {
  children?: React.ReactNode;
  className?: string;
}

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
          <div className={clsx(walletStyles.button.base, walletStyles.button.disconnect)}>
            Disconnect
          </div>
        )}
      </button>
    );
  }

  return (
    <button onClick={() => connect()} className={clsx(className)}>
      {children || <SuiConnectButton /> || (
        <div className={clsx(walletStyles.button.base, walletStyles.button.connect)}>
          Connect
        </div>
      )}
    </button>
  );
}
