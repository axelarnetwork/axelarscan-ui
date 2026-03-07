'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { numberFormat } from '@/lib/number';
import type { EVMVote } from '@/types';
import type { VotesProps } from './Validator.types';
import * as styles from './Validator.styles';

const SIZE = 200;
const NUM_LATEST_BLOCKS = 10000;

function VoteBlockDot({ d, chains }: { d: EVMVote; chains: import('@/types').Chain[] | null | undefined }) {
  const { name } = { ...getChainData(d.sender_chain, chains) };

  return (
    <Link
      href={d.id ? `/evm-poll/${d.id}` : `/block/${d.height}`}
      target="_blank"
      className={styles.blockLink}
    >
      <Tooltip
        content={
          d.id
            ? `Poll ID: ${d.id} (${name})`
            : numberFormat(d.height, '0,0')
        }
        className={styles.chainTooltip}
      >
        <div
          className={clsx(
            styles.blockDot,
            typeof d.vote === 'boolean'
              ? d.vote
                ? styles.blockDotActive
                : styles.blockDotNo
              : styles.blockDotInactive
          )}
        />
      </Tooltip>
    </Link>
  );
}

export function Votes({ data }: VotesProps) {
  const chains = useChains();

  if (!data || data.length === 0) {
    return null;
  }

  const totalY = toArray(data).filter(
    (d: EVMVote) => typeof d.vote === 'boolean' && d.vote
  ).length;
  const totalN = toArray(data).filter(
    (d: EVMVote) => typeof d.vote === 'boolean' && !d.vote
  ).length;
  const totalUN = toArray(data).filter((d: EVMVote) => typeof d.vote !== 'boolean').length;
  const totalVotes = Object.fromEntries(
    Object.entries({ Y: totalY, N: totalN, UN: totalUN }).filter(
      ([_k, v]) => v || _k === 'Y'
    )
  );

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeaderVotes}>
        <div className={styles.sectionHeaderLeft}>
          <h3 className={styles.sectionTitle}>EVM Votes</h3>
          <p className={styles.sectionSubtitle}>
            Latest {numberFormat(SIZE, '0,0')} Polls (
            {numberFormat(NUM_LATEST_BLOCKS, '0,0')} Blocks)
          </p>
        </div>
        <div className={styles.sectionHeaderRight}>
          <Number
            value={
              (data.filter((d: EVMVote) => typeof d.vote === 'boolean').length * 100) /
              data.length
            }
            suffix="%"
            className={styles.sectionTitle}
          />
          <Number
            value={data.length}
            format="0,0"
            prefix={`${Object.keys(totalVotes).length > 1 ? '(' : ''}${Object.entries(
              totalVotes
            )
              .map(([k, v]) => `${numberFormat(v, '0,0')}${k}`)
              .join(' : ')}${Object.keys(totalVotes).length > 1 ? ')' : ''}/`}
            className={styles.sectionSubtitle}
          />
        </div>
      </div>
      <div className={styles.blockGrid}>
        {data.map((d: EVMVote, i: number) => (
          <VoteBlockDot key={i} d={d} chains={chains} />
        ))}
      </div>
    </div>
  );
}
