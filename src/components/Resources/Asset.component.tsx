'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { AddMetamask } from '@/components/Metamask';
import { ValueBox } from '@/components/ValueBox';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { getIBCDenomBase64, toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import type { AssetProps } from './Resources.types';
import * as styles from './Resources.styles';

const NUM_CHAINS_TRUNCATE = 6;

export function Asset({ data, focusID, onFocus }: AssetProps) {
  const [seeMore, setSeeMore] = useState(false);
  const [chainSelected, setChainSelected] = useState<string | null>(null);
  const chains = useChains();

  // asset
  const { type, denom, native_chain, symbol } = { ...data };
  let { addresses } = { ...data };
  const asset = type === 'its' ? data.id : denom;

  addresses = _.uniqBy(
    toArray(
      _.concat(
        {
          chain: native_chain,
          ...(type === 'its'
            ? data.chains?.[native_chain]
            : addresses?.[native_chain]),
        },
        Object.entries({ ...(type === 'its' ? data.chains : addresses) }).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([k, v]: [string, any]) => ({ chain: k, ...v })
        )
      )
    ),
    'chain'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).map((d: any) => ({ ...d, address: d.address || d.tokenAddress }));

  // chain
  const {
    id: chain,
    explorer,
    chain_type,
  } = { ...(focusID === asset && getChainData(chainSelected, chains)) };
  const { url, contract_path, asset_path } = { ...explorer };

  // asset data of focused chain
  const {
    address,
    ibc_denom,
    symbol: tokenSymbol,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = { ...addresses.find((d: any) => d.chain === chain) };

  useEffect(() => {
    if (focusID !== asset) {
      setSeeMore(false);
    }
  }, [data, focusID, asset, type, denom]);

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
          {data.decimals > 0 && (
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
              {_.slice(
                addresses,
                0,
                focusID === asset && seeMore
                  ? addresses.length
                  : NUM_CHAINS_TRUNCATE
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ).map(({ chain: chainId }: any, i: number) => {
                const { name, image } = { ...getChainData(chainId, chains) };

                return (
                  <div key={i} className={styles.chainIconWrapper}>
                    <Tooltip
                      content={`${name}${chainId === native_chain ? ' (Native Chain)' : ''}`}
                      className={styles.chainIconTooltip}
                    >
                      <button
                        onClick={() => {
                          setChainSelected(
                            chainId === chainSelected ? null : chainId
                          );

                          if (onFocus) {
                            onFocus(asset);
                          }
                        }}
                      >
                        <Image
                          src={image}
                          alt=""
                          width={24}
                          height={24}
                          className={clsx(
                            'rounded-full',
                            focusID === asset && chainId === chainSelected
                              ? styles.chainIconSelected
                              : chainId === native_chain
                                ? styles.chainIconNative
                                : ''
                          )}
                        />
                      </button>
                    </Tooltip>
                  </div>
                );
              })}
              {addresses.length > NUM_CHAINS_TRUNCATE && (
                <button
                  onClick={() => {
                    setSeeMore(!seeMore);

                    if (onFocus) {
                      onFocus(asset);
                    }
                  }}
                  className={styles.seeMoreButton}
                >
                  {seeMore
                    ? 'See Less'
                    : `+${addresses.length - NUM_CHAINS_TRUNCATE} More`}
                </button>
              )}
            </div>
          </div>
          {chain && (
            <div className={styles.focusedChainSection}>
              <div className={styles.focusedChainHeader}>
                <Tag className={styles.focusedChainTag}>{chain}</Tag>
                {chain_type === 'evm' && (
                  <AddMetamask chain={chain} asset={asset} type={type} />
                )}
              </div>
              {address && (
                <ValueBox
                  title="Token Contract"
                  value={address}
                  url={
                    url &&
                    `${url}${contract_path?.replace('{address}', address)}`
                  }
                />
              )}
              {ibc_denom && (
                <ValueBox
                  title="IBC Denom"
                  value={ibc_denom}
                  url={
                    url &&
                    `${url}${asset_path?.replace('{ibc_denom}', getIBCDenomBase64(ibc_denom))}`
                  }
                  prefix="ibc/"
                />
              )}
              {(tokenSymbol || symbol) && (
                <ValueBox
                  title="Symbol"
                  value={tokenSymbol || symbol}
                  url={
                    url &&
                    (address
                      ? `${url}${contract_path?.replace('{address}', address)}`
                      : ibc_denom
                        ? `${url}${asset_path?.replace('{ibc_denom}', getIBCDenomBase64(ibc_denom))}`
                        : undefined)
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
