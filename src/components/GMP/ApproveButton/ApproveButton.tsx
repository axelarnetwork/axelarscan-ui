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

  let buttonLabel: string;
  if (!isConfirmed && !isAxelarChain && !isCosmosChain) {
    buttonLabel = processing ? 'Confirming...' : 'Confirm';
  } else if (isCosmosChain) {
    buttonLabel = processing ? 'Executing...' : 'Execute';
  } else {
    buttonLabel = processing ? 'Approving...' : 'Approve';
  }

  return (
    <div key="approve" className={gmpStyles.actionRow}>
      <button
        disabled={processing}
        onClick={() => onApprove(data!)}
        className={clsx(gmpStyles.actionButton(processing))}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
