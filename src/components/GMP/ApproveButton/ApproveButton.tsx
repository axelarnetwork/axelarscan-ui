import clsx from 'clsx';

import { isAxelar } from '@/lib/chain';

import { gmpStyles } from '../GMP.styles';
import { ApproveButtonProps } from './ApproveButton.types';
import { shouldShowApproveButton } from './ApproveButton.utils';

export function ApproveButton({
  data,
  processing,
  onApprove,
  chains,
  estimatedTimeSpent,
}: ApproveButtonProps) {
  // Check if button should be shown
  if (!shouldShowApproveButton(data, chains, estimatedTimeSpent)) {
    return null;
  }

  const { call, confirm } = data!;

  // Determine button text
  const isConfirmed = Boolean(confirm && !data!.confirm_failed);
  const isAxelarChain = isAxelar(call.chain);
  const isCosmosChain = call.chain_type === 'cosmos';

  return (
    <div key="approve" className={gmpStyles.actionRow}>
      <button
        disabled={processing}
        onClick={() => onApprove(data!)}
        className={clsx(gmpStyles.actionButton(processing))}
      >
        {(!isConfirmed || data!.confirm_failed) && !isAxelarChain && !isCosmosChain
          ? 'Confirm'
          : isCosmosChain
            ? 'Execut'
            : 'Approv'}
        {processing
          ? 'ing...'
          : (!isConfirmed || data!.confirm_failed) && !isAxelarChain && !isCosmosChain
            ? ''
            : 'e'}
      </button>
    </div>
  );
}
