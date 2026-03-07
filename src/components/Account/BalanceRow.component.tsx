'use client';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Number } from '@/components/Number';
import { useAssets } from '@/hooks/useGlobalData';
import { getAssetData } from '@/lib/config';
import { ellipse } from '@/lib/string';
import type { BalanceRowProps } from './Account.types';
import * as styles from './Account.styles';

export function BalanceRow({ entry, index }: BalanceRowProps) {
  const assets = useAssets();
  const burnedPrefix = 'burned-';
  const { symbol, image, price } = { ...getAssetData(entry.denom?.replace(burnedPrefix, ''), assets) };
  const isBurned = entry.denom?.startsWith(burnedPrefix);

  return (
    <tr className={styles.tableRow}>
      <td className={styles.tdIndex}>{index + 1}</td>
      <td className={styles.tdDefault}>
        <div className={styles.assetCell}>
          <Image src={image} alt="" width={16} height={16} />
          {(symbol || entry.denom) && (
            <div className={styles.assetInfo}>
              <div className={styles.assetNameWrapper}>
                <span className={styles.assetName}>
                  {isBurned ? 'Burned ' : ''}
                  {ellipse(symbol || entry.denom, 6, 'ibc/')}
                </span>
                {!symbol && <Copy size={16} value={entry.denom} />}
              </div>
              {price! > 0 && (
                <Number value={price!} maxDecimals={2} prefix="$" className={styles.assetPrice} />
              )}
            </div>
          )}
        </div>
      </td>
      <td className={styles.tdRight}>
        <div className={styles.cellEndAligned}>
          <Number value={entry.amount} className={styles.balanceValue} />
        </div>
      </td>
      <td className={styles.tdLast}>
        <div className={styles.cellEndAligned}>
          {price! > 0 && (
            <Number value={entry.amount * price!} prefix="$" noTooltip={true} className={styles.balanceUsdValue} />
          )}
        </div>
      </td>
    </tr>
  );
}
