'use client';

import freighter from '@stellar/freighter-api';
import clsx from 'clsx';
import { useEffect } from 'react';
import { create } from 'zustand';

import { walletStyles } from './Wallet.styles';

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

  if (address) {
    return (
      <button onClick={() => disconnect()} className={clsx(className)}>
        {children || (
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
      {children || (
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
