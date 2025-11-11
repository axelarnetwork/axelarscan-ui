'use client';

import { useSignAndExecuteTransaction as useSuiSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSignAndSubmitTransaction as useXRPLSignAndSubmitTransaction } from '@xrpl-wallet-standard/react';
import _ from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCheckCircleFill, PiXCircleFill } from 'react-icons/pi';

import { ExplorerLink } from '@/components/ExplorerLink';
import { customData } from '@/components/GMPs';
import { useGlobalStore } from '@/components/Global';
import { useCosmosWalletStore } from '@/components/Wallet/CosmosWallet.hooks';
import { useEVMWalletStore } from '@/components/Wallet/EVMWallet';
import { useStellarWalletStore } from '@/components/Wallet/StellarWallet';
import { useSuiWalletStore } from '@/components/Wallet/SuiWallet';
import { useXRPLWalletStore } from '@/components/Wallet/XRPLWallet';
import { searchGMP } from '@/lib/api/gmp';
import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';
import { isNumber } from '@/lib/number';
import { getParams } from '@/lib/operator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';

import { executeAddGas } from './AddGasButton/AddGasButton.utils';
import { executeApprove } from './ApproveButton/ApproveButton.utils';
import { Details } from './Details/Details';
import { executeExecute } from './ExecuteButton/ExecuteButton.utils';
import {
  useEstimatedGasUsed,
  useEstimatedTimeSpent,
  useExecuteData,
  useGMPRecoveryAPI,
} from './GMP.hooks';
import {
  GMPMessage,
  GMPProps,
  GMPRecoveryActions,
  GMPSettlementData,
  GMPToastState,
} from './GMP.types';
import { isGMPMessage } from './GMP.utils';
import { GMPContainer } from './GMPContainer';
import { Info } from './Info/Info';

const parseCustomData = async (
  value: unknown
): Promise<GMPMessage | undefined> => {
  const parsed = await customData(value);
  return isGMPMessage(parsed) ? parsed : undefined;
};

export function GMP({ tx, lite }: GMPProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<GMPMessage | null>(null);
  const [ended, setEnded] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [response, setResponse] = useState<GMPToastState | null>(null);
  const { chains, assets } = useGlobalStore();
  const { chainId, address, provider, signer } = useEVMWalletStore();
  const cosmosWalletStore = useCosmosWalletStore();
  const suiWalletStore = useSuiWalletStore();
  const stellarWalletStore = useStellarWalletStore();
  const xrplWalletStore = useXRPLWalletStore();
  const { mutateAsync: suiSignAndExecuteTransaction } =
    useSuiSignAndExecuteTransaction();
  const xrplSignAndSubmitTransaction = useXRPLSignAndSubmitTransaction();

  const estimatedTimeSpent = useEstimatedTimeSpent(data);
  const executeData = useExecuteData(data, chains, assets);
  const estimatedGasUsed = useEstimatedGasUsed(data);
  const sdk = useGMPRecoveryAPI();

  const getData = useCallback(async (): Promise<GMPMessage | undefined> => {
    const params = getParams(searchParams) as unknown as Record<
      string,
      unknown
    >;
    const commandId =
      typeof params.commandId === 'string' ? params.commandId : undefined;

    if (commandId) {
      const response = await searchGMP({ commandId });
      const parsed = await parseCustomData(response?.data?.[0]);

      if (parsed) {
        if (parsed.call?.transactionHash) {
          router.push(`/gmp/${parsed.call.transactionHash}`);
          return undefined;
        }

        setData(parsed);
        return parsed;
      }

      setData({
        status: 'errorOnGetData',
        code: 404,
        message: `Command ID: ${commandId} not found`,
      });

      return undefined;
    } else if (tx && !ended) {
      const response = await searchGMP(
        tx.includes('-') ? { messageId: tx } : { txHash: tx }
      );
      const parsedMessage = await parseCustomData(response?.data?.[0]);

      const isSecondHopOfInterchainTransfer = (
        message: GMPMessage
      ): boolean => {
        const destChain = message.interchain_transfer?.destinationChain;
        const callChain = message.call?.chain;
        return Boolean(destChain && callChain && destChain === callChain);
      };

      if (parsedMessage) {
        if (
          parsedMessage.call?.parentMessageID &&
          ((!parsedMessage.executed?.childMessageIDs &&
            isSecondHopOfInterchainTransfer(parsedMessage)) ||
            isAxelar(parsedMessage.call.chain))
        ) {
          const parentMessageId = parsedMessage.call.parentMessageID;
          if (parentMessageId && typeof parentMessageId === 'string') {
            router.push(`/gmp/${parentMessageId}`);
          }
        } else {
          if (
            parsedMessage.simplified_status &&
            ['received', 'failed'].includes(parsedMessage.simplified_status) &&
            (parsedMessage.executed || parsedMessage.error) &&
            (parsedMessage.refunded || parsedMessage.not_to_refund)
          ) {
            setEnded(true);
          }

          // callback
          if (parsedMessage.callback?.transactionHash) {
            const callbackTxHash = parsedMessage.callback.transactionHash;
            const { data } = {
              ...(await searchGMP({
                txHash: callbackTxHash,
                txIndex: parsedMessage.callback.transactionIndex,
                txLogIndex: parsedMessage.callback.logIndex,
              })),
            };

            parsedMessage.callbackData = toArray(data).find(callbackEntry =>
              equalsIgnoreCase(
                callbackEntry.call?.transactionHash,
                callbackTxHash
              )
            );
            parsedMessage.callbackData = await parseCustomData(
              parsedMessage.callbackData
            );
          } else if (parsedMessage.executed?.transactionHash) {
            const executedTxHash = parsedMessage.executed.transactionHash;
            const { data } = {
              ...(await searchGMP({
                txHash: executedTxHash,
              })),
            };

            parsedMessage.callbackData = toArray(data).find(callbackEntry =>
              equalsIgnoreCase(
                callbackEntry.call?.transactionHash,
                executedTxHash
              )
            );
            parsedMessage.callbackData = await parseCustomData(
              parsedMessage.callbackData
            );
          } else if (parsedMessage.callback?.messageIdHash) {
            const messageId = `${parsedMessage.callback.messageIdHash}-${parsedMessage.callback.messageIdIndex}`;
            const { data } = { ...(await searchGMP({ messageId })) };

            parsedMessage.callbackData = toArray(data).find(callbackEntry =>
              equalsIgnoreCase(
                callbackEntry.call?.returnValues?.messageId,
                messageId
              )
            );
            parsedMessage.callbackData = await parseCustomData(
              parsedMessage.callbackData
            );
          } else if (
            parsedMessage.executed?.childMessageIDs &&
            Array.isArray(parsedMessage.executed.childMessageIDs) &&
            parsedMessage.executed.childMessageIDs.length > 0
          ) {
            const childMessageId = parsedMessage.executed.childMessageIDs[0];
            const { data } = {
              ...(await searchGMP({
                messageId: childMessageId,
              })),
            };

            parsedMessage.callbackData = toArray(data).find(callbackEntry =>
              equalsIgnoreCase(
                callbackEntry.call?.returnValues?.messageId,
                childMessageId
              )
            );
            parsedMessage.callbackData = await parseCustomData(
              parsedMessage.callbackData
            );
          }

          if (
            isAxelar(
              parsedMessage.callbackData?.call?.returnValues?.destinationChain
            )
          ) {
            parsedMessage.callbackData = undefined;
          }

          // origin
          if (
            parsedMessage.call &&
            (parsedMessage.gas_paid_to_callback ||
              (parsedMessage.is_call_from_relayer &&
                !isAxelar(parsedMessage.call.returnValues?.destinationChain)))
          ) {
            const searchParams = parsedMessage.call.transactionHash
              ? { txHash: parsedMessage.call.transactionHash }
              : parsedMessage.call.parentMessageID
                ? { messageId: parsedMessage.call.parentMessageID }
                : null;

            if (searchParams) {
              const { data } = { ...(await searchGMP(searchParams)) };

              parsedMessage.originData = toArray(data).find(originEntry => {
                const callTransactionHash = parsedMessage.call?.transactionHash;
                const callParentMessageId = parsedMessage.call?.parentMessageID;

                return callTransactionHash
                  ? toArray([
                      originEntry.express_executed?.transactionHash,
                      originEntry.executed?.transactionHash,
                    ]).findIndex(
                      transactionHash =>
                        typeof transactionHash === 'string' &&
                        equalsIgnoreCase(transactionHash, callTransactionHash)
                    ) > -1
                  : toArray([
                      originEntry.express_executed?.messageId,
                      originEntry.executed?.messageId,
                      originEntry.executed?.returnValues?.messageId,
                    ]).findIndex(
                      messageIdValue =>
                        typeof messageIdValue === 'string' &&
                        typeof callParentMessageId === 'string' &&
                        equalsIgnoreCase(messageIdValue, callParentMessageId)
                    ) > -1;
              });
              parsedMessage.originData = await parseCustomData(
                parsedMessage.originData
              );
            }
          }

          if (isAxelar(parsedMessage.originData?.call?.chain)) {
            parsedMessage.originData = undefined;
          }

          // settlement filled
          if (parsedMessage.settlement_forwarded_events) {
            const size = 10;
            let retryCount = 0;
            let offset = 0;
            let totalEvents;
            let filledEventsAccumulator: GMPSettlementData[] = [];

            while (
              (!isNumber(totalEvents) ||
                (typeof totalEvents === 'number' &&
                  totalEvents > filledEventsAccumulator.length) ||
                (typeof totalEvents === 'number' && offset < totalEvents)) &&
              retryCount < 10
            ) {
              const settlementResponse = {
                ...(await searchGMP({
                  event: 'SquidCoralSettlementFilled',
                  squidCoralOrderHash:
                    parsedMessage.settlement_forwarded_events.map(
                      settlementEvent => settlementEvent.orderHash
                    ),
                  from: offset,
                  size,
                })),
              };

              if (isNumber(settlementResponse.total)) {
                totalEvents = settlementResponse.total;
              }

              if (settlementResponse.data) {
                const normalizedResponse = toArray(
                  settlementResponse.data
                ).filter(
                  (entry): entry is GMPSettlementData =>
                    typeof entry === 'object' && entry !== null
                );

                filledEventsAccumulator = _.uniqBy(
                  _.concat(filledEventsAccumulator, normalizedResponse),
                  'id'
                );
                offset = filledEventsAccumulator.length;
              } else {
                break;
              }

              retryCount++;
            }

            if (filledEventsAccumulator.length > 0) {
              parsedMessage.settlementFilledData = filledEventsAccumulator;
            }
          }

          // settlement forwarded
          if (parsedMessage.settlement_filled_events) {
            const size = 10;
            let retryCount = 0;
            let offset = 0;
            let totalEvents;
            let forwardedEventsAccumulator: GMPSettlementData[] = [];

            while (
              (!isNumber(totalEvents) ||
                (typeof totalEvents === 'number' &&
                  totalEvents > forwardedEventsAccumulator.length) ||
                (typeof totalEvents === 'number' && offset < totalEvents)) &&
              retryCount < 10
            ) {
              const settlementResponse = {
                ...(await searchGMP({
                  event: 'SquidCoralSettlementForwarded',
                  squidCoralOrderHash:
                    parsedMessage.settlement_filled_events.map(
                      settlementEvent => settlementEvent.orderHash
                    ),
                  from: offset,
                  size,
                })),
              };

              if (isNumber(settlementResponse.total)) {
                totalEvents = settlementResponse.total;
              }

              if (settlementResponse.data) {
                const normalizedResponse = toArray(
                  settlementResponse.data
                ).filter(
                  (entry): entry is GMPSettlementData =>
                    typeof entry === 'object' && entry !== null
                );

                forwardedEventsAccumulator = _.uniqBy(
                  _.concat(forwardedEventsAccumulator, normalizedResponse),
                  'id'
                );
                offset = forwardedEventsAccumulator.length;
              } else {
                break;
              }

              retryCount++;
            }

            if (forwardedEventsAccumulator.length > 0) {
              parsedMessage.settlementForwardedData =
                forwardedEventsAccumulator;
            }
          }

          console.log('[data]', parsedMessage);
          setData(parsedMessage);

          return parsedMessage;
        }
      } else {
        setData({
          status: 'errorOnGetData',
          code: 404,
          message: `GMP: ${tx} not found`,
        });

        return undefined;
      }
    }

    return undefined;
  }, [tx, router, searchParams, ended, setData]);

  // interval update
  useEffect(() => {
    getData();

    if (!ended) {
      const interval = setInterval(() => getData(), 0.5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [tx, searchParams, ended, setData, setEnded, getData]);

  // toast
  useEffect(() => {
    const { status, message, hash, chain } = { ...response };
    const chainData = getChainData(chain, chains);

    toast.remove();

    if (message && status) {
      if ((hash && chainData?.explorer) || status === 'failed') {
        let icon: React.ReactNode;

        switch (status) {
          case 'success':
            icon = <PiCheckCircleFill size={20} className="text-green-600" />;
            break;
          case 'failed':
            icon = <PiXCircleFill size={20} className="text-red-600" />;
            break;
          default:
            break;
        }

        toast.custom(
          <div className="flex flex-col gap-y-1 rounded-lg bg-white px-3 py-2.5 shadow-lg sm:gap-y-0">
            <div className="flex items-center gap-x-1.5 sm:gap-x-2">
              {icon}
              <span className="whitespace-pre-wrap text-zinc-700">
                {message}
              </span>
            </div>
            {chainData?.explorer && hash && chain && (
              <div className="ml-6 flex items-center justify-between gap-x-4 pl-0.5 sm:ml-7 sm:pl-0">
                <ExplorerLink
                  value={hash}
                  chain={chain}
                  iconOnly={false}
                  nonIconClassName="text-zinc-700 text-xs sm:text-sm"
                />
                <button
                  onClick={() => setResponse(null)}
                  className="text-xs font-light text-zinc-400 underline sm:text-sm"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>,
          { duration: 60000 }
        );
      } else {
        const duration = 10000;

        switch (status) {
          case 'pending':
            toast.loading(message);
            break;
          case 'success':
            toast.success(message, { duration });
            break;
          default:
            break;
        }
      }
    }
  }, [response, chains]);

  // Action handlers that delegate to extracted utility functions
  const addGas = async (data: GMPMessage): Promise<void> => {
    await executeAddGas({
      data,
      sdk: sdk ?? null,
      chains,
      provider,
      signer,
      address,
      cosmosWalletStore,
      suiWalletStore,
      stellarWalletStore,
      xrplWalletStore,
      estimatedGasUsed,
      setResponse,
      setProcessing,
      getData,
      approve,
      suiSignAndExecuteTransaction,
      xrplSignAndSubmitTransaction,
    });
  };

  const approve = async (
    data: GMPMessage,
    afterPayGas: boolean = false
  ): Promise<void> => {
    await executeApprove({
      data,
      sdk: sdk ?? null,
      provider,
      setResponse,
      setProcessing,
      afterPayGas,
    });
  };

  const execute = async (data: GMPMessage): Promise<void> => {
    await executeExecute({
      data,
      sdk: sdk ?? null,
      provider,
      signer,
      setResponse,
      setProcessing,
      getData,
    });
  };

  // Render buttons - they handle their own visibility logic internally
  const recoveryActions: GMPRecoveryActions = {
    processing,
    response,
    chainId,
    signer,
    cosmosWalletStore,
    suiWalletStore,
    stellarWalletStore,
    xrplWalletStore,
    onAddGas: addGas,
    onApprove: approve,
    onExecute: execute,
  };

  return (
    <GMPContainer data={data}>
      {data && (
        <>
          <Info
            data={data}
            estimatedTimeSpent={estimatedTimeSpent}
            executeData={executeData}
            recovery={recoveryActions}
            tx={tx}
            lite={lite}
          />
          {!lite && (
            <>
              {data.originData && (
                <Details
                  data={{
                    ...data.originData,
                    callbackData: Object.fromEntries(
                      Object.entries(data).filter(
                        ([key]) => !find(key, ['originData', 'callbackData'])
                      )
                    ) as Partial<GMPMessage>,
                  }}
                />
              )}
              <Details data={data} />
              {data.callbackData && (
                <Details
                  data={{
                    ...data.callbackData,
                    originData: Object.fromEntries(
                      Object.entries(data).filter(
                        ([key]) => !find(key, ['originData', 'callbackData'])
                      )
                    ) as Partial<GMPMessage>,
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </GMPContainer>
  );
}
