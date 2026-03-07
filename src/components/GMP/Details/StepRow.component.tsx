import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

import { Copy } from '@/components/Copy';
import { ExplorerLink } from '@/components/ExplorerLink';
import { Tag } from '@/components/Tag';
import { TimeAgo } from '@/components/Time';
import { isNumber, numberFormat } from '@/lib/number';
import { isString, ellipse } from '@/lib/string';
import { toArray } from '@/lib/parser';
import type { Chain } from '@/types';

import { GMPEventLog, GMPMessage, GMPStep } from '../GMP.types';
import { detailsStyles } from './Details.styles';
import {
  getStepData,
  computeStepTxAndUrl,
  computeToAddress,
  computeGasAmount,
  getStepStatusClass,
} from './Details.utils';
import { TxHashCell } from './TxHashCell.component';
import { HeightCell } from './HeightCell.component';
import { AddressCell } from './AddressCell.component';
import { GasCell } from './GasCell.component';
import { ExecuteErrorInfo } from './ExecuteErrorInfo.component';

interface StepRowProps {
  step: GMPStep;
  index: number;
  data: GMPMessage;
  axelarChainData: Chain | undefined;
  destinationChainData: Chain | undefined;
}

export function StepRow({
  step,
  index,
  data,
  axelarChainData,
  destinationChainData,
}: StepRowProps) {
  const { fees } = data;

  const stepData = getStepData(step, data);
  const { stepTX, stepURL } = computeStepTxAndUrl(
    step,
    stepData,
    data,
    axelarChainData
  );
  const fromAddress = stepData?.transaction?.from;
  const toAddress = computeToAddress(step, stepData, data);
  const gasAmount = computeGasAmount(step, data);

  const {
    blockNumber,
    block_timestamp,
    created_at,
  } = stepData || {};

  const proposal_id = stepData?.proposal_id as string | undefined;
  const axelarBlockNumber = stepData?.axelarBlockNumber as
    | string
    | number
    | undefined;

  const { url, block_path, transaction_path } = {
    ...step.chainData?.explorer,
  };

  const stepMoreInfos = buildStepMoreInfos(
    step,
    stepData,
    data,
    axelarChainData
  );

  const stepMoreTransactions = buildStepMoreTransactions(
    step,
    stepData,
    data,
    url,
    transaction_path
  );

  return (
    <tr key={index} className={detailsStyles.row}>
      <td className={detailsStyles.cellStep}>
        <span className={detailsStyles.textMedium}>{step.title}</span>
      </td>
      <TxHashCell
        stepTX={stepTX}
        stepURL={stepURL}
        proposalId={proposal_id}
        chainId={step.chainData?.id}
        stepMoreInfos={stepMoreInfos}
        stepMoreTransactions={stepMoreTransactions}
      />
      <HeightCell
        blockNumber={blockNumber}
        axelarBlockNumber={axelarBlockNumber}
        url={url}
        blockPath={block_path}
        axelarChainData={axelarChainData}
      />
      <AddressCell
        fromAddress={fromAddress}
        toAddress={toAddress}
        step={step}
        stepData={stepData}
        destinationChainData={destinationChainData}
      />
      <td className={detailsStyles.tableCellNarrow}>
        {step.status && (
          <Tag
            className={clsx(
              detailsStyles.tag,
              getStepStatusClass(step.status)
            )}
          >
            {step.status}
          </Tag>
        )}
      </td>
      <GasCell gasAmount={gasAmount} fees={fees} data={data} />
      <td className={detailsStyles.tableCellEnd}>
        <TimeAgo
          timestamp={(block_timestamp ?? 0) * 1000 || created_at?.ms}
        />
      </td>
    </tr>
  );
}

// --- Imperative builders for stepMoreInfos / stepMoreTransactions ---

function buildStepMoreInfos(
  step: GMPStep,
  stepData: GMPEventLog | undefined,
  data: GMPMessage,
  axelarChainData: Chain | undefined
): React.ReactElement[] {
  const {
    transactionHash,
    logIndex,
    eventIndex,
    chain_type,
    confirmation_txhash,
    poll_id,
    axelarTransactionHash,
    returnValues,
    contract_address,
  } = stepData || {};

  const infos: React.ReactElement[] = [];

  if (step.id === 'confirm') {
    if (confirmation_txhash && poll_id) {
      infos.push(
        <Copy key={infos.length} size={16} value={poll_id}>
          <Link
            href={
              contract_address
                ? `/amplifier-poll/${contract_address}_${poll_id}`
                : `/evm-poll/${poll_id}`
            }
            target="_blank"
            className={detailsStyles.link}
          >
            Poll: {poll_id}
          </Link>
        </Copy>
      );
    }
    return infos;
  }

  // Default case (non-confirm steps)
  if (
    transactionHash &&
    axelarTransactionHash &&
    axelarChainData?.explorer?.url
  ) {
    infos.push(
      <div key={infos.length} className={detailsStyles.inlineRow}>
        <Copy size={16} value={axelarTransactionHash}>
          <Link
            href={`${axelarChainData.explorer.url}${axelarChainData.explorer.transaction_path!.replace('{tx}', axelarTransactionHash)}`}
            target="_blank"
            className={detailsStyles.link}
          >
            {['send', 'pay_gas'].includes(step.id)
              ? 'MessageReceived'
              : 'RouteMessage'}
          </Link>
        </Copy>
        <ExplorerLink
          value={axelarTransactionHash}
          chain={axelarChainData?.id}
          width={14}
          height={14}
        />
      </div>
    );
  }

  if (
    ['send', 'pay_gas', 'approve'].includes(step.id) &&
    chain_type === 'evm'
  ) {
    if (isNumber(logIndex)) {
      infos.push(
        <div key={infos.length} className={detailsStyles.inlineRow}>
          <span className={detailsStyles.inlineMuted}>LogIndex:</span>
          <ExplorerLink
            value={transactionHash}
            chain={step.chainData?.id}
            hasEventLog
            title={numberFormat(logIndex, '0,0')}
            iconOnly={false}
            width={14}
            height={14}
            containerClassName={detailsStyles.explorerLinkContainer}
            nonIconClassName={detailsStyles.explorerLinkText}
            className={detailsStyles.mediaAuto}
          />
        </div>
      );
    }

    if (step.id === 'send' && isNumber(eventIndex)) {
      infos.push(
        <div key={infos.length} className={detailsStyles.inlineRow}>
          <span className={detailsStyles.inlineMuted}>EventIndex:</span>
          <ExplorerLink
            value={transactionHash}
            chain={step.chainData?.id}
            hasEventLog
            title={numberFormat(eventIndex, '0,0')}
            iconOnly={false}
            width={14}
            height={14}
            containerClassName={detailsStyles.explorerLinkContainer}
            nonIconClassName={detailsStyles.explorerLinkText}
            className={detailsStyles.mediaAuto}
          />
        </div>
      );
    }
  }

  if (step.id === 'approve' && returnValues?.commandId) {
    infos.push(
      <Copy key={infos.length} size={16} value={returnValues.commandId}>
        {chain_type === 'vm' ? (
          <span className={detailsStyles.textXs}>Command ID</span>
        ) : (
          <Link
            href={`/evm-batches?commandId=${returnValues.commandId}`}
            target="_blank"
            className={detailsStyles.link}
          >
            Command ID
          </Link>
        )}
      </Copy>
    );
  }

  if (step.id === 'execute' && step.status === 'failed' && data.error) {
    infos.push(
      <ExecuteErrorInfo
        key={infos.length}
        data={data}
        axelarTransactionHash={axelarTransactionHash}
      />
    );
  }

  return infos;
}

function buildStepMoreTransactions(
  step: GMPStep,
  stepData: GMPEventLog | undefined,
  data: GMPMessage,
  url: string | undefined,
  transactionPath: string | undefined
): React.ReactElement[] {
  const transactions: React.ReactElement[] = [];

  const hasGasAddedTransactions =
    step.id === 'pay_gas' &&
    (isString(step.data)
      ? data.originData?.gas_added_transactions
      : data.gas_added_transactions);

  const hasRefundedTransactions =
    step.id === 'refund' && data.refunded_more_transactions;

  if (!hasGasAddedTransactions && !hasRefundedTransactions) {
    return transactions;
  }

  const rawTransactions =
    step.id === 'pay_gas'
      ? isString(step.data)
        ? data.originData?.gas_added_transactions
        : data.gas_added_transactions
      : data.refunded_more_transactions;

  for (const transaction of toArray(rawTransactions)) {
    const txHash =
      typeof transaction === 'object' &&
      transaction !== null &&
      'transactionHash' in transaction
        ? transaction.transactionHash
        : undefined;

    if (!txHash) continue;

    transactions.push(
      <div key={transactions.length} className={detailsStyles.inlineRow}>
        <Copy size={16} value={String(txHash)}>
          {url && transactionPath ? (
            <Link
              href={`${url}${transactionPath.replace('{tx}', String(txHash))}`}
              target="_blank"
              className={detailsStyles.link}
            >
              {ellipse(String(txHash))}
            </Link>
          ) : (
            ellipse(String(txHash))
          )}
        </Copy>
        <ExplorerLink
          value={String(txHash)}
          chain={step.chainData?.id}
          width={14}
          height={14}
          className={detailsStyles.mediaAuto}
        />
      </div>
    );
  }

  return transactions;
}
