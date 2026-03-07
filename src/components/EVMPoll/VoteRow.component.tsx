import Link from 'next/link';
import clsx from 'clsx';
import { IoCheckmarkCircle, IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { equalsIgnoreCase, ellipse, toTitle } from '@/lib/string';

import type { VoteRowProps } from './EVMPoll.types';
import * as styles from './EVMPoll.styles';
import { resolveVoteLabel } from './EVMPoll.utils';

export function VoteRow({
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
                <IoCheckmarkCircle size={18} className={styles.initiatedIcon} />
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
            className={clsx(
              styles.statusTagBase,
              styles.getVoteStyle(voteLabel)
            )}
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
