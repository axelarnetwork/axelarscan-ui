import { isAxelar } from '@/lib/chain';
import { isNumber } from '@/lib/number';

import { getEvent } from './GMPs.component';
import type { GMPRowData } from './GMPs.types';

/**
 * Build the href for a GMP detail page given a row of GMP data.
 */
export function buildGmpHref(d: GMPRowData): string {
  if (d.call.parentMessageID) {
    return `/gmp/${d.call.parentMessageID}`;
  }

  if (d.message_id) {
    return `/gmp/${d.message_id}`;
  }

  const isCosmos = d.call.chain_type === 'cosmos';
  const txHash = isCosmos && isNumber(d.call.messageIdIndex)
    ? d.call.axelarTransactionHash
    : d.call.transactionHash;

  let suffix = '';
  if (isNumber(d.call.logIndex)) {
    suffix = `:${d.call.logIndex}`;
  } else if (isCosmos && isNumber(d.call.messageIdIndex)) {
    suffix = `-${d.call.messageIdIndex}`;
  }

  return `/gmp/${txHash}${suffix}`;
}

/**
 * Derive the human-readable status label for a GMP row.
 */
export function getStatusLabel(d: GMPRowData): string {
  if (
    d.simplified_status === 'received' &&
    (getEvent(d) === 'ContractCall' ||
      (getEvent(d) === 'InterchainTransfer' &&
        isAxelar(d.call.returnValues?.destinationChain)))
  ) {
    return 'Executed';
  }
  return d.simplified_status;
}
