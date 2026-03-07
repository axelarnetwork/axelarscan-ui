import clsx from 'clsx';

import { Tag } from '@/components/Tag';

import type { StatusCellProps } from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function StatusCell({ status }: StatusCellProps) {
  if (!status) return null;

  return (
    <div className={styles.flexColGap1}>
      <Tag
        className={clsx(
          styles.statusTagBase,
          ['completed'].includes(status)
            ? styles.statusCompleted
            : ['failed'].includes(status)
              ? styles.statusFailed
              : ['expired'].includes(status)
                ? styles.statusExpired
                : styles.statusPending
        )}
      >
        {status}
      </Tag>
    </div>
  );
}
