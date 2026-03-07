'use client';

import { useState } from 'react';
import _ from 'lodash';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { JSONView } from '@/components/JSONView';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { toArray } from '@/lib/parser';
import { lastString, toTitle } from '@/lib/string';
import type { BlockEventsProps, BlockData, BlockEvent } from './Block.types';
import * as styles from './Block.styles';

const BLOCK_EVENT_FIELDS = ['begin_block_events', 'end_block_events'] as const;
const COLLAPSE_SIZE = 3;

function EventDataItems({
  items,
  type,
  seeMoreTypes,
  onToggleSeeMore,
}: {
  items: Record<string, unknown>[];
  type: string;
  seeMoreTypes: string[];
  onToggleSeeMore: (type: string) => void;
}) {
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

function EventRow({
  event,
  seeMoreTypes,
  onToggleSeeMore,
}: {
  event: BlockEvent;
  seeMoreTypes: string[];
  onToggleSeeMore: (type: string) => void;
}) {
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

export function BlockEvents({ data }: BlockEventsProps) {
  const [seeMoreTypes, setSeeMoreTypes] = useState<string[]>([]);

  const handleToggleSeeMore = (type: string) => {
    setSeeMoreTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : _.uniq(_.concat(prev, type))
    );
  };

  const activeEventFields = BLOCK_EVENT_FIELDS.filter(
    f => toArray(data[f as keyof BlockData]).length > 0
  );

  if (activeEventFields.length === 0) {
    return null;
  }

  return (
    <div className={styles.eventsGrid}>
      {activeEventFields.map((f, i) => (
        <div key={i} className={styles.eventColumn}>
          <Tag className="w-fit capitalize">{toTitle(f)}</Tag>
          <div className={styles.eventTableWrapper}>
            <table className={styles.eventTable}>
              <thead className={styles.eventThead}>
                <tr className={styles.eventTheadRow}>
                  <th scope="col" className={styles.eventThLeft}>Type</th>
                  <th scope="col" className={styles.eventThRight}>Data</th>
                </tr>
              </thead>
              <tbody className={styles.eventTbody}>
                {(data[f as keyof BlockData] as BlockEvent[])
                  .filter(d => d.data)
                  .map((d, j) => (
                    <EventRow
                      key={j}
                      event={d}
                      seeMoreTypes={seeMoreTypes}
                      onToggleSeeMore={handleToggleSeeMore}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
