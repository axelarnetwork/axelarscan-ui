'use client';

import Link from 'next/link';
import { LuChevronUp, LuChevronDown } from 'react-icons/lu';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, ellipse, toTitle, spacedSuffix } from '@/lib/string';

import type { Receiver, DistributionRowProps } from './AmplifierRewards.types';
import * as styles from './AmplifierRewards.styles';

export function DistributionRow({
  distribution: d,
  distributionExpanded,
  setDistributionExpanded,
  symbol,
}: DistributionRowProps) {
  const isExpanded = equalsIgnoreCase(d.txhash, distributionExpanded);

  return (
    <tr key={d.txhash} className={styles.tr}>
      <td className={styles.tdFirst}>
        {d.height && (
          <Link
            href={`/block/${d.height}`}
            target="_blank"
            className={styles.blockLink}
          >
            <Number value={d.height} />
          </Link>
        )}
      </td>
      <td className={styles.tdMiddle}>
        <Copy value={d.txhash}>
          <Link
            href={`/tx/${d.txhash}`}
            target="_blank"
            className={styles.txLink}
          >
            {ellipse(d.txhash)}
          </Link>
        </Copy>
      </td>
      <td className={styles.tdMiddle}>
        <Tag className={styles.poolTag}>{toTitle(d.pool_type)}</Tag>
      </td>
      <td className={styles.tdMiddle}>
        <div className={styles.recipientsWrapper}>
          <div
            onClick={() =>
              setDistributionExpanded(isExpanded ? null : d.txhash)
            }
            className={styles.recipientToggle}
          >
            <Number
              value={d.total_receivers}
              format="0,0"
              suffix=" Verifiers"
              noTooltip={true}
              className={styles.recipientCount}
            />
            {isExpanded ? (
              <LuChevronUp size={18} />
            ) : (
              <LuChevronDown size={18} />
            )}
          </div>
          {isExpanded && (
            <div className={styles.recipientGrid}>
              {toArray(d.receivers).map((r: Receiver, i: number) => (
                <div key={i} className={styles.recipientRow}>
                  <Profile
                    address={r.receiver}
                    width={18}
                    height={18}
                    className={styles.recipientProfileClass}
                  />
                  <Number
                    value={r.amount}
                    noTooltip={true}
                    className={styles.recipientAmount}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className={styles.tdMiddle}>
        <div className={styles.payoutWrapper}>
          <Number
            value={d.total_amount}
            suffix={spacedSuffix(symbol)}
            noTooltip={true}
            className={styles.payoutAmount}
          />
        </div>
      </td>
      <td className={styles.tdLast}>
        <TimeAgo timestamp={d.created_at?.ms} />
      </td>
    </tr>
  );
}
