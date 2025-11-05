'use client';

import {
  StellarWalletsKit,
  WalletNetwork,
  FreighterModule,
  ISupportedWallet,
} from '@creit.tech/stellar-wallets-kit';
import clsx from 'clsx';
import { create } from 'zustand';

import { ENVIRONMENT } from '@/lib/config';
import { walletStyles } from './Wallet.styles';

export const STELLAR_NETWORK_PASSPHRASES = {
  MAINNET: 'Public Global Stellar Network ; September 2015',
  TESTNET: 'Test SDF Network ; September 2015',
  FUTURENET: 'Test SDF Future Network ; October 2022',
  SANDBOX: 'Local Sandbox Stellar Network ; September 2022',
  STANDALONE: 'Standalone Network ; February 2017',
} as const;

const getSorobanRpcUrl = (networkPassphrase: string): string | null => {
  const rpcUrls: Record<string, string> = {
    [STELLAR_NETWORK_PASSPHRASES.MAINNET]:
      'https://soroban-rpc.mainnet.stellar.org',
    [STELLAR_NETWORK_PASSPHRASES.TESTNET]:
      'https://soroban-rpc.testnet.stellar.org',
    [STELLAR_NETWORK_PASSPHRASES.FUTURENET]:
      'https://rpc-futurenet.stellar.org',
    [STELLAR_NETWORK_PASSPHRASES.SANDBOX]: 'http://localhost:8000/soroban/rpc',
    [STELLAR_NETWORK_PASSPHRASES.STANDALONE]:
      'http://localhost:8000/soroban/rpc',
  };

  return rpcUrls[networkPassphrase] || null;
};

interface StellarNetwork {
  network: string;
  networkPassphrase: string;
}

interface StellarWalletState {
  address: string | null;
  provider: StellarWalletsKit | null;
  network: StellarNetwork | null;
  sorobanRpcUrl: string | null;
  setAddress: (address: string | null) => void;
  setProvider: (provider: StellarWalletsKit | null) => void;
  setNetwork: (network: StellarNetwork | null) => void;
  setSorobanRpcUrl: (url: string | null) => void;
}

export const useStellarWalletStore = create<StellarWalletState>()(set => ({
  address: null,
  provider: null,
  network: null,
  sorobanRpcUrl: null,
  setAddress: data => set(state => ({ ...state, address: data })),
  setProvider: data => set(state => ({ ...state, provider: data })),
  setNetwork: data => set(state => ({ ...state, network: data })),
  setSorobanRpcUrl: data => set(state => ({ ...state, sorobanRpcUrl: data })),
}));

interface StellarWalletProps {
  children?: React.ReactNode;
  className?: string;
}

export function StellarWallet({ children, className }: StellarWalletProps) {
  const {
    address,
    provider,
    setAddress,
    setProvider,
    setNetwork,
    setSorobanRpcUrl,
  } = useStellarWalletStore();

  const connect = async () => {
    let kit = provider;
    if (!kit) {
      kit = new StellarWalletsKit({
        network:
          ENVIRONMENT === 'mainnet'
            ? WalletNetwork.PUBLIC
            : WalletNetwork.TESTNET,
        modules: [new FreighterModule()],
      });
    }

    await kit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        try {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          const { network, networkPassphrase } = await kit.getNetwork();

          setAddress(address);
          setProvider(kit);
          setNetwork({ network, networkPassphrase });
          setSorobanRpcUrl(getSorobanRpcUrl(networkPassphrase));
        } catch (error) {
          console.error('Failed to connect to Stellar wallet:', error);
          resetWalletState();
        }
      },
    });
  };

  const resetWalletState = () => {
    setAddress(null);
    setProvider(null);
    setNetwork(null);
    setSorobanRpcUrl(null);
  };

  const disconnect = async () => {
    if (provider) {
      await provider.disconnect();
    }
    resetWalletState();
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
