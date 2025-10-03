'use client';

import { useEffect } from 'react';
// import { BrowserProvider, FallbackProvider, JsonRpcProvider, JsonRpcSigner } from 'ethers'
import clsx from 'clsx';
import { create } from 'zustand';

import { ENVIRONMENT } from '@/lib/config';
import { toArray } from '@/lib/parser';

interface KeplrChain {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bip44: {
    coinType: number;
  };
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
  };
  currencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  }>;
  feeCurrencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  }>;
  stakeCurrency: {
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  };
  features: string[];
}

interface KeplrSigner {
  getAccounts(): Promise<Array<{ address: string }>>;
  signAmino(
    signerAddress: string,
    signDoc: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
  signDirect(
    signerAddress: string,
    signDoc: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
}

interface KeplrWallet {
  enable(chainId: string): Promise<void>;
  experimentalSuggestChain(chain: KeplrChain): Promise<void>;
  getOfflineSignerAuto(chainId: string): Promise<KeplrSigner>;
}

interface CrossmarkWallet {
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

declare global {
  interface Window {
    keplr?: KeplrWallet;
    crossmark?: CrossmarkWallet;
  }
}

interface CosmosWalletState {
  chainId: string | null;
  address: string | null;
  provider: KeplrWallet | null;
  signer: KeplrSigner | null;
  setChainId: (chainId: string | null) => void;
  setAddress: (address: string | null) => void;
  setProvider: (provider: KeplrWallet | null) => void;
  setSigner: (signer: KeplrSigner | null) => void;
}

export const useCosmosWalletStore = create<CosmosWalletState>()(set => ({
  chainId: null,
  address: null,
  provider: null,
  signer: null,
  setChainId: data => set(state => ({ ...state, chainId: data })),
  setAddress: data => set(state => ({ ...state, address: data })),
  setProvider: data => set(state => ({ ...state, provider: data })),
  setSigner: data => set(state => ({ ...state, signer: data })),
}));

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
  const {
    chainId,
    address,
    provider,
    signer,
    setChainId,
    setAddress,
    setProvider,
    setSigner,
  } = useCosmosWalletStore();

  useEffect(() => {
    if (chainId && signer && address) {
      setChainId(chainId);
      setAddress(address);
      setProvider(window?.keplr);
      setSigner(signer);
    } else {
      setChainId(null);
      setAddress(null);
      setProvider(null);
      setSigner(null);
    }
  }, [
    chainId,
    signer,
    address,
    setChainId,
    setAddress,
    setProvider,
    setSigner,
  ]);

  const enable = async (chainId = connectChainId) => {
    try {
      if (chainId) {
        await window.keplr.enable(chainId);
      }
    } catch (error) {
      if (!error?.toString()?.includes('Request rejected')) {
        try {
          const response = await fetch(
            `https://${ENVIRONMENT === 'mainnet' ? '' : 'testnet.'}api.0xsquid.com/v1/chains`
          ).catch(() => null);
          if (response) {
            const { chains } = { ...(await response.json()) };

            await window.keplr.experimentalSuggestChain(
              toArray(chains).find(d => d.chainId === chainId)
            );
            await window.keplr.enable(chainId);
          }
        } catch {
          // Handle error silently
        }
      }
    }
  };

  const getSigner = async (
    chainId = connectChainId
  ): Promise<KeplrSigner | undefined> => {
    if (!chainId) return;

    await enable(chainId);

    try {
      return await window.keplr.getOfflineSignerAuto(chainId);
    } catch {
      // Handle error silently
    }

    return;
  };

  const getAddress = async (
    chainId = connectChainId
  ): Promise<string | undefined> => {
    if (!chainId) return;

    const signer = await getSigner(chainId);
    if (!signer) return;

    const [account] = await signer.getAccounts();
    return account.address;
  };

  const connect = async (chainId = connectChainId) => {
    const signer = await getSigner(chainId);
    const address = signer && (await getAddress(chainId));

    if (chainId && signer && address) {
      setChainId(chainId);
      setAddress(address);
      setProvider(window?.keplr);
      setSigner(signer);
    } else {
      disconnect();
    }
  };

  const disconnect = () => {
    setChainId(null);
    setAddress(null);
    setProvider(null);
    setSigner(null);
  };

  return provider ? (
    connectChainId && connectChainId !== chainId ? (
      <button
        onClick={() => connect(connectChainId)}
        className={clsx(className)}
      >
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-zinc-100 px-2.5 py-1 font-display text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            Connect
          </div>
        )}
      </button>
    ) : (
      <button onClick={() => disconnect()} className={clsx(className)}>
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
            Disconnect
          </div>
        )}
      </button>
    )
  ) : (
    <button onClick={() => connect(connectChainId)} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          Connect
        </div>
      )}
    </button>
  );
}
