import { parseError } from '@/lib/parser';

import { ExecuteActionParams } from './ExecuteButton.types';

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
