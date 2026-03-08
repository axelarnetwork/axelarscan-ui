'use client';

import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';

import { useValidators } from '@/hooks/useGlobalData';
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

    const validatorList = (validators ?? []) as Validator[];

    const mappedVotes: PollVote[] = data.votes.map(d => ({
      ...d,
      validatorData: validatorList.find(v =>
        equalsIgnoreCase(v.broadcaster_address, d.voter)
      ),
    }));

    const participants = (data.participants ?? []) as string[];
    const mappedOperators = mappedVotes
      .map(v => v.validatorData?.operator_address)
      .filter(Boolean) as string[];

    const unsubmitted: PollVote[] = participants
      .filter(p => !find(p, mappedOperators))
      .map(p => {
        const validatorData = validatorList.find(v =>
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

  const initiated_txhash = data?.initiated_txhash;
  const confirmation_txhash = data?.confirmation_txhash;

  const totalVotingPower = useMemo(
    () =>
      _.sumBy(
        ((validators ?? []) as Validator[]).filter(
          d => !d.jailed && d.status === 'BOND_STATUS_BONDED'
        ),
        'quadratic_voting_power'
      ),
    [validators]
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
