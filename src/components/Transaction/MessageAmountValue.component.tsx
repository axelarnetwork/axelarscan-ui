'use client';

import { Number } from '@/components/Number';
import { useAssets } from '@/hooks/useGlobalData';
import { resolveMessageAmount } from '@/lib/chain/messageAmount';
import { spacedSuffix } from '@/lib/string';

import type { MessageAmountValueProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function MessageAmountValue({ amount }: MessageAmountValueProps) {
  const { value, raw, suffix } = resolveMessageAmount(amount, useAssets());

  if (raw !== undefined) {
    return (
      <span className={styles.messageFieldAmount}>
        {raw}
        {spacedSuffix(suffix)}
      </span>
    );
  }

  // Number shows whole units above 1000 and keeps the exact figure in its
  // tooltip, same as amounts elsewhere in the app.
  return (
    <Number
      value={value}
      format="0,0.000000"
      suffix={spacedSuffix(suffix)}
      className={styles.messageFieldAmount}
    />
  );
}
