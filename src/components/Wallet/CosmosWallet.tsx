'use client';

import clsx from 'clsx';
import {
  useConnect,
  useCosmosWalletStore,
  useSyncState,
} from './CosmosWallet.hooks';

interface CosmosWalletProps {
  connectChainId?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CosmosWallet({
  connectChainId,
  children,
  className,
}: CosmosWalletProps) {
  const { chainId, provider } = useCosmosWalletStore();

  useSyncState();

  const { connect, disconnect } = useConnect({ connectChainId });

  if (!provider) {
    return (
      <button
        onClick={() => connect(connectChainId)}
        className={clsx(className)}
      >
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
            Connect
          </div>
        )}
      </button>
    );
  }

  if (connectChainId && connectChainId !== chainId) {
    return (
      <button
        onClick={() => connect(connectChainId)}
        className={clsx(className)}
      >
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-zinc-100 px-2.5 py-1 font-display text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            Switch Network
          </div>
        )}
      </button>
    );
  }

  return (
    <button onClick={() => disconnect()} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
          Disconnect
        </div>
      )}
    </button>
  );
}
