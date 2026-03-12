import Link from 'next/link';
import clsx from 'clsx';

import { Tooltip } from '@/components/Tooltip';
import { numberFormat } from '@/lib/number';
import type { UptimeBlockDotProps } from './Validator.types';
import * as styles from './Validator.styles';

export function UptimeBlockDot({ d }: UptimeBlockDotProps) {
  return (
    <Link
      href={`/block/${d.height}`}
      target="_blank"
      className={styles.blockLink}
    >
      <Tooltip content={numberFormat(d.height, '0,0')}>
        <div
          className={clsx(
            styles.blockDot,
            d.status ? styles.blockDotActive : styles.blockDotInactive
          )}
        />
      </Tooltip>
    </Link>
  );
}
