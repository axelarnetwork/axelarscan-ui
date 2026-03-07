import { isAxelar } from '@/lib/chain';
import { timeDiff } from '@/lib/time';

import type { InsufficientFeeWarningProps } from '../GMP.types';
import { WarningRow } from './WarningRow.component';

export function InsufficientFeeWarning({ entry }: InsufficientFeeWarningProps) {
  if (!entry.is_insufficient_fee) return null;
  if (entry.confirm || entry.approved) return null;

  const chain = entry.call?.chain;
  const destChain = entry.call?.returnValues?.destinationChain;
  const createdAtMs = entry.call?.created_at?.ms;

  const isNonAxelarPair = !isAxelar(chain) && !isAxelar(destChain);
  const isTimedOut = createdAtMs ? timeDiff(createdAtMs) > 120 : false;

  if (!isNonAxelarPair && !isTimedOut) return null;

  return <WarningRow text="Insufficient Fee" />;
}
