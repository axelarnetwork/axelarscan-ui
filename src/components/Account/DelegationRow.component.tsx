import clsx from 'clsx';
import { MdArrowForwardIos } from 'react-icons/md';

import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import type { DelegationRowProps } from './Account.types';
import * as styles from './Account.styles';

export function DelegationRow({ entry, index, tab }: DelegationRowProps) {
  const validatorAddress =
    tab === 'redelegations'
      ? entry.validator_src_address
      : entry.validator_address;

  return (
    <tr className={styles.tableRow}>
      <td className={styles.tdIndex}>{index + 1}</td>
      <td className={styles.tdDefault}>
        <div className={styles.delegationValidatorCell}>
          <Profile
            i={index}
            address={validatorAddress}
            width={16}
            height={16}
            className="text-xs"
          />
          {tab === 'redelegations' && (
            <>
              <MdArrowForwardIos
                size={12}
                className={styles.redelegationArrow}
              />
              <Profile
                i={index}
                address={entry.validator_dst_address}
                width={16}
                height={16}
                className="text-xs"
              />
            </>
          )}
        </div>
      </td>
      <td
        className={clsx(
          'text-right',
          tab === 'unstakings' ? 'px-3 py-4' : 'py-4 pl-3 pr-4 sm:pr-0'
        )}
      >
        <div className={styles.cellEndAligned}>
          <Number value={entry.amount} className={styles.balanceValue} />
        </div>
      </td>
      {tab === 'unstakings' && (
        <td className={styles.tdUnstakingsTime}>
          <TimeAgo timestamp={entry.completion_time} className="text-xs" />
        </td>
      )}
    </tr>
  );
}
