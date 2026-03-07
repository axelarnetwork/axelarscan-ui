'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { useVerifiers } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find, ellipse, toTitle } from '@/lib/string';
import type { VotesProps, PollVote, VerifierEntry } from './AmplifierPoll.types';
import { getVoteLabel, getVoteOptionStyle } from './AmplifierPoll.types';
import * as styles from './AmplifierPoll.styles';

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
          {votes.map((d: PollVote, i: number) => {
            const vote = getVoteLabel(d.vote);

            return (
              <tr key={i} className={styles.votesRow}>
                <td className={styles.votesTdFirst}>{i + 1}</td>
                <td className={styles.votesTd}>
                  {d.verifierData ? (
                    <Profile i={i} address={d.verifierData.address} />
                  ) : (
                    <Copy value={d.voter}>
                      <Link
                        href={`/verifier/${d.voter}`}
                        target="_blank"
                        className={styles.voterLink}
                      >
                        {ellipse(d.voter, 10, '0x')}
                      </Link>
                    </Copy>
                  )}
                </td>
                <td className={styles.votesTd}>
                  {d.id && (
                    <div className={styles.txHashColumn}>
                      <Copy value={d.id}>
                        <Link
                          href={`/tx/${d.id}`}
                          target="_blank"
                          className={styles.voterLink}
                        >
                          {ellipse(d.id, 6)}
                        </Link>
                      </Copy>
                      {equalsIgnoreCase(d.id, confirmation_txhash) && (
                        <Link
                          href={`/tx/${confirmation_txhash}`}
                          target="_blank"
                          className={styles.confirmationLink}
                        >
                          <IoCheckmarkDoneCircle
                            size={18}
                            className={styles.confirmationIcon}
                          />
                          <span className={styles.confirmationText}>
                            Confirmation
                          </span>
                        </Link>
                      )}
                    </div>
                  )}
                </td>
                <td className={styles.votesTd}>
                  {d.height && (
                    <Link
                      href={`/block/${d.height}`}
                      target="_blank"
                      className={styles.blockLink}
                    >
                      <Number value={d.height} />
                    </Link>
                  )}
                </td>
                <td className={styles.votesTdRight}>
                  <div className={styles.voteTagWrapper}>
                    <Tag
                      className={clsx(
                        'w-fit capitalize',
                        getVoteOptionStyle(vote, styles),
                      )}
                    >
                      {toTitle(vote)}
                    </Tag>
                  </div>
                </td>
                <td className={styles.votesTdLast}>
                  <TimeAgo timestamp={d.created_at} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
