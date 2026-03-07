import clsx from 'clsx';
import { MdOutlineTimer } from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';

import { Tag } from '@/components/Tag';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeSpent } from '@/components/Time';

import type { TransferStatusCellProps } from './Transfers.types';
import * as styles from './Transfers.styles';

function getStatusTagStyle(simplifiedStatus: string): string {
  if (['received'].includes(simplifiedStatus)) return styles.statusTagReceived;
  if (['approved'].includes(simplifiedStatus)) return styles.statusTagApproved;
  if (['failed'].includes(simplifiedStatus)) return styles.statusTagFailed;
  return styles.statusTagDefault;
}

export function StatusCell({ d }: TransferStatusCellProps) {
  const showTimeSpent =
    (d.time_spent?.total ?? 0) > 0 &&
    d.simplified_status &&
    ['received'].includes(d.simplified_status);

  return (
    <div className={styles.statusCol}>
      {d.simplified_status && (
        <div className={styles.statusRow}>
          <Tag
            className={clsx(
              styles.tagFitCapitalize,
              getStatusTagStyle(d.simplified_status),
            )}
          >
            {d.simplified_status}
          </Tag>
          {['received'].includes(d.simplified_status) && (
            <ExplorerLink
              value={
                d.unwrap?.tx_hash_unwrap ||
                d.command?.transactionHash ||
                d.axelar_transfer?.txhash ||
                d.ibc_send?.recv_txhash
              }
              chain={
                d.send.destination_chain ||
                d.link?.destination_chain
              }
            />
          )}
        </div>
      )}
      {d.send.insufficient_fee && (
        <div className={styles.insufficientFeeRow}>
          <PiWarningCircle size={16} />
          <span className={styles.insufficientFeeText}>Insufficient Fee</span>
        </div>
      )}
      {showTimeSpent && (
        <div className={styles.timeSpentRow}>
          <MdOutlineTimer size={16} />
          <TimeSpent
            fromTimestamp={0}
            toTimestamp={d.time_spent!.total! * 1000}
            className={styles.timeSpentText}
          />
        </div>
      )}
    </div>
  );
}
