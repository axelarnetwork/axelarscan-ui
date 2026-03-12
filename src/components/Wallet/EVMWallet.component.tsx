'use client';

import { useAppKit } from '@reown/appkit/react';
import clsx from 'clsx';
import { useEffect } from 'react';
import {
  useAccount,
  useChainId,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';

import {
  useEVMWalletStore,
  walletClientToProvider,
  walletClientToSigner,
} from './EVMWallet.stores';
import { walletStyles } from './Wallet.styles';
import type { EVMWalletProps } from './Wallet.types';

export function EVMWallet({
  connectChainId,
  children,
  className,
}: EVMWalletProps) {
  const { chainId, provider, setChainId, setAddress, setProvider, setSigner } =
    useEVMWalletStore();

  const { open } = useAppKit();
  const chainIdConnected = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (chainIdConnected && walletClient && address) {
      setChainId(chainIdConnected);
      setAddress(address);
      setProvider(walletClientToProvider(walletClient));
      setSigner(walletClientToSigner(walletClient));
    } else {
      setChainId(null);
      setAddress(null);
      setProvider(null);
      setSigner(null);
    }
  }, [
    chainIdConnected,
    walletClient,
    address,
    setChainId,
    setAddress,
    setProvider,
    setSigner,
  ]);

  if (!provider) {
    return (
      <button onClick={() => open()} className={clsx(className)}>
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

  if (connectChainId && connectChainId !== chainId) {
    return (
      <button
        onClick={() => switchChain({ chainId: connectChainId })}
        className={clsx(className)}
      >
        {children || (
          <div
            className={clsx(
              walletStyles.button.base,
              walletStyles.button.switch
            )}
          >
            Switch Network
          </div>
        )}
      </button>
    );
  }

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
