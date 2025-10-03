'use client';

import {
  ConnectButton as SuiConnectButton,
  useCurrentAccount as useSuiCurrentAccount,
} from '@mysten/dapp-kit';
import { useAppKit } from '@reown/appkit/react';
import freighter from '@stellar/freighter-api';
import {
  useAccount as useXRPLAccount,
  useConnect as useXRPLConnect,
  useDisconnect as useXRPLDisconnect,
  useWallets as useXRPLWallets,
} from '@xrpl-wallet-standard/react';
import { providers } from 'ethers';
import { useEffect, useState } from 'react';
import type { PublicClient, WalletClient } from 'viem';
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

import { Image } from '@/components/Image';
import { ENVIRONMENT } from '@/lib/config';
import { toArray } from '@/lib/parser';

import '@mysten/dapp-kit/dist/index.css';

// Type declarations for global objects

interface SuiAccount {
  address?: string;
}

declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      experimentalSuggestChain: (chain: unknown) => Promise<void>;
      getOfflineSignerAuto: (chainId: string) => Promise<unknown>;
    };
    crossmark?: unknown;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const publicClientToProvider = (
  publicClient: PublicClient
): providers.Provider => {
  const { chain, transport } = { ...publicClient };

  const network = {
    chainId: chain?.id,
    name: chain?.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  // if (transport.type === 'fallback') {
  //   const providers = transport.transports.map(({ value }) => new JsonRpcProvider(value?.url, network))

  //   if (providers.length === 1) {
  //     return providers[0]
  //   }

  //   return new FallbackProvider(providers)
  // }

  // return new JsonRpcProvider(transport.url, network)

  if (transport.type === 'fallback') {
    return new providers.FallbackProvider(
      transport.transports.map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    );
  }

  return new providers.JsonRpcProvider(transport.url, network);
};

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
        if (address && signature && publicClient) {
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

interface CosmosWalletState {
  chainId: string | null;
  address: string | null;
  provider: unknown | null;
  signer: unknown | null;
  setChainId: (chainId: string | null) => void;
  setAddress: (address: string | null) => void;
  setProvider: (provider: unknown | null) => void;
  setSigner: (signer: unknown | null) => void;
}

export const useCosmosWalletStore = create<CosmosWalletState>()(set => ({
  chainId: null,
  address: null,
  provider: null,
  signer: null,
  setChainId: data => set(state => ({ ...state, chainId: data })),
  setAddress: data => set(state => ({ ...state, address: data })),
  setProvider: data => set(state => ({ ...state, provider: data })),
  setSigner: data => set(state => ({ ...state, signer: data })),
}));

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
  const {
    chainId,
    address,
    provider,
    signer,
    setChainId,
    setAddress,
    setProvider,
    setSigner,
  } = useCosmosWalletStore();

  useEffect(() => {
    if (chainId && signer && address) {
      setChainId(chainId);
      setAddress(address);
      setProvider(window?.keplr);
      setSigner(signer);
    } else {
      setChainId(null);
      setAddress(null);
      setProvider(null);
      setSigner(null);
    }
  }, [
    chainId,
    signer,
    address,
    setChainId,
    setAddress,
    setProvider,
    setSigner,
  ]);

  const enable = async (chainId = connectChainId) => {
    try {
      if (chainId && window.keplr) {
        await window.keplr.enable(chainId);
      }
    } catch (error) {
      if (!error?.toString()?.includes('Request rejected')) {
        try {
          const response = await fetch(
            `https://${ENVIRONMENT === 'mainnet' ? '' : 'testnet.'}api.0xsquid.com/v1/chains`
          ).catch(() => null);
          if (response) {
            const { chains } = { ...(await response.json()) };

            if (window.keplr) {
              await window.keplr.experimentalSuggestChain(
                toArray(chains).find(d => d.chainId === chainId)
              );
              await window.keplr.enable(chainId);
            }
          }
        } catch {
          // Handle error silently
        }
      }
    }
  };

  const getSigner = async (chainId = connectChainId) => {
    if (!chainId) return;

    await enable(chainId);

    try {
      if (window.keplr) {
        return await window.keplr.getOfflineSignerAuto(chainId);
      }
    } catch {
      // Handle error silently
    }

    return;
  };

  const getAddress = async (chainId = connectChainId) => {
    if (!chainId) return;

    const signer = await getSigner(chainId);
    if (!signer) return;

    const [account] = await (
      signer as unknown as {
        getAccounts(): Promise<Array<{ address: string }>>;
      }
    ).getAccounts();
    return account.address;
  };

  const connect = async (chainId = connectChainId) => {
    const signer = await getSigner(chainId);
    const address = signer && (await getAddress(chainId));

    if (chainId && signer && address) {
      setChainId(chainId);
      setAddress(address);
      setProvider(window?.keplr);
      setSigner(signer);
    } else {
      disconnect();
    }
  };

  const disconnect = () => {
    setChainId(null);
    setAddress(null);
    setProvider(null);
    setSigner(null);
  };

  return provider ? (
    connectChainId && connectChainId !== chainId ? (
      <button
        onClick={() => connect(connectChainId)}
        className={clsx(className)}
      >
        {children || (
          <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-zinc-100 px-2.5 py-1 font-display text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            Connect
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
    <button onClick={() => connect(connectChainId)} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          Connect
        </div>
      )}
    </button>
  );
}

interface SuiWalletState {
  address: string | null;
  setAddress: (address: string | null) => void;
}

export const useSuiWalletStore = create<SuiWalletState>()(set => ({
  address: null,
  setAddress: data => set(state => ({ ...state, address: data })),
}));

interface SuiWalletProps {
  children?: React.ReactNode;
  className?: string;
}

export function SuiWallet({ children, className }: SuiWalletProps) {
  const { address, setAddress } = useSuiWalletStore();
  const account: SuiAccount | null = useSuiCurrentAccount();

  useEffect(() => {
    const address = account?.address;

    if (address) {
      setAddress(address);
    } else {
      setAddress(null);
    }
  }, [account, setAddress]);

  const connect = () => {
    const address = account?.address;

    if (address) {
      setAddress(address);
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  return address ? (
    <button onClick={() => disconnect()} className={clsx(className)}>
      {children || <SuiConnectButton /> || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
          Disconnect
        </div>
      )}
    </button>
  ) : (
    <button onClick={() => connect()} className={clsx(className)}>
      {children || <SuiConnectButton /> || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          Connect
        </div>
      )}
    </button>
  );
}

interface StellarWalletState {
  address: string | null;
  provider: unknown | null;
  network: unknown | null;
  setAddress: (address: string | null) => void;
  setProvider: (provider: unknown | null) => void;
  setNetwork: (network: unknown | null) => void;
}

export const useStellarWalletStore = create<StellarWalletState>()(set => ({
  address: null,
  provider: null,
  network: null,
  setAddress: data => set(state => ({ ...state, address: data })),
  setProvider: data => set(state => ({ ...state, provider: data })),
  setNetwork: data => set(state => ({ ...state, network: data })),
}));

interface StellarWalletProps {
  children?: React.ReactNode;
  className?: string;
}

export function StellarWallet({ children, className }: StellarWalletProps) {
  const { address, setAddress, setProvider, setNetwork } =
    useStellarWalletStore();

  useEffect(() => {
    const getData = async () => {
      if (address) {
        setAddress(address);
        setProvider(freighter);
      } else {
        setAddress(null);
        setProvider(null);
      }

      setNetwork(await getNetwork());
    };

    getData();
  }, [address, setAddress, setProvider, setNetwork]);

  const getAddress = async () => {
    const { address } = { ...(await freighter.getAddress()) };
    return address;
  };

  const getNetwork = async () => await freighter.getNetworkDetails();

  const connect = async () => {
    await freighter.setAllowed();
    const address = await getAddress();

    if (address) {
      setAddress(address);
      setProvider(freighter);
      setNetwork(await getNetwork());
    }
  };

  const disconnect = () => {
    setAddress(null);
    setProvider(null);
    setNetwork(null);
  };

  return address ? (
    <button onClick={() => disconnect()} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-red-600 px-2.5 py-1 font-display text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600">
          Disconnect
        </div>
      )}
    </button>
  ) : (
    <button onClick={() => connect()} className={clsx(className)}>
      {children || (
        <div className="flex h-6 items-center whitespace-nowrap rounded-xl bg-blue-600 px-2.5 py-1 font-display text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          Connect
        </div>
      )}
    </button>
  );
}

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
