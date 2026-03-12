import { Tooltip } from '@/components/Tooltip';
import { Profile, ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';

import type { HopAndRecipientProps } from './GMPs.types';
import * as styles from './GMPs.styles';

export function HopAndRecipient({
  data: d,
  useAnotherHopChain,
  destChain,
  isDestAxelar,
}: HopAndRecipientProps) {
  if (!d.callback_chain && !d.customValues?.recipientAddress) {
    return null;
  }

  const recipientAddress =
    d.customValues?.recipientAddress ||
    (useAnotherHopChain && d.callback_destination_address);

  const recipientTooltipContent =
    isDestAxelar &&
    (d.customValues?.projectName === 'ITS' ||
      (!d.customValues?.recipientAddress && d.callback_destination_address))
      ? 'Destination Address'
      : `${d.customValues?.projectName ? d.customValues.projectName : 'Final User'} Recipient`;

  return (
    <>
      {isDestAxelar && (
        <div className={styles.hopChainWrapper}>
          <ChainProfile
            value={
              useAnotherHopChain
                ? d.callback_chain || d.customValues?.destinationChain
                : undefined
            }
            className={styles.chainProfileHeight}
            titleClassName={styles.chainProfileTitleBold}
          />
          {useAnotherHopChain && (
            <ExplorerLink
              value={d.call.returnValues?.destinationContractAddress}
              chain={destChain}
              type="address"
              title="via"
              iconOnly={false}
              width={11}
              height={11}
              containerClassName={styles.explorerLinkContainerClassName}
              nonIconClassName={styles.explorerLinkNonIconClassName}
            />
          )}
        </div>
      )}
      {recipientAddress && (
        <Tooltip
          content={recipientTooltipContent}
          parentClassName={styles.recipientTooltipParent}
        >
          <Profile
            address={recipientAddress}
            chain={
              (useAnotherHopChain && d.callback_chain) ||
              d.customValues?.destinationChain ||
              destChain
            }
          />
        </Tooltip>
      )}
    </>
  );
}
