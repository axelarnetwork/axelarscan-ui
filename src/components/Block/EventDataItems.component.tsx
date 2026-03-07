import _ from 'lodash';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { JSONView } from '@/components/JSONView';
import type { EventDataItemsProps } from './Block.types';
import * as styles from './Block.styles';

const COLLAPSE_SIZE = 3;

export function EventDataItems({
  items,
  type,
  seeMoreTypes,
  onToggleSeeMore,
}: EventDataItemsProps) {
  const isExpanded = seeMoreTypes.includes(type);
  const visibleItems = _.slice(items, 0, isExpanded ? items.length : COLLAPSE_SIZE);
  const showToggle = items.length > COLLAPSE_SIZE || isExpanded;

  return (
    <div className={styles.eventDataInner}>
      {visibleItems.map((item, k) => (
        <JSONView
          key={k}
          value={item}
          tab={2}
          useJSONView={false}
          className="text-xs"
        />
      ))}
      {showToggle && (
        <button
          onClick={() => onToggleSeeMore(type)}
          className={styles.seeMoreButton}
        >
          <span>See {isExpanded ? 'Less' : 'More'}</span>
          {!isExpanded && <span>({items.length - COLLAPSE_SIZE})</span>}
          {isExpanded ? <RxCaretUp size={14} /> : <RxCaretDown size={14} />}
        </button>
      )}
    </div>
  );
}
