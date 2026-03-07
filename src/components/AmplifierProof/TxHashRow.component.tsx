'use client';

import Link from 'next/link';

import { ellipse } from '@/lib/string';

import type { TxHashRowProps } from './AmplifierProof.types';
import * as styles from './AmplifierProof.styles';

export function TxHashRow({ label, txhash, external }: TxHashRowProps) {
  const href = external
    ? `${external.url}${external.transaction_path?.replace('{tx}', txhash)}`
    : `/tx/${txhash}`;

  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>{label}</dt>
      <dd className={styles.ddValue}>
        <Link href={href} target="_blank" className={styles.blockLink}>
          {ellipse(txhash)}
        </Link>
      </dd>
    </div>
  );
}
