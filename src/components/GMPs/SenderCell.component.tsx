import { Profile, ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { isAxelar } from '@/lib/chain';

import type { SenderCellProps } from './GMPs.types';
import * as styles from './GMPs.styles';

export function SenderCell({ data: d, useAnotherHopChain }: SenderCellProps) {
  const isHopOrigin =
    useAnotherHopChain && isAxelar(d.call.chain) && d.origin_chain;

  return (
    <td className={styles.tdDefault}>
      <div className={styles.senderCellWrapper}>
        {isHopOrigin ? (
          <div className={styles.senderChainProfileWrapper}>
            <ChainProfile
              value={d.origin_chain}
              className={styles.chainProfileHeight}
              titleClassName={styles.chainProfileTitleBold}
            />
            <ExplorerLink
              value={d.call.returnValues?.sender}
              chain={d.call.chain}
              type="address"
              title="via"
              iconOnly={false}
              width={11}
              height={11}
              containerClassName={styles.explorerLinkContainerClassName}
              nonIconClassName={styles.explorerLinkNonIconClassName}
            />
          </div>
        ) : (
          <ChainProfile
            value={d.call.chain}
            titleClassName={styles.chainProfileTitleBold}
          />
        )}
        {!isHopOrigin && (
          <Profile address={d.call.transaction?.from} chain={d.call.chain} />
        )}
      </div>
    </td>
  );
}
