import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { Tooltip } from '@/components/Tooltip';
import type { SortHeaderProps } from './Validators.types';
import * as styles from './Validators.styles';

export function SortHeader({ label, sortKey, order, onSort, className }: SortHeaderProps) {
  return (
    <th
      scope="col"
      onClick={() => onSort(sortKey)}
      className={className ?? styles.thDefault}
    >
      <div className={styles.thSortFlex}>
        <span>{label}</span>
        {order[0] === sortKey && (
          <Tooltip
            content={`${label}: ${order[1]}`}
            className={styles.tooltipWhitespace}
          >
            <div className={styles.thSortIcon}>
              {order[1] === 'asc' ? (
                <RxCaretUp size={16} />
              ) : (
                <RxCaretDown size={16} />
              )}
            </div>
          </Tooltip>
        )}
      </div>
    </th>
  );
}
