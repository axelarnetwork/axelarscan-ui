'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { IoCheckmarkCircle, IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { useValidators } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find, ellipse, toTitle } from '@/lib/string';
import type { Validator } from '@/types';

import type { VotesProps, PollVote } from './EVMPoll.types';
import * as styles from './EVMPoll.styles';

function resolveVoteLabel(vote: boolean | undefined): string {
  if (vote === true) return 'yes';
  if (vote === false) return 'no';
  return 'unsubmitted';
}

function getVoteOptionStyle(vote: string): string {
  switch (vote) {
    case 'no':
      return styles.voteOptionNo;
    case 'yes':
      return styles.voteOptionYes;
    default:
      return styles.voteOptionUnsubmitted;
  }
}

interface VoteRowProps {
  vote: PollVote;
  index: number;
  totalVotingPower: number;
  initiatedTxhash: string | undefined;
  confirmationTxhash: string | undefined;
}

function VoteRow({
  vote: d,
  index: i,
  totalVotingPower,
  initiatedTxhash,
  confirmationTxhash,
}: VoteRowProps) {
  const voteLabel = resolveVoteLabel(d.vote);

  return (
    <tr className={styles.tr}>
      <td className={styles.tdFirst}>{i + 1}</td>
      <td className={styles.tdMiddle}>
        {d.validatorData ? (
          <Profile
            i={i}
            address={d.validatorData.operator_address}
            prefix="axelarvaloper"
          />
        ) : (
          <Copy value={d.voter}>
            <Link
              href={`/account/${d.voter}`}
              target="_blank"
              className={styles.voterLink}
            >
              {ellipse(d.voter, 10, 'axelar')}
            </Link>
          </Copy>
        )}
      </td>
      <td className={styles.tdMiddleRight}>
        {d.validatorData && (
          <div className={styles.votingPowerWrapper}>
            <Number
              value={d.validatorData.quadratic_voting_power}
              format="0,0.00a"
              noTooltip={true}
              className={styles.votingPowerValue}
            />
            {(d.validatorData.quadratic_voting_power ?? 0) > 0 &&
              totalVotingPower > 0 && (
                <Number
                  value={
                    (d.validatorData.quadratic_voting_power! * 100) /
                    totalVotingPower
                  }
                  format="0,0.000000"
                  suffix="%"
                  noTooltip={true}
                  className={styles.votingPowerPercent}
                />
              )}
          </div>
        )}
      </td>
      <td className={styles.tdMiddle}>
        {d.id && (
          <div className={styles.txHashWrapper}>
            <Copy value={d.id}>
              <Link
                href={`/tx/${d.id}`}
                target="_blank"
                className={styles.txHashLink}
              >
                {ellipse(d.id, 6)}
              </Link>
            </Copy>
            {equalsIgnoreCase(d.id, initiatedTxhash) && (
              <Link
                href={`/tx/${initiatedTxhash}`}
                target="_blank"
                className={styles.statusRow}
              >
                <IoCheckmarkCircle
                  size={18}
                  className={styles.initiatedIcon}
                />
                <span className={styles.statusLabel}>Initiated</span>
              </Link>
            )}
            {equalsIgnoreCase(d.id, confirmationTxhash) && (
              <Link
                href={`/tx/${confirmationTxhash}`}
                target="_blank"
                className={styles.statusRow}
              >
                <IoCheckmarkDoneCircle
                  size={18}
                  className={styles.confirmationIcon}
                />
                <span className={styles.statusLabel}>Confirmation</span>
              </Link>
            )}
          </div>
        )}
      </td>
      <td className={styles.tdMiddle}>
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
      <td className={styles.tdMiddleRight}>
        <div className={styles.voteWrapper}>
          <Tag
            className={clsx(styles.statusTagBase, getVoteOptionStyle(voteLabel))}
          >
            {toTitle(voteLabel)}
          </Tag>
        </div>
      </td>
      <td className={styles.tdLast}>
        <TimeAgo timestamp={d.created_at} />
      </td>
    </tr>
  );
}

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
