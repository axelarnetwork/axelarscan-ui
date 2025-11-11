import { sleep } from '@/lib/operator';
import { parseError } from '@/lib/parser';
import { timeDiff } from '@/lib/time';

import { ChainMetadata, GMPMessage } from '../GMP.types';
import { ApproveActionParams } from './ApproveButton.types';

/**
 * Determines if the Approve button should be shown based on transaction state
 */
export function shouldShowApproveButton(
  data: GMPMessage | null,
  chains: ChainMetadata[] | null,
  estimatedTimeSpent: { confirm?: number } | null
): boolean {
  if (!data?.call) return false;

  const { call, confirm, approved, executed, error, gas } = data;

  // Calculate finality time
  const finalityTime = estimatedTimeSpent?.confirm
    ? estimatedTimeSpent.confirm + 15
    : 600;

  // Check all conditions for showing the approve button
  const isAmplifierCall = call.chain_type === 'vm';
  const isCosmosDestination = call.destination_chain_type === 'cosmos';
  const isVMDestination = call.destination_chain_type === 'vm';
  const isCosmosSource = call.chain_type === 'cosmos';

  // Check if already approved/executed
  const isAlreadyApproved = isCosmosDestination
    ? Boolean(
        (isCosmosSource && executed?.transactionHash) ||
          (confirm && confirm.poll_id !== data.confirm_failed_event?.poll_id)
      )
    : Boolean(approved) || isVMDestination;

  if (isAmplifierCall) return false;
  if (isAlreadyApproved) return false;
  if (data.is_executed) return false;

  // Check execution status
  const hasValidExecution = Boolean(
    !executed ||
      (executed.axelarTransactionHash &&
        !executed.transactionHash &&
        (error ||
          (executed.block_timestamp &&
            timeDiff(executed.block_timestamp * 1000) >= 3600)))
  );

  if (!hasValidExecution) return false;

  // Check if confirmed or enough time has passed
  const hasConfirmation = Boolean(
    confirm ||
      data.confirm_failed ||
      (call.block_timestamp &&
        timeDiff(call.block_timestamp * 1000) >= finalityTime)
  );

  if (!hasConfirmation) return false;

  // Check if enough time has passed since confirmation or call
  const hasEnoughTimePassed = Boolean(
    (confirm &&
      confirm.block_timestamp &&
      timeDiff(confirm.block_timestamp * 1000) >= 60) ||
      (call.block_timestamp && timeDiff(call.block_timestamp * 1000) >= 60)
  );

  if (!hasEnoughTimePassed) return false;

  // Check if valid call with sufficient gas
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
 * Execute the approve/confirm action for a GMP transaction
 * This calls manualRelayToDestChain on the Axelar network
 */
export async function executeApprove(
  params: ApproveActionParams
): Promise<void> {
  const { data, sdk, provider, setResponse, setProcessing, afterPayGas } =
    params;

  if (!data?.call || !sdk) {
    return;
  }

  setProcessing(true);

  if (!afterPayGas) {
    setResponse({
      status: 'pending',
      message:
        (!data.confirm || data.confirm_failed) &&
        data.call.chain_type !== 'cosmos'
          ? 'Confirming...'
          : data.call.destination_chain_type === 'cosmos'
            ? 'Executing...'
            : 'Approving...',
    });
  }

  try {
    const {
      destination_chain_type,
      transactionHash,
      logIndex,
      eventIndex,
      message_id,
    } = { ...data.call };

    const messageIdStr =
      typeof message_id === 'string' ? message_id : undefined;

    console.log('[manualRelayToDestChain request]', {
      transactionHash,
      logIndex,
      eventIndex,
      message_id: messageIdStr,
    });

    const response = await sdk.manualRelayToDestChain(
      transactionHash ?? '',
      logIndex,
      eventIndex,
      {
        useWindowEthereum: true,
        provider: provider ?? undefined,
      },
      false,
      messageIdStr
    );

    console.log('[manualRelayToDestChain response]', response);

    const { success, error, confirmTx, signCommandTx, routeMessageTx } = {
      ...response,
    };

    if (success) {
      await sleep(15 * 1000);
    }

    if (success || !afterPayGas) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message
          : String(error || '');

      setResponse({
        status: success || !error ? 'success' : 'failed',
        message:
          errorMessage ||
          `${destination_chain_type === 'cosmos' ? 'Execute' : 'Approve'} successful`,
        hash:
          routeMessageTx?.transactionHash ||
          signCommandTx?.transactionHash ||
          confirmTx?.transactionHash,
        chain: 'axelarnet',
      });
    }
  } catch (error) {
    setResponse({ status: 'failed', ...parseError(error) });
  }

  setProcessing(false);
}
