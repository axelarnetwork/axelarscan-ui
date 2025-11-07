// @ts-nocheck
import _ from 'lodash';
import clsx from 'clsx';
import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ExplorerLink } from '@/components/ExplorerLink';
import { useGlobalStore } from '@/components/Global';
import { Number } from '@/components/Number';
import { ChainProfile, Profile } from '@/components/Profile';
import { Tag } from '@/components/Tag';
import { TimeAgo } from '@/components/Time';
import { getChainData } from '@/lib/config';
import {
  isNumber,
  numberFormat,
  toNumber,
} from '@/lib/number';
import { split, toArray } from '@/lib/parser';
import {
  ellipse,
  headString,
  isString,
} from '@/lib/string';

import { getStep } from '../GMP.utils';
import { detailsStyles } from './Details.styles';
import { DetailsProps } from './Details.types';

import { MdKeyboardArrowRight } from 'react-icons/md';

export function Details({ data }: DetailsProps) {
  const { chains } = useGlobalStore();

  const { call, gas_paid, approved, refunded, fees, gas } = { ...data };

  const sourceChain = call?.chain;
  const destinationChain = approved?.chain || call?.returnValues?.destinationChain;

  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);

  const steps = getStep(data, chains);

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={detailsStyles.container}>
      {(data.originData || data.callbackData) && (
        <div className={detailsStyles.multiHopHeader}>
          <ChainProfile
            value={sourceChain}
            width={20}
            height={20}
            className="h-5"
            titleClassName="text-sm font-semibold"
          />
          <MdKeyboardArrowRight size={20} />
          <ChainProfile
            value={destinationChain}
            width={20}
            height={20}
            className="h-5"
            titleClassName="text-sm font-semibold"
          />
        </div>
      )}
      <table className={detailsStyles.table}>
        <thead className={detailsStyles.tableHead}>
          <tr className={detailsStyles.tableHeadRow}>
            <th scope="col" className={detailsStyles.cellStep}>
              Step
            </th>
            <th scope="col" className={detailsStyles.cellTx}>
              Tx Hash
            </th>
            <th scope="col" className={detailsStyles.cellDefault}>
              Height
            </th>
            <th scope="col" className={detailsStyles.cellDefault}>
              Address
            </th>
            <th scope="col" className={detailsStyles.cellDefault}>
              Status
            </th>
            <th scope="col" className={detailsStyles.cellDefault}>
              Gas
            </th>
            <th scope="col" className={detailsStyles.cellTime}>
              Time
            </th>
          </tr>
        </thead>
        <tbody className={detailsStyles.tableBody}>
          {steps
            .filter(step => step.status !== 'pending' || step.data?.axelarTransactionHash)
            .map((step, index) => {
              const {
                transactionHash,
                logIndex,
                eventIndex,
                chain_type,
                confirmation_txhash,
                poll_id,
                axelarTransactionHash,
                blockNumber,
                axelarBlockNumber,
                transaction,
                returnValues,
                contract_address,
                block_timestamp,
                created_at,
                proposal_id,
              } = {
                ...(step.id === 'pay_gas' && isString(step.data)
                  ? data.originData?.gas_paid
                  : step.data),
              };

              const { url, block_path, transaction_path } = {
                ...step.chainData?.explorer,
              };

              let stepTX;
              let stepURL;
              const stepMoreInfos: JSX.Element[] = [];
              const stepMoreTransactions: JSX.Element[] = [];

              switch (step.id) {
                case 'confirm':
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

                  if (confirmation_txhash && poll_id) {
                    stepMoreInfos.push(
                      <Copy key={stepMoreInfos.length} size={16} value={poll_id}>
                        <Link
                          href={
                            contract_address
                              ? `/amplifier-poll/${contract_address}_${poll_id}`
                              : `/evm-poll/${poll_id}`
                          }
                          target="_blank"
                          className="text-xs text-blue-600 underline dark:text-blue-500"
                        >
                          Poll: {poll_id}
                        </Link>
                      </Copy>
                    );
                  }
                  break;
                default:
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
                        stepURL = `${url}${block_path.replace('{block}', transactionHash)}`;
                      } else if (transaction_path) {
                        stepURL = `${url}${transaction_path.replace('{tx}', transactionHash)}`;
                      }
                    }
                  } else if (axelarTransactionHash && axelarChainData?.explorer?.url) {
                    stepTX = axelarTransactionHash;
                    stepURL = `${axelarChainData.explorer.url}${axelarChainData.explorer.transaction_path.replace('{tx}', axelarTransactionHash)}`;
                  }

                  if (
                    transactionHash &&
                    axelarTransactionHash &&
                    axelarChainData?.explorer?.url
                  ) {
                    stepMoreInfos.push(
                      <div key={stepMoreInfos.length} className="flex items-center gap-x-1">
                        <Copy size={16} value={axelarTransactionHash}>
                          <Link
                            href={`${axelarChainData.explorer.url}${axelarChainData.explorer.transaction_path.replace('{tx}', axelarTransactionHash)}`}
                            target="_blank"
                            className="text-xs text-blue-600 underline dark:text-blue-500"
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

                  if (['send', 'pay_gas', 'approve'].includes(step.id) && chain_type === 'evm') {
                    if (isNumber(logIndex)) {
                      stepMoreInfos.push(
                        <div key={stepMoreInfos.length} className="flex items-center gap-x-1">
                          <span className="text-xs text-zinc-700 dark:text-zinc-300">LogIndex:</span>
                          <ExplorerLink
                            value={transactionHash}
                            chain={step.chainData?.id}
                            hasEventLog
                            title={numberFormat(logIndex, '0,0')}
                            iconOnly={false}
                            width={14}
                            height={14}
                            containerClassName="!gap-x-1.5"
                            nonIconClassName="text-blue-600 dark:text-blue-500 text-xs"
                            className="h-auto"
                          />
                        </div>
                      );
                    }

                    if (step.id === 'send' && isNumber(eventIndex)) {
                      stepMoreInfos.push(
                        <div key={stepMoreInfos.length} className="flex items-center gap-x-1">
                          <span className="text-xs text-zinc-700 dark:text-zinc-300">EventIndex:</span>
                          <ExplorerLink
                            value={transactionHash}
                            chain={step.chainData?.id}
                            hasEventLog
                            title={numberFormat(eventIndex, '0,0')}
                            iconOnly={false}
                            width={14}
                            height={14}
                            containerClassName="!gap-x-1.5"
                            nonIconClassName="text-blue-600 dark:text-blue-500 text-xs"
                            className="h-auto"
                          />
                        </div>
                      );
                    }
                  }

                  if (step.id === 'approve' && returnValues?.commandId) {
                    stepMoreInfos.push(
                      <Copy key={stepMoreInfos.length} size={16} value={returnValues.commandId}>
                        {chain_type === 'vm' ? (
                          <span className="text-xs">Command ID</span>
                        ) : (
                          <Link
                            href={`/evm-batches?commandId=${returnValues.commandId}`}
                            target="_blank"
                            className="text-xs text-blue-600 underline dark:text-blue-500"
                          >
                            Command ID
                          </Link>
                        )}
                      </Copy>
                    );
                  }

                  if (step.id === 'execute' && step.status === 'failed' && data.error) {
                    const { error } = { ...data.error };
                    const message = error?.data?.message || error?.message;
                    const reason = error?.reason;
                    const code = error?.code;
                    const body = error?.body?.replaceAll('"""', '');

                    stepMoreInfos.push(
                      <div key={stepMoreInfos.length} className="flex w-64 flex-col gap-y-1">
                        {message && (!reason || !axelarTransactionHash) && (
                          <div className="whitespace-pre-wrap text-xs font-normal text-red-600 dark:text-red-500">
                            {ellipse(message, 256)}
                          </div>
                        )}
                        {reason && (
                          <div className="whitespace-pre-wrap text-xs font-medium text-red-600 dark:text-red-500">
                            Reason: {ellipse(reason, 256)}
                          </div>
                        )}
                        <div className="flex flex-col gap-y-4">
                          {code && (call.destination_chain_type === 'evm' ? (
                            <Link
                              href={
                                isNumber(code)
                                  ? 'https://docs.metamask.io/guide/ethereum-provider.html#errors'
                                  : `https://docs.ethers.io/v5/api/utils/logger/#errors-${
                                      isString(code)
                                        ? `-${split(code, { toCase: 'lower', delimiter: '_' }).join('-')}`
                                        : 'ethereum'
                                    }`
                              }
                              target="_blank"
                              className="flex h-6 w-fit items-center rounded-xl bg-zinc-50 px-2.5 py-1 text-2xs dark:bg-zinc-800"
                            >
                              {code}
                            </Link>
                          ) : (
                            <div className="flex h-6 w-fit items-center rounded-xl bg-zinc-50 px-2.5 py-1 text-2xs dark:bg-zinc-800">
                              {code}
                            </div>
                          ))}
                          {body && (
                            <div className="w-fit whitespace-pre-wrap break-all bg-zinc-50 p-2.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {ellipse(body, 256)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (
                    (step.id === 'pay_gas' &&
                      (isString(step.data)
                        ? data.originData?.gas_added_transactions
                        : data.gas_added_transactions)) ||
                    (step.id === 'refund' && data.refunded_more_transactions)
                  ) {
                    for (const { transactionHash: txHash } of toArray(
                      step.id === 'pay_gas'
                        ? isString(step.data)
                          ? data.originData.gas_added_transactions
                          : data.gas_added_transactions
                        : data.refunded_more_transactions
                    )) {
                      stepMoreTransactions.push(
                        <div key={stepMoreTransactions.length} className="flex items-center gap-x-1">
                          <Copy size={16} value={txHash}>
                            {url ? (
                              <Link
                                href={`${url}${transaction_path.replace('{tx}', txHash)}`}
                                target="_blank"
                                className="text-xs font-medium text-blue-600 dark:text-blue-500"
                              >
                                {ellipse(txHash)}
                              </Link>
                            ) : (
                              ellipse(txHash)
                            )}
                          </Copy>
                          <ExplorerLink
                            value={txHash}
                            chain={step.chainData?.id}
                            width={14}
                            height={14}
                            className="h-auto"
                          />
                        </div>
                      );
                    }
                  }
                  break;
              }

              const fromAddress = transaction?.from;
              let toAddress = contract_address;

              switch (step.id) {
                case 'send':
                  if (!toAddress && chain_type === 'cosmos') {
                    toAddress = returnValues?.sender;
                  }
                  break;
                case 'pay_gas':
                  if (!toAddress && chain_type === 'cosmos') {
                    toAddress = returnValues?.recipient;
                  }
                  break;
                case 'execute':
                  if (!toAddress && chain_type === 'cosmos') {
                    toAddress =
                      returnValues?.destinationContractAddress ||
                      returnValues?.receiver;
                  }
                  break;
                case 'refund':
                  toAddress = gas_paid?.returnValues?.refundAddress || toAddress;
                  break;
                default:
                  break;
              }

              let gasAmount: number | undefined;

              switch (step.id) {
                case 'pay_gas':
                  gasAmount = isString(step.data)
                    ? (step.data *
                        fees?.destination_native_token?.gas_price *
                        fees?.destination_native_token?.token_price?.usd) /
                      fees?.source_token?.token_price?.usd
                    : gas?.gas_paid_amount;
                  break;
                case 'express':
                  gasAmount = gas?.gas_express_amount;
                  break;
                case 'confirm':
                  gasAmount = fees?.source_confirm_fee;
                  break;
                case 'approve':
                  gasAmount = gas?.gas_approve_amount - fees?.source_confirm_fee;
                  break;
                case 'execute':
                  gasAmount = gas?.gas_execute_amount;
                  break;
                case 'refund':
                  gasAmount =
                    refunded?.amount +
                    _.sum(toArray(data.refunded_more_transactions).map(item => toNumber(item.amount)));
                  break;
                default:
                  break;
              }

              const gasElement = isNumber(gasAmount) && gasAmount >= 0 && (
                <Number
                  value={gasAmount}
                  format="0,0.000000"
                  suffix={` ${fees?.source_token?.symbol}`}
                  noTooltip
                  className="font-medium text-zinc-900 dark:text-zinc-100"
                />
              );

              const gasConvertedElement =
                data.originData?.fees?.source_token?.token_price?.usd > 0 &&
                gasElement && (
                  <Number
                    value={
                      (gasAmount * fees?.source_token?.token_price?.usd) /
                      data.originData.fees.source_token.token_price.usd
                    }
                    format="0,0.000000"
                    suffix={` ${data.originData.fees.source_token.symbol}`}
                    noTooltip
                    className="text-xs font-medium text-zinc-400 dark:text-zinc-500"
                  />
                );

              return (
                <tr key={index} className={detailsStyles.row}>
                  <td className={detailsStyles.cellStep}>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {step.title}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-left">
                    <div className={detailsStyles.columnStack}>
                      {stepTX && (
                        <div className="flex items-center gap-x-1">
                          <Copy value={stepTX}>
                            {stepURL ? (
                              <Link
                                href={stepURL}
                                target="_blank"
                                className="font-medium text-blue-600 dark:text-blue-500"
                              >
                                {ellipse(stepTX)}
                              </Link>
                            ) : (
                              ellipse(stepTX)
                            )}
                          </Copy>
                          {!proposal_id && (
                            <ExplorerLink value={stepTX} chain={step.chainData?.id} customURL={stepURL} />
                          )}
                        </div>
                      )}
                      {stepMoreInfos.length > 0 && (
                        <div className="flex items-start gap-x-3">{stepMoreInfos}</div>
                      )}
                      {stepMoreTransactions.length > 0 && (
                        <div className="flex flex-col gap-y-1.5">{stepMoreTransactions}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-left">
                    <div className={detailsStyles.columnStack}>
                      {toNumber(blockNumber) > 0 &&
                        (url && block_path ? (
                          <Link
                            href={`${url}${block_path.replace('{block}', blockNumber)}`}
                            target="_blank"
                            className="font-medium text-blue-600 dark:text-blue-500"
                          >
                            <Number value={blockNumber} />
                          </Link>
                        ) : (
                          <Number value={blockNumber} />
                        ))}
                      {axelarBlockNumber &&
                        (axelarChainData?.explorer?.url && axelarChainData.explorer.block_path ? (
                          <Link
                            href={`${axelarChainData.explorer.url}${axelarChainData.explorer.block_path.replace('{block}', axelarBlockNumber)}`}
                            target="_blank"
                            className="font-medium text-blue-600 dark:text-blue-500"
                          >
                            <Number value={axelarBlockNumber} />
                          </Link>
                        ) : (
                          <Number value={axelarBlockNumber} />
                        ))}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-left">
                    <div className={detailsStyles.columnStack}>
                      {fromAddress && (
                        <div className="flex items-center gap-x-4">
                          <span className={detailsStyles.cellLabel}>From:</span>
                          <Profile address={fromAddress} chain={step.chainData?.id} />
                        </div>
                      )}
                      {toAddress && (
                        <div className="flex items-center gap-x-4">
                          <span className={detailsStyles.cellLabel}>To:</span>
                          <Profile
                            address={toAddress}
                            chain={
                              step.data?.axelarTransactionHash
                                ? destinationChainData?.id
                                : step.chainData?.id
                            }
                            useContractLink={
                              step.id === 'execute' &&
                              ['stellar'].includes(
                                headString(
                                  step.data?.axelarTransactionHash
                                    ? destinationChainData?.id
                                    : step.chainData?.id
                                )
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-left">
                    {step.status && (
                      <Tag
                        className={clsx(
                          detailsStyles.tag,
                          step.status === 'success'
                            ? 'bg-green-600 dark:bg-green-500'
                            : step.status === 'failed'
                              ? 'bg-red-600 dark:bg-red-500'
                              : ''
                        )}
                      >
                        {step.status}
                      </Tag>
                    )}
                  </td>
                  <td className="px-3 py-4 text-left">
                    <div className={detailsStyles.columnStack}>
                      {gasElement}
                      {gasConvertedElement}
                    </div>
                  </td>
                  <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
                    <TimeAgo timestamp={block_timestamp * 1000 || created_at?.ms} />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}


