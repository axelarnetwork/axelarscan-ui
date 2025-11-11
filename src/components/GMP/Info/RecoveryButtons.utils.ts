import { checkNeedMoreGasFromError } from '@/components/GMPs';
import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';
import { equalsIgnoreCase } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import type {
  ChainMetadata,
  GMPMessage,
  GMPToastState,
} from '../GMP.types';
import { isAddGasSupported } from '../GMP.utils';

export function shouldShowAddGasButton(
  data: GMPMessage | null,
  response: GMPToastState | null,
  chains: ChainMetadata[] | null
): boolean {
  if (!data?.call) return false;

  const { call, gas_paid, confirm, approved, executed, error, gas } = data;
  const sourceChainData = getChainData(call.chain, chains);

  if (!sourceChainData || isAxelar(call.chain)) return false;
  if (!isAddGasSupported(call.chain, call.chain_type, chains)) return false;
  if (response?.message === 'Pay gas successful') return false;

  const shouldShowForSelf =
    !executed &&
    !data.is_executed &&
    !approved &&
    !(confirm && !data.confirm_failed) &&
    (call.chain_type !== 'cosmos' ||
      (call.block_timestamp && timeDiff(call.block_timestamp * 1000) >= 60)) &&
    (!(gas_paid || data.gas_paid_to_callback) ||
      data.is_insufficient_fee ||
      data.is_invalid_gas_paid ||
      data.not_enough_gas_to_execute ||
      (gas?.gas_remain_amount !== undefined &&
        gas.gas_remain_amount < 0.000001));

  const shouldShowForCallback = Boolean(
    data.callbackData &&
      (data.callbackData.is_insufficient_fee ||
        data.callbackData.not_enough_gas_to_execute ||
        checkNeedMoreGasFromError(data.callbackData.error)) &&
      data.callbackData.created_at &&
      typeof data.callbackData.created_at === 'object' &&
      'ms' in data.callbackData.created_at &&
      typeof data.callbackData.created_at.ms === 'number' &&
      timeDiff(data.callbackData.created_at.ms) > 60
  );

  const shouldShowForAxelarDestination = Boolean(
    isAxelar(call.returnValues?.destinationChain) &&
      checkNeedMoreGasFromError(error)
  );

  return (
    shouldShowForSelf || shouldShowForCallback || shouldShowForAxelarDestination
  );
}

export function shouldShowApproveButton(
  data: GMPMessage | null,
  chains: ChainMetadata[] | null,
  estimatedTimeSpent: { confirm?: number } | null
): boolean {
  if (!data?.call) return false;

  const { call, confirm, approved, executed, error, gas } = data;

  const finalityTime = estimatedTimeSpent?.confirm
    ? estimatedTimeSpent.confirm + 15
    : 600;

  const isAmplifierCall = call.chain_type === 'vm';
  const isCosmosDestination = call.destination_chain_type === 'cosmos';
  const isVMDestination = call.destination_chain_type === 'vm';
  const isCosmosSource = call.chain_type === 'cosmos';

  const isAlreadyApproved = isCosmosDestination
    ? Boolean(
        (isCosmosSource && executed?.transactionHash) ||
          (confirm && confirm.poll_id !== data.confirm_failed_event?.poll_id)
      )
    : Boolean(approved) || isVMDestination;

  if (isAmplifierCall) return false;
  if (isAlreadyApproved) return false;
  if (data.is_executed) return false;

  const hasValidExecution = Boolean(
    !executed ||
      (executed.axelarTransactionHash &&
        !executed.transactionHash &&
        (error ||
          (executed.block_timestamp &&
            timeDiff(executed.block_timestamp * 1000) >= 3600)))
  );

  if (!hasValidExecution) return false;

  const hasConfirmation = Boolean(
    confirm ||
      data.confirm_failed ||
      (call.block_timestamp &&
        timeDiff(call.block_timestamp * 1000) >= finalityTime)
  );

  if (!hasConfirmation) return false;

  const hasEnoughTimePassed = Boolean(
    (confirm &&
      confirm.block_timestamp &&
      timeDiff(confirm.block_timestamp * 1000) >= 60) ||
      (call.block_timestamp && timeDiff(call.block_timestamp * 1000) >= 60)
  );

  if (!hasEnoughTimePassed) return false;

  const hasValidGas = Boolean(
    !data.is_invalid_call &&
      !data.is_insufficient_fee &&
      (gas?.gas_remain_amount ||
        data.gas_paid_to_callback ||
        data.is_call_from_relayer ||
        call.proposal_id)
  );

  return hasValidGas;
}

export function shouldShowExecuteButton(data: GMPMessage | null): boolean {
  if (!data?.call) return false;

  const { call, confirm, approved, executed, error } = data;

  const isVMDestination = call.destination_chain_type === 'vm';
  const isCosmosDestination = call.destination_chain_type === 'cosmos';
  const isAxelarDestination = isAxelar(call.returnValues?.destinationChain);
  const hasPayload = call.returnValues?.payload;

  if (isVMDestination) return false;
  if (isAxelarDestination) return false;
  if (!hasPayload) return false;

  const isApproved = isCosmosDestination
    ? confirm || call.chain_type === 'cosmos'
    : approved;

  if (!isApproved) return false;

  const hasExecutedTxHash = executed?.transactionHash;
  const isSameAsErrorTx =
    hasExecutedTxHash &&
    error?.transactionHash &&
    equalsIgnoreCase(executed.transactionHash, error.transactionHash);

  if (hasExecutedTxHash && !isSameAsErrorTx) return false;
  if (data.is_executed) return false;

  const relevantTimestamp = isCosmosDestination
    ? confirm?.block_timestamp
    : approved?.block_timestamp;
  const timestampToUse =
    (relevantTimestamp || call.block_timestamp || 0) * 1000;
  const minWaitTime = isCosmosDestination ? 300 : 120;
  const hasError = Boolean(error);
  const hasEnoughTimePassed = timeDiff(timestampToUse) >= minWaitTime;

  return hasError || hasEnoughTimePassed;
}

