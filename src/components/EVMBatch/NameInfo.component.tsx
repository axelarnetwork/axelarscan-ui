import { Number } from '@/components/Number';

import type { NameInfoProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function NameInfo({
  name,
  decimals,
  cap,
}: NameInfoProps) {
  return (
    <div className={styles.nameWrapper}>
      <span className={styles.nameText}>{name}</span>
      <div className={styles.nameDetailsRow}>
        {decimals != null && decimals > 0 && (
          <Number
            value={decimals}
            prefix="Decimals: "
            className={styles.nameDetail}
          />
        )}
        {cap != null && cap > 0 && (
          <Number value={cap} prefix="Cap: " className={styles.nameDetail} />
        )}
      </div>
    </div>
  );
}
