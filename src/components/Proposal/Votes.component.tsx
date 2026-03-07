'use client';

import _ from 'lodash';

import { useValidators } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';

import { VoteRow } from './VoteRow.component';
import type { VoteEntry } from './Proposal.types';
import * as styles from './Proposal.styles';

export function Votes({ data }: { data: VoteEntry[] }) {
  const validators = useValidators();

  const totalVotingPower = _.sumBy(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (toArray(validators) as any[]).filter(
      (d) => !d.jailed && d.status === 'BOND_STATUS_BONDED'
    ),
    'tokens'
  );

  if (!data) {
    return null;
  }

  return (
    <div className={styles.votesWrapper}>
      <table className={styles.votesTable}>
        <thead className={styles.votesThead}>
          <tr className={styles.votesTheadRow}>
            <th scope="col" className={styles.votesThFirst}>#</th>
            <th scope="col" className={styles.votesTh}>Voter</th>
            <th scope="col" className={styles.votesTh}>Validator</th>
            <th scope="col" className={styles.votesThRight}>Voting Power</th>
            <th scope="col" className={styles.votesThLast}>Vote</th>
          </tr>
        </thead>
        <tbody className={styles.votesTbody}>
          {data.map((d: VoteEntry, i: number) => (
            <VoteRow key={i} entry={d} index={i} totalVotingPower={totalVotingPower} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
