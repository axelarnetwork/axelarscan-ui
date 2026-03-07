import { Copy } from '@/components/Copy';
import { ellipse } from '@/lib/string';

import type { SignaturesRowProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function SignaturesRow({ signatures }: SignaturesRowProps) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>
        {`Signature${signatures.length > 1 ? `s (${signatures.length})` : ''}`}
      </dt>
      <dd className={styles.ddValue}>
        <div className={styles.signaturesGrid}>
          {signatures.map((d: string, i: number) => (
            <Copy key={i} size={14} value={d}>
              <span className={styles.signatureText}>{ellipse(d, 8)}</span>
            </Copy>
          ))}
        </div>
      </dd>
    </div>
  );
}
