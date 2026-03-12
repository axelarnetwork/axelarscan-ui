'use client';

import { Tag } from '@/components/Tag';
import { AddMetamask } from '@/components/Metamask';
import { ValueBox } from '@/components/ValueBox';
import { getIBCDenomBase64 } from '@/lib/parser';

import type { FocusedChainDetailProps } from './Resources.types';
import * as styles from './Resources.styles';

export function FocusedChainDetail({
  chain,
  chainType,
  asset,
  assetType,
  address,
  ibcDenom,
  tokenSymbol,
  symbol,
  explorerUrl,
  contractPath,
  assetPath,
}: FocusedChainDetailProps) {
  const displaySymbol = tokenSymbol || symbol;

  return (
    <div className={styles.focusedChainSection}>
      <div className={styles.focusedChainHeader}>
        <Tag className={styles.focusedChainTag}>{chain}</Tag>
        {chainType === 'evm' && (
          <AddMetamask chain={chain} asset={asset} type={assetType} />
        )}
      </div>
      {address && (
        <ValueBox
          title="Token Contract"
          value={address}
          url={
            explorerUrl &&
            `${explorerUrl}${contractPath?.replace('{address}', address)}`
          }
        />
      )}
      {ibcDenom && (
        <ValueBox
          title="IBC Denom"
          value={ibcDenom}
          url={
            explorerUrl &&
            `${explorerUrl}${assetPath?.replace('{ibc_denom}', getIBCDenomBase64(ibcDenom))}`
          }
          prefix="ibc/"
        />
      )}
      {displaySymbol && (
        <ValueBox
          title="Symbol"
          value={displaySymbol}
          url={
            explorerUrl &&
            (address
              ? `${explorerUrl}${contractPath?.replace('{address}', address)}`
              : ibcDenom
                ? `${explorerUrl}${assetPath?.replace('{ibc_denom}', getIBCDenomBase64(ibcDenom))}`
                : undefined)
          }
        />
      )}
    </div>
  );
}
