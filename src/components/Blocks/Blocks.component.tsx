import { Container } from '@/components/Container';
import { numberFormat } from '@/lib/number';
import * as styles from './Blocks.styles';
import type { BlockEntry, BlocksProps } from './Blocks.types';
import { BlockRow } from './BlockRow.component';

export function Blocks({ data }: BlocksProps) {
  return (
    <Container className="sm:mt-8">
      <div>
        <div className="sm:flex-auto">
          <h1 className={styles.pageTitle}>Blocks</h1>
          <p className={styles.pageDescription}>
            Latest {numberFormat(data.length, '0,0')} Blocks
          </p>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th scope="col" className={styles.thFirst}>
                  Height
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Hash
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Proposer
                </th>
                <th scope="col" className={styles.thTxCount}>
                  No. Transactions
                </th>
                <th scope="col" className={styles.thLast}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((d, i) => (
                <BlockRow key={d.height} block={d} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
