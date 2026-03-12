import clsx from 'clsx';

import { Tag } from '@/components/Tag';

import type { StatusRowProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function StatusRow({ status, executeButton }: StatusRowProps) {
  if (!status) {
    return (
      <div className={styles.dlRow}>
        <dt className={styles.dtLabel}>Status</dt>
        <dd className={styles.ddValue} />
      </div>
    );
  }

  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>Status</dt>
      <dd className={styles.ddValue}>
        <div className={styles.statusWrapper}>
          <Tag
            className={clsx(
              'w-fit capitalize',
              ['executed'].includes(status)
                ? 'bg-green-600 dark:bg-green-500'
                : ['signed'].includes(status)
                  ? 'bg-orange-500 dark:bg-orange-600'
                  : ['signing'].includes(status)
                    ? 'bg-yellow-400 dark:bg-yellow-500'
                    : 'bg-red-600 dark:bg-red-500'
            )}
          >
            {status}
          </Tag>
          {executeButton}
        </div>
      </dd>
    </div>
  );
}
