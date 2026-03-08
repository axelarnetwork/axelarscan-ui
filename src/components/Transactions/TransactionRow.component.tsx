import { memo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { includesSomePatterns, ellipse } from '@/lib/string';
import { formatUnits } from '@/lib/number';

import type { TransactionRowProps } from './Transactions.types';
import type { Chain } from '@/types';
import * as styles from './Transactions.styles';

export const TransactionRow = memo(function TransactionRow({
  data: d,
  height,
  address,
  chains,
}: TransactionRowProps) {
  return (
    <tr className={styles.tableRow}>
      <td className={styles.tdFirst}>
        <div className={styles.cellFlexCol}>
          <Copy value={d.txhash}>
            <Link
              href={`/tx/${d.txhash}`}
              target="_blank"
              className={styles.txHashLink}
            >
              {ellipse(d.txhash, 6)}
            </Link>
          </Copy>
        </div>
      </td>
      {!height && (
        <td className={styles.tdDefault}>
          {d.height && (
            <Link
              href={`/block/${d.height}`}
              target="_blank"
              className={styles.heightLink}
            >
              <Number value={d.height} />
            </Link>
          )}
        </td>
      )}
      <td className={styles.tdDefault}>
        {d.type && <Tag className={styles.typeTag}>{d.type}</Tag>}
      </td>
      <td className={styles.tdDefault}>
        <Tag
          className={clsx(
            styles.statusTagBase,
            d.code ? styles.statusFailed : styles.statusSuccess
          )}
        >
          {d.code ? 'Failed' : 'Success'}
        </Tag>
      </td>
      <td className={styles.tdDefault}>
        <Profile address={d.sender} />
      </td>
      {!!address && (
        <td className={styles.tdDefault}>
          {!includesSomePatterns(d.type ?? '', [
            'HeartBeat',
            'SubmitSignature',
            'SubmitPubKey',
          ]) && (
            <div className={styles.cellFlexCol}>
              {toArray<string>(d.recipient).map((a: string, j: number) => (
                <Profile key={j} address={a} />
              ))}
            </div>
          )}
        </td>
      )}
      {!(height || address) && (
        <td className={styles.tdRight}>
          {d.tx?.auth_info?.fee?.amount && (
            <Number
              value={formatUnits(
                String(d.tx?.auth_info?.fee?.amount?.[0]?.amount ?? '0'),
                6
              )}
              format="0,0.00000000"
              suffix={` ${(getChainData('axelarnet', chains) as (Chain & { native_token?: { symbol?: string } }) | undefined)?.native_token?.symbol}`}
              noTooltip={true}
              className={styles.feeNumber}
            />
          )}
        </td>
      )}
      <td className={styles.tdLast}>
        <TimeAgo timestamp={d.timestamp} />
      </td>
    </tr>
  );
});
