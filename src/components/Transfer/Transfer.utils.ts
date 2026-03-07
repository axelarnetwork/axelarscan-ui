import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
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

  const sourceChain = send?.source_chain || link?.source_chain;
  const destinationChain =
    send?.destination_chain ||
    unwrap?.destination_chain ||
    link?.destination_chain;

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
