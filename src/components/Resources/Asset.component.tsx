'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import type { AssetProps, AssetAddressEntry, NormalizedAssetAddress } from './Resources.types';
import * as styles from './Resources.styles';
import { ChainIcon } from './ChainIcon.component';
import { FocusedChainDetail } from './FocusedChainDetail.component';

const NUM_CHAINS_TRUNCATE = 6;

export function Asset({ data, focusID, onFocus }: AssetProps) {
  const [seeMore, setSeeMore] = useState(false);
  const [chainSelected, setChainSelected] = useState<string | null>(null);
  const chains = useChains();

  const { type, denom, native_chain, symbol, addresses: rawAddresses } = { ...data };
  const asset = type === 'its' ? data.id : denom;

  const chainAddresses: NormalizedAssetAddress[] = _.uniqBy(
    toArray(
      _.concat(
        {
          chain: native_chain,
          ...(type === 'its'
            ? data.chains?.[native_chain!]
            : rawAddresses?.[native_chain!]),
        },
        Object.entries({ ...(type === 'its' ? data.chains : rawAddresses) }).map(
          ([k, v]) => ({ chain: k, ...(v as AssetAddressEntry) })
        )
      )
    ),
    'chain'
  ).map((d: NormalizedAssetAddress) => ({ ...d, address: d.address || d.tokenAddress }));

  const isFocused = focusID === asset;
  const {
    id: chain,
    explorer,
    chain_type,
  } = { ...(isFocused && getChainData(chainSelected, chains)) };
  const { url, contract_path, asset_path } = { ...explorer };

  const {
    address,
    ibc_denom,
    symbol: tokenSymbol,
  } = { ...chainAddresses.find((d: NormalizedAssetAddress) => d.chain === chain) };

  useEffect(() => {
    if (focusID !== asset) {
      setSeeMore(false);
    }
  }, [data, focusID, asset, type, denom]);

  const visibleChains = _.slice(
    chainAddresses,
    0,
    isFocused && seeMore ? chainAddresses.length : NUM_CHAINS_TRUNCATE
  );

  const handleChainClick = (chainId: string | undefined) => {
    setChainSelected(chainId === chainSelected ? null : chainId ?? null);
    if (onFocus && asset) {
      onFocus(asset);
    }
  };

  const handleSeeMoreClick = () => {
    setSeeMore(!seeMore);
    if (onFocus && asset) {
      onFocus(asset);
    }
  };

  return (
    <li>
      <div className={styles.cardWrapper}>
        <div className={styles.cardHeader}>
          <div className={styles.cardImageWrapper}>
            <Image
              src={data.image}
              alt=""
              width={56}
              height={56}
              className={styles.cardImage}
            />
          </div>
          <div className={styles.assetActionsColumn}>
            {symbol && (
              <Tooltip content="Symbol" className={styles.symbolTooltip}>
                <Tag>{symbol}</Tag>
              </Tooltip>
            )}
            <div className={styles.denomsWrapper}>
              {toArray(_.concat(denom, _.head(data.denoms))).map((d: string | undefined) => (
                <Tooltip key={d} content="Denom" className={styles.symbolTooltip}>
                  <Tag className={styles.denomTag}>
                    {ellipse(d)}
                  </Tag>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.assetNameRow}>
          <span className={styles.assetName}>{data.name}</span>
          {(data.decimals ?? 0) > 0 && (
            <span className={styles.assetDecimals}>
              Decimals: {data.decimals}
            </span>
          )}
        </div>
        <div className={styles.assetBodyWrapper}>
          <div className={styles.tokensSection}>
            <span className={styles.tokensLabel}>
              {type === 'its' ? 'Interchain' : 'Gateway'} Tokens
            </span>
            <div className={styles.tokensIconRow}>
              {visibleChains.map(({ chain: chainId }: NormalizedAssetAddress, i: number) => (
                <ChainIcon
                  key={i}
                  chainId={chainId}
                  nativeChain={native_chain}
                  isSelected={isFocused && chainId === chainSelected}
                  onClick={() => handleChainClick(chainId)}
                  chains={chains}
                />
              ))}
              {chainAddresses.length > NUM_CHAINS_TRUNCATE && (
                <button
                  onClick={handleSeeMoreClick}
                  className={styles.seeMoreButton}
                >
                  {seeMore
                    ? 'See Less'
                    : `+${chainAddresses.length - NUM_CHAINS_TRUNCATE} More`}
                </button>
              )}
            </div>
          </div>
          {chain && (
            <FocusedChainDetail
              chain={chain}
              chainType={chain_type}
              asset={asset}
              assetType={type}
              address={address}
              ibcDenom={ibc_denom}
              tokenSymbol={tokenSymbol}
              symbol={symbol}
              explorerUrl={url}
              contractPath={contract_path}
              assetPath={asset_path}
            />
          )}
        </div>
      </div>
    </li>
  );
}
