'use client';

import freighter from '@stellar/freighter-api';
import { useEffect } from 'react';
// import { BrowserProvider, FallbackProvider, JsonRpcProvider, JsonRpcSigner } from 'ethers'
import clsx from 'clsx';
import { create } from 'zustand';

interface StellarNetwork {
  network: string;
  networkUrl: string;
  networkPassphrase: string;
}

interface StellarProvider {
  getAddress(): Promise<{ address: string } & { error?: unknown }>;
  getNetworkDetails(): Promise<StellarNetwork>;
  setAllowed(): Promise<{ isAllowed: boolean } & { error?: unknown }>;
}

interface StellarWalletState {
  address: string | null;
  provider: StellarProvider | null;
  network: StellarNetwork | null;
  setAddress: (address: string | null) => void;
  setProvider: (provider: StellarProvider | null) => void;
  setNetwork: (network: StellarNetwork | null) => void;
}

export const useStellarWalletStore = create<StellarWalletState>()(set => ({
  address: null,
  provider: null,
  network: null,
  setAddress: data => set(state => ({ ...state, address: data })),
  setProvider: data => set(state => ({ ...state, provider: data })),
  setNetwork: data => set(state => ({ ...state, network: data })),
}));

interface StellarWalletProps {
  children?: React.ReactNode;
  className?: string;
}

export function StellarWallet({ children, className }: StellarWalletProps) {
  const { address, setAddress, setProvider, setNetwork } =
    useStellarWalletStore();

  useEffect(() => {
    const getData = async () => {
      if (address) {
        setAddress(address);
        setProvider(freighter);
      } else {
        setAddress(null);
        setProvider(null);
      }

      setNetwork(await getNetwork());
    };

    getData();
  }, [address, setAddress, setProvider, setNetwork]);

  const getAddress = async (): Promise<string | undefined> => {
    const { address } = { ...(await freighter.getAddress()) };
    return address;
  };

  const getNetwork = async (): Promise<StellarNetwork> =>
    await freighter.getNetworkDetails();

  const connect = async () => {
    await freighter.setAllowed();
    const address = await getAddress();

    if (address) {
      setAddress(address);
      setProvider(freighter);
      setNetwork(await getNetwork());
    }
  };

  const disconnect = () => {
    setAddress(null);
    setProvider(null);
    setNetwork(null);
  };

  return address ? (
    <button onClick={() => disconnect()} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
          Disconnect
        </div>
      )}
    </button>
  ) : (
    <button onClick={() => connect()} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          Connect
        </div>
      )}
    </button>
  );
}
