'use client';

import Link from 'next/link';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { TimeAgo } from '@/components/Time';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';

import type { RewardRowProps } from './Verifier.types';
import * as styles from './Verifier.styles';

export function RewardRow({ entry }: RewardRowProps) {
  const chains = useChains();
  const { name, image } = { ...getChainData(entry.chain, chains) };

  return (
    <tr className={styles.rewardsRow}>
      <td className={styles.rewardsTdFirst}>
        <div className={styles.rewardsTdFirstInner}>
          <Copy size={16} value={entry.height}>
            <Link
              href={`/block/${entry.height}`}
              target="_blank"
              className={styles.blueLink}
            >
              <Number value={entry.height} className={styles.numberXs} />
            </Link>
          </Copy>
        </div>
      </td>
      <td className={styles.rewardsTdMiddle}>
        <div className={styles.rewardsTdMiddleInner}>
          {name ? (
            <Tooltip content={name} className={styles.chainTooltip}>
              <Image src={image} alt="" width={20} height={20} />
            </Tooltip>
          ) : (
            <span className={styles.chainFallbackText}>{entry.chain}</span>
          )}
        </div>
      </td>
      <td className={styles.rewardsTdRight}>
        <div className={styles.rewardsTdRightInner}>
          <Number value={entry.amount} className={styles.amountValue} />
        </div>
      </td>
      <td className={styles.rewardsTdLast}>
        <div className={styles.rewardsTdLastInner}>
          <TimeAgo timestamp={entry.created_at?.ms} />
        </div>
      </td>
    </tr>
  );
}
