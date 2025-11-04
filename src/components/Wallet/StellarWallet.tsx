'use client';

import freighter from '@stellar/freighter-api';
import clsx from 'clsx';
import { create } from 'zustand';

import { walletStyles } from './Wallet.styles';

// Stellar network passphrases
export const STELLAR_NETWORK_PASSPHRASES = {
  MAINNET: 'Public Global Stellar Network ; September 2015',
  TESTNET: 'Test SDF Network ; September 2015',
  FUTURENET: 'Test SDF Future Network ; October 2022',
  SANDBOX: 'Local Sandbox Stellar Network ; September 2022',
  STANDALONE: 'Standalone Network ; February 2017',
} as const;

// Derive Soroban RPC URL from network passphrase
const getSorobanRpcUrl = (networkPassphrase: string): string | null => {
  const rpcUrls: Record<string, string> = {
    [STELLAR_NETWORK_PASSPHRASES.MAINNET]:
      'https://soroban-rpc.mainnet.stellar.org',
    [STELLAR_NETWORK_PASSPHRASES.TESTNET]:
      'https://soroban-rpc.testnet.stellar.org',
    [STELLAR_NETWORK_PASSPHRASES.FUTURENET]:
      'https://rpc-futurenet.stellar.org',
    [STELLAR_NETWORK_PASSPHRASES.SANDBOX]:
      'http://localhost:8000/soroban/rpc',
    [STELLAR_NETWORK_PASSPHRASES.STANDALONE]:
      'http://localhost:8000/soroban/rpc',
  };

  return rpcUrls[networkPassphrase] || null;
};

interface StellarNetwork {
  network: string;
  networkUrl: string;
  networkPassphrase: string;
}

interface StellarProvider {
  getAddress(): Promise<{ address: string } & { error?: unknown }>;
  getNetworkDetails(): Promise<StellarNetwork>;
  setAllowed(): Promise<{ isAllowed: boolean } & { error?: unknown }>;
  signTransaction(
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      path?: string;
      submit?: boolean;
      submitUrl?: string;
    }
  ): Promise<{
    signedTxXdr: string;
    signerAddress?: string;
  }>;
}

interface StellarWalletState {
  address: string | null;
  provider: StellarProvider | null;
  network: StellarNetwork | null;
  sorobanRpcUrl: string | null;
  setAddress: (address: string | null) => void;
  setProvider: (provider: StellarProvider | null) => void;
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
  const { address, setAddress, setProvider, setNetwork, setSorobanRpcUrl } =
    useStellarWalletStore();

  const connect = async () => {
    await freighter.setAllowed();
    const { address } = { ...(await freighter.getAddress()) };

    if (address) {
      setAddress(address);
      setProvider(freighter);
      
      const networkDetails = await freighter.getNetworkDetails();
      setNetwork(networkDetails);
      
      // Derive sorobanRpcUrl from networkPassphrase (wallet-agnostic)
      if (networkDetails?.networkPassphrase) {
        setSorobanRpcUrl(getSorobanRpcUrl(networkDetails.networkPassphrase));
      }
    }
  };

  const disconnect = () => {
    setAddress(null);
    setProvider(null);
    setNetwork(null);
    setSorobanRpcUrl(null);
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
