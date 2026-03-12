'use client';

import {
  StellarWalletsKit,
  WalletNetwork,
  FreighterModule,
  ISupportedWallet,
} from '@creit.tech/stellar-wallets-kit';
import clsx from 'clsx';

import { ENVIRONMENT } from '@/lib/config';
import {
  useStellarWalletStore,
  getSorobanRpcUrl,
} from './StellarWallet.stores';
import { walletStyles } from './Wallet.styles';
import type { StellarWalletProps } from './Wallet.types';

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
      setProvider(kit);
    }

    await kit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        try {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          const { network, networkPassphrase } = await kit.getNetwork();

          setAddress(address);
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
