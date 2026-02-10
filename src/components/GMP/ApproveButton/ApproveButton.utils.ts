import { sleep } from '@/lib/operator';
import { parseError } from '@/lib/parser';

import { ApproveActionParams } from './ApproveButton.types';
const shouldTreatConfirmAsPending = (
  isConfirmAction: boolean,
  success: boolean | undefined,
  confirmTxHash: string | undefined
): boolean => {
  if (!isConfirmAction || success) {
    return false;
  }

  return Boolean(confirmTxHash);
};

/**
 * Execute the approve/confirm action for a GMP transaction
 * This calls manualRelayToDestChain on the Axelar network
 */
export async function executeApprove(
  params: ApproveActionParams
): Promise<void> {
  const {
    data,
    sdk,
    provider,
    setResponse,
    setProcessing,
    afterPayGas,
  } = params;

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

    const isConfirmAction = Boolean(
      (!data.confirm || data.confirm_failed) && data.call.chain_type !== 'cosmos'
    );

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
      const parsedError = parseError(error)?.message;
      const rawError =
        typeof error === 'string'
          ? error
          : typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message?: unknown }).message
            : undefined;
      const normalizedError =
        parsedError ||
        (typeof rawError === 'string' && rawError.length > 0
          ? rawError
          : undefined);

      const confirmTxHash =
        confirmTx && typeof confirmTx === 'object' && 'transactionHash' in confirmTx
          ? (confirmTx as { transactionHash?: string }).transactionHash
          : undefined;

      const treatAsPending = shouldTreatConfirmAsPending(
        isConfirmAction,
        success,
        confirmTxHash
      );

      const pendingMessage = normalizedError
        ? `Confirmation submitted. Waiting for Axelar to finalize... (${normalizedError})`
        : 'Confirmation submitted. Waiting for Axelar to finalize...';
      const fallbackSuccessMessage = `${
        destination_chain_type === 'cosmos' ? 'Execute' : 'Approve'
      } successful`;

      setResponse({
        status: success || !error ? 'success' : treatAsPending ? 'pending' : 'failed',
        message: treatAsPending ? pendingMessage : normalizedError || fallbackSuccessMessage,
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
