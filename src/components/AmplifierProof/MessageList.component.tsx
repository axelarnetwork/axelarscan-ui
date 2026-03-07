'use client';

import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { headString, ellipse, removeHexPrefix } from '@/lib/string';

import type { MessageId, MessageListProps } from './AmplifierProof.types';
import * as styles from './AmplifierProof.styles';

export function MessageList({ data, chains }: MessageListProps) {
  const rawMessages = toArray(
    data.message_ids || {
      message_id: data.message_id,
      source_chain: data.source_chain,
    }
  ) as MessageId[];

  return (
    <div className={styles.messageList}>
      {rawMessages.map((m: MessageId, i: number) => {
        const messageId = m.message_id || m.id;
        const sourceChain = m.source_chain || m.chain;

        if (!messageId) return null;

        const { url, transaction_path } = {
          ...getChainData(sourceChain, chains)?.explorer,
        };
        const cleanId = removeHexPrefix(messageId);

        return (
          <div key={i} className={styles.messageRow}>
            <ChainProfile value={sourceChain} />
            <div className={styles.messageIdRow}>
              <Copy value={cleanId}>
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', headString(cleanId) ?? '')}`}
                  target="_blank"
                  className={styles.messageIdLink}
                >
                  {ellipse(cleanId).toUpperCase()}
                </Link>
              </Copy>
              <ExplorerLink
                value={headString(cleanId)}
                chain={sourceChain}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
