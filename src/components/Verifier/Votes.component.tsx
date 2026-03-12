'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { numberFormat } from '@/lib/number';
import type { VotesProps, VerifierPollEntry } from './Verifier.types';
import * as styles from './Verifier.styles';

const SIZE = 200;

export function Votes({ data }: VotesProps) {
  const chains = useChains();
  const entries = toArray(data) as VerifierPollEntry[];

  if (!data || data.length === 0) return null;

  const totalY = entries.filter(
    d => typeof d.vote === 'boolean' && d.vote
  ).length;
  const totalN = entries.filter(
    d => typeof d.vote === 'boolean' && !d.vote
  ).length;
  const totalUN = entries.filter(d => typeof d.vote !== 'boolean').length;
  const totalVotes = Object.fromEntries(
    Object.entries({ Y: totalY, N: totalN, UN: totalUN }).filter(
      ([_k, v]) => v || _k === 'Y'
    )
  );

  const participationRate =
    (entries.filter(d => typeof d.vote === 'boolean').length * 100) /
    data.length;
  const summaryPrefix = `${Object.keys(totalVotes).length > 1 ? '(' : ''}${Object.entries(
    totalVotes
  )
    .map(([k, v]) => `${numberFormat(v, '0,0')}${k}`)
    .join(' : ')}${Object.keys(totalVotes).length > 1 ? ')' : ''}/`;

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <h3 className={styles.sectionTitle}>Amplifier Votes</h3>
          <p className={styles.sectionSubtitle}>
            Latest {numberFormat(SIZE, '0,0')} Polls
          </p>
        </div>
        <div className={styles.sectionHeaderRight}>
          <Number
            value={participationRate}
            suffix="%"
            className={styles.sectionTitle}
          />
          <Number
            value={data.length}
            format="0,0"
            prefix={summaryPrefix}
            className={styles.sectionSubtitle}
          />
        </div>
      </div>
      <div className={styles.blockGrid}>
        {data.map((d, i) => {
          const { name } = { ...getChainData(d.sender_chain, chains) };
          const tooltipContent = d.poll_id
            ? `Poll ID: ${d.poll_id} (${name})`
            : numberFormat(d.height, '0,0');

          return (
            <Link
              key={i}
              href={d.id ? `/amplifier-poll/${d.id}` : `/block/${d.height}`}
              target="_blank"
              className={styles.blockLink}
            >
              <Tooltip content={tooltipContent} className={styles.chainTooltip}>
                <div
                  className={clsx(
                    styles.blockDot,
                    styles.getVoteDotStyle(d.vote)
                  )}
                />
              </Tooltip>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
