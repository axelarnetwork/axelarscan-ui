import { Copy } from '@/components/Copy';

import type { AddressRowProps } from './Validator.types';
import * as styles from './Validator.styles';

export function AddressRow({ label, value, children }: AddressRowProps) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dlLabel}>{label}</dt>
      <dd className={styles.dlValue}>
        <Copy value={value}>{children}</Copy>
      </dd>
    </div>
  );
}
