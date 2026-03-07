'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { TimeAgo } from '@/components/Time';
import { ExplorerLink } from '@/components/ExplorerLink';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { ellipse } from '@/lib/string';
import { getStep, resolveBlockURL } from './Transfer.utils';
import type { DetailsProps, TransferStep } from './Transfer.types';
import * as styles from './Transfer.styles';

interface StepTxInfo {
  stepTX: string | undefined;
  stepURL: string | undefined;
  stepMoreInfos: React.ReactNode[];
}

function resolveStepTxInfo(
  step: TransferStep,
  axelarChainData: ReturnType<typeof getChainData>,
  destinationChainData: ReturnType<typeof getChainData>
): StepTxInfo {
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

  let stepTX: string | undefined;
  let stepURL: string | undefined;
  const stepMoreInfos: React.ReactNode[] = [];

  if (!url || !transaction_path) {
    return { stepTX, stepURL, stepMoreInfos };
  }

  switch (step.id) {
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

  return { stepTX, stepURL, stepMoreInfos };
}

export function Details({ data }: DetailsProps) {
  const chains = useChains();

  const { link, send, unwrap } = { ...data };

  const destinationChain = (
    send?.destination_chain ||
    unwrap?.destination_chain ||
    link?.destination_chain
  ) as string | undefined;
  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);

  const steps = getStep(data, chains);

  if (steps.length === 0) return null;

  const visibleSteps = steps.filter(
    (d: TransferStep) => d.status !== 'pending' || (d.id === 'ibc_send' && d.data)
  );

  return (
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
          {visibleSteps.map((d: TransferStep, i: number) => {
            const stepData = d.data;
            const height = stepData?.height;
            const blockNumber = stepData?.blockNumber;
            const block_timestamp = stepData?.block_timestamp;
            const received_at = stepData?.received_at;
            const created_at = stepData?.created_at;
            const { url, block_path } = { ...d.chainData?.explorer };

            const { stepTX, stepURL, stepMoreInfos } = resolveStepTxInfo(
              d,
              axelarChainData,
              destinationChainData
            );

            const blockValue = height ?? blockNumber;

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
                  {blockValue &&
                    (url && block_path ? (
                      <Link
                        href={resolveBlockURL(d, blockValue, axelarChainData)}
                        target="_blank"
                        className={styles.detailsTxLink}
                      >
                        <Number value={blockValue} />
                      </Link>
                    ) : (
                      <Number value={blockValue} />
                    ))}
                </td>
                <td className={styles.detailsTdDefault}>
                  {d.status && (
                    <Tag
                      className={clsx(
                        styles.tagFitCapitalize,
                        styles.getStatusTagClass(d.status)
                      )}
                    >
                      {d.status}
                    </Tag>
                  )}
                </td>
                <td className={styles.detailsTdTime}>
                  <TimeAgo
                    timestamp={
                      (block_timestamp && block_timestamp * 1000) ||
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
  );
}
