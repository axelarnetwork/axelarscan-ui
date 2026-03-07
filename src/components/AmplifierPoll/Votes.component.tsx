'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { useVerifiers } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';
import type { VotesProps, PollVote, VerifierEntry } from './AmplifierPoll.types';
import * as styles from './AmplifierPoll.styles';
import { VoteRow } from './VoteRow.component';

export function Votes({ data }: VotesProps) {
  const [votes, setVotes] = useState<PollVote[] | null>(null);
  const verifiers = useVerifiers();

  useEffect(() => {
    if (!data?.votes) return;

    const mappedVotes: PollVote[] = data.votes.map(d => ({
      ...d,
      verifierData: (toArray(verifiers) as VerifierEntry[]).find(v =>
        equalsIgnoreCase(v.address, d.voter)
      ) || { address: d.voter },
    }));

    const unsubmitted: PollVote[] = (toArray(data.participants) as string[])
      .filter(
        p =>
          !find(
            p,
            mappedVotes.map(v => v.verifierData?.address).filter(Boolean) as string[]
          )
      )
      .map(p => {
        const verifierData = (toArray(verifiers) as VerifierEntry[]).find(v =>
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

  const { confirmation_txhash } = { ...data };

  return (
    <div className={styles.votesWrapper}>
      <table className={styles.votesTable}>
        <thead className={styles.votesThead}>
          <tr className={styles.votesTheadRow}>
            <th scope="col" className={styles.votesThFirst}>#</th>
            <th scope="col" className={styles.votesTh}>Voter</th>
            <th scope="col" className={styles.votesThWrap}>Tx Hash</th>
            <th scope="col" className={styles.votesTh}>Height</th>
            <th scope="col" className={styles.votesThRight}>Vote</th>
            <th scope="col" className={styles.votesThLast}>Time</th>
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
