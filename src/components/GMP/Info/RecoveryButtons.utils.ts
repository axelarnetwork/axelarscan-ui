import { checkNeedMoreGasFromError } from '@/components/GMPs';
import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';
import { equalsIgnoreCase, headString } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import type { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';

/**
 * Axelar only supports the add-gas flow on chains that expose the relevant
 * APIs.
 *
 * @param targetChain      The human-readable chain identifier (e.g. axelar, osmosis, sui-1).
 * @param targetChainType  Axelar's chain type classification (cosmos, evm, vm).
 * @param chains           Cached chain metadata for lookups.
 */
function isChainSupportedForAddGas(
  targetChain: string | undefined,
  targetChainType: string | undefined,
  chains: ChainMetadata[] | null
): boolean {
  if (targetChainType !== 'vm') {
    return true;
  }

  const chainData = getChainData(targetChain, chains);
  if (chainData && typeof chainData.chain_id === 'number') {
    return true;
  }

  const normalizedChain = headString(targetChain)?.toLowerCase();

  return Boolean(
    normalizedChain && ['sui', 'stellar', 'xrpl'].includes(normalizedChain)
  );
}

/**
 * The original call still needs gas when:
 *  - Nothing has executed yet.
 *  - We have not already approved the message.
 *  - Cosmos calls have waited at least a minute for finality.
 *  - One of the gas shortage indicators from Axelar is present.
 */
function needsGasForOriginalCall({
  call,
  gas_paid,
  confirm,
  approved,
  executed,
  gas,
  gmp,
}: {
  call: GMPMessage['call'];
  gas_paid: GMPMessage['gas_paid'];
  confirm: GMPMessage['confirm'];
  approved: GMPMessage['approved'];
  executed: GMPMessage['executed'];
  gas: GMPMessage['gas'];
  gmp: GMPMessage;
}): boolean {
  if (executed || gmp.is_executed || approved) {
    return false;
  }

  if (confirm && !gmp.confirm_failed) {
    return false;
  }

  const cosmosNeedsFinality =
    call?.chain_type === 'cosmos' &&
    (!call.block_timestamp || timeDiff(call.block_timestamp * 1000) < 60);

  if (cosmosNeedsFinality) {
    return false;
  }

  const shortageDetected =
    !(gas_paid || gmp.gas_paid_to_callback) ||
    gmp.is_insufficient_fee ||
    gmp.is_invalid_gas_paid ||
    gmp.not_enough_gas_to_execute ||
    (gas?.gas_remain_amount !== undefined && gas.gas_remain_amount < 0.000001);

  return shortageDetected;
}

/**
 * Callback chains need extra gas when the callback leg exists and any of the
 * failure markers Axelar emits are present, provided the callback record is
 * older than one minute.
 */
function needsGasForCallback(gmp: GMPMessage): boolean {
  const callback = gmp.callbackData;
  if (
    !callback ||
    !(
      callback.is_insufficient_fee ||
      callback.not_enough_gas_to_execute ||
      checkNeedMoreGasFromError(callback.error)
    )
  ) {
    return false;
  }

  const createdAt = callback.created_at;
  if (
    !createdAt ||
    typeof createdAt !== 'object' ||
    !('ms' in createdAt) ||
    typeof createdAt.ms !== 'number'
  ) {
    return false;
  }

  return timeDiff(createdAt.ms) > 60;
}

/**
 * Determine whether the “Add Gas” recovery button should be rendered.
 *
 * - Only chains that support the add-gas flow (EVM, Cosmos, Sui, Stellar,
 *   XRPL) can show the button.
 * - If the most recent action already reported “Pay gas successful” we
 *   suppress the button to avoid duplicate submissions.
 * - Beyond those guards we surface the button when any of the three
 *   problem scenarios are true:
 *     * The original call is still awaiting gas (self check).
 *     * A callback leg ran out of gas (callback check).
 *     * The call is routing back through Axelar and the last transaction
 *       error indicates additional gas is required.
 *
 * @param data      The full GMP message object.
 * @param response  The latest toast state which can signal a recent success.
 * @param chains    Axelar chain metadata used for lookups.
 */
export function shouldShowAddGasButton(
  data: GMPMessage | null,
  response: GMPToastState | null,
  chains: ChainMetadata[] | null
): boolean {
  if (!data?.call) {
    return false;
  }

  const { call, gas_paid, confirm, approved, executed, error, gas } = data;
  const sourceChainData = getChainData(call.chain, chains);

  if (!sourceChainData) {
    return false;
  }

  if (isAxelar(call.chain)) {
    return false;
  }

  if (!isChainSupportedForAddGas(call.chain, call.chain_type, chains)) {
    return false;
  }

  if (response?.message === 'Pay gas successful') {
    return false;
  }

  if (
    needsGasForOriginalCall({
      call,
      gas_paid,
      confirm,
      approved,
      executed,
      gas,
      gmp: data,
    })
  ) {
    return true;
  }

  if (needsGasForCallback(data)) {
    return true;
  }

  const waitingOnAxelar =
    isAxelar(call.returnValues?.destinationChain) &&
    checkNeedMoreGasFromError(error);

  return Boolean(waitingOnAxelar);
}

/**
 * Decide if the “Approve / Confirm / Execute” recovery button should be shown.
 *
 * - No button for amplifier calls (Axelar handles those internally).
 * - Skip when the destination leg has already been fully approved/executed.
 * - Require a valid pending Axelar execution (including retries on errors).
 * - Ensure the original transaction is old enough / has finality.
 * - Finally, only allow the button when there’s usable gas on the message.
 *
 * Depending on the source/destination chain pair the button text/rendered
 * action changes (Confirm / Approve / Execute). The caller decides which
 * label to use based on this boolean.
 */
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

/**
 * Determine if the “Execute” recovery button should appear.
 *
 * We only surface the button when:
 * - The destination chain is neither VM-only (e.g. Cosmos, Sui, Stellar, XRPL) nor Axelar itself.
 * - The call carries a payload (executeWithToken / execute),
 * - The message has an approved/confirmed step ready to execute,
 * - There is no successful execution recorded (or the failure hash matches).
 * - Enough time has passed since confirmation (or an explicit error exists).
 */
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
