import type { GMPEventLog } from '../GMP.types';

interface ExplorerConfig {
  url?: string;
  block_path?: string;
  transaction_path?: string;
}

export function resolveStepURL(
  id: string,
  stepEventLog: GMPEventLog | undefined,
  explorer: ExplorerConfig | undefined
): string | undefined {
  if (!stepEventLog) return undefined;

  const {
    transactionHash,
    chain_type,
    confirmation_txhash,
    poll_id,
    axelarTransactionHash,
    blockNumber,
    contract_address,
  } = stepEventLog;

  const { url, block_path, transaction_path } = explorer ?? {};

  switch (id) {
    case 'confirm':
      return resolveConfirmURL(confirmation_txhash, contract_address, poll_id);
    case 'approve':
      return resolveApproveURL(transactionHash, url, transaction_path);
    case 'execute':
    case 'executed':
      return resolveExecuteURL(
        transactionHash,
        axelarTransactionHash,
        blockNumber,
        url,
        block_path,
        transaction_path
      );
    default:
      return resolveDefaultURL(
        id,
        stepEventLog,
        transactionHash,
        chain_type,
        blockNumber,
        url,
        block_path,
        transaction_path
      );
  }
}

function resolveConfirmURL(
  confirmation_txhash?: string,
  contract_address?: string,
  poll_id?: string
): string | undefined {
  if (confirmation_txhash) return `/tx/${confirmation_txhash}`;
  if (contract_address && poll_id)
    return `/amplifier-poll/${contract_address}_${poll_id}`;
  if (poll_id) return `/evm-poll/${poll_id}`;
  return undefined;
}

function resolveApproveURL(
  transactionHash?: string,
  url?: string,
  transaction_path?: string
): string | undefined {
  if (transactionHash && url) {
    return `${url}${transaction_path?.replace('{tx}', transactionHash)}`;
  }
  return undefined;
}

function resolveExecuteURL(
  transactionHash?: string,
  axelarTransactionHash?: string,
  blockNumber?: number,
  url?: string,
  block_path?: string,
  transaction_path?: string
): string | undefined {
  const hashToUse = transactionHash || axelarTransactionHash;
  if (!hashToUse) return undefined;

  if (
    block_path &&
    typeof transactionHash === 'number' &&
    typeof blockNumber === 'number' &&
    transactionHash === blockNumber
  ) {
    return `${url}${block_path.replace('{block}', String(transactionHash))}`;
  }

  if (transaction_path) {
    return `${url}${transaction_path.replace('{tx}', String(hashToUse))}`;
  }

  return undefined;
}

function resolveDefaultURL(
  id: string,
  stepEventLog: GMPEventLog,
  transactionHash?: string,
  chain_type?: string,
  blockNumber?: number,
  url?: string,
  block_path?: string,
  transaction_path?: string
): string | undefined {
  if (stepEventLog.proposal_id) {
    return `/proposal/${stepEventLog.proposal_id}`;
  }

  if (!transactionHash || !url) return undefined;

  if (id === 'send' && chain_type === 'cosmos') {
    return `${url}${transaction_path?.replace('{tx}', transactionHash)}`;
  }

  if (
    block_path &&
    typeof transactionHash === 'number' &&
    typeof blockNumber === 'number' &&
    transactionHash === blockNumber
  ) {
    return `${url}${block_path.replace('{block}', String(transactionHash))}`;
  }

  return `${url}${transaction_path?.replace('{tx}', transactionHash)}`;
}
