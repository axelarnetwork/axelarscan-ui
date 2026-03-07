'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { useValidators } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';
import type { Validator } from '@/types';

import type { VotesProps, PollVote } from './EVMPoll.types';
import * as styles from './EVMPoll.styles';
import { VoteRow } from './VoteRow.component';

export function Votes({ data }: VotesProps) {
  const [votes, setVotes] = useState<PollVote[] | null>(null);
  const validators = useValidators();

  useEffect(() => {
    if (!data?.votes) return;

    const mappedVotes: PollVote[] = data.votes.map(d => ({
      ...d,
      validatorData: (toArray(validators) as Validator[]).find(v =>
        equalsIgnoreCase(v.broadcaster_address, d.voter)
      ),
    }));

    const unsubmitted: PollVote[] = (toArray(data.participants) as string[])
      .filter(
        p =>
          !find(
            p,
            mappedVotes.map(v => v.validatorData?.operator_address).filter(Boolean) as string[]
          )
      )
      .map(p => {
        const validatorData = (toArray(validators) as Validator[]).find(v =>
          equalsIgnoreCase(v.operator_address, p)
        );

        return {
          voter: validatorData?.broadcaster_address || p,
          validatorData,
        };
      });

    setVotes(
      _.concat(
        _.orderBy(
          mappedVotes.map(d => ({ ...d, confirmedFlag: d.confirmed ? 1 : 0 })),
          ['confirmedFlag'],
          ['desc']
        ),
        unsubmitted
      )
    );
  }, [data, setVotes, validators]);

  const { initiated_txhash, confirmation_txhash } = { ...data };

  const totalVotingPower = _.sumBy(
    (toArray(validators) as Validator[]).filter(
      d => !d.jailed && d.status === 'BOND_STATUS_BONDED'
    ),
    'quadratic_voting_power'
  );

  if (!votes) return null;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.theadRow}>
            <th scope="col" className={styles.thFirst}>
              #
            </th>
            <th scope="col" className={styles.thMiddle}>
              Voter
            </th>
            <th scope="col" className={styles.thMiddleRight}>
              Voting Power
            </th>
            <th scope="col" className={styles.thMiddle}>
              Tx Hash
            </th>
            <th scope="col" className={styles.thMiddle}>
              Height
            </th>
            <th scope="col" className={styles.thRight}>
              Vote
            </th>
            <th scope="col" className={styles.thLast}>
              Time
            </th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {votes.map((d: PollVote, i: number) => (
            <VoteRow
              key={i}
              vote={d}
              index={i}
              totalVotingPower={totalVotingPower}
              initiatedTxhash={initiated_txhash}
              confirmationTxhash={confirmation_txhash}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
