import moment from 'moment';

import { TIME_FORMAT } from '@/lib/time';

import type { TimeRowProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function TimeRow({ createdAtMs }: TimeRowProps) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>Time</dt>
      <dd className={styles.ddValue}>
        {createdAtMs && moment(createdAtMs).format(TIME_FORMAT)}
      </dd>
    </div>
  );
}
