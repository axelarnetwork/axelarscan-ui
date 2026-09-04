'use client';

import { extractMessageSummaries } from '@/lib/chain/txMessages';

import { MessageDataItem } from './MessageDataItem.component';
import type { DataProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function MessageData({ data }: DataProps) {
  const summaries = extractMessageSummaries(data);

  // Nothing to add for message types we cannot describe - the raw JSON below
  // still shows them.
  if (summaries.length === 0) return null;

  return (
    <section className={styles.sectionWrapper}>
      <h3 className={styles.sectionTitle}>Message details</h3>
      <div className={styles.stackedPanel}>
        {summaries.map(summary => (
          <MessageDataItem
            key={`${summary.type}-${summary.index}`}
            summary={summary}
          />
        ))}
      </div>
    </section>
  );
}
