import Link from 'next/link';

import { ChainProfile } from '@/components/Profile';

import type { ChainRowProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function ChainRow({
  url,
  addressPath,
  gatewayAddress,
  chain,
}: ChainRowProps) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>Chain</dt>
      <dd className={styles.ddValue}>
        {url && gatewayAddress ? (
          <Link
            href={`${url}${addressPath?.replace('{address}', gatewayAddress)}`}
            target="_blank"
          >
            <ChainProfile value={chain} />
          </Link>
        ) : (
          <ChainProfile value={chain} />
        )}
      </dd>
    </div>
  );
}
