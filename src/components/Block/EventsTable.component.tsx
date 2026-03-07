'use client';

import { Number } from '@/components/Number';
import { lastString, toTitle } from '@/lib/string';
import type { EventRowProps } from './Block.types';
import { EventDataItems } from './EventDataItems.component';
import * as styles from './Block.styles';

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
