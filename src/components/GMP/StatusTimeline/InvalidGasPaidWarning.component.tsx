import type { InvalidGasPaidWarningProps } from '../GMP.types';
import { WarningRow } from './WarningRow.component';

export function InvalidGasPaidWarning({ entry }: InvalidGasPaidWarningProps) {
  if (!entry.is_invalid_gas_paid) return null;
  if (entry.confirm || entry.approved) return null;
  return <WarningRow text="Invalid Gas Paid (source address mismatch)" />;
}
