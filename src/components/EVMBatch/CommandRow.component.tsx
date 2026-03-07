import clsx from 'clsx';
import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Tooltip } from '@/components/Tooltip';
import { ellipse } from '@/lib/string';

import type { CommandRowProps } from './EVMBatch.types';
import { CommandParams } from './CommandParams.component';
import * as styles from './EVMBatch.styles';

export function CommandRow({
  command,
  chain,
  url,
  transaction_path,
  chains,
  assets,
}: CommandRowProps) {
  const idElement = (
    <span className={styles.commandIdText}>
      {ellipse(command.id, 6)}
    </span>
  );

  const typeElement = (
    <div className={styles.commandTypeWrapper}>
      <Tooltip content={command.executed ? 'Executed' : 'Unexecuted'}>
        <Tag
          className={clsx(
            command.executed
              ? styles.commandTagExecuted
              : styles.commandTagUnexecuted
          )}
        >
          {command.type}
        </Tag>
      </Tooltip>
    </div>
  );

  const txUrl = url && command.transactionHash
    ? `${url}${transaction_path?.replace('{tx}', command.transactionHash)}`
    : null;

  return (
    <tr className={styles.tableRow}>
      <td className={styles.tdFirst}>
        {txUrl ? (
          <Copy size={16} value={command.id}>
            <Link href={txUrl} target="_blank" className={styles.linkBlue}>
              {idElement}
            </Link>
          </Copy>
        ) : (
          <Copy size={16} value={command.id}>
            {idElement}
          </Copy>
        )}
      </td>
      <td className={styles.tdMiddle}>
        {txUrl ? (
          <Link href={txUrl} target="_blank">
            {typeElement}
          </Link>
        ) : (
          typeElement
        )}
      </td>
      <td className={styles.tdLast}>
        <CommandParams
          command={command}
          chain={chain}
          url={url}
          transaction_path={transaction_path}
          chains={chains}
          assets={assets}
        />
      </td>
    </tr>
  );
}
