import type { BatchCommand, CommandsSectionProps } from './EVMBatch.types';
import { CommandRow } from './CommandRow.component';
import * as styles from './EVMBatch.styles';

export function CommandsSection({
  commands,
  chain,
  url,
  transaction_path,
  chains,
  assets,
}: CommandsSectionProps) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>
        {`Command${commands.length > 1 ? `s (${commands.length})` : ''}`}
      </dt>
      <dd className={styles.ddValue}>
        <div className={styles.tableScrollWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableHeadRow}>
                <th scope="col" className={styles.thFirst}>ID</th>
                <th scope="col" className={styles.thMiddle}>Command</th>
                <th scope="col" className={styles.thLast}>Parameters</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {commands.map((c: BatchCommand, i: number) => (
                <CommandRow
                  key={i}
                  command={c}
                  chain={chain}
                  url={url}
                  transaction_path={transaction_path}
                  chains={chains}
                  assets={assets}
                />
              ))}
            </tbody>
          </table>
        </div>
      </dd>
    </div>
  );
}
