import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { ellipse } from '@/lib/string';

import type { DataRowProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>{label}</dt>
      <dd className={styles.ddValue}>
        {value && (
          <div className={styles.dataWrapper}>
            <Tag className={styles.dataTag}>{ellipse(value, 256)}</Tag>
            <Copy value={value} className={styles.dataCopy} />
          </div>
        )}
      </dd>
    </div>
  );
}
