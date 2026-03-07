'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { MdClose, MdCheck } from 'react-icons/md';
import { PiClock, PiWarningCircle } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Response } from '@/components/Response';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { TimeAgo, TimeSpent } from '@/components/Time';
import { ExplorerLink } from '@/components/ExplorerLink';
import { normalizeType } from '@/components/Transfers';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchTransfers } from '@/lib/api/token-transfer';
import { getChainData, getAssetData } from '@/lib/config';
import { toCase, split, toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';
import { isString, equalsIgnoreCase, ellipse, toTitle } from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import type { Chain } from '@/types';
import * as styles from './Transfer.styles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TransferData extends Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  link?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrap?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unwrap?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  erc20_transfer?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirm?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vote?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  command?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ibc_send?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axelar_transfer?: Record<string, any>;
  type?: string;
  transfer_id?: string;
  simplified_status?: string;
  time_spent?: { total?: number };
  status?: string;
  code?: number;
  message?: string;
}

interface TransferStep {
  id: string;
  title: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  chainData?: Chain;
}

export function getStep(data: TransferData, chains: Chain[] | null | undefined) {
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
      title: (
        type === 'wrap'
          ? wrap
          : type === 'erc20_transfer'
            ? erc20_transfer
            : send
      )
        ? 'Sent'
        : 'Send',
      status: (
        type === 'wrap'
          ? wrap
          : type === 'erc20_transfer'
            ? erc20_transfer
            : send
      )
        ? 'success'
        : 'pending',
      data:
        type === 'wrap'
          ? wrap
          : type === 'erc20_transfer'
            ? erc20_transfer
            : send,
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
      title: vote
        ? vote.success
          ? 'Confirmed'
          : 'Failed to Confirm'
        : confirm
          ? 'Confirming'
          : 'Confirm',
      status: vote ? (vote.success ? 'success' : 'failed') : 'pending',
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
        title:
          ibc_send?.ack_txhash ||
          (ibc_send?.recv_txhash && !ibc_send.failed_txhash)
            ? 'Received'
            : ibc_send?.failed_txhash
              ? 'Error'
              : 'Execute',
        status:
          ibc_send?.ack_txhash ||
          (ibc_send?.recv_txhash && !ibc_send.failed_txhash)
            ? 'success'
            : ibc_send?.failed_txhash
              ? 'failed'
              : 'pending',
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

function Info({ data, tx }: { data: TransferData; tx?: string }) {
  const chains = useChains();
  const assets = useAssets();

  const {
    link,
    send,
    wrap,
    unwrap,
    erc20_transfer,
    confirm,
    vote,
    command,
    type,
    simplified_status,
    time_spent,
  } = { ...data };
  const txhash = send?.txhash || tx;

  const sourceChain = send?.source_chain || link?.source_chain;
  const destinationChain =
    send?.destination_chain ||
    unwrap?.destination_chain ||
    link?.destination_chain;

  const senderAddress =
    wrap?.sender_address ||
    erc20_transfer?.sender_address ||
    send?.sender_address;
  const recipientAddress = unwrap?.recipient_address || link?.recipient_address;
  const depositAddress =
    wrap?.deposit_address ||
    unwrap?.deposit_address_link ||
    erc20_transfer?.deposit_address ||
    send?.recipient_address ||
    link?.deposit_address;

  const commandID = command?.command_id;
  const transferID =
    command?.transfer_id ||
    vote?.transfer_id ||
    confirm?.transfer_id ||
    data.transfer_id;

  const sourceChainData = getChainData(sourceChain, chains);
  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);
  const depositChainData = getChainData(
    depositAddress?.startsWith('axelar') ? 'axelarnet' : sourceChain,
    chains
  );

  const { url, transaction_path } = { ...sourceChainData?.explorer };

  // asset data
  const assetData = getAssetData(send?.denom, assets);

  const { addresses } = { ...assetData };
  let { symbol, image } = { ...(sourceChainData ? addresses?.[sourceChainData.id] : undefined) };

  if (!symbol) {
    symbol = assetData?.symbol || (send?.denom as string | undefined);
  }

  if (!image) {
    image = assetData?.image;
  }

  if (symbol) {
    switch (type) {
      case 'wrap':
        const WRAP_PREFIXES = ['w', 'axl'];
        const i = WRAP_PREFIXES.findIndex(
          (p: string) =>
            toCase(symbol!, 'lower').startsWith(p) &&
            !equalsIgnoreCase(p, symbol!)
        );

        if (i > -1) {
          symbol = symbol.substring(WRAP_PREFIXES[i].length);

          if (image) {
            image = split(image, { delimiter: '/' })
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

            image = `${image.startsWith('/') ? '' : '/'}${image}`;
          }
        }
        break;
      default:
        break;
    }
  }

  const steps = getStep(data, chains);

  return (
    <div className={styles.infoWrapper}>
      <div className={styles.infoHeaderPadding}>
        <h3 className={styles.infoTitle}>
          Transfer
        </h3>
        <div className={styles.infoSubtitle}>
          {txhash && (
            <div className={styles.infoTxHashRow}>
              <Copy value={txhash}>
                {url ? (
                  <Link
                    href={`${url}${transaction_path?.replace('{tx}', txhash)}`}
                    target="_blank"
                    className={styles.infoTxHashLink}
                  >
                    {ellipse(txhash)}
                  </Link>
                ) : (
                  ellipse(txhash)
                )}
              </Copy>
              <ExplorerLink value={txhash} chain={sourceChain} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.infoBorderTop}>
        <dl className={styles.infoDl}>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Type
            </dt>
            <dd className={styles.infoDd}>
              <Tag className={clsx(styles.tagFitCapitalize)}>
                {toTitle(normalizeType(type))}
              </Tag>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Status
            </dt>
            <dd className={styles.infoDd}>
              <div className={styles.statusFlexCol}>
                <nav
                  aria-label="Progress"
                  className={styles.statusNav}
                >
                  <ol role="list" className={styles.statusOl}>
                    {steps.map((d: TransferStep, i: number) => {
                      const {
                        txhash,
                        poll_id,
                        batch_id,
                        transactionHash,
                        recv_txhash,
                        ack_txhash,
                        failed_txhash,
                        tx_hash_unwrap,
                      } = { ...d.data };
                      const { url, transaction_path } = {
                        ...d.chainData?.explorer,
                      };

                      let stepURL: string | undefined;

                      if (url && transaction_path) {
                        switch (d.id) {
                          case 'link':
                          case 'send':
                          case 'wrap':
                          case 'erc20_transfer':
                          case 'confirm':
                          case 'axelar_transfer':
                            if (txhash) {
                              stepURL = `${url}${transaction_path.replace('{tx}', txhash)}`;
                            }
                            break;
                          case 'vote':
                            if (txhash) {
                              stepURL = `/tx/${txhash}`;
                            } else if (poll_id) {
                              stepURL = `/evm-poll/${poll_id}`;
                            }
                            break;
                          case 'command':
                            if (transactionHash) {
                              stepURL = `${url}${transaction_path.replace('{tx}', transactionHash)}`;
                            } else if (batch_id && destinationChainData) {
                              stepURL = `/evm-batch/${destinationChainData.id}/${batch_id}`;
                            }
                            break;
                          case 'ibc_send':
                            if (recv_txhash) {
                              stepURL = `${url}${transaction_path.replace('{tx}', recv_txhash)}`;
                            } else if (ack_txhash) {
                              stepURL = `${axelarChainData?.explorer?.url}${axelarChainData?.explorer?.transaction_path?.replace('{tx}', ack_txhash)}`;
                            } else if (failed_txhash) {
                              stepURL = `${url}${transaction_path.replace('{tx}', failed_txhash)}`;
                            }
                            break;
                          case 'unwrap':
                            if (tx_hash_unwrap) {
                              stepURL = `${url}${transaction_path.replace('{tx}', tx_hash_unwrap)}`;
                            }
                            break;
                          default:
                            break;
                        }
                      }

                      const element = (
                        <>
                          <div
                            className={clsx(
                              styles.stepCircleBase,
                              d.status === 'failed'
                                ? styles.stepCircleFailed
                                : styles.stepCircleSuccess
                            )}
                          >
                            {d.status === 'failed' ? (
                              <MdClose className={styles.stepIcon} />
                            ) : (
                              <MdCheck className={styles.stepIcon} />
                            )}
                          </div>
                          <span
                            className={clsx(
                              styles.stepLabelBase,
                              d.status === 'failed'
                                ? styles.stepLabelFailed
                                : styles.stepLabelSuccess,
                              d.title?.length <= 5 ? styles.shortLabelOffset : ''
                            )}
                          >
                            {d.title}
                          </span>
                        </>
                      );

                      return (
                        <li
                          key={d.id}
                          className={clsx(
                            styles.stepLiBase,
                            i !== steps.length - 1 ? styles.stepLiNotLast : ''
                          )}
                        >
                          {d.status === 'pending' ? (
                            <>
                              <div
                                className={styles.stepPendingInset}
                                aria-hidden="true"
                              >
                                <div className={styles.stepPendingBar} />
                              </div>
                              <div
                                className={clsx(
                                  styles.stepPendingCircleBase,
                                  steps[i - 1]?.status === 'pending'
                                    ? styles.stepPendingBorderInactive
                                    : styles.stepPendingBorderActive
                                )}
                                aria-current="step"
                              >
                                {steps[i - 1]?.status !== 'pending' && (
                                  <PiClock
                                    className={clsx(
                                      'h-5 w-5',
                                      steps[i - 1]?.status === 'pending'
                                        ? styles.stepPendingClockInactive
                                        : styles.stepPendingClockActive
                                    )}
                                  />
                                )}
                                <span
                                  className={clsx(
                                    styles.stepPendingLabelBase,
                                    steps[i - 1]?.status !== 'pending'
                                      ? styles.stepPendingLabelActive
                                      : styles.stepPendingLabelInactive,
                                    d.title?.length <= 5 ? styles.shortLabelOffset : ''
                                  )}
                                >
                                  {d.title}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className={styles.stepPendingInset}
                                aria-hidden="true"
                              >
                                <div
                                  className={clsx(
                                    styles.stepCompletedBarBase,
                                    d.status === 'failed'
                                      ? styles.stepCompletedBarFailed
                                      : styles.stepCompletedBarSuccess
                                  )}
                                />
                              </div>
                              {stepURL ? (
                                <Link href={stepURL} target="_blank">
                                  {element}
                                </Link>
                              ) : (
                                element
                              )}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </nav>
                {send?.insufficient_fee && (
                  <div className={styles.insufficientFeeRow}>
                    <PiWarningCircle size={16} />
                    <span className={styles.insufficientFeeText}>Insufficient Fee</span>
                  </div>
                )}
              </div>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Source Chain
            </dt>
            <dd className={styles.infoDd}>
              <ChainProfile value={sourceChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Destination Chain
            </dt>
            <dd className={styles.infoDd}>
              <ChainProfile value={destinationChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Asset
            </dt>
            <dd className={styles.infoDd}>
              <div className={styles.assetRow}>
                <Image src={image} alt="" width={24} height={24} />
                {isNumber(send?.amount) && assets ? (
                  <Number
                    value={
                      isString(send.amount)
                        ? formatUnits(send.amount as string, assetData?.decimals)
                        : send.amount as string | number
                    }
                    format="0,0.000000"
                    suffix={` ${symbol}`}
                    className={styles.assetValue}
                  />
                ) : (
                  <span className={styles.assetValue}>
                    {symbol}
                  </span>
                )}
              </div>
            </dd>
          </div>
          {isNumber(send?.fee) && assets && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>
                Transfer Fee
              </dt>
              <dd className={styles.infoDd}>
                <div className={styles.assetRow}>
                  <Image src={image} alt="" width={24} height={24} />
                  <Number
                    value={
                      isString(send.fee)
                        ? formatUnits(send.fee as string, assetData?.decimals)
                        : send.fee as string | number
                    }
                    format="0,0.000000"
                    suffix={` ${symbol}`}
                    className={styles.assetValue}
                  />
                </div>
              </dd>
            </div>
          )}
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Sender
            </dt>
            <dd className={styles.infoDd}>
              <Profile address={senderAddress} chain={sourceChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Recipient
            </dt>
            <dd className={styles.infoDd}>
              <Profile address={recipientAddress} chain={destinationChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              {type === 'send_token'
                ? 'Gateway'
                : ['wrap', 'unwrap', 'erc20_transfer'].includes(type ?? '')
                  ? 'Contract'
                  : 'Deposit Address'}
            </dt>
            <dd className={styles.infoDd}>
              <Profile
                address={depositAddress}
                chain={depositChainData?.id || sourceChain}
              />
            </dd>
          </div>
          {commandID && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>
                Command ID
              </dt>
              <dd className={styles.infoDd}>
                <Copy value={commandID}>
                  <span>{ellipse(commandID)}</span>
                </Copy>
              </dd>
            </div>
          )}
          {transferID && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>
                Transfer ID
              </dt>
              <dd className={styles.infoDd}>
                <Copy value={transferID}>
                  <span>{transferID}</span>
                </Copy>
              </dd>
            </div>
          )}
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Created
            </dt>
            <dd className={styles.infoDd}>
              {moment(send?.created_at?.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {(time_spent?.total ?? 0) > 0 &&
            ['received'].includes(simplified_status ?? '') && (
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>
                  Time Spent
                </dt>
                <dd className={styles.infoDd}>
                  <TimeSpent
                    fromTimestamp={0}
                    toTimestamp={time_spent!.total! * 1000}
                  />
                </dd>
              </div>
            )}
        </dl>
      </div>
    </div>
  );
}

function Details({ data }: { data: TransferData }) {
  const chains = useChains();

  const { link, send, unwrap } = { ...data };

  const destinationChain =
    send?.destination_chain ||
    unwrap?.destination_chain ||
    link?.destination_chain;
  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);

  const steps = getStep(data, chains);

  return (
    steps.length > 0 && (
      <div className={styles.detailsTableWrapper}>
        <table className={styles.detailsTable}>
          <thead className={styles.detailsThead}>
            <tr className={styles.detailsTheadTr}>
              <th scope="col" className={styles.detailsThStep}>
                Step
              </th>
              <th
                scope="col"
                className={styles.detailsThTxHash}
              >
                Tx Hash
              </th>
              <th scope="col" className={styles.detailsThDefault}>
                Height
              </th>
              <th scope="col" className={styles.detailsThDefault}>
                Status
              </th>
              <th scope="col" className={styles.detailsThTime}>
                Time
              </th>
            </tr>
          </thead>
          <tbody className={styles.detailsTbody}>
            {steps
              .filter(
                (d: TransferStep) => d.status !== 'pending' || (d.id === 'ibc_send' && d.data)
              )
              .map((d: TransferStep, i: number) => {
                const {
                  txhash,
                  poll_id,
                  batch_id,
                  transactionHash,
                  recv_txhash,
                  ack_txhash,
                  failed_txhash,
                  tx_hash_unwrap,
                  height,
                  blockNumber,
                  block_timestamp,
                  received_at,
                  created_at,
                } = { ...d.data };
                const { url, block_path, transaction_path } = {
                  ...d.chainData?.explorer,
                };

                let stepTX: string | undefined;
                let stepURL: string | undefined;
                const stepMoreInfos: React.ReactNode[] = [];

                if (url && transaction_path) {
                  switch (d.id) {
                    case 'link':
                    case 'send':
                    case 'wrap':
                    case 'erc20_transfer':
                    case 'confirm':
                    case 'axelar_transfer':
                      if (txhash) {
                        stepTX = txhash;
                        stepURL = `${url}${transaction_path.replace('{tx}', txhash)}`;
                      }
                      break;
                    case 'vote':
                      if (txhash) {
                        stepTX = txhash;
                        stepURL = `/tx/${txhash}`;
                      } else if (poll_id) {
                        stepTX = poll_id;
                        stepURL = `/evm-poll/${poll_id}`;
                      }
                      break;
                    case 'command':
                      if (transactionHash) {
                        stepTX = transactionHash;
                        stepURL = `${url}${transaction_path.replace('{tx}', transactionHash)}`;
                      }

                      if (batch_id && destinationChainData) {
                        if (!stepTX) {
                          stepTX = batch_id;
                        }

                        if (!stepURL) {
                          stepURL = `/evm-batch/${destinationChainData.id}/${batch_id}`;
                        }

                        if (transactionHash) {
                          stepMoreInfos.push(
                            <Copy
                              key={stepMoreInfos.length}
                              size={16}
                              value={batch_id}
                            >
                              <Link
                                href={`/evm-batch/${destinationChainData.id}/${batch_id}`}
                                target="_blank"
                                className={styles.detailsBatchLink}
                              >
                                Batch
                              </Link>
                            </Copy>
                          );
                        }
                      }
                      break;
                    case 'ibc_send':
                      if (recv_txhash) {
                        stepTX = recv_txhash;
                        stepURL = `${url}${transaction_path.replace('{tx}', recv_txhash)}`;
                      }

                      if (ack_txhash) {
                        if (!stepTX) {
                          stepTX = ack_txhash;
                        }

                        if (stepURL) {
                          stepURL = `${axelarChainData?.explorer?.url}${axelarChainData?.explorer?.transaction_path?.replace('{tx}', ack_txhash)}`;
                        }

                        if (recv_txhash) {
                          stepMoreInfos.push(
                            <Copy
                              key={stepMoreInfos.length}
                              size={16}
                              value={ack_txhash}
                            >
                              <Link
                                href={`${axelarChainData?.explorer?.url}${axelarChainData?.explorer?.transaction_path?.replace('{tx}', ack_txhash)}`}
                                target="_blank"
                                className={styles.detailsAckLink}
                              >
                                Acknowledgement
                              </Link>
                            </Copy>
                          );
                        }
                      }

                      if (failed_txhash) {
                        if (!stepTX) {
                          stepTX = failed_txhash;
                        }

                        if (!stepURL) {
                          stepURL = `${url}${transaction_path.replace('{tx}', failed_txhash)}`;
                        }

                        if (recv_txhash && !ack_txhash) {
                          stepMoreInfos.push(
                            <Copy
                              key={stepMoreInfos.length}
                              size={16}
                              value={failed_txhash}
                            >
                              <Link
                                href={`${url}${transaction_path.replace('{tx}', failed_txhash)}`}
                                target="_blank"
                                className={styles.detailsIbcFailedLink}
                              >
                                IBC Failed
                              </Link>
                            </Copy>
                          );
                        }
                      }

                      if (txhash) {
                        if (!stepTX) {
                          stepTX = txhash;
                        }

                        if (!stepURL) {
                          stepURL = `${url}${transaction_path.replace('{tx}', txhash)}`;
                        }

                        if (recv_txhash || ack_txhash || failed_txhash) {
                          stepMoreInfos.push(
                            <Copy
                              key={stepMoreInfos.length}
                              size={16}
                              value={txhash}
                            >
                              <Link
                                href={`${axelarChainData?.explorer?.url}${axelarChainData?.explorer?.transaction_path?.replace('{tx}', txhash)}`}
                                target="_blank"
                                className={styles.detailsIbcSendLink}
                              >
                                IBC Send
                              </Link>
                            </Copy>
                          );
                        }
                      }
                      break;
                    case 'unwrap':
                      if (tx_hash_unwrap) {
                        stepTX = tx_hash_unwrap;
                        stepURL = `${url}${transaction_path.replace('{tx}', tx_hash_unwrap)}`;
                      }
                      break;
                    default:
                      break;
                  }
                }

                return (
                  <tr
                    key={i}
                    className={styles.detailsTr}
                  >
                    <td className={styles.detailsTdStep}>
                      <span className={styles.detailsTdStepText}>
                        {d.title}
                      </span>
                    </td>
                    <td className={styles.detailsTdDefault}>
                      <div className={styles.detailsTxFlexCol}>
                        {stepTX && (
                          <div className={styles.detailsTxRow}>
                            <Copy value={stepTX}>
                              <Link
                                href={stepURL!}
                                target="_blank"
                                className={styles.detailsTxLink}
                              >
                                {ellipse(stepTX)}
                              </Link>
                            </Copy>
                            <ExplorerLink
                              value={stepTX}
                              chain={d.chainData?.id}
                              customURL={stepURL}
                            />
                          </div>
                        )}
                        {stepMoreInfos.length > 0 && (
                          <div className={styles.detailsMoreInfos}>
                            {stepMoreInfos}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.detailsTdDefault}>
                      {(height || blockNumber) &&
                        (url && block_path ? (
                          <Link
                            href={`${height && d.id === 'ibc_send' ? axelarChainData?.explorer?.url : url}${(height && d.id === 'ibc_send' ? axelarChainData?.explorer?.block_path : block_path)?.replace('{block}', height || blockNumber)}`}
                            target="_blank"
                            className={styles.detailsTxLink}
                          >
                            <Number value={height || blockNumber} />
                          </Link>
                        ) : (
                          <Number value={height || blockNumber} />
                        ))}
                    </td>
                    <td className={styles.detailsTdDefault}>
                      {d.status && (
                        <Tag
                          className={clsx(
                            styles.tagFitCapitalize,
                            ['success'].includes(d.status)
                              ? styles.detailsTagSuccess
                              : ['failed'].includes(d.status)
                                ? styles.detailsTagFailed
                                : ''
                          )}
                        >
                          {d.status}
                        </Tag>
                      )}
                    </td>
                    <td className={styles.detailsTdTime}>
                      <TimeAgo
                        timestamp={
                          block_timestamp * 1000 ||
                          received_at?.ms ||
                          created_at?.ms
                        }
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    )
  );
}

export function Transfer({ tx, lite }: { tx?: string; lite?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<TransferData | null>(null);
  const [ended, setEnded] = useState<boolean | null>(null);

  useEffect(() => {
    const getData = async () => {
      const { transferId } = { ...getParams(searchParams) } as Record<string, string>;

      if (tx) {
        if (!ended) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = { ...(await searchTransfers({ txHash: tx })) as any } as { data?: TransferData[] };
          const d = data?.[0];

          if (d) {
            if (['received', 'failed'].includes(d.simplified_status ?? '')) {
              setEnded(true);
            }

            console.log('[data]', d);
            setData(d);
          } else {
            setData({
              status: 'errorOnGetData',
              code: 404,
              message: `Transaction: ${tx} not found`,
            });
          }
        }
      } else if (transferId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = { ...(await searchTransfers({ transferId })) as any } as { data?: TransferData[] };
        const d = data?.[0];

        if (d) {
          if (d.send?.txhash) {
            router.push(`/transfer/${d.send.txhash}`);
          } else {
            setData(d);
          }
        } else {
          setData({
            status: 'errorOnGetData',
            code: 404,
            message: `Transfer ID: ${transferId} not found`,
          });
        }
      }
    };

    getData();

    const interval = !ended && setInterval(() => getData(), 0.5 * 60 * 1000);
    return () => clearInterval(interval as ReturnType<typeof setInterval>);
  }, [tx, router, searchParams, setData, ended, setEnded]);

  return (
    <Container className={styles.transferContainer}>
      {!data ? (
        <Spinner />
      ) : data.status === 'errorOnGetData' ? (
        <Response data={data} />
      ) : (
        <div className={styles.transferContent}>
          <Info data={data} tx={tx} />
          {!lite && <Details data={data} />}
        </div>
      )}
    </Container>
  );
}
