import { memo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink, buildExplorerURL } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { getChainData } from '@/lib/config';
import { ellipse, toTitle } from '@/lib/string';
import type { PollVoteOption, PollRowProps } from './AmplifierPolls.types';
import * as styles from './AmplifierPolls.styles';

export const PollRow = memo(function PollRow({ poll, chains }: PollRowProps) {
  const explorer = {
    ...getChainData(poll.sender_chain, chains)?.explorer,
  };
  const txHref = buildExplorerURL({
    value: poll.transaction_id,
    type: 'tx',
    useContractLink: false,
    hasEventLog: false,
    explorer,
  });

  return (
    <tr className={styles.tr}>
      <td className={styles.tdFirst}>
        <div className={styles.cellColumn}>
          <Copy value={poll.poll_id}>
            <Link
              href={`/amplifier-poll/${poll.id}`}
              target="_blank"
              className={styles.pollLink}
            >
              {poll.poll_id}
            </Link>
          </Copy>
          {poll.transaction_id && (
            <div className={styles.txRow}>
              <Copy value={poll.transaction_id}>
                <Link href={txHref} target="_blank" className={styles.pollLink}>
                  {ellipse(poll.transaction_id)}
                </Link>
              </Copy>
              <ExplorerLink
                value={poll.transaction_id}
                chain={poll.sender_chain}
              />
            </div>
          )}
        </div>
      </td>
      <td className={styles.tdMiddle}>
        <div className={styles.cellColumn}>
          <ChainProfile value={poll.sender_chain} />
          {poll.contract_address && (
            <div className="flex items-center">
              <Tooltip
                content="Verifier Contract"
                className={styles.verifierTooltip}
              >
                <Copy value={poll.contract_address}>
                  {ellipse(poll.contract_address)}
                </Copy>
              </Tooltip>
            </div>
          )}
        </div>
      </td>
      <td className={styles.tdMiddle}>
        {poll.height && (
          <Link
            href={`/block/${poll.height}`}
            target="_blank"
            className={styles.blockLink}
          >
            <Number value={poll.height} />
          </Link>
        )}
      </td>
      <td className={styles.tdMiddle}>
        <div className={styles.statusColumn}>
          {poll.status && (
            <Tag
              className={clsx(
                styles.statusTagBase,
                styles.getStatusStyle(poll.status)
              )}
            >
              {poll.status}
            </Tag>
          )}
        </div>
      </td>
      <td className={styles.tdMiddle}>
        <Link
          href={`/amplifier-poll/${poll.id}`}
          target="_blank"
          className={styles.participationLink}
        >
          {poll.voteOptions?.map((v: PollVoteOption, i: number) => (
            <Number
              key={i}
              value={v.value}
              format="0,0"
              suffix={` ${toTitle(v.option.substring(0, v.option === 'unsubmitted' ? 2 : 1))}`}
              noTooltip={true}
              className={clsx(
                styles.voteOptionBase,
                styles.getVoteOptionStyle(v.option)
              )}
            />
          ))}
        </Link>
      </td>
      <td className={styles.tdLast}>
        <TimeAgo timestamp={poll.created_at?.ms} />
      </td>
    </tr>
  );
});
