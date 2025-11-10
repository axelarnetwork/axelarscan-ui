import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';
import { timeDiff } from '@/lib/time';
import { toCase } from '@/lib/parser';

import { ChainMetadata, GMPEventLog, GMPMessage, GMPStep } from './GMP.types';

export function isGMPMessage(value: unknown): value is GMPMessage {
  return typeof value === 'object' && value !== null;
}

export function getStep(
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

    addStep(
      buildStep(
        'pay_gas',
        gas_paid || gas_paid_to_callback
          ? 'Gas Paid'
          : timeDiff((call?.block_timestamp ?? 0) * 1000) < 30
            ? 'Checking Gas Paid'
            : 'Pay Gas',
        gas_paid || gas_paid_to_callback ? 'success' : 'pending',
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
    const confirmTitle =
      (confirm &&
        (call?.chain_type === 'cosmos' ||
          confirm?.poll_id !== confirm_failed_event?.poll_id)) ||
      approved ||
      executed ||
      is_executed ||
      error
        ? 'Confirmed'
        : is_invalid_call
          ? 'Invalid Call'
          : confirm_failed
            ? 'Failed to Confirm'
            : gas_paid || gas_paid_to_callback || express_executed
              ? 'Waiting for Finality'
              : 'Confirm';

    const confirmStatus =
      (confirm &&
        (call?.chain_type === 'cosmos' ||
          confirm?.poll_id !== confirm_failed_event?.poll_id)) ||
      approved ||
      executed ||
      is_executed ||
      error
        ? 'success'
        : is_invalid_call || confirm_failed
          ? 'failed'
          : 'pending';

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
    const approveTitle = approved
      ? 'Approved'
      : confirm &&
          (['cosmos', 'vm'].includes(call?.chain_type ?? '') ||
            confirm?.poll_id !== confirm_failed_event?.poll_id)
        ? 'Approving'
        : 'Approve';

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

  const executeTitle =
    (executed &&
      (!executed.axelarTransactionHash ||
        (executed.transactionHash && !error))) ||
    is_executed
      ? 'Executed'
      : errored
        ? 'Error'
        : executed?.axelarTransactionHash &&
            timeDiff(
              (confirm?.block_timestamp ?? call?.block_timestamp ?? 0) * 1000
            ) >= 60
          ? 'Waiting for IBC'
          : 'Execute';

  const executeStatus =
    (executed &&
      (!executed.axelarTransactionHash ||
        (executed.transactionHash && !error))) ||
    is_executed
      ? 'success'
      : errored
        ? 'failed'
        : 'pending';

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
