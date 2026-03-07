import Link from 'next/link';
import clsx from 'clsx';
import { IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { equalsIgnoreCase, ellipse, toTitle } from '@/lib/string';
import type { VoteRowProps } from './AmplifierPoll.types';
import { getVoteLabel, getVoteOptionStyle } from './AmplifierPoll.types';
import * as styles from './AmplifierPoll.styles';

export function VoteRow({
  vote: d,
  index: i,
  confirmationTxhash,
}: VoteRowProps) {
  const vote = getVoteLabel(d.vote);

  return (
    <tr className={styles.votesRow}>
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
            {equalsIgnoreCase(d.id, confirmationTxhash) && (
              <Link
                href={`/tx/${confirmationTxhash}`}
                target="_blank"
                className={styles.confirmationLink}
              >
                <IoCheckmarkDoneCircle
                  size={18}
                  className={styles.confirmationIcon}
                />
                <span className={styles.confirmationText}>Confirmation</span>
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
              getVoteOptionStyle(vote, styles)
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
}
