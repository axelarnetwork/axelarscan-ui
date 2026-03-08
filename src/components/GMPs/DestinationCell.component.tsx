import { PiWarningCircle } from 'react-icons/pi';

import { Tooltip } from '@/components/Tooltip';
import { Profile, ChainProfile } from '@/components/Profile';
import { isAxelar } from '@/lib/chain';

import type { DestinationCellProps } from './GMPs.types';
import * as styles from './GMPs.styles';
import { HopAndRecipient } from './HopAndRecipient.component';

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
            <HopAndRecipient
              data={d}
              useAnotherHopChain={useAnotherHopChain}
              destChain={destChain}
              isDestAxelar={isDestAxelar}
            />
          </>
        )}
      </div>
    </td>
  );
}
