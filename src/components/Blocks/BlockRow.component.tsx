import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { ellipse } from '@/lib/string';
import * as styles from './Blocks.styles';
import type { BlockRowProps } from './Blocks.types';

export function BlockRow({ block: d, index: i }: BlockRowProps) {
  return (
    <tr className={styles.row}>
      <td className={styles.tdFirst}>
        <div className={styles.heightWrapper}>
          <Copy value={d.height}>
            <Link
              href={`/block/${d.height}`}
              target="_blank"
              className={styles.heightLink}
            >
              <Number value={d.height} />
            </Link>
          </Copy>
        </div>
      </td>
      <td className={styles.tdMiddle}>
        {d.hash && (
          <Copy value={d.hash}>
            <Link
              href={`/block/${d.height}`}
              target="_blank"
              className={styles.hashLink}
            >
              {ellipse(d.hash)}
            </Link>
          </Copy>
        )}
      </td>
      <td className={styles.tdMiddle}>
        <Profile i={i} address={d.proposer_address} />
      </td>
      <td className={styles.tdTxCount}>
        <Number value={d.num_txs} className={styles.txCountValue} />
      </td>
      <td className={styles.tdLast}>
        <TimeAgo timestamp={d.time} />
      </td>
    </tr>
  );
}
