import _ from 'lodash';

import { Tag } from '@/components/Tag';
import { toArray, toHex } from '@/lib/parser';
import { isString, toTitle } from '@/lib/string';
import type { EventLogEntryProps } from './Transaction.types';
import { renderEntries } from './Transaction.utils';
import * as styles from './Transaction.styles';

export function EventLogEntry({ entry: d, index: i }: EventLogEntryProps) {
  return (
    <div key={i} className={styles.activityItem}>
      {d.log && (
        <span className={styles.eventLogText}>{d.log}</span>
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {_.reverse(_.cloneDeep(toArray(d.events) as any[]))
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        .map((e: Record<string, any>) => ({
          ...e,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          attributes: toArray(e.attributes).map((a: any) => [
            a.key,
            a.value,
          ]),
        }))
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        .map((e: any, j: number) => (
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
