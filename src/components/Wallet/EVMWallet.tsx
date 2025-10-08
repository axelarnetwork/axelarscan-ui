'use client';

import { useAppKit } from '@reown/appkit/react';
import clsx from 'clsx';
import { providers } from 'ethers';
import { useEffect } from 'react';
import type { WalletClient } from 'viem';
import {
  useAccount,
  useChainId,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';
import { create } from 'zustand';

const walletClientToProvider = (
  walletClient: WalletClient
): providers.Web3Provider | null => {
  const { chain, transport } = { ...walletClient };

  if (!chain) {
    console.error('Chain not found');
    return null;
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  return new providers.Web3Provider(
    transport as providers.ExternalProvider | providers.JsonRpcFetchFunc,
    network
  );
};

const walletClientToSigner = (
  walletClient: WalletClient
): providers.JsonRpcSigner | null => {
  const { account, chain, transport } = { ...walletClient };

  if (!chain) {
    console.error('Chain not found');
    return null;
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  const provider = new providers.Web3Provider(
    transport as providers.ExternalProvider | providers.JsonRpcFetchFunc,
    network
  );

  const signer = provider.getSigner(account?.address);

  return signer;
};

interface EVMWalletState {
  chainId: number | null;
  address: string | null;
  provider: providers.Web3Provider | null;
  signer: providers.JsonRpcSigner | null;
  setChainId: (chainId: number | null) => void;
  setAddress: (address: string | null) => void;
  setProvider: (provider: providers.Web3Provider | null) => void;
  setSigner: (signer: providers.JsonRpcSigner | null) => void;
}

export const useEVMWalletStore = create<EVMWalletState>()(set => ({
  chainId: null,
  address: null,
  provider: null,
  signer: null,
  setChainId: data => set(state => ({ ...state, chainId: data })),
  setAddress: data => set(state => ({ ...state, address: data })),
  setProvider: data => set(state => ({ ...state, provider: data })),
  setSigner: data => set(state => ({ ...state, signer: data })),
}));

interface EVMWalletProps {
  connectChainId?: number;
  children?: React.ReactNode;
  className?: string;
}

export function EVMWallet({
  connectChainId,
  children,
  className,
}: EVMWalletProps) {
  const { chainId, provider, setChainId, setAddress, setProvider, setSigner } =
    useEVMWalletStore();

  const { open } = useAppKit();
  const chainIdConnected = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (chainIdConnected && walletClient && address) {
      setChainId(chainIdConnected);
      setAddress(address);
      setProvider(walletClientToProvider(walletClient));
      setSigner(walletClientToSigner(walletClient));
    } else {
      setChainId(null);
      setAddress(null);
      setProvider(null);
      setSigner(null);
    }
  }, [
    chainIdConnected,
    walletClient,
    address,
    setChainId,
    setAddress,
    setProvider,
    setSigner,
  ]);

  if (!provider) {
    return (
      <button onClick={() => open()} className={clsx(className)}>
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
            Connect
          </div>
        )}
      </button>
    );
  }

  if (connectChainId && connectChainId !== chainId) {
    return (
      <button
        onClick={() => switchChain({ chainId: connectChainId })}
        className={clsx(className)}
      >
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-zinc-100 px-2.5 py-1 font-display text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            Switch Network
          </div>
        )}
      </button>
    );
  }

  return (
    <button onClick={() => disconnect()} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
          Disconnect
        </div>
      )}
    </button>
  );
}
