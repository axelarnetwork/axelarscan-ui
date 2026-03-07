import { TimeAgo } from '@/components/Time';

import type { GMPRowProps } from './GMPs.types';
import * as styles from './GMPs.styles';
import { TxHashCell } from './TxHashCell.component';
import { MethodCell } from './MethodCell.component';
import { SenderCell } from './SenderCell.component';
import { DestinationCell } from './DestinationCell.component';
import { StatusCell } from './StatusCell.component';

export function GMPRow({ data: d, useAnotherHopChain }: GMPRowProps) {
  const key = d.message_id || d.call.transactionHash;

  return (
    <tr key={key} className={styles.tableRow}>
      <TxHashCell data={d} />
      <MethodCell data={d} />
      <SenderCell data={d} useAnotherHopChain={useAnotherHopChain} />
      <DestinationCell data={d} useAnotherHopChain={useAnotherHopChain} />
      <StatusCell data={d} />
      <td className={styles.tdLast}>
        <TimeAgo timestamp={d.call.block_timestamp * 1000} />
      </td>
    </tr>
  );
}
