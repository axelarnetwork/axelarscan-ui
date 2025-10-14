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

import { walletStyles } from './Wallet.styles';

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

export function XRPLWallet({ children, className }: XRPLWalletProps) {
  const { address, setAddress } = useXRPLWalletStore();

  const wallets = useXRPLWallets();
  const account = useXRPLAccount();
  const { connect: connectXRPL } = useXRPLConnect();
  const disconnectXRPL = useXRPLDisconnect();

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

  const availableWallets = wallets.filter(w =>
    w.name === 'Crossmark' ? window?.crossmark : w
  );

  return (
    <div className={walletStyles.layout.walletList}>
      {availableWallets.map((w, i) => (
        <button
          key={i}
          onClick={() => connectXRPL(w)}
          className={clsx(className)}
        >
          <div
            className={clsx(
              walletStyles.layout.buttonWithIcon,
              walletStyles.button.base,
              walletStyles.button.connect
            )}
          >
            <Image src={w.icon} alt="" width={16} height={16} className="" />
            {w.name}
          </div>
        </button>
      ))}
    </div>
  );
}
