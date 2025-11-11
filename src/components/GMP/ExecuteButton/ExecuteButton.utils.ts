import { isAxelar } from '@/lib/chain';
import { parseError } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import { GMPMessage } from '../GMP.types';
import { ExecuteActionParams } from './ExecuteButton.types';

/**
 * Determines if the Execute button should be shown based on transaction state
 */
export function shouldShowExecuteButton(data: GMPMessage | null): boolean {
  if (!data?.call) return false;

  const { call, confirm, approved, executed, error } = data;

  // Check basic conditions
  const isVMDestination = call.destination_chain_type === 'vm';
  const isCosmosDestination = call.destination_chain_type === 'cosmos';
  const isAxelarDestination = isAxelar(call.returnValues?.destinationChain);
  const hasPayload = call.returnValues?.payload;

  if (isVMDestination) return false;
  if (isAxelarDestination) return false;
  if (!hasPayload) return false;

  // Check if approved/confirmed
  const isApproved = isCosmosDestination
    ? confirm || call.chain_type === 'cosmos'
    : approved;

  if (!isApproved) return false;

  // Check execution status
  const hasExecutedTxHash = executed?.transactionHash;
  const isSameAsErrorTx =
    hasExecutedTxHash &&
    error?.transactionHash &&
    equalsIgnoreCase(executed.transactionHash, error.transactionHash);

  if (hasExecutedTxHash && !isSameAsErrorTx) return false;
  if (data.is_executed) return false;

  // Check if enough time has passed or there's an error
  const relevantTimestamp = isCosmosDestination
    ? confirm?.block_timestamp
    : approved?.block_timestamp;
  const timestampToUse =
    (relevantTimestamp || call.block_timestamp || 0) * 1000;
  const minWaitTime = isCosmosDestination ? 300 : 120; // 5 min for cosmos, 2 min for evm
  const hasError = Boolean(error);
  const hasEnoughTimePassed = timeDiff(timestampToUse) >= minWaitTime;

  return hasError || hasEnoughTimePassed;
}

/**
 * Execute the execute action for a GMP transaction on EVM chains
 * This calls the execute method on the destination contract
 */
export async function executeExecute(
  params: ExecuteActionParams
): Promise<void> {
  const { data, sdk, provider, signer, setResponse, setProcessing, getData } =
    params;

  if (!data?.approved || !sdk || !signer) {
    return;
  }

  setProcessing(true);
  setResponse({ status: 'pending', message: 'Executing...' });

  try {
    const { transactionHash, logIndex } = { ...data.call };
    const gasLimitBuffer = '200000';

    if (!transactionHash) {
      throw new Error('Missing transaction hash for execute');
    }

    console.log('[execute request]', {
      transactionHash,
      logIndex,
      gasLimitBuffer,
    });

    const response = await sdk.execute(transactionHash, logIndex, {
      useWindowEthereum: true,
      provider: provider ?? undefined,
      gasLimitBuffer: Number(gasLimitBuffer),
    });

    console.log('[execute response]', response);

    const { success, error, transaction } = { ...response };

    setResponse({
      status: success && transaction ? 'success' : 'failed',
      message:
        parseError(error)?.message ||
        error ||
        (transaction
          ? 'Execute successful'
          : 'Error Execution. Please see the error on console.'),
      hash: transaction?.transactionHash,
      chain: data.approved.chain,
    });

    if (success && transaction) {
      getData();
    }
  } catch (error) {
    setResponse({ status: 'failed', ...parseError(error) });
  }

  setProcessing(false);
}
