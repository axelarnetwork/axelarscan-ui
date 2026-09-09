'use client';

import { Tag } from '@/components/Tag';

import { MessageFieldRow } from './MessageFieldRow.component';
import type { MessageDataItemProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function MessageDataItem({ summary }: MessageDataItemProps) {
  return (
    <div className={styles.stackedPanelItem}>
      <div className={styles.stackedPanelHeader}>
        <Tag className={styles.stackedPanelTag}>{summary.label}</Tag>
        {summary.deprecated && (
          <Tag className={styles.messageDeprecatedTag}>Deprecated</Tag>
        )}
        <span className={styles.stackedPanelMutedText}>
          {summary.wrappedIn
            ? `${summary.type} in ${summary.wrappedIn}`
            : summary.type}
        </span>
      </div>
      <dl className={styles.infoDivider}>
        {summary.fields.map(field => (
          <MessageFieldRow key={field.label} field={field} />
        ))}
      </dl>
    </div>
  );
}
