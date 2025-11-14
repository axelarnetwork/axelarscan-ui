import { checkNeedMoreGasFromError } from '@/components/GMPs';
import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';
import { equalsIgnoreCase, headString } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import type {
  ChainMetadata,
  ChainType,
  GMPMessage,
  GMPToastState,
} from '../GMP.types';

/**
 * Determine whether our add-gas UX can be surfaced for a given chain.
 *
 * Axelar exposes different recovery entry points depending on the chain
 * category. EVM and Cosmos chains share a generic add-gas flow, while
 * certain VM chains have bespoke handlers:
 *
 *  • Standard / EVM-compatible chains (including vm-classified EVMs such as
 *    xrpl-evm) – always supported. These expose a numeric `chain_id`.
 *  • Cosmos chains – handled through the Cosmos addGas endpoint.
 *  • vm chains – only supported if they fall into the curated list of
 *    auxiliary implementations (currently Sui, Stellar, XRPL).
 *
 * @param targetChain      Human readable chain identifier (e.g. axelarnet, osmosis, sui-1).
 * @param targetChainType  Axelar’s chain type classification (cosmos, evm, vm).
 * @param chains           Cached Axelar chain metadata used for lookups.
 * @returns true when the UI should present an add-gas option.
 */
function isChainSupportedForAddGas(
  targetChain: string | undefined,
  targetChainType: ChainType | undefined,
  chains: ChainMetadata[] | null
): boolean {
  // Non-VM (Cosmos, EVM) chains are always supported.
  if (targetChainType !== 'vm') {
    return true;
  }

  // Some “vm” classified chains are actually EVM-compatible (e.g. xrpl-evm)
  // and expose a numeric chain_id. Treat them as fully supported.
  const chainData = getChainData(targetChain, chains);
  const isEvmCompatible =
    chainData !== undefined && typeof chainData.chain_id === 'number';

  if (isEvmCompatible) {
    return true;
  }

  // Otherwise, only Sui, Stellar, XRPL are supported.
  const normalizedChain = headString(targetChain)?.toLowerCase();

  if (!normalizedChain) {
    return false;
  }

  const isSupported = ['sui', 'stellar', 'xrpl'].includes(normalizedChain);

  return isSupported;
}

/**
 * Evaluate whether the original (source) call is still waiting on additional
 * gas funding.
 *
 * The button should be presented only when every one of the following holds:
 *  • We have not executed or approved the message yet.
 *  • Any confirmation attempt either failed or has not happened.
 *  • Cosmos calls are past their initial-finality guard (~60s).
 *  • Axelar has flagged one of the insufficient-fee markers (insufficient fee,
 *    invalid gas payment, not enough gas remaining).
 *
 * If any of the above checks fail we suppress the add-gas affordance unless
 * other recovery paths require it (e.g. callback leg).
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
  // If the message is already executed (or marked executed) we do not need more gas.
  if (executed || gmp.is_executed || approved) {
    return false;
  }

  // Successful confirmation means Axelar has already processed the message.
  if (confirm && !gmp.confirm_failed) {
    return false;
  }

  // Enforce the minimum finality window for Cosmos chains (~60 seconds).
  const cosmosNeedsFinality =
    call?.chain_type === 'cosmos' &&
    (!call.block_timestamp || timeDiff(call.block_timestamp * 1000) < 60);

  if (cosmosNeedsFinality) {
    return false;
  }

  // Detect insufficient gas using Axelar-provided flags and balances.
  // Any of these markers signal that the origin leg still needs funding.
  const shortageDetected =
    !(gas_paid || gmp.gas_paid_to_callback) ||
    gmp.is_insufficient_fee ||
    gmp.is_invalid_gas_paid ||
    gmp.not_enough_gas_to_execute ||
    (gas?.gas_remain_amount !== undefined && gas.gas_remain_amount < 0.000001);

  return shortageDetected;
}

/**
 * Determine whether the callback leg has stalled due to insufficient gas.
 *
 * A “callback leg” refers to the optional transaction Axelar dispatches back
 * to the original source chain after the destination execution completes
 * (e.g. contract callbacks, interchain token callbacks). We surface the
 * add-gas flow only when ALL of the following are true:
 *
 *  • Callback data exists (Axelar emitted a callback attempt), and
 *  • The callback carries one of the insufficient-fee markers (explicit flags
 *    or an error parsed by `checkNeedMoreGasFromError`), and
 *  • The callback record is older than one minute (to avoid racing a pending
 *    success).
 */
function needsGasForCallback(gmp: GMPMessage): boolean {
  const callback = gmp.callbackData;

  // Callback leg must exist and be explicitly marked as needing gas.
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

  // Preserve legacy behaviour: if the callback timestamp is missing, fall back
  // to the default `timeDiff` window (which is already > 60 seconds).
  const createdAtMs =
    callback.created_at &&
    typeof callback.created_at === 'object' &&
    'ms' in callback.created_at &&
    typeof callback.created_at.ms === 'number'
      ? callback.created_at.ms
      : undefined;

  return timeDiff(createdAtMs) > 60;
}

/**
 * High-level guard that decides whether the UI should render the "Add Gas"
 * recovery button.
 *
 * The button is offered when ALL of the following are true:
 *  • The chain supports add-gas (see `isChainSupportedForAddGas`).
 *  • The most recent action did not already succeed with "Pay gas successful".
 *  • At least one of the gas-shortage heuristics returns true:
 *      – `needsGasForOriginalCall` indicates the source leg still needs gas.
 *      – `needsGasForCallback` flags a callback insufficiency.
 *      – The Axelar destination is itself and the last error signals a gas gap.
 *
 * @param data      The full GMP message.
 * @param response  Latest toast state (used to avoid duplicate “pay gas” attempts).
 * @param chains    Cached Axelar chain metadata.
 */
export function shouldShowAddGasButton(
  data: GMPMessage | null,
  response: GMPToastState | null,
  chains: ChainMetadata[] | null
): boolean {
  // No data or missing call means there is nothing to recover.
  if (!data?.call) {
    return false;
  }

  const { call, gas_paid, confirm, approved, executed, error, gas } = data;
  const sourceChainData = getChainData(call.chain, chains);

  // Ignore unknown source chains (metadata missing).
  if (!sourceChainData) {
    return false;
  }

  // Axelar-origin messages do not require add gas (Axelar handles them).
  if (isAxelar(call.chain)) {
    return false;
  }

  // Guard against unsupported chains.
  if (!isChainSupportedForAddGas(call.chain, call.chain_type, chains)) {
    return false;
  }

  const waitingOnAxelar =
    isAxelar(call.returnValues?.destinationChain) &&
    checkNeedMoreGasFromError(error);

  // Avoid duplicate “Pay gas successful” loops unless the Axelar destination flow still needs recovery.
  if (response?.message === 'Pay gas successful' && !waitingOnAxelar) {
    return false;
  }

  // Short-circuit when the origin leg clearly needs gas.
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

  // Surface the button when the callback leg is stalled.
  if (needsGasForCallback(data)) {
    return true;
  }

  // Finally handle Axelar → Axelar hops that emit gas-related errors.
  return Boolean(waitingOnAxelar);
}

/**
 * Determine whether the “Approve / Confirm / Execute” recovery button should
 * be rendered for the current message state.
 *
 * Key conditions:
 *  • Amplifier (vm) origin calls are handled internally — skip the button.
 *  • If the message is already approved/executed for the target chain type,
 *    the button is unnecessary.
 *  • Require an actionable execution state (pending Axelar execution or retry).
 *  • Respect finality windows: ensure confirmations or timestamp guards are
 *    satisfied (Cosmos finality, generic 60s waits, etc.).
 *  • The message must have valid gas available (paid or routed appropriately).
 *
 * When the boolean is true the caller decides which label (Confirm / Approve /
 * Execute) to present based on the source/destination pair.
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
