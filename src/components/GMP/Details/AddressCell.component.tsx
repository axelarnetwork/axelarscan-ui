import { Profile } from '@/components/Profile';
import { headString } from '@/lib/string';

import type { AddressCellProps } from '../GMP.types';
import { detailsStyles } from './Details.styles';

export function AddressCell({
  fromAddress,
  toAddress,
  step,
  stepData,
  destinationChainData,
}: AddressCellProps) {
  const resolvedChain = stepData?.axelarTransactionHash
    ? destinationChainData?.id
    : step.chainData?.id;

  return (
    <td className={detailsStyles.tableCellNarrow}>
      <div className={detailsStyles.columnStack}>
        {fromAddress && (
          <div className={detailsStyles.rowLargeGap}>
            <span className={detailsStyles.cellLabel}>From:</span>
            <Profile address={fromAddress} chain={step.chainData?.id} />
          </div>
        )}
        {toAddress && (
          <div className={detailsStyles.rowLargeGap}>
            <span className={detailsStyles.cellLabel}>To:</span>
            <Profile
              address={toAddress}
              chain={resolvedChain}
              useContractLink={
                step.id === 'execute' &&
                ['stellar'].includes(headString(resolvedChain) ?? '')
              }
            />
          </div>
        )}
      </div>
    </td>
  );
}
