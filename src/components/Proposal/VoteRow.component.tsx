import Link from 'next/link';
import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { ellipse, toTitle } from '@/lib/string';

import type { VoteRowProps } from './Proposal.types';
import * as styles from './Proposal.styles';

export function VoteRow({ entry, index, totalVotingPower }: VoteRowProps) {
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
