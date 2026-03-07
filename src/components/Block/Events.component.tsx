'use client';

import { useState } from 'react';
import _ from 'lodash';

import { Tag } from '@/components/Tag';
import { toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import type { BlockEventsProps, BlockData, BlockEvent } from './Block.types';
import { EventRow } from './EventsTable.component';
import * as styles from './Block.styles';

const BLOCK_EVENT_FIELDS = ['begin_block_events', 'end_block_events'] as const;

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
                  <th scope="col" className={styles.eventThLeft}>
                    Type
                  </th>
                  <th scope="col" className={styles.eventThRight}>
                    Data
                  </th>
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
