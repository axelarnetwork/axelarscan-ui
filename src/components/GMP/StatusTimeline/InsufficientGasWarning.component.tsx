import type { InsufficientGasWarningProps } from '../GMP.types';
import { WarningRow } from './WarningRow.component';

export function InsufficientGasWarning({ entry }: InsufficientGasWarningProps) {
  if (!entry.not_enough_gas_to_execute) return null;
  if (entry.executed || entry.is_executed) return null;
  return <WarningRow text="Insufficient Gas" />;
}
