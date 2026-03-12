'use client';

import {
  useAccount as useXRPLAccount,
  useConnect as useXRPLConnect,
  useDisconnect as useXRPLDisconnect,
  useWallets as useXRPLWallets,
} from '@xrpl-wallet-standard/react';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useMetaMaskProvider } from '@/lib/wallets/eip6963';

import { useXRPLWalletStore } from './XRPLWallet.stores';
import { WalletButton } from './WalletButton.component';
import { walletStyles } from './Wallet.styles';
import type { XRPLWalletProps } from './Wallet.types';

export function XRPLWallet({ children, className }: XRPLWalletProps) {
  const { address, setAddress } = useXRPLWalletStore();

  const wallets = useXRPLWallets();
  const account = useXRPLAccount();
  const { connect: connectXRPL } = useXRPLConnect();
  const disconnectXRPL = useXRPLDisconnect();
  const metaMaskProvider = useMetaMaskProvider();

  useEffect(() => {
    const address = account?.address;

    if (address) {
      setAddress(address);
    } else {
      setAddress(null);
    }
  }, [account, setAddress]);

  if (address) {
    return (
      <button onClick={() => disconnectXRPL()} className={clsx(className)}>
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

  const crossmarkEnabled = !!window?.crossmark;
  const WalletConnectWallet = wallets.find(w => w.name === 'WalletConnect');
  const metaMaskEnabled = !!metaMaskProvider;

  // expand "Walletconnect" to wallets that support walletconnect
  let WalletConnectSupportedWallets: { name: string; icon: string }[] = [];
  if (WalletConnectWallet) {
    WalletConnectSupportedWallets = [
      //{name: WalletConnectWallet.name, icon: WalletConnectWallet.icon}, // add WalletConnect as well?
      { name: 'Bifrost', icon: '/logos/wallets/bifrost.webp' },
      { name: 'Joey', icon: '/logos/wallets/joey.webp' },
      { name: 'Girin', icon: '/logos/wallets/girin.webp' },
    ];
  }

  return (
    <div className={walletStyles.layout.walletList}>
      {wallets.flatMap((w, i) => {
        // Case 1.1: Crossmark not enabled -> Show "Install Crossmark"
        if (w.name === 'Crossmark' && !crossmarkEnabled) {
          return (
            <WalletButton
              key={i}
              iconSrc={w.icon}
              label="Install Crossmark"
              className={className}
              onClick={() =>
                window.open('https://crossmark.io/', '_blank', 'noreferrer')
              }
            />
          );
        }

        // Case 1.2: MetaMask not enabled -> Show "Install Metamask"
        if (w.name === 'MetaMask' && !metaMaskEnabled) {
          return (
            <WalletButton
              key={i}
              iconSrc={w.icon}
              label="Install MetaMask"
              className={className}
              onClick={() =>
                window.open(
                  'https://metamask.io/en-GB/download',
                  '_blank',
                  'noreferrer'
                )
              }
            />
          );
        }

        // Case 2: WalletConnect -> Show WalletConnect wallets explicitly
        if (w.name === 'WalletConnect') {
          return WalletConnectSupportedWallets.map((wcw, wci) => (
            <WalletButton
              key={`${i}-${wci}`}
              iconSrc={wcw.icon}
              label={wcw.name}
              className={className}
              onClick={() => connectXRPL(w)}
            />
          ));
        }

        // Case 3: Normal wallet
        return (
          <WalletButton
            key={i}
            iconSrc={w.icon}
            label={w.name}
            className={className}
            onClick={() => connectXRPL(w)}
          />
        );
      })}
    </div>
  );
}
