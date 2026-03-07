import clsx from 'clsx';
import {
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineArrowRightEndOnRectangle,
} from 'react-icons/hi2';
import {
  MdOutlineTimer,
} from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';
import { RiTimerFlashLine } from 'react-icons/ri';

import { Tag } from '@/components/Tag';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeSpent } from '@/components/Time';
import { isAxelar } from '@/lib/chain';
import { timeDiff } from '@/lib/time';

import type { StatusCellProps } from './GMPs.types';
import * as styles from './GMPs.styles';
import { getStatusLabel } from './GMPs.utils';

export function StatusCell({ data: d }: StatusCellProps) {
  const receivedTransactionHash =
    d.express_executed?.transactionHash ||
    d.executed?.transactionHash;
  const destChain = d.call.returnValues?.destinationChain;

  return (
    <td className={styles.tdDefault}>
      <div className={styles.statusCellWrapper}>
        {d.simplified_status && (
          <div className={styles.statusRow}>
            <Tag
              className={clsx(
                styles.statusTagBase,
                styles.getStatusTagClass(d.simplified_status)
              )}
            >
              {getStatusLabel(d)}
            </Tag>
            {d.simplified_status === 'received' && (
              <ExplorerLink
                value={receivedTransactionHash}
                chain={destChain}
              />
            )}
          </div>
        )}
        {d.is_insufficient_fee &&
          ((!isAxelar(d.call.chain) && !isAxelar(destChain)) ||
            timeDiff(d.call.created_at?.ms) > 300) && (
            <div className={styles.insufficientFeeWrapper}>
              <PiWarningCircle size={16} />
              <span className={styles.statusSmallText}>
                Insufficient Fee
              </span>
            </div>
          )}
        {d.is_invalid_gas_paid && (
          <div className={styles.invalidGasPaidWrapper}>
            <PiWarningCircle size={16} />
            <span className={styles.statusSmallText}>Invalid Gas Paid</span>
          </div>
        )}
        {(d.time_spent?.call_express_executed ?? 0) > 0 &&
          ['express_executed', 'executed'].includes(d.status ?? '') && (
            <div className={styles.expressExecutedWrapper}>
              <RiTimerFlashLine size={16} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={(d.time_spent?.call_express_executed ?? 0) * 1000}
                className={styles.statusSmallText}
              />
            </div>
          )}
        {(d.time_spent?.total ?? 0) > 0 && d.status === 'executed' && (
          <div className={styles.totalTimeWrapper}>
            <MdOutlineTimer size={16} />
            <TimeSpent
              fromTimestamp={0}
              toTimestamp={(d.time_spent?.total ?? 0) * 1000}
              className={styles.statusSmallText}
            />
          </div>
        )}
        {isAxelar(destChain) && (
          <div className={styles.hopIndicator}>
            <HiOutlineArrowRightEndOnRectangle size={16} />
            <span className={styles.statusSmallText}>1st hop</span>
          </div>
        )}
        {isAxelar(d.call.chain) && (
          <div className={styles.hopIndicator}>
            <HiOutlineArrowRightStartOnRectangle size={16} />
            <span className={styles.statusSmallText}>2nd hop</span>
          </div>
        )}
      </div>
    </td>
  );
}
