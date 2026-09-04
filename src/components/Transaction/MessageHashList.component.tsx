'use client';

import { MessageHashRow } from './MessageHashRow.component';
import type { MessageHashListProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function MessageHashList({ hashes, chain, gmp }: MessageHashListProps) {
  return (
    <div className={styles.messageHashList}>
      {hashes.map(hash => (
        <MessageHashRow key={hash} hash={hash} chain={chain} gmp={gmp} />
      ))}
    </div>
  );
}
