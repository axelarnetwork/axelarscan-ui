'use client';

import { useAppKit } from '@reown/appkit/react';
import { providers } from 'ethers';
import { useEffect, useState } from 'react';
import type { WalletClient } from 'viem';
import { hashMessage, parseAbiItem, verifyMessage } from 'viem';
import {
  useAccount,
  useChainId,
  useDisconnect,
  usePublicClient,
  useSignMessage,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';
// import { BrowserProvider, FallbackProvider, JsonRpcProvider, JsonRpcSigner } from 'ethers'
import clsx from 'clsx';
import { create } from 'zustand';

const walletClientToProvider = (
  walletClient: WalletClient
): providers.Web3Provider => {
  const { chain, transport } = { ...walletClient };

  const network = {
    chainId: chain?.id,
    name: chain?.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  // const provider = new BrowserProvider(transport, network)

  return new providers.Web3Provider(transport as unknown, network);
};

const walletClientToSigner = (
  walletClient: WalletClient
): providers.JsonRpcSigner => {
  const { account, chain, transport } = { ...walletClient };

  const network = {
    chainId: chain?.id,
    name: chain?.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  // const provider = new BrowserProvider(transport, network)
  // const signer = new JsonRpcSigner(provider, account.address)

  const provider = new providers.Web3Provider(transport as unknown, network);
  const signer = provider.getSigner(account.address);

  return signer;
};

interface EVMWalletState {
  chainId: number | null;
  address: string | null;
  provider: providers.Web3Provider | null;
  signer: providers.JsonRpcSigner | null;
  setChainId: (chainId: number | null) => void;
  setAddress: (address: string | null) => void;
  setProvider: (provider: providers.Web3Provider | null) => void;
  setSigner: (signer: providers.JsonRpcSigner | null) => void;
}

export const useEVMWalletStore = create<EVMWalletState>()(set => ({
  chainId: null,
  address: null,
  provider: null,
  signer: null,
  setChainId: data => set(state => ({ ...state, chainId: data })),
  setAddress: data => set(state => ({ ...state, address: data })),
  setProvider: data => set(state => ({ ...state, provider: data })),
  setSigner: data => set(state => ({ ...state, signer: data })),
}));

interface EVMWalletProps {
  connectChainId?: number;
  children?: React.ReactNode;
  className?: string;
}

export function EVMWallet({
  connectChainId,
  children,
  className,
}: EVMWalletProps) {
  const { chainId, provider, setChainId, setAddress, setProvider, setSigner } =
    useEVMWalletStore();
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);

  const { open } = useAppKit();
  const publicClient = usePublicClient();
  const chainIdConnected = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const message = process.env.NEXT_PUBLIC_APP_URL as string;
  const { data: signature } = useSignMessage({
    message: message || '',
  } as unknown as Parameters<typeof useSignMessage>[0]);

  useEffect(() => {
    if (chainIdConnected && walletClient && address) {
      setChainId(chainIdConnected);
      setAddress(address);
      // setProvider(publicClientToProvider(publicClient))
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
    publicClient,
    walletClient,
    address,
    setChainId,
    setAddress,
    setProvider,
    setSigner,
  ]);

  // validate signature
  useEffect(() => {
    const validateSignature = async () => {
      try {
        if (await publicClient.getBytecode({ address })) {
          const response = await publicClient.readContract({
            address,
            abi: [
              parseAbiItem(
                'function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)'
              ),
            ],
            functionName: 'isValidSignature',
            args: [hashMessage(message), signature],
          });

          // https://eips.ethereum.org/EIPS/eip-1271
          setSignatureValid(response === '0x1626ba7e');
        } else {
          setSignatureValid(
            await verifyMessage({ address, message, signature })
          );
        }
      } catch {
        // Handle error silently
      }
    };

    if (!signatureValid && publicClient) {
      validateSignature();
    }
  }, [signatureValid, publicClient, address, message, signature]);

  return provider ? (
    connectChainId && connectChainId !== chainId ? (
      <button
        onClick={() => switchChain({ chainId: connectChainId })}
        className={clsx(className)}
      >
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-zinc-100 px-2.5 py-1 font-display text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            Switch Network
          </div>
        )}
      </button>
    ) : (
      <button onClick={() => disconnect()} className={clsx(className)}>
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
            Disconnect
          </div>
        )}
      </button>
    )
  ) : (
    <button onClick={() => open()} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          Connect
        </div>
      )}
    </button>
  );
}
