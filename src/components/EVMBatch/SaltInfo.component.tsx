import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ellipse } from '@/lib/string';

import type { SaltInfoProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function SaltInfo({
  salt,
  depositAddress,
}: SaltInfoProps) {
  return (
    <div className={styles.saltWrapper}>
      <span className={styles.saltLabel}>
        {depositAddress ? 'Deposit address' : 'Salt'}:
      </span>
      {depositAddress ? (
        <Copy size={16} value={depositAddress}>
          <Link
            href={`/account/${depositAddress}`}
            target="_blank"
            className={styles.saltLabel}
          >
            {ellipse(depositAddress, 6, '0x')}
          </Link>
        </Copy>
      ) : (
        <Copy size={16} value={salt}>
          <span className={styles.saltLabel}>
            {ellipse(salt, 6, '0x')}
          </span>
        </Copy>
      )}
    </div>
  );
}
