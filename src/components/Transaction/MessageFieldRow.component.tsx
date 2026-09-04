'use client';

import { MessageFieldValue } from './MessageFieldValue.component';
import type { MessageFieldRowProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function MessageFieldRow({ field }: MessageFieldRowProps) {
  return (
    <div className={styles.messageFieldRow}>
      <dt className={styles.infoLabel}>{field.label}</dt>
      <dd className={styles.infoValue}>
        <MessageFieldValue field={field} />
      </dd>
    </div>
  );
}
