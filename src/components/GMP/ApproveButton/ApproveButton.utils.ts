import { sleep } from '@/lib/operator';
import { parseError } from '@/lib/parser';

import { ApproveActionParams } from './ApproveButton.types';

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
