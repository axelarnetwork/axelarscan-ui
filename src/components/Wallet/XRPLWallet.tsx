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
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
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
    <div className="flex flex-col gap-y-2">
      {availableWallets.map((w, i) => (
        <button
          key={i}
          onClick={() => connectXRPL(w)}
          className={clsx(className)}
        >
          <div className="flex h-6 w-fit items-center gap-x-1.5 whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
            <Image src={w.icon} alt="" width={16} height={16} className="" />
            {w.name}
          </div>
        </button>
      ))}
    </div>
  );
}
