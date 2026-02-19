import { sleep } from '@/lib/operator';
import { parseError } from '@/lib/parser';

import { ApproveActionParams } from './ApproveButton.types';
import type { GMPMessage } from '../GMP.types';

const isWalletRejectionError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const { code, message } = error as { code?: unknown; message?: unknown };
  if (code === 4001) {
    return true;
  }

  return typeof message === 'string' && /reject|denied|cancel/i.test(message);
};

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

type ManualRelayResponse = Awaited<
  ReturnType<NonNullable<ApproveActionParams['sdk']>['manualRelayToDestChain']>
>;
type ManualRelayToDestChainOptions = {
  evmWalletDetails?: {
    useWindowEthereum?: boolean;
    provider?: unknown;
  };
  escapeAfterConfirm?: boolean;
  messageId?: string;
  selfSigning?: {
    cosmosWalletDetails: {
      offlineSigner?: unknown;
    };
  };
};
type ManualRelayToDestChainWithOptions = (
  txHash: string,
  txLogIndex?: number,
  txEventIndex?: number,
  options?: ManualRelayToDestChainOptions
) => Promise<ManualRelayResponse>;

const shouldRequireEvmProvider = (data: GMPMessage): boolean =>
  data.call?.chain_type === 'evm' ||
  data.call?.destination_chain_type === 'evm';

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
    cosmosSigner,
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
      (!data.confirm || data.confirm_failed) &&
        data.call.chain_type !== 'cosmos'
    );

    const messageIdStr =
      typeof message_id === 'string' ? message_id : undefined;
    const sourceChainType = data.call.chain_type;
    const requiresEvmProvider = shouldRequireEvmProvider(data);
    const useSelfSigning = Boolean(cosmosSigner);
    const missingCosmosSigner = !useSelfSigning;
    const missingEvmProvider = requiresEvmProvider && !provider;

    const recoveryLogContext = {
      source_chain_type: sourceChainType,
      destination_chain_type,
      transactionHash,
      logIndex,
      eventIndex,
      message_id: messageIdStr,
      has_evm_provider: Boolean(provider),
      has_cosmos_signer: Boolean(cosmosSigner),
      use_self_signing: useSelfSigning,
    };

    console.log('[manualRelayToDestChain request]', recoveryLogContext);

    if (missingCosmosSigner || missingEvmProvider) {
      console.error('[recovery missing wallet requirements]', {
        ...recoveryLogContext,
        missing_cosmos_signer: missingCosmosSigner,
        missing_evm_provider: missingEvmProvider,
      });

      setResponse({
        status: 'failed',
        message: missingCosmosSigner
          ? 'Connect a Cosmos wallet to continue'
          : 'Connect an EVM wallet to continue',
      });
      setProcessing(false);
      return;
    }

    const options: ManualRelayToDestChainOptions = {
      evmWalletDetails: {
        useWindowEthereum: true,
        provider: provider ?? undefined,
      },
      escapeAfterConfirm: false,
      messageId: messageIdStr,
      selfSigning: {
        cosmosWalletDetails: {
          offlineSigner: cosmosSigner,
        },
      },
    };

    const manualRelayToDestChain = sdk.manualRelayToDestChain.bind(
      sdk
    ) as ManualRelayToDestChainWithOptions;

    const response: ManualRelayResponse = await manualRelayToDestChain(
      transactionHash ?? '',
      logIndex,
      eventIndex,
      options
    );

    console.log('[manualRelayToDestChain response]', response);

    const { success, error, confirmTx, signCommandTx, routeMessageTx } =
      response;

    if (!success && !error) {
      console.error('[recovery unexpected response]', {
        ...recoveryLogContext,
        response,
      });
    }

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
        confirmTx &&
        typeof confirmTx === 'object' &&
        'transactionHash' in confirmTx
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
        status: success ? 'success' : treatAsPending ? 'pending' : 'failed',
        message: treatAsPending
          ? pendingMessage
          : normalizedError ||
            (success ? fallbackSuccessMessage : 'Recovery failed'),
        hash:
          routeMessageTx?.transactionHash ||
          signCommandTx?.transactionHash ||
          confirmTx?.transactionHash,
        chain: 'axelarnet',
      });
    }
  } catch (error) {
    const isWalletRejection = isWalletRejectionError(error);
    console.error('[recovery self-sign request failed]', {
      is_wallet_rejection: isWalletRejection,
      error,
    });
    setResponse(
      isWalletRejection
        ? { status: 'failed', message: 'Transaction cancelled' }
        : { status: 'failed', ...parseError(error) }
    );
  }

  setProcessing(false);
}
