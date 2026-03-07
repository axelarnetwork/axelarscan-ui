'use client';

import { useCallback, useEffect, useState } from 'react';
import { Web3 } from 'web3';
import { create } from 'zustand';
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { useChains, useAssets, useITSAssets } from '@/hooks/useGlobalData';
import { getChainData, getAssetData, getITSAssetData } from '@/lib/config';
import { split } from '@/lib/parser';
import MetamaskLogo from '@/images/wallets/metamask.png';

import {
  cursorNotAllowedClass,
  cursorPointerClass,
  tooltipClass,
} from './Metamask.styles';
import type { TokenData, ChainIdState, AddMetamaskProps } from './Metamask.types';

export const useChainIdStore = create<ChainIdState>()(set => ({
  chainId: null,
  setChainId: data => set(state => ({ ...state, chainId: data })),
}));

export function AddMetamask({
  chain,
  asset,
  type,
  width = 20,
  height = 20,
  noTooltip = false,
}: AddMetamaskProps) {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [data, setData] = useState<{ chain_id: number; tokenData: TokenData } | null>(null);
  const { chainId, setChainId } = useChainIdStore();
  const chains = useChains();
  const assets = useAssets();
  const itsAssets = useITSAssets();

  const switchNetwork = useCallback(
    async (chain_id: number, tokenData?: TokenData) => {
      try {
        await web3!.currentProvider!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: web3!.utils.toHex(chain_id) }],
        });
      } catch (error: unknown) {
        if ((error as { code?: number })?.code === 4902) {
          try {
            const { provider_params } = { ...getChainData(chain_id, chains) };

            await web3!.currentProvider!.request({
              method: 'wallet_addEthereumChain',
              params: provider_params,
            });
          } catch (error) {}
        }
      }

      if (tokenData) {
        setData({ chain_id, tokenData });
      }
    },
    [web3?.currentProvider, web3?.utils, chains]
  );

  const addToken = useCallback(
    async (chain_id: number, tokenData: TokenData) => {
      if (web3 && tokenData) {
        if (chain_id === chainId) {
          try {
            const { address, symbol, decimals, image } = { ...tokenData };

            await web3!.currentProvider!.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  address,
                  symbol,
                  decimals,
                  image: image
                    ? `${image.startsWith('/') ? window.location.origin : ''}${image}`
                    : undefined,
                },
              },
            });
          } catch (error) {}

          setData(null);
        } else {
          switchNetwork(chain_id, tokenData);
        }
      }
    },
    [web3, chainId, switchNetwork]
  );

  useEffect(() => {
    if (!web3 && window.ethereum) {
      setWeb3(new Web3(window.ethereum));
    } else if (web3?.currentProvider) {
      (web3.currentProvider as Web3['currentProvider'] & { _handleChainChanged: (e: { chainId: string }) => void })._handleChainChanged = (e: { chainId: string }) => {
        try {
          setChainId(Web3.utils.hexToNumber(e.chainId) as number);
        } catch (error) {}
      };
    }
  }, [web3, setChainId]);

  useEffect(() => {
    if (data?.tokenData && data.chain_id === chainId) {
      addToken(data.chain_id, data.tokenData);
    }
  }, [data, chainId, addToken]);

  if (!chainId) return;

  // get chain data
  const chainData = getChainData(chain, chains);
  const { id, chain_id, name } = { ...chainData };

  // get asset data
  const assetData: Record<string, unknown> | undefined =
    type === 'its'
      ? getITSAssetData(asset, itsAssets) as Record<string, unknown> | undefined
      : getAssetData(asset, assets) as Record<string, unknown> | undefined;
  const { symbol, decimals, image, addresses } = { ...assetData } as { symbol?: string; decimals?: number; image?: string; addresses?: Record<string, unknown> };

  const tokenData: TokenData = {
    symbol,
    decimals,
    image,
    ...(type === 'its' ? (assetData?.chains as Record<string, unknown> | undefined)?.[id!] as Record<string, unknown> : (addresses as Record<string, unknown> | undefined)?.[id!] as Record<string, unknown>),
  };

  // set address from its asset data
  if (tokenData?.tokenAddress) {
    tokenData.address = tokenData.tokenAddress;
  }

  const alreadyOnThisChain = chain_id === chainId;

  const button = (
    <button
      onClick={() => {
        if (chain && typeof chain_id === 'number') {
          if (asset) {
            addToken(chain_id, tokenData);
          } else {
            switchNetwork(chain_id);
          }
        }
      }}
      className={clsx(
        !chain || (alreadyOnThisChain && !asset)
          ? cursorNotAllowedClass
          : cursorPointerClass
      )}
    >
      <Image src={(MetamaskLogo as { src: string }).src} alt="" width={width} height={height} />
    </button>
  );

  if (!noTooltip) {
    const tooltip =
      alreadyOnThisChain && !asset
        ? 'Your Metamask is currently on this chain.'
        : split(
            `Add ${asset ? tokenData.symbol || asset : ''} ${chain && asset ? 'on' : ''} ${name || chain} to Metamask`,
            { delimiter: ' ' }
          ).join(' ');

    return (
      <Tooltip content={tooltip} className={tooltipClass}>
        {button}
      </Tooltip>
    );
  }

  return button;
}
