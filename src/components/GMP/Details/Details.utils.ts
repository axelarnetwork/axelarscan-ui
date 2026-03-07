import React from 'react';

import { GMPEventLog, GMPMessage, GMPStep } from '../GMP.types';
import { isNumber, toNumber } from '@/lib/number';
import { isString } from '@/lib/string';
import { toArray } from '@/lib/parser';
import type { Chain } from '@/types';

interface StepExplorerPaths {
  url?: string;
  block_path?: string;
  transaction_path?: string;
}

export interface StepComputedData {
  stepData: GMPEventLog | undefined;
  stepTX: string | number | undefined;
  stepURL: string | undefined;
  stepMoreInfos: React.ReactElement[];
  stepMoreTransactions: React.ReactElement[];
  fromAddress: string | undefined;
  toAddress: string | undefined;
  gasAmount: number | undefined;
  explorer: StepExplorerPaths;
}

export function getStepData(
  step: GMPStep,
  data: GMPMessage
): GMPEventLog | undefined {
  if (step.id === 'pay_gas' && isString(step.data)) {
    return typeof data.originData?.gas_paid === 'object'
      ? (data.originData.gas_paid as GMPEventLog)
      : undefined;
  }

  if (
    typeof step.data === 'object' &&
    step.data !== null &&
    !Array.isArray(step.data)
  ) {
    return step.data as GMPEventLog;
  }

  return undefined;
}

export function computeStepTxAndUrl(
  step: GMPStep,
  stepData: GMPEventLog | undefined,
  data: GMPMessage,
  axelarChainData: Chain | undefined
): { stepTX: string | number | undefined; stepURL: string | undefined } {
  const {
    transactionHash,
    confirmation_txhash,
    poll_id,
    axelarTransactionHash,
    blockNumber,
    returnValues,
    contract_address,
    proposal_id,
  } = stepData || {};

  const { url, block_path, transaction_path } = {
    ...step.chainData?.explorer,
  };

  let stepTX: string | number | undefined;
  let stepURL: string | undefined;

  if (step.id === 'confirm') {
    if (confirmation_txhash) {
      stepTX = confirmation_txhash;
      stepURL = `/tx/${confirmation_txhash}`;
    } else if (contract_address && poll_id) {
      stepTX = poll_id;
      stepURL = `/amplifier-poll/${contract_address}_${poll_id}`;
    } else if (poll_id) {
      stepTX = poll_id;
      stepURL = `/evm-poll/${poll_id}`;
    }
  } else {
    if (proposal_id) {
      stepTX = returnValues?.messageId || transactionHash;
      stepURL = `/proposal/${proposal_id}`;
    } else if (transactionHash) {
      stepTX = transactionHash;

      if (url) {
        if (
          block_path &&
          isNumber(transactionHash) &&
          isNumber(blockNumber) &&
          toNumber(transactionHash) === toNumber(blockNumber)
        ) {
          stepURL = `${url}${block_path.replace('{block}', String(transactionHash))}`;
        } else if (transaction_path && transactionHash) {
          stepURL = `${url}${transaction_path.replace('{tx}', String(transactionHash))}`;
        }
      }
    } else if (
      axelarTransactionHash &&
      axelarChainData?.explorer?.url
    ) {
      stepTX = axelarTransactionHash;
      stepURL = `${axelarChainData.explorer.url}${axelarChainData.explorer.transaction_path!.replace('{tx}', axelarTransactionHash)}`;
    }
  }

  return { stepTX, stepURL };
}

export function computeToAddress(
  step: GMPStep,
  stepData: GMPEventLog | undefined,
  data: GMPMessage
): string | undefined {
  const { chain_type, returnValues, contract_address } = stepData || {};
  const { gas_paid } = data;

  let toAddress: string | undefined =
    typeof contract_address === 'string' ? contract_address : undefined;

  switch (step.id) {
    case 'send':
      if (!toAddress && chain_type === 'cosmos') {
        toAddress = returnValues?.sender;
      }
      break;
    case 'pay_gas':
      if (!toAddress && chain_type === 'cosmos') {
        const recipient = returnValues?.recipient;
        toAddress = typeof recipient === 'string' ? recipient : undefined;
      }
      break;
    case 'execute':
      if (!toAddress && chain_type === 'cosmos') {
        const destAddress =
          returnValues?.destinationContractAddress || returnValues?.receiver;
        toAddress = typeof destAddress === 'string' ? destAddress : undefined;
      }
      break;
    case 'refund': {
      const refundAddress =
        typeof gas_paid === 'object' &&
        gas_paid !== null &&
        'returnValues' in gas_paid
          ? gas_paid.returnValues?.refundAddress
          : undefined;
      toAddress =
        (typeof refundAddress === 'string' ? refundAddress : undefined) ||
        toAddress;
      break;
    }
    default:
      break;
  }

  return toAddress;
}

import _ from 'lodash';

export function computeGasAmount(
  step: GMPStep,
  data: GMPMessage
): number | undefined {
  const { fees, gas, refunded } = data;

  switch (step.id) {
    case 'pay_gas':
      if (isString(step.data)) {
        const dataValue = Number(step.data);
        const destGasPrice =
          fees?.destination_native_token?.gas_price ?? 0;
        const destTokenPrice =
          fees?.destination_native_token?.token_price?.usd ?? 0;
        const srcTokenPrice = fees?.source_token?.token_price?.usd;
        // Allow division by undefined to result in NaN, matching original behavior
        return srcTokenPrice
          ? (dataValue * destGasPrice * destTokenPrice) / srcTokenPrice
          : NaN;
      }
      return gas?.gas_paid_amount;
    case 'express':
      return gas?.gas_express_amount;
    case 'confirm':
      return fees?.source_confirm_fee;
    case 'approve':
      return (gas?.gas_approve_amount ?? 0) - (fees?.source_confirm_fee ?? 0);
    case 'execute':
      return gas?.gas_execute_amount;
    case 'refund': {
      const refundedAmount =
        typeof refunded?.amount === 'number' ? refunded.amount : 0;
      const moreRefunds = _.sum(
        toArray(data.refunded_more_transactions)
          .filter(
            (item): item is GMPEventLog =>
              typeof item === 'object' && item !== null
          )
          .map(item => toNumber(item.amount))
      );
      return refundedAmount + moreRefunds;
    }
    default:
      return undefined;
  }
}

export function getStepStatusClass(status?: string): string {
  if (status === 'success') {
    return 'bg-green-600 dark:bg-green-500';
  }

  if (status === 'failed') {
    return 'bg-red-600 dark:bg-red-500';
  }

  return '';
}
