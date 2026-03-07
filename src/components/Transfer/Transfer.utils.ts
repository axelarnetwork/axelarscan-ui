import { getChainData } from '@/lib/config';
import { toArray, toCase, split } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import type { Chain } from '@/types';
import type { TransferData, TransferStep } from './Transfer.types';

function getSendData(
  type: string | undefined,
  wrap: TransferData['wrap'],
  erc20_transfer: TransferData['erc20_transfer'],
  send: TransferData['send']
) {
  if (type === 'wrap') return wrap;
  if (type === 'erc20_transfer') return erc20_transfer;
  return send;
}

function getVoteStatus(vote: TransferData['vote']): string {
  if (!vote) return 'pending';
  return vote.success ? 'success' : 'failed';
}

function getVoteTitle(vote: TransferData['vote'], confirm: TransferData['confirm']): string {
  if (!vote) return confirm ? 'Confirming' : 'Confirm';
  return vote.success ? 'Confirmed' : 'Failed to Confirm';
}

function getIbcSendTitle(ibc_send: TransferData['ibc_send']): string {
  if (
    ibc_send?.ack_txhash ||
    (ibc_send?.recv_txhash && !ibc_send.failed_txhash)
  ) {
    return 'Received';
  }
  if (ibc_send?.failed_txhash) return 'Error';
  return 'Execute';
}

function getIbcSendStatus(ibc_send: TransferData['ibc_send']): string {
  if (
    ibc_send?.ack_txhash ||
    (ibc_send?.recv_txhash && !ibc_send.failed_txhash)
  ) {
    return 'success';
  }
  if (ibc_send?.failed_txhash) return 'failed';
  return 'pending';
}

export function getStep(data: TransferData, chains: Chain[] | null | undefined): TransferStep[] {
  const {
    link,
    send,
    wrap,
    unwrap,
    erc20_transfer,
    confirm,
    vote,
    command,
    ibc_send,
    axelar_transfer,
    type,
  } = { ...data };

  const sourceChain = (send?.source_chain || link?.source_chain) as string | undefined;
  const destinationChain = (
    send?.destination_chain ||
    unwrap?.destination_chain ||
    link?.destination_chain
  ) as string | undefined;

  const sourceChainData = getChainData(sourceChain, chains);
  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);

  const relevantSendData = getSendData(type, wrap, erc20_transfer, send);

  return toArray([
    type === 'deposit_address' &&
      link && {
        id: 'link',
        title: 'Linked',
        status: 'success',
        data: link,
        chainData: axelarChainData,
      },
    {
      id: 'send',
      title: relevantSendData ? 'Sent' : 'Send',
      status: relevantSendData ? 'success' : 'pending',
      data: relevantSendData,
      chainData: sourceChainData,
    },
    type === 'wrap' && {
      id: 'wrap',
      title: send ? 'Wrapped' : 'Wrap',
      status: send ? 'success' : 'pending',
      data: send,
      chainData: sourceChainData,
    },
    type === 'erc20_transfer' && {
      id: 'erc20_transfer',
      title: send ? 'ERC20 Transferred' : 'ERC20 Transfer',
      status: send ? 'success' : 'pending',
      data: send,
      chainData: sourceChainData,
    },
    !['send_token', 'wrap', 'erc20_transfer'].includes(type ?? '') && {
      id: 'confirm',
      title: confirm
        ? 'Deposit Confirmed'
        : sourceChainData?.chain_type === 'evm'
          ? 'Waiting for Finality'
          : 'Confirm Deposit',
      status: confirm ? 'success' : 'pending',
      data: confirm,
      chainData: axelarChainData,
    },
    sourceChainData?.chain_type === 'evm' && {
      id: 'vote',
      title: getVoteTitle(vote, confirm),
      status: getVoteStatus(vote),
      data: vote,
      chainData: axelarChainData,
    },
    destinationChainData?.chain_type === 'evm' && {
      id: 'command',
      title:
        command?.executed || command?.transactionHash ? 'Received' : 'Approve',
      status:
        command?.executed || command?.transactionHash ? 'success' : 'pending',
      data: command,
      chainData: command?.transactionHash
        ? destinationChainData
        : axelarChainData,
    },
    destinationChainData?.chain_type === 'cosmos' &&
      destinationChainData.id !== 'axelarnet' && {
        id: 'ibc_send',
        title: getIbcSendTitle(ibc_send),
        status: getIbcSendStatus(ibc_send),
        data: ibc_send,
        chainData: ibc_send?.recv_txhash
          ? destinationChainData
          : axelarChainData,
      },
    destinationChainData?.id === 'axelarnet' && {
      id: 'axelar_transfer',
      title: axelar_transfer ? 'Received' : 'Execute',
      status: axelar_transfer ? 'success' : 'pending',
      data: axelar_transfer,
      chainData: axelarChainData,
    },
    type === 'unwrap' && {
      id: 'unwrap',
      title: unwrap?.tx_hash_unwrap ? 'Unwrapped' : 'Unwrap',
      status: unwrap?.tx_hash_unwrap ? 'success' : 'pending',
      data: unwrap,
      chainData: destinationChainData,
    },
  ]) as TransferStep[];
}

// ─── Utilities from Transfer.component.tsx ────────────────────

export function isTerminalStatus(status?: string): boolean {
  return ['received', 'failed'].includes(status ?? '');
}

export function makeErrorData(message: string): TransferData {
  return {
    status: 'errorOnGetData',
    code: 404,
    message,
  };
}

// ─── Utilities from Info.component.tsx ─────────────────────────

export function getDepositAddressLabel(type?: string): string {
  if (type === 'send_token') return 'Gateway';
  if (['wrap', 'unwrap', 'erc20_transfer'].includes(type ?? '')) return 'Contract';
  return 'Deposit Address';
}

export function resolveSymbolAndImage(
  symbol: string | undefined,
  image: string | undefined,
  type?: string
): { symbol: string | undefined; image: string | undefined } {
  if (!symbol || type !== 'wrap') {
    return { symbol, image };
  }

  const WRAP_PREFIXES = ['w', 'axl'];
  const prefixIndex = WRAP_PREFIXES.findIndex(
    (p: string) =>
      toCase(symbol, 'lower').startsWith(p) &&
      !equalsIgnoreCase(p, symbol)
  );

  if (prefixIndex < 0) {
    return { symbol, image };
  }

  const unwrappedSymbol = symbol.substring(WRAP_PREFIXES[prefixIndex].length);
  let unwrappedImage = image;

  if (unwrappedImage) {
    unwrappedImage = split(unwrappedImage, { delimiter: '/' })
      .map((s: string) => {
        if (s?.includes('.')) {
          const i = WRAP_PREFIXES.findIndex((p: string) =>
            toCase(s, 'lower').startsWith(p)
          );
          if (i > -1) {
            s = s.substring(WRAP_PREFIXES[i].length);
          }
        }
        return s;
      })
      .join('/');

    unwrappedImage = `${unwrappedImage.startsWith('/') ? '' : '/'}${unwrappedImage}`;
  }

  return { symbol: unwrappedSymbol, image: unwrappedImage };
}

export function resolveStepURL(
  step: TransferStep,
  axelarChainData: ReturnType<typeof getChainData>,
  destinationChainData: ReturnType<typeof getChainData>
): string | undefined {
  const stepData = step.data;
  const txhash = stepData?.txhash;
  const poll_id = stepData?.poll_id;
  const batch_id = stepData?.batch_id;
  const transactionHash = stepData?.transactionHash;
  const recv_txhash = stepData?.recv_txhash;
  const ack_txhash = stepData?.ack_txhash;
  const failed_txhash = stepData?.failed_txhash;
  const tx_hash_unwrap = stepData?.tx_hash_unwrap;
  const { url, transaction_path } = { ...step.chainData?.explorer };

  if (!url || !transaction_path) return undefined;

  switch (step.id) {
    case 'link':
    case 'send':
    case 'wrap':
    case 'erc20_transfer':
    case 'confirm':
    case 'axelar_transfer':
      if (txhash) return `${url}${transaction_path.replace('{tx}', txhash)}`;
      break;
    case 'vote':
      if (txhash) return `/tx/${txhash}`;
      if (poll_id) return `/evm-poll/${poll_id}`;
      break;
    case 'command':
      if (transactionHash) return `${url}${transaction_path.replace('{tx}', transactionHash)}`;
      if (batch_id && destinationChainData) return `/evm-batch/${destinationChainData.id}/${batch_id}`;
      break;
    case 'ibc_send':
      if (recv_txhash) return `${url}${transaction_path.replace('{tx}', recv_txhash)}`;
      if (ack_txhash) return `${axelarChainData?.explorer?.url}${axelarChainData?.explorer?.transaction_path?.replace('{tx}', ack_txhash)}`;
      if (failed_txhash) return `${url}${transaction_path.replace('{tx}', failed_txhash)}`;
      break;
    case 'unwrap':
      if (tx_hash_unwrap) return `${url}${transaction_path.replace('{tx}', tx_hash_unwrap)}`;
      break;
    default:
      break;
  }

  return undefined;
}

// ─── Utilities from Details.component.tsx ──────────────────────

export function resolveBlockURL(
  step: TransferStep,
  blockValue: string | number,
  axelarChainData: ReturnType<typeof getChainData>
): string {
  const baseUrl = step.data?.height && step.id === 'ibc_send'
    ? axelarChainData?.explorer?.url
    : step.chainData?.explorer?.url;
  const blockPath = step.data?.height && step.id === 'ibc_send'
    ? axelarChainData?.explorer?.block_path
    : step.chainData?.explorer?.block_path;

  return `${baseUrl}${blockPath?.replace('{block}', String(blockValue))}`;
}
