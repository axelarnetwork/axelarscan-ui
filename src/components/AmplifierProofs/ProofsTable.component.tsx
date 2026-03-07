'use client';

import { ProofRow } from './ProofRow.component';
import type {
  AmplifierProofEntry,
  ProofsTableProps,
} from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function ProofsTable({ data, chains }: ProofsTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.theadTr}>
            <th scope="col" className={styles.thSessionId}>Session ID</th>
            <th scope="col" className={styles.thDefault}>Messages</th>
            <th scope="col" className={styles.thDefault}>Height</th>
            <th scope="col" className={styles.thDefault}>Status</th>
            <th scope="col" className={styles.thDefault}>Participations</th>
            <th scope="col" className={styles.thTime}>Time</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.map((d: AmplifierProofEntry) => (
            <ProofRow key={d.id} proof={d} chains={chains} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
