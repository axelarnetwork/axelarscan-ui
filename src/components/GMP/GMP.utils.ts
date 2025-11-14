import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';
import { isNumber } from '@/lib/number';
import { toCase } from '@/lib/parser';
import { headString } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import {
  ChainMetadata,
  GMPEventLog,
  GMPMessage,
  GMPStep,
  WalletContext,
} from './GMP.types';

export function isGMPMessage(value: unknown): value is GMPMessage {
  return typeof value === 'object' && value !== null;
}

function resolvePayGasTitle(
  call: GMPEventLog | undefined,
  hasGasPayment: boolean
) {
  if (hasGasPayment) {
    return 'Gas Paid';
  }

  const recentlySent = timeDiff((call?.block_timestamp ?? 0) * 1000) < 30;
  return recentlySent ? 'Checking Gas Paid' : 'Pay Gas';
}

interface ConfirmResolutionContext {
  call?: GMPEventLog;
  confirm?: GMPEventLog;
  confirmFailed?: GMPEventLog;
  confirmFailedEvent?: GMPEventLog;
  approved?: GMPEventLog;
  executed?: GMPEventLog;
  isExecuted?: boolean;
  error?: GMPEventLog | undefined;
  isInvalidCall?: boolean;
  gasPaid?: GMPEventLog | string | undefined;
  gasPaidToCallback?: GMPEventLog | undefined;
  expressExecuted?: GMPEventLog | undefined;
}

function hasSuccessfulConfirmation({
  call,
  confirm,
  confirmFailedEvent,
  approved,
  executed,
  isExecuted,
  error,
}: ConfirmResolutionContext): boolean {
  if (!confirm && !approved && !executed && !isExecuted && !error) {
    return false;
  }

  const confirmationValid = Boolean(
    confirm &&
      (call?.chain_type === 'cosmos' ||
        confirm?.poll_id !== confirmFailedEvent?.poll_id)
  );

  return (
    confirmationValid ||
    Boolean(approved) ||
    Boolean(executed) ||
    Boolean(isExecuted) ||
    Boolean(error)
  );
}

function resolveConfirmTitle(context: ConfirmResolutionContext) {
  if (hasSuccessfulConfirmation(context)) {
    return 'Confirmed';
  }

  if (context.isInvalidCall) {
    return 'Invalid Call';
  }

  if (context.confirmFailed) {
    return 'Failed to Confirm';
  }

  if (context.gasPaid || context.gasPaidToCallback || context.expressExecuted) {
    return 'Waiting for Finality';
  }

  return 'Confirm';
}

function resolveConfirmStatus(
  context: ConfirmResolutionContext
): 'success' | 'failed' | 'pending' {
  if (hasSuccessfulConfirmation(context)) {
    return 'success';
  }

  if (context.isInvalidCall || context.confirmFailed) {
    return 'failed';
  }

  return 'pending';
}

function resolveApproveTitle(
  call: GMPEventLog | undefined,
  confirm: GMPEventLog | undefined,
  confirmFailedEvent: GMPEventLog | undefined,
  approved: GMPEventLog | undefined
) {
  if (approved) {
    return 'Approved';
  }

  const canShowApproving = Boolean(
    confirm &&
      (['cosmos', 'vm'].includes(call?.chain_type ?? '') ||
        confirm?.poll_id !== confirmFailedEvent?.poll_id)
  );

  return canShowApproving ? 'Approving' : 'Approve';
}

interface ExecuteResolutionContext {
  executed?: GMPEventLog;
  isExecuted?: boolean;
  error?: GMPEventLog | undefined;
  errored: boolean;
  confirm?: GMPEventLog;
  call?: GMPEventLog;
}

function hasSuccessfulExecution({
  executed,
  isExecuted,
  error,
}: ExecuteResolutionContext): boolean {
  if (isExecuted) {
    return true;
  }

  if (!executed) {
    return false;
  }

  const missingAxelarHash = !executed.axelarTransactionHash;
  const hasExecutableTransaction = Boolean(executed.transactionHash && !error);

  return missingAxelarHash || hasExecutableTransaction;
}

function shouldWaitForIbc({
  executed,
  confirm,
  call,
}: ExecuteResolutionContext): boolean {
  if (!executed?.axelarTransactionHash) {
    return false;
  }

  const referenceTimestamp =
    (confirm?.block_timestamp ?? call?.block_timestamp ?? 0) * 1000;
  return timeDiff(referenceTimestamp) >= 60;
}

function resolveExecuteTitle(context: ExecuteResolutionContext): string {
  if (hasSuccessfulExecution(context)) {
    return 'Executed';
  }

  if (context.errored) {
    return 'Error';
  }

  if (shouldWaitForIbc(context)) {
    return 'Waiting for IBC';
  }

  return 'Execute';
}

function resolveExecuteStatus(
  context: ExecuteResolutionContext
): 'success' | 'failed' | 'pending' {
  if (hasSuccessfulExecution(context)) {
    return 'success';
  }

  if (context.errored) {
    return 'failed';
  }

  return 'pending';
}

export function getGMPSteps(
  data: GMPMessage | undefined,
  chains: ChainMetadata[] | undefined
): GMPStep[] {
  if (!data) {
    return [];
  }

  const {
    call,
    gas_paid,
    gas_paid_to_callback,
    express_executed,
    confirm,
    confirm_failed,
    confirm_failed_event,
    approved,
    executed,
    error,
    refunded,
    is_executed,
    is_invalid_call,
    originData,
  } = { ...data };

  const sourceChain = call?.chain;
  const destinationChain = call?.returnValues?.destinationChain;

  const sourceChainData = getChainData(sourceChain, chains);
  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);
  const callbackGasChainData =
    getChainData(originData?.call?.chain, chains) || destinationChainData;

  const errored =
    !!error &&
    timeDiff(
      ((error?.block_timestamp ||
        approved?.block_timestamp ||
        confirm?.block_timestamp) ??
        0) * 1000
    ) > 120;

  const steps: GMPStep[] = [];

  const addStep = (step?: GMPStep | false) => {
    if (step) {
      steps.push(step);
    }
  };

  addStep(
    buildStep(
      'send',
      call ? 'Sent' : 'Send',
      call ? 'success' : 'pending',
      call,
      sourceChainData
    )
  );

  if (!call?.proposal_id || gas_paid || gas_paid_to_callback) {
    const payGasData = (gas_paid || gas_paid_to_callback) as
      | GMPEventLog
      | string
      | undefined;
    const hasGasPayment = Boolean(gas_paid || gas_paid_to_callback);
    const payGasTitle = resolvePayGasTitle(call, hasGasPayment);
    const payGasStatus = hasGasPayment ? 'success' : 'pending';

    addStep(
      buildStep(
        'pay_gas',
        payGasTitle,
        payGasStatus,
        payGasData,
        !gas_paid && gas_paid_to_callback
          ? callbackGasChainData
          : sourceChainData
      )
    );
  }

  if (express_executed) {
    addStep(
      buildStep(
        'express',
        'Express Executed',
        'success',
        express_executed,
        destinationChainData
      )
    );
  }

  const shouldAddConfirmStep =
    !isAxelar(sourceChain) &&
    (confirm || !approved || !(executed || is_executed || error));

  if (shouldAddConfirmStep) {
    const confirmContext: ConfirmResolutionContext = {
      call,
      confirm,
      confirmFailed: confirm_failed,
      confirmFailedEvent: confirm_failed_event,
      approved,
      executed,
      isExecuted: is_executed,
      error,
      isInvalidCall: is_invalid_call,
      gasPaid: gas_paid,
      gasPaidToCallback: gas_paid_to_callback,
      expressExecuted: express_executed,
    };

    const confirmTitle = resolveConfirmTitle(confirmContext);
    const confirmStatus = resolveConfirmStatus(confirmContext);

    addStep(
      buildStep(
        'confirm',
        confirmTitle,
        confirmStatus,
        (confirm || confirm_failed_event) as GMPEventLog,
        axelarChainData
      )
    );
  }

  const shouldAddApproveStep =
    (['evm', 'vm'].includes(call?.destination_chain_type ?? '') ||
      (['evm', 'vm'].includes(call?.chain_type ?? '') &&
        isAxelar(destinationChain))) &&
    (approved || (!executed && !error));

  if (shouldAddApproveStep) {
    const approveTitle = resolveApproveTitle(
      call,
      confirm,
      confirm_failed_event,
      approved
    );

    addStep(
      buildStep(
        'approve',
        approveTitle,
        approved ? 'success' : 'pending',
        approved,
        destinationChainData
      )
    );
  }

  const executeContext: ExecuteResolutionContext = {
    executed,
    isExecuted: is_executed,
    error,
    errored,
    confirm,
    call,
  };

  const executeTitle = resolveExecuteTitle(executeContext);
  const executeStatus = resolveExecuteStatus(executeContext);

  addStep(
    buildStep(
      'execute',
      executeTitle,
      executeStatus,
      (executed || is_executed || error) as GMPEventLog | boolean | undefined,
      executed?.axelarTransactionHash && !executed.transactionHash
        ? axelarChainData
        : destinationChainData
    )
  );

  if (refunded?.receipt?.status) {
    addStep(
      buildStep(
        'refund',
        'Excess Gas Refunded',
        'success',
        refunded,
        sourceChainData
      )
    );
  }

  return steps;
}

export function getStep(
  data: GMPMessage | undefined,
  chains: ChainMetadata[] | null | undefined
): GMPStep[] {
  return getGMPSteps(data, chains ?? undefined);
}

function buildStep(
  id: string,
  title: string,
  status: string,
  data: GMPEventLog | boolean | string | null | undefined,
  chainData: ChainMetadata | undefined
): GMPStep {
  return {
    id,
    title,
    status,
    data,
    chainData,
  };
}

export function getDefaultGasLimit(chain?: string): number {
  const defaults: Record<string, number> = {
    ethereum: 400000,
    binance: 150000,
    polygon: 400000,
    'polygon-sepolia': 400000,
    avalanche: 500000,
    fantom: 400000,
    arbitrum: 1000000,
    'arbitrum-sepolia': 1000000,
    optimism: 400000,
    'optimism-sepolia': 400000,
    base: 400000,
    'base-sepolia': 400000,
    mantle: 3000000000,
    'mantle-sepolia': 3000000000,
    celo: 400000,
    kava: 400000,
    filecoin: 200000000,
    'filecoin-2': 200000000,
    linea: 400000,
    'linea-sepolia': 400000,
    centrifuge: 1000000,
    'centrifuge-2': 1000000,
    scroll: 500000,
    fraxtal: 400000,
    'xrpl-evm': 500000,
    'xrpl-evm-2': 7000000,
  };

  if (!chain) {
    return 700000;
  }

  const chainKeyCandidate = toCase(chain, 'lower');
  const chainKey =
    typeof chainKeyCandidate === 'string'
      ? chainKeyCandidate
      : String(chainKeyCandidate ?? '');

  return defaults[chainKey] ?? 700000;
}

/**
 * Check if adding gas is supported for the given chain
 */
/**
 * Check if a wallet is connected for the given chain
 */
export function isWalletConnectedForChain(
  targetChain: string | undefined,
  targetChainType: string | undefined,
  chainMetadataList: ChainMetadata[] | null,
  walletContext: WalletContext
): boolean {
  if (targetChainType === 'cosmos') {
    return Boolean(walletContext.cosmosWalletStore?.signer);
  }

  if (isNumber(getChainData(targetChain, chainMetadataList)?.chain_id)) {
    return Boolean(walletContext.signer);
  }

  if (!targetChain) return false;

  const normalizedChain = headString(targetChain);
  if (normalizedChain === 'sui') {
    return Boolean(walletContext.suiWalletStore?.address);
  }
  if (normalizedChain === 'stellar') {
    return Boolean(walletContext.stellarWalletStore?.address);
  }
  if (normalizedChain === 'xrpl') {
    return Boolean(walletContext.xrplWalletStore?.address);
  }

  return false;
}

/**
 * Check if the chain needs to be switched
 */
export function shouldSwitchChain(
  targetChainId: string | number | undefined,
  targetChainType: string | undefined,
  walletContext: WalletContext,
  evmChainId: number | null
): boolean {
  return (
    targetChainId !==
    (targetChainType === 'cosmos'
      ? walletContext.cosmosWalletStore?.chainId
      : isNumber(targetChainId)
        ? evmChainId
        : targetChainId)
  );
}
