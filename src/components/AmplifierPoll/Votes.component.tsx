'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { useVerifiers } from '@/hooks/useGlobalData';
import { equalsIgnoreCase, find } from '@/lib/string';
import type {
  VotesProps,
  PollVote,
  VerifierEntry,
} from './AmplifierPoll.types';
import * as styles from './AmplifierPoll.styles';
import { VoteRow } from './VoteRow.component';

export function Votes({ data }: VotesProps) {
  const [votes, setVotes] = useState<PollVote[] | null>(null);
  const verifiers = useVerifiers();

  useEffect(() => {
    if (!data?.votes) return;

    const verifierList = (verifiers ?? []) as VerifierEntry[];

    const mappedVotes: PollVote[] = data.votes.map(d => ({
      ...d,
      verifierData: verifierList.find(v =>
        equalsIgnoreCase(v.address, d.voter)
      ) || { address: d.voter },
    }));

    const participants = (data.participants ?? []) as string[];
    const mappedAddresses = mappedVotes
      .map(v => v.verifierData?.address)
      .filter(Boolean) as string[];

    const unsubmitted: PollVote[] = participants
      .filter(p => !find(p, mappedAddresses))
      .map(p => {
        const verifierData = verifierList.find(v =>
          equalsIgnoreCase(v.address, p)
        );
        return {
          voter: verifierData?.address || p,
          verifierData,
        };
      });

    setVotes(_.concat(mappedVotes, unsubmitted));
  }, [data, verifiers]);

  if (!votes) return null;

  const confirmation_txhash = data?.confirmation_txhash;

  return (
    <div className={styles.votesWrapper}>
      <table className={styles.votesTable}>
        <thead className={styles.votesThead}>
          <tr className={styles.votesTheadRow}>
            <th scope="col" className={styles.votesThFirst}>
              #
            </th>
            <th scope="col" className={styles.votesTh}>
              Voter
            </th>
            <th scope="col" className={styles.votesThWrap}>
              Tx Hash
            </th>
            <th scope="col" className={styles.votesTh}>
              Height
            </th>
            <th scope="col" className={styles.votesThRight}>
              Vote
            </th>
            <th scope="col" className={styles.votesThLast}>
              Time
            </th>
          </tr>
        </thead>
        <tbody className={styles.votesTbody}>
          {votes.map((d: PollVote, i: number) => (
            <VoteRow
              key={i}
              vote={d}
              index={i}
              confirmationTxhash={confirmation_txhash}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
