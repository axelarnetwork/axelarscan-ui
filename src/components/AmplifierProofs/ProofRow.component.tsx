import { memo } from 'react';

import { TimeAgo } from '@/components/Time';

import { SessionIdCell } from './SessionIdCell.component';
import { MessagesCell } from './MessagesCell.component';
import { HeightCell } from './HeightCell.component';
import { StatusCell } from './StatusCell.component';
import { ParticipationsCell } from './ParticipationsCell.component';
import type { ProofRowProps } from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export const ProofRow = memo(function ProofRow({ proof, chains }: ProofRowProps) {
  const chain = proof.chain || proof.destination_chain;

  return (
    <tr className={styles.tr}>
      <td className={styles.tdSessionId}>
        <SessionIdCell proof={proof} chain={chain} />
      </td>
      <td className={styles.tdDefault}>
        <MessagesCell proof={proof} chains={chains} />
      </td>
      <td className={styles.tdDefault}>
        <HeightCell height={proof.height} />
      </td>
      <td className={styles.tdDefault}>
        <StatusCell status={proof.status} />
      </td>
      <td className={styles.tdDefault}>
        <ParticipationsCell proof={proof} />
      </td>
      <td className={styles.tdTime}>
        <TimeAgo timestamp={proof.created_at?.ms} />
      </td>
    </tr>
  );
});
