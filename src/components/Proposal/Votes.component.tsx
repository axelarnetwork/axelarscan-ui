'use client';

import Link from 'next/link';
import clsx from 'clsx';
import _ from 'lodash';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { useValidators } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { ellipse, toTitle } from '@/lib/string';

import type { VoteEntry } from './Proposal.types';
import * as styles from './Proposal.styles';

function VoteRow({ entry, index, totalVotingPower }: { entry: VoteEntry; index: number; totalVotingPower: number }) {
  return (
    <tr className={styles.votesRow}>
      <td className={styles.votesTdFirst}>{index + 1}</td>
      <td className={styles.votesTd}>
        <Copy value={entry.voter}>
          <Link
            href={`/account/${entry.voter}`}
            target="_blank"
            className={styles.voterLink}
          >
            {ellipse(entry.voter, 10, 'axelar')}
          </Link>
        </Copy>
      </td>
      <td className={styles.votesTd}>
        {entry.validatorData && (
          <Profile
            i={index}
            address={entry.validatorData.operator_address}
            prefix="axelarvaloper"
          />
        )}
      </td>
      <td className={styles.votesTdRight}>
        {(entry.voting_power ?? 0) > 0 && (
          <div className={styles.votePowerWrapper}>
            <Number
              value={entry.voting_power}
              format="0,0.00a"
              noTooltip={true}
              className={styles.votePowerValue}
            />
            {totalVotingPower > 0 && (
              <Number
                value={(entry.voting_power! * 100) / totalVotingPower}
                format="0,0.000000"
                suffix="%"
                noTooltip={true}
                className={styles.votePowerPercent}
              />
            )}
          </div>
        )}
      </td>
      <td className={styles.votesTdLast}>
        {entry.option && (
          <div className={styles.voteOptionWrapper}>
            <Tag
              className={clsx(
                'w-fit capitalize',
                ['NO'].includes(entry.option)
                  ? 'bg-red-600 dark:bg-red-500'
                  : ['YES'].includes(entry.option)
                    ? 'bg-green-600 dark:bg-green-500'
                    : ''
              )}
            >
              {toTitle(entry.option)}
            </Tag>
          </div>
        )}
      </td>
    </tr>
  );
}

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
