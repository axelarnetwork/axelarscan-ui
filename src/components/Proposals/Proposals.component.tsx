'use client';

import { useEffect, useState } from 'react';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { getProposals } from '@/lib/api/axelarscan';
import { toArray } from '@/lib/parser';
import * as styles from './Proposals.styles';
import type { ProposalListItem, ProposalsApiResponse } from './Proposals.types';
import { ProposalRow } from './ProposalRow.component';

export function Proposals() {
  const [data, setData] = useState<ProposalListItem[] | null>(null);

  useEffect(() => {
    const getData = async () => {
      const { data: responseData } = {
        ...((await getProposals()) as ProposalsApiResponse | null),
      };
      setData(toArray(responseData));
    };
    getData();
  }, []);

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

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
