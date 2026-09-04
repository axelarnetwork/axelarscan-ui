'use client';

import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ExplorerLink } from '@/components/ExplorerLink';
import { ellipse } from '@/lib/string';

import type { MessageHashRowProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function MessageHashRow({ hash, chain, gmp }: MessageHashRowProps) {
  // Same shape as a transaction hash anywhere else in the app: the hash itself,
  // copyable, with the explorer icon beside it. ExplorerLink is icon-only by
  // default and would otherwise show no hash at all.
  //
  // Votes and confirmation polls are always about a gateway contract call, so
  // the hash doubles as a link to that cross-chain message.
  return (
    <div className={styles.messageHashRow}>
      <Copy value={hash}>
        {gmp ? (
          <Link
            href={`/gmp/${hash}`}
            target="_blank"
            className={styles.blockLink}
          >
            {ellipse(hash)}
          </Link>
        ) : (
          ellipse(hash)
        )}
      </Copy>
      <ExplorerLink value={hash} chain={chain} />
    </div>
  );
}
