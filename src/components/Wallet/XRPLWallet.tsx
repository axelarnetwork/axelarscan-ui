'use client';

import { Image } from '@/components/Image';
import {
  useAccount as useXRPLAccount,
  useConnect as useXRPLConnect,
  useDisconnect as useXRPLDisconnect,
  useWallets as useXRPLWallets,
} from '@xrpl-wallet-standard/react';
import clsx from 'clsx';
import { useEffect } from 'react';
import { create } from 'zustand';
import { useMetaMaskProvider } from '@/lib/wallets/eip6963';

interface XRPLWalletState {
  address: string | null;
  setAddress: (address: string | null) => void;
}

export const useXRPLWalletStore = create<XRPLWalletState>()(set => ({
  address: null,
  setAddress: data => set(state => ({ ...state, address: data })),
}));

interface XRPLWalletProps {
  children?: React.ReactNode;
  className?: string;
}

interface WalletButtonProps {
  iconSrc: string;
  label: string;
  onClick: () => void;
  className?: string;
}

const WalletButton: React.FC<WalletButtonProps> = ({
  iconSrc,
  label,
  onClick,
  className,
}) => (
  <button onClick={onClick} className={clsx('w-fit', className)}>
    <div className="flex h-6 items-center gap-x-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
      <Image src={iconSrc} alt={label} width={16} height={16} className="" />
      {label}
    </div>
  </button>
);

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
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
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
    <div className="flex flex-col gap-y-2">
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
