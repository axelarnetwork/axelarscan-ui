'use client';

import {
  useAccount as useXRPLAccount,
  useConnect as useXRPLConnect,
  useDisconnect as useXRPLDisconnect,
  useWallets as useXRPLWallets,
} from '@xrpl-wallet-standard/react';
import { useEffect } from 'react';
// import { BrowserProvider, FallbackProvider, JsonRpcProvider, JsonRpcSigner } from 'ethers'
import clsx from 'clsx';
import { create } from 'zustand';

import { Image } from '@/components/Image';

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

  return address ? (
    <button onClick={() => disconnectXRPL()} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
          Disconnect
        </div>
      )}
    </button>
  ) : (
    <div className="flex flex-col gap-y-2">
      {wallets
        .filter(w => (w.name === 'Crossmark' ? window?.crossmark : w))
        .map((w, i) => (
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
