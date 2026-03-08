import { Container } from '@/components/Container';
import * as styles from './Proposals.styles';
import type { ProposalsProps, ProposalListItem } from './Proposals.types';
import { ProposalRow } from './ProposalRow.component';

export function Proposals({ data }: ProposalsProps) {
  return (
    <Container className="sm:mt-8">
      <div>
        <div className={styles.headerWrapper}>
          <div className="sm:flex-auto">
            <h1 className={styles.pageTitle}>Proposals</h1>
            <p className={styles.pageDescription}>
              List of proposals in Axelar Network including ID, title,
              description, type and status.
            </p>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th scope="col" className={styles.thFirst}>
                  ID
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Proposal
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Type
                </th>
                <th scope="col" className={styles.thHidden}>
                  Height
                </th>
                <th scope="col" className={styles.thHiddenWrap}>
                  Voting Period
                </th>
                <th scope="col" className={styles.thHiddenRight}>
                  Deposit
                </th>
                <th scope="col" className={styles.thLast}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((d: ProposalListItem, i: number) => (
                <ProposalRow key={i} proposal={d} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
