import { useEffect } from 'react';
import { create } from 'zustand';
import { getKeplrChainData } from '../../lib/api/keplr';
import { KeplrSigner, KeplrWallet } from '../../types/cosmos';

export interface CosmosWalletState {
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

export interface UseConnectProps {
  connectChainId?: string;
}

export const useConnect = ({ connectChainId }: UseConnectProps) => {
  const { setChainId, setAddress, setProvider, setSigner } =
    useCosmosWalletStore();

  const enable = async (chainId = connectChainId) => {
    if (!window.keplr || !chainId) {
      console.error('Keplr not found or chainId not provided');
      return;
    }

    try {
      if (chainId) {
        await window.keplr.enable(chainId);
      }
    } catch (error) {
      if (!error?.toString()?.includes('Request rejected')) {
        try {
          // in case the chain is not available in keplr, we need to suggest it
          const chainData = await getKeplrChainData(chainId);

          if (chainData) {
            await window.keplr.experimentalSuggestChain(chainData);
            await window.keplr.enable(chainId);
          }
        } catch {
          console.error(error);
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
      return await window.keplr?.getOfflineSignerAuto(chainId);
    } catch (error) {
      console.error(error);
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
      setProvider(window?.keplr ?? null);
      setChainId(chainId);
      setAddress(address);
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

  return { connect, disconnect };
};

// NOTE: need to evaluate if this is needed
export const useSyncState = () => {
  const {
    chainId,
    address,
    signer,
    setChainId,
    setAddress,
    setProvider,
    setSigner,
  } = useCosmosWalletStore();

  useEffect(() => {
    if (chainId && signer && address) {
      setProvider(window?.keplr ?? null);
      setChainId(chainId);
      setAddress(address);
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
};
