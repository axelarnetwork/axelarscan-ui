import Link from 'next/link';
import clsx from 'clsx';
import _ from 'lodash';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { getChainData } from '@/lib/config';
import { toCase, toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';

import type { ChainExplorer } from '@/types';
import type { BatchCommand, BatchRowProps } from './EVMBatches.types';
import { CommandItem } from './CommandItem.component';
import * as styles from './EVMBatches.styles';

const NUM_COMMANDS_TRUNCATE = 10;

export function BatchRow({ batch: d, chains, assets }: BatchRowProps) {
  const { url, transaction_path } = { ...getChainData(d.chain, chains)?.explorer } as Partial<ChainExplorer>;

  const executed = toArray(d.commands).length === toArray(d.commands).filter((c: BatchCommand) => c.executed).length;
  const status = executed
    ? 'executed'
    : toCase(d.status?.replace('BATCHED_COMMANDS_STATUS_', ''), 'lower');

  return (
    <tr key={d.batch_id} className={styles.tr}>
      <td className={styles.tdFirst}>
        <div className={styles.batchIdWrapper}>
          <Copy value={d.batch_id}>
            <Link href={`/evm-batch/${d.chain}/${d.batch_id}`} target="_blank" className={styles.batchLink}>
              {ellipse(d.batch_id)}
            </Link>
          </Copy>
          <Copy value={d.key_id}>
            <span>{d.key_id}</span>
          </Copy>
        </div>
      </td>
      <td className={styles.tdMiddle}>
        <ChainProfile value={d.chain} />
      </td>
      <td className={styles.tdMiddle}>
        <div className={styles.commandsWrapper}>
          {_.slice(toArray(d.commands), 0, NUM_COMMANDS_TRUNCATE).map((c: BatchCommand, i: number) => (
            <CommandItem key={i} command={c} batch={d} chains={chains} assets={assets} explorerUrl={url} transactionPath={transaction_path} />
          ))}
          {toArray(d.commands).length > NUM_COMMANDS_TRUNCATE && (
            <Link href={`/evm-batch/${d.chain}/${d.batch_id}`} target="_blank" className={styles.moreCommandsLink}>
              <Number value={toArray(d.commands).length - NUM_COMMANDS_TRUNCATE} prefix={'and '} suffix={' more'} />
            </Link>
          )}
        </div>
      </td>
      <td className={styles.tdRight}>
        <div className={styles.statusWrapper}>
          {status && (
            <Tag
              className={clsx(
                styles.statusTagBase,
                ['executed'].includes(status)
                  ? styles.statusTagExecuted
                  : ['signed'].includes(status)
                    ? styles.statusTagSigned
                    : ['signing'].includes(status)
                      ? styles.statusTagSigning
                      : styles.statusTagAborted
              )}
            >
              {status}
            </Tag>
          )}
        </div>
      </td>
      <td className={styles.tdLast}>
        <TimeAgo timestamp={d.created_at?.ms} />
      </td>
    </tr>
  );
}
