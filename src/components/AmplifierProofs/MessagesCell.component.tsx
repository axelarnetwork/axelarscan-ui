import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { headString, ellipse, removeHexPrefix } from '@/lib/string';

import type { MessageEntry, MessagesCellProps } from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function MessagesCell({ proof, chains }: MessagesCellProps) {
  const messages = toArray(
    proof.message_ids || {
      message_id: proof.message_id,
      source_chain: proof.source_chain,
    }
  ) as MessageEntry[];

  return (
    <div className={styles.flexColGapSmall}>
      {messages.map((m: MessageEntry, i: number) => {
        if (!m.message_id) {
          m.message_id = m.id;
        }
        if (!m.source_chain) {
          m.source_chain = m.chain;
        }

        const { url, transaction_path } = {
          ...getChainData(m.source_chain, chains)?.explorer,
        };

        return (
          <div key={i} className={styles.flexItemsGap4}>
            <ChainProfile value={m.source_chain} />
            <div className={styles.flexItemsGap1}>
              <Copy value={removeHexPrefix(m.message_id)}>
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', headString(removeHexPrefix(m.message_id)) ?? '')}`}
                  target="_blank"
                  className={styles.linkBlue}
                >
                  {ellipse(removeHexPrefix(m.message_id)).toUpperCase()}
                </Link>
              </Copy>
              <ExplorerLink
                value={headString(removeHexPrefix(m.message_id))}
                chain={m.source_chain}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
