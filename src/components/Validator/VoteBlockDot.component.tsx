import Link from 'next/link';
import clsx from 'clsx';

import { Tooltip } from '@/components/Tooltip';
import { getChainData } from '@/lib/config';
import { numberFormat } from '@/lib/number';
import type { VoteBlockDotProps } from './Validator.types';
import * as styles from './Validator.styles';

export function VoteBlockDot({ d, chains }: VoteBlockDotProps) {
  const { name } = { ...getChainData(d.sender_chain, chains) };

  return (
    <Link
      href={d.id ? `/evm-poll/${d.id}` : `/block/${d.height}`}
      target="_blank"
      className={styles.blockLink}
    >
      <Tooltip
        content={
          d.id ? `Poll ID: ${d.id} (${name})` : numberFormat(d.height, '0,0')
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
