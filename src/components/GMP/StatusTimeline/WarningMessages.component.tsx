import type { WarningMessagesProps } from '../GMP.types';
import { InsufficientFeeWarning } from './InsufficientFeeWarning.component';
import { InvalidGasPaidWarning } from './InvalidGasPaidWarning.component';
import { InsufficientGasWarning } from './InsufficientGasWarning.component';

export function WarningMessages({ entry }: WarningMessagesProps) {
  return (
    <>
      <InsufficientFeeWarning entry={entry} />
      <InvalidGasPaidWarning entry={entry} />
      <InsufficientGasWarning entry={entry} />
    </>
  );
}
