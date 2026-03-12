import { Copy } from '@/components/Copy';
import { JSONView } from '@/components/JSONView';
import { Tag } from '@/components/Tag';
import { toArray } from '@/lib/parser';
import { ellipse, isString } from '@/lib/string';
import * as styles from './Transaction.styles';

export function renderEntries(entries: [string, unknown][]) {
  return (toArray(entries) as [string, unknown][]).map(
    ([k, v]: [string, unknown], i: number) => (
      <div key={i} className={styles.entryRow}>
        <span className={styles.entryKey}>{k}</span>
        <div className={styles.entryValueWrapper}>
          <Tag className={styles.entryValueTag}>
            {isString(v) ? (
              ellipse(v, 256)
            ) : v && typeof v === 'object' ? (
              <JSONView value={v} />
            ) : (
              v?.toString()
            )}
          </Tag>
          <Copy
            size={16}
            value={typeof v === 'object' ? JSON.stringify(v) : v}
            className="mt-2"
          />
        </div>
      </div>
    )
  );
}
