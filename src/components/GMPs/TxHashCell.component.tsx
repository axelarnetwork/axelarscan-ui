import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ExplorerLink } from '@/components/ExplorerLink';
import { ellipse } from '@/lib/string';

import type { TxHashCellProps } from './GMPs.types';
import * as styles from './GMPs.styles';
import { buildGmpHref } from './GMPs.utils';

export function TxHashCell({ data: d }: TxHashCellProps) {
  const key = d.message_id || d.call.transactionHash;

  return (
    <td className={styles.tdFirst}>
      <div className={styles.txHashWrapper}>
        <Copy value={key}>
          <Link
            href={buildGmpHref(d)}
            target="_blank"
            className={styles.txHashLink}
          >
            {ellipse(key, 8)}
          </Link>
        </Copy>
        {!d.call.proposal_id && (
          <ExplorerLink value={d.call.transactionHash} chain={d.call.chain} />
        )}
      </div>
    </td>
  );
}
