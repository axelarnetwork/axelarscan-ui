import { ENVIRONMENT } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { useEffect } from 'react';
import { create } from 'zustand';
import { CosmosWalletState, KeplrSigner } from './CosmotWallet.types';

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
  connectChainId: string;
}

export const useConnect = ({ connectChainId }: UseConnectProps) => {
  const { setChainId, setAddress, setProvider, setSigner } =
    useCosmosWalletStore();

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
      return await window.keplr.getOfflineSignerAuto(chainId);
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
      setProvider(window?.keplr);
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
      setProvider(window?.keplr);
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
