import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { numberFormat } from '@/lib/number';
import type { EvmChainVoteProps } from './Validators.types';
import * as styles from './Validators.styles';

export function EvmChainVote({ chain, votes, isSupported }: EvmChainVoteProps) {
  const {
    votes: voteBreakdown,
    total,
    total_polls,
  } = { ...votes } as {
    votes?: Record<string, number>;
    total?: number;
    total_polls?: number;
  };

  const details = isSupported
    ? (['true', 'false', 'unsubmitted'] as const)
        .map(s => [
          s === 'true' ? 'Y' : s === 'false' ? 'N' : 'UN',
          voteBreakdown?.[s],
        ])
        .filter(([_k, v]) => v)
        .map(([k, v]) => `${numberFormat(v, '0,0')}${k}`)
        .join(' / ')
    : 'Not Supported';

  return (
    <div className={styles.evmChainCell}>
      <Tooltip
        content={`${chain.name}${details ? `: ${details}` : ''}`}
        className={styles.tooltipWhitespace}
      >
        <div className={styles.evmChainRow}>
          <Image src={chain.image} alt="" width={20} height={20} />
          {!isSupported ? (
            <span className={styles.evmNotSupported}>Not Supported</span>
          ) : (
            <div className={styles.evmVotesRow}>
              <Number
                value={total || 0}
                format="0,0.0a"
                noTooltip={true}
                className={clsx(
                  (total ?? 0) < (total_polls ?? 0)
                    ? styles.evmVotesPartial
                    : styles.evmVotesFull
                )}
              />
              <Number
                value={total_polls || 0}
                format="0,0.0a"
                prefix=" / "
                noTooltip={true}
                className={styles.evmVotesFull}
              />
            </div>
          )}
        </div>
      </Tooltip>
    </div>
  );
}
