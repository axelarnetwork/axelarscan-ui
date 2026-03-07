'use client';

import _ from 'lodash';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { JSONView } from '@/components/JSONView';
import { Number } from '@/components/Number';
import { lastString, toTitle } from '@/lib/string';
import type { EventDataItemsProps, EventRowProps } from './Block.types';
import * as styles from './Block.styles';

const COLLAPSE_SIZE = 3;

function EventDataItems({
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

export function EventRow({
  event,
  seeMoreTypes,
  onToggleSeeMore,
}: EventRowProps) {
  return (
    <tr className={styles.eventRow}>
      <td className={styles.eventTypeCell}>
        <div className={styles.eventTypeInner}>
          <span className="whitespace-nowrap">
            {toTitle(lastString(event.type, '.'))}
          </span>
          {event.data.length > 1 && (
            <Number
              value={event.data.length}
              format="0,0"
              prefix="["
              suffix="]"
              className="text-xs font-medium"
            />
          )}
        </div>
      </td>
      <td className={styles.eventDataCell}>
        <EventDataItems
          items={event.data}
          type={event.type}
          seeMoreTypes={seeMoreTypes}
          onToggleSeeMore={onToggleSeeMore}
        />
      </td>
    </tr>
  );
}
