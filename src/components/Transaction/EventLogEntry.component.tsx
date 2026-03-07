import _ from 'lodash';

import { Tag } from '@/components/Tag';
import { toArray, toHex } from '@/lib/parser';
import { isString, toTitle } from '@/lib/string';
import type { EventLogAttribute, EventLogEvent, EventLogEntryProps } from './Transaction.types';
import { renderEntries } from './Transaction.utils';
import * as styles from './Transaction.styles';

export function EventLogEntry({ entry: d, index: i }: EventLogEntryProps) {
  return (
    <div key={i} className={styles.activityItem}>
      {d.log && (
        <span className={styles.eventLogText}>{d.log}</span>
      )}
      {_.reverse(_.cloneDeep(toArray(d.events) as EventLogEvent[]))
        .map((e: EventLogEvent) => ({
          type: e.type,
          attributes: toArray(e.attributes).map(
            (a: EventLogAttribute): [string, unknown] => [a.key, a.value]
          ),
        }))
        .map((e: { type?: string; attributes: [string, unknown][] }, j: number) => (
          <div key={j} className={styles.eventCard}>
            {e.type && (
              <Tag className={styles.eventTag}>
                {toTitle(e.type, '_', true, true)}
              </Tag>
            )}
            {renderEntries(
              e.attributes
                .filter(
                  ([_k, v]: [string, unknown]) =>
                    typeof v !== 'undefined'
                )
                .map(([k, v]: [string, unknown]) => {
                  let processed = v;
                  // byteArray to hex
                  if (
                    (Array.isArray(processed) ||
                      (isString(processed) &&
                        (processed as string).startsWith('[') &&
                        (processed as string).endsWith(']'))) &&
                    [
                      'gateway_address',
                      'deposit_address',
                      'token_address',
                      'tx_id',
                    ].includes(k)
                  ) {
                    processed = toHex(
                      JSON.parse(processed as string)
                    );
                  }

                  return [k, processed] as [string, unknown];
                })
            )}
          </div>
        ))}
    </div>
  );
}
