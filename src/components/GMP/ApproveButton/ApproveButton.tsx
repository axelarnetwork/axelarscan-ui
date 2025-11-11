import clsx from 'clsx';

import { isAxelar } from '@/lib/chain';

import { gmpStyles } from '../GMP.styles';
import { ApproveButtonProps } from './ApproveButton.types';

export function ApproveButton({
  data,
  processing,
  onApprove,
  chains: _chains,
  estimatedTimeSpent: _estimatedTimeSpent,
}: ApproveButtonProps) {
  if (!data || !data.call) {
    return null;
  }

  const call = data.call;
  const confirm = data.confirm;

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
        {(!isConfirmed || data!.confirm_failed) &&
        !isAxelarChain &&
        !isCosmosChain
          ? 'Confirm'
          : isCosmosChain
            ? 'Execut'
            : 'Approv'}
        {processing
          ? 'ing...'
          : (!isConfirmed || data!.confirm_failed) &&
              !isAxelarChain &&
              !isCosmosChain
            ? ''
            : 'e'}
      </button>
    </div>
  );
}
