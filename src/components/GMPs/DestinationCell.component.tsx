import { PiWarningCircle } from 'react-icons/pi';

import { Tooltip } from '@/components/Tooltip';
import { Profile, ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { isAxelar } from '@/lib/chain';

import type { DestinationCellProps, GMPRowProps } from './GMPs.types';
import * as styles from './GMPs.styles';

export function DestinationCell({
  data: d,
  useAnotherHopChain,
}: DestinationCellProps) {
  const destChain = d.call.returnValues?.destinationChain;
  const isDestAxelar = isAxelar(destChain);
  const showMainChain =
    !isDestAxelar || !d.customValues?.recipientAddress || !useAnotherHopChain;

  return (
    <td className={styles.tdDefault}>
      <div className={styles.destinationCellWrapper}>
        {d.is_invalid_destination_chain ? (
          <div className={styles.invalidChainWrapper}>
            <Tooltip content={destChain}>
              <div className={styles.invalidChainContent}>
                <PiWarningCircle size={20} />
                <span>Invalid Chain</span>
              </div>
            </Tooltip>
          </div>
        ) : (
          showMainChain && (
            <ChainProfile
              value={destChain}
              titleClassName={styles.chainProfileTitleBold}
            />
          )
        )}
        {d.is_invalid_contract_address ? (
          <div className={styles.invalidChainWrapper}>
            <Tooltip content={d.call.returnValues?.destinationContractAddress}>
              <div className={styles.invalidChainContent}>
                <PiWarningCircle size={20} />
                <span>Invalid Contract</span>
              </div>
            </Tooltip>
          </div>
        ) : (
          <>
            {showMainChain && (
              <Tooltip
                content="Destination Contract"
                parentClassName={styles.destinationContractTooltipParent}
              >
                <Profile
                  address={d.call.returnValues?.destinationContractAddress}
                  chain={destChain}
                  useContractLink={true}
                />
              </Tooltip>
            )}
            {hopAndRecipient(d, useAnotherHopChain, destChain, isDestAxelar)}
          </>
        )}
      </div>
    </td>
  );
}

// ─── Helper (not a component — returns a fragment) ──────────────────────────

function hopAndRecipient(
  d: GMPRowProps['data'],
  useAnotherHopChain: boolean,
  destChain: string | undefined,
  isDestAxelar: boolean
) {
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
