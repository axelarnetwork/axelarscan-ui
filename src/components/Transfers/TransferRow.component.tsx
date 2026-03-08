import { memo } from 'react';
import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { Profile, ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { ellipse } from '@/lib/string';

import { StatusCell } from './StatusCell.component';
import { MethodCell } from './MethodCell.component';
import { resolveSymbol } from './Transfers.utils';
import type { TransferRowProps } from './Transfers.types';
import * as styles from './Transfers.styles';

export const TransferRow = memo(function TransferRow({ d, assets }: TransferRowProps) {
  const { symbol, image, assetData } = resolveSymbol(d, assets);

  const senderAddress =
    d.wrap?.sender_address ||
    d.erc20_transfer?.sender_address ||
    d.send?.sender_address;
  const recipientAddress =
    d.unwrap?.recipient_address || d.link?.recipient_address;
  const destinationChain =
    d.send.destination_chain || d.link?.destination_chain;

  return (
    <tr key={d.send.txhash} className={styles.tr}>
      <td className={styles.tdTxHash}>
        <div className={styles.tdTxHashRow}>
          <Copy value={d.send.txhash}>
            <Link
              href={`/transfer/${d.send.txhash}`}
              target="_blank"
              className={styles.tdTxHashLink}
            >
              {ellipse(d.send.txhash, 4, '0x')}
            </Link>
          </Copy>
          <ExplorerLink value={d.send.txhash} chain={d.send.source_chain} />
        </div>
      </td>
      <td className={styles.tdDefault}>
        <MethodCell
          d={d}
          symbol={symbol}
          image={image}
          assetData={assetData}
          assets={assets}
        />
      </td>
      <td className={styles.tdDefault}>
        <div className={styles.chainCol}>
          <ChainProfile
            value={d.send.source_chain}
            titleClassName="font-semibold"
          />
          <Profile address={senderAddress} chain={d.send.source_chain} />
        </div>
      </td>
      <td className={styles.tdDefault}>
        <div className={styles.chainCol}>
          <ChainProfile
            value={destinationChain}
            titleClassName="font-semibold"
          />
          <Profile address={recipientAddress} chain={destinationChain} />
        </div>
      </td>
      <td className={styles.tdDefault}>
        <StatusCell d={d} />
      </td>
      <td className={styles.tdCreatedAt}>
        <TimeAgo timestamp={d.send.created_at?.ms} />
      </td>
    </tr>
  );
});
