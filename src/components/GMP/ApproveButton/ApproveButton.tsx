import clsx from 'clsx';

import { gmpStyles } from '../GMP.styles';
import { useApproveButton } from './ApproveButton.hooks';
import { ApproveButtonProps } from './ApproveButton.types';

export function ApproveButton(props: ApproveButtonProps) {
  const { data, processing, setProcessing, setResponse } = props;
  const { buttonLabel, handleApprove } = useApproveButton({
    data,
    processing,
    setProcessing,
    setResponse,
  });

  if (!data?.call) {
    return null;
  }

  return (
    <div key="approve" className={gmpStyles.actionRow}>
      <button
        disabled={processing}
        onClick={handleApprove}
        className={clsx(gmpStyles.actionButton(processing))}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
