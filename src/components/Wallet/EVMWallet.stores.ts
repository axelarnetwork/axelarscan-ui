import { providers } from 'ethers';
import type { WalletClient } from 'viem';
import { create } from 'zustand';

export const walletClientToProvider = (
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

export const walletClientToSigner = (
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
