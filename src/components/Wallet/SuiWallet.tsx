'use client';

import {
  ConnectButton as SuiConnectButton,
  useCurrentAccount as useSuiCurrentAccount,
} from '@mysten/dapp-kit';
import { useEffect } from 'react';
// import { BrowserProvider, FallbackProvider, JsonRpcProvider, JsonRpcSigner } from 'ethers'
import clsx from 'clsx';
import { create } from 'zustand';

import '@mysten/dapp-kit/dist/index.css';

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

  return address ? (
    <button onClick={() => disconnect()} className={clsx(className)}>
      {children || <SuiConnectButton /> || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
          Disconnect
        </div>
      )}
    </button>
  ) : (
    <button onClick={() => connect()} className={clsx(className)}>
      {children || <SuiConnectButton /> || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          Connect
        </div>
      )}
    </button>
  );
}
