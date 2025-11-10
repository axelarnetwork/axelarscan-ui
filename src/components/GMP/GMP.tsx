'use client';

import { useSignAndExecuteTransaction as useSuiSignAndExecuteTransaction } from '@mysten/dapp-kit';
import * as StellarSDK from '@stellar/stellar-sdk';
import { useSignAndSubmitTransaction as useXRPLSignAndSubmitTransaction } from '@xrpl-wallet-standard/react';
import clsx from 'clsx';
import _ from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCheckCircleFill, PiXCircleFill } from 'react-icons/pi';

import { ExplorerLink } from '@/components/ExplorerLink';
import { checkNeedMoreGasFromError, customData } from '@/components/GMPs';
import { useGlobalStore } from '@/components/Global';
import { CosmosWallet } from '@/components/Wallet/CosmosWallet';
import { useCosmosWalletStore } from '@/components/Wallet/CosmosWallet.hooks';
import { EVMWallet, useEVMWalletStore } from '@/components/Wallet/EVMWallet';
import {
  StellarWallet,
  useStellarWalletStore,
} from '@/components/Wallet/StellarWallet';
import { SuiWallet, useSuiWalletStore } from '@/components/Wallet/SuiWallet';
import { XRPLWallet, useXRPLWalletStore } from '@/components/Wallet/XRPLWallet';
import { estimateITSFee, searchGMP } from '@/lib/api/gmp';
import { isAxelar } from '@/lib/chain';
import { ENVIRONMENT, getChainData } from '@/lib/config';
import { formatUnits, isNumber, parseUnits, toBigNumber } from '@/lib/number';
import { getParams, sleep } from '@/lib/operator';
import { parseError, toArray } from '@/lib/parser';
import { equalsIgnoreCase, find, headString } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import { Details } from './Details/Details';
import {
  useEstimatedGasUsed,
  useEstimatedTimeSpent,
  useExecuteData,
  useGMPRecoveryAPI,
} from './GMP.hooks';
import { gmpStyles } from './GMP.styles';
import {
  ChainMetadata,
  GMPButtonMap,
  GMPMessage,
  GMPProps,
  GMPSettlementData,
  GMPToastState,
  WalletContext,
} from './GMP.types';
import { getDefaultGasLimit, isGMPMessage } from './GMP.utils';
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

  const isAddGasSupported = (
    targetChain: string | undefined,
    targetChainType: string | undefined
  ): boolean => {
    if (targetChainType !== 'vm') return true;

    const chainData = getChainData(targetChain, chains);
    if (isNumber(chainData?.chain_id)) return true;

    if (targetChain && typeof targetChain === 'string') {
      const normalizedChain = headString(targetChain);
      if (normalizedChain) {
        return ['sui', 'stellar', 'xrpl'].includes(normalizedChain);
      }
    }

    return false;
  };

  const isWalletConnectedForChain = (
    targetChain: string | undefined,
    targetChainType: string | undefined,
    chainMetadataList: ChainMetadata[] | null = chains,
    walletContext: WalletContext = {
      cosmosWalletStore,
      signer,
      suiWalletStore,
      stellarWalletStore,
      xrplWalletStore,
    }
  ): boolean => {
    if (targetChainType === 'cosmos') {
      return Boolean(walletContext.cosmosWalletStore?.signer);
    }

    if (isNumber(getChainData(targetChain, chainMetadataList)?.chain_id)) {
      return Boolean(walletContext.signer);
    }

    if (!targetChain) return false;

    const normalizedChain = headString(targetChain);
    if (normalizedChain === 'sui') {
      return Boolean(walletContext.suiWalletStore?.address);
    }
    if (normalizedChain === 'stellar') {
      return Boolean(walletContext.stellarWalletStore?.address);
    }
    if (normalizedChain === 'xrpl') {
      return Boolean(walletContext.xrplWalletStore?.address);
    }

    return false;
  };

  const renderWalletComponent = (
    targetChain: string | undefined,
    targetChainType: string | undefined
  ): React.ReactNode => {
    const { chain_id: chainIdentifier } = {
      ...getChainData(targetChain, chains),
    };

    if (targetChainType === 'cosmos') {
      return (
        <CosmosWallet
          connectChainId={
            typeof chainIdentifier === 'string' ? chainIdentifier : undefined
          }
        />
      );
    }

    if (isNumber(chainIdentifier)) {
      return <EVMWallet connectChainId={chainIdentifier as number} />;
    }

    const normalizedChain = targetChain ? headString(targetChain) : '';
    if (normalizedChain === 'sui') return <SuiWallet />;
    if (normalizedChain === 'stellar') return <StellarWallet />;
    if (normalizedChain === 'xrpl') return <XRPLWallet />;

    return null;
  };

  const shouldSwitchChain = (
    targetChainId: string | number | undefined,
    targetChainType: string | undefined,
    cosmosStore = cosmosWalletStore,
    evmChainId: number | null = chainId
  ): boolean =>
    targetChainId !==
    (targetChainType === 'cosmos'
      ? cosmosStore?.chainId
      : isNumber(targetChainId)
        ? evmChainId
        : targetChainId);

  // addNativeGas for evm, addGasToCosmosChain for cosmos, amplifier (addGasToSuiChain, addGasToStellarChain, addGasToXrplChain)
  const addGas = async (data: GMPMessage): Promise<void> => {
    if (
      data?.call &&
      sdk &&
      isWalletConnectedForChain(data.call.chain, data.call.chain_type, chains, {
        cosmosWalletStore,
        signer,
        suiWalletStore,
        stellarWalletStore,
        xrplWalletStore,
      })
    ) {
      setProcessing(true);
      setResponse({ status: 'pending', message: 'Adding gas...' });

      try {
        const {
          chain,
          chain_type,
          destination_chain_type,
          transactionHash,
          logIndex,
        } = { ...data.call };
        const { sender, destinationChain, messageId } = {
          ...data.call.returnValues,
        };
        const { base_fee, express_fee, source_token } = { ...data.fees };

        let gasAddedAmount;

        if (isAxelar(destinationChain)) {
          let nextHopDestinationChain;

          if (data.interchain_transfer?.destinationChain) {
            nextHopDestinationChain = data.interchain_transfer.destinationChain;
          } else if (
            data.interchain_token_deployment_started?.destinationChain
          ) {
            nextHopDestinationChain =
              data.interchain_token_deployment_started.destinationChain;
          } else if (data.link_token_started?.destinationChain) {
            nextHopDestinationChain = data.link_token_started.destinationChain;
          } else if (chain) {
            switch (headString(chain)) {
              case 'xrpl':
                if (chain.startsWith('xrpl-evm')) {
                  nextHopDestinationChain =
                    ENVIRONMENT === 'devnet-amplifier' ? 'xrpl-dev2' : 'xrpl';
                } else {
                  nextHopDestinationChain =
                    ENVIRONMENT === 'devnet-amplifier'
                      ? 'xrpl-evm-2'
                      : 'xrpl-evm';
                }
                break;
              default:
                nextHopDestinationChain =
                  ENVIRONMENT === 'mainnet'
                    ? 'ethereum'
                    : ENVIRONMENT === 'devnet-amplifier'
                      ? 'eth-sepolia'
                      : 'ethereum-sepolia';
                break;
            }
          }

          const totalGasAmount = await estimateITSFee({
            sourceChain: chain,
            destinationChain: nextHopDestinationChain,
            sourceTokenSymbol: source_token?.symbol,
            gasLimit: getDefaultGasLimit(nextHopDestinationChain),
            gasMultiplier: 1.1,
            event: data.interchain_token_deployment_started
              ? 'InterchainTokenDeployment'
              : data.link_token_started
                ? 'LinkToken'
                : data.token_metadata_registered
                  ? 'TokenMetadataRegistered'
                  : undefined,
          });

          if (totalGasAmount) {
            gasAddedAmount = toBigNumber(totalGasAmount);
          }
        }

        if (!chain) {
          throw new Error('Chain is required for gas operations');
        }

        const gasLimit = isNumber(estimatedGasUsed) ? estimatedGasUsed : 700000;
        const decimals =
          source_token?.decimals || (headString(chain) === 'sui' ? 9 : 18);

        if (!gasAddedAmount) {
          const baseFee = base_fee ?? 0;
          const expressFee = express_fee ?? 0;
          const gasPrice = source_token?.gas_price ?? 0;

          gasAddedAmount = toBigNumber(
            BigInt(parseUnits((baseFee + expressFee) * 1.1, decimals)) +
              BigInt(parseUnits(gasLimit * gasPrice, decimals))
          );
        }

        if (chain_type === 'evm' || isNumber(sourceChainData?.chain_id)) {
          console.log('[addGas request]', {
            chain,
            destinationChain,
            transactionHash,
            logIndex,
            estimatedGasUsed: gasLimit,
            refundAddress: address,
          });

          if (!chain || !transactionHash) {
            throw new Error('Missing required parameters for addNativeGas');
          }

          const response = await sdk.addNativeGas(
            chain,
            transactionHash,
            gasLimit,
            {
              evmWalletDetails: {
                useWindowEthereum: true,
                provider: provider ?? undefined,
              },
              destChain: destinationChain,
              logIndex,
              refundAddress: address ?? undefined,
            }
          );

          console.log('[addGas response]', response);

          const { success, error, transaction } = { ...response };

          if (success) {
            await sleep(1000);
          }

          setResponse({
            status: success ? 'success' : 'failed',
            message:
              parseError(error)?.message ||
              String(error) ||
              'Pay gas successful',
            hash: transaction?.transactionHash,
            chain,
          });

          if (success) {
            const _data = await getData();

            if (
              _data &&
              chain_type !== 'vm' &&
              (destination_chain_type === 'cosmos'
                ? !data.executed && !_data.executed
                : !data.approved && !_data.approved)
            ) {
              await approve(_data, true);
            }
          }
        } else if (chain_type === 'cosmos' && !isAxelar(chain)) {
          const token = 'autocalculate';

          if (
            !ENVIRONMENT ||
            !cosmosWalletStore.signer ||
            !chain ||
            !transactionHash ||
            !messageId
          ) {
            throw new Error(
              'Missing required parameters for addGasToCosmosChain'
            );
          }

          const sendOptions: {
            environment: string;
            offlineSigner: typeof cosmosWalletStore.signer;
            txFee: {
              gas: string;
              amount: Array<{ denom: string; amount: string }>;
            };
          } = {
            environment: ENVIRONMENT,
            offlineSigner: cosmosWalletStore.signer,
            txFee: {
              gas: '300000',
              amount: [
                {
                  denom: String(sourceChainData?.native_token?.denom ?? 'uaxl'),
                  amount: '30000',
                },
              ],
            },
          };

          console.log('[addGas request]', {
            chain,
            transactionHash,
            messageId,
            estimatedGasUsed: gasLimit,
            token,
            sendOptions,
          });

          const response = await sdk.addGasToCosmosChain({
            txHash: transactionHash,
            messageId,
            gasLimit,
            chain,
            token,
            sendOptions: sendOptions as never,
          } as never);

          console.log('[addGas response]', response);

          const { success, info, broadcastResult } = { ...response };

          if (success) {
            await sleep(1000);
          }

          setResponse({
            status: success ? 'success' : 'failed',
            message: info || 'Pay gas successful',
            hash: broadcastResult?.transactionHash,
            chain,
          });

          if (success && !broadcastResult?.code) {
            const _data = await getData();

            if (
              _data &&
              (destination_chain_type === 'cosmos'
                ? !data.executed && !_data.executed
                : !data.approved && !_data.approved)
            ) {
              await approve(_data, true);
            }
          }
        } else if (headString(chain) === 'sui') {
          console.log('[addGas request]', {
            chain,
            messageId,
            gasAddedAmount,
            refundAddress: suiWalletStore.address,
          });

          if (!messageId || !suiWalletStore.address) {
            throw new Error('Missing required parameters for Sui gas addition');
          }

          const suiTransaction = await sdk.addGasToSuiChain({
            messageId,
            amount: gasAddedAmount,
            gasParams: '0x',
            refundAddress: suiWalletStore.address,
          });

          if (suiTransaction) {
            const suiResponse = await suiSignAndExecuteTransaction({
              transaction: suiTransaction as never,
              chain:
                `sui:${ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet'}` as never,
            });

            console.log('[addGas response]', suiResponse);

            const suiEffectsStatus = (
              suiResponse as {
                effects?: { status?: { status?: string; error?: unknown } };
              }
            )?.effects?.status;

            setResponse({
              status:
                suiEffectsStatus?.status === 'success' ? 'success' : 'failed',
              message:
                parseError(suiEffectsStatus?.error)?.message ||
                'Pay gas successful',
              hash: (suiResponse as { digest?: string })?.digest,
              chain,
            });
          }
        } else if (headString(chain) === 'stellar') {
          console.log('[addGas request]', {
            chain,
            messageId,
            gasAddedAmount,
            refundAddress: stellarWalletStore.address,
          });

          if (!sender || !messageId || !stellarWalletStore.address) {
            throw new Error(
              'Missing required parameters for Stellar gas addition'
            );
          }

          const stellarTransactionXdr = await sdk.addGasToStellarChain({
            senderAddress: sender,
            messageId,
            amount: gasAddedAmount,
            spender: stellarWalletStore.address,
          });

          if (
            stellarTransactionXdr &&
            typeof stellarTransactionXdr === 'string' &&
            stellarWalletStore.provider &&
            stellarWalletStore.network &&
            stellarWalletStore.sorobanRpcUrl
          ) {
            const server = new StellarSDK.rpc.Server(
              sourceChainData?.endpoints?.rpc?.[0] ||
                stellarWalletStore.sorobanRpcUrl,
              { allowHttp: true }
            );

            const preparedTransaction = await server.prepareTransaction(
              StellarSDK.TransactionBuilder.fromXDR(
                stellarTransactionXdr,
                stellarWalletStore.network.networkPassphrase
              )
            );

            const signedResult =
              await stellarWalletStore.provider.signTransaction(
                preparedTransaction.toXDR()
              );

            if (signedResult?.signedTxXdr) {
              console.log('[stellar sendTransaction]', {
                ...signedResult,
                network: stellarWalletStore.network,
              });

              let stellarResponse:
                | StellarSDK.rpc.Api.SendTransactionResponse
                | undefined;
              let stellarError: string | undefined;

              try {
                stellarResponse = await server.sendTransaction(
                  StellarSDK.TransactionBuilder.fromXDR(
                    signedResult.signedTxXdr,
                    stellarWalletStore.network.networkPassphrase
                  )
                );

                if (stellarResponse.errorResult) {
                  stellarError = JSON.parse(
                    JSON.stringify(stellarResponse.errorResult)
                  )?._attributes?.result?._switch?.name;
                }
              } catch (error) {
                stellarError = String(error);
              }

              console.log('[addGas response]', stellarResponse);

              setResponse({
                status:
                  stellarError || stellarResponse?.status === 'ERROR'
                    ? 'failed'
                    : 'success',
                message:
                  parseError(stellarError)?.message ||
                  stellarError ||
                  'Pay gas successful',
                hash: stellarResponse?.hash,
                chain,
              });
            }
          }
        } else if (headString(chain) === 'xrpl') {
          console.log('[addGas request]', {
            chain,
            messageId,
            gasAddedAmount: formatUnits(gasAddedAmount, decimals),
            refundAddress: xrplWalletStore.address,
          });

          if (!xrplWalletStore.address || !messageId) {
            throw new Error(
              'Missing required parameters for XRPL gas addition'
            );
          }

          const gasAddedAmountStr = formatUnits(gasAddedAmount, decimals);
          const xrplTransaction = await sdk.addGasToXrplChain({
            senderAddress: xrplWalletStore.address,
            messageId,
            amount:
              typeof gasAddedAmountStr === 'string'
                ? gasAddedAmountStr
                : String(gasAddedAmountStr),
          });

          if (xrplTransaction && typeof xrplTransaction === 'string') {
            const xrplResponse = await xrplSignAndSubmitTransaction(
              xrplTransaction as never,
              `xrpl:${ENVIRONMENT === 'mainnet' ? '0' : ENVIRONMENT === 'devnet-amplifier' ? '2' : '1'}` as never
            );

            console.log('[addGas response]', xrplResponse);

            const xrplResult = (
              xrplResponse as {
                result?: {
                  meta?: { TransactionResult?: string };
                  hash?: string;
                };
              }
            )?.result;

            setResponse({
              status:
                xrplResult?.meta?.TransactionResult === 'tesSUCCESS'
                  ? 'success'
                  : 'failed',
              message:
                parseError(xrplResult?.meta)?.message || 'Pay gas successful',
              hash: xrplResult?.hash,
              chain,
            });
          }
        }
      } catch (error) {
        setResponse({ status: 'failed', ...parseError(error) });
      }

      setProcessing(false);
    }
  };

  // manualRelayToDestChain (confirm source evm, approve destination evm, RouteMessage destination cosmos)
  const approve = async (
    data: GMPMessage,
    afterPayGas: boolean = false
  ): Promise<void> => {
    if (data?.call && sdk) {
      setProcessing(true);

      if (!afterPayGas) {
        setResponse({
          status: 'pending',
          message:
            (!data.confirm || data.confirm_failed) &&
            data.call.chain_type !== 'cosmos'
              ? 'Confirming...'
              : data.call.destination_chain_type === 'cosmos'
                ? 'Executing...'
                : 'Approving...',
        });
      }

      try {
        const {
          destination_chain_type,
          transactionHash,
          logIndex,
          eventIndex,
          message_id,
        } = { ...data.call };

        const messageIdStr =
          typeof message_id === 'string' ? message_id : undefined;

        console.log('[manualRelayToDestChain request]', {
          transactionHash,
          logIndex,
          eventIndex,
          message_id: messageIdStr,
        });
        const response = await sdk.manualRelayToDestChain(
          transactionHash ?? '',
          logIndex,
          eventIndex,
          {
            useWindowEthereum: true,
            provider: provider ?? undefined,
          },
          false,
          messageIdStr
        );
        console.log('[manualRelayToDestChain response]', response);

        const { success, error, confirmTx, signCommandTx, routeMessageTx } = {
          ...response,
        };

        if (success) {
          await sleep(15 * 1000);
        }
        if (success || !afterPayGas) {
          const errorMessage =
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as { message?: string }).message
              : String(error || '');

          setResponse({
            status: success || !error ? 'success' : 'failed',
            message:
              errorMessage ||
              `${destination_chain_type === 'cosmos' ? 'Execute' : 'Approve'} successful`,
            hash:
              routeMessageTx?.transactionHash ||
              signCommandTx?.transactionHash ||
              confirmTx?.transactionHash,
            chain: 'axelarnet',
          });
        }
      } catch (error) {
        setResponse({ status: 'failed', ...parseError(error) });
      }

      setProcessing(false);
    }
  };

  // execute for evm only
  const execute = async (data: GMPMessage): Promise<void> => {
    if (data?.approved && sdk && signer) {
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
  };

  const { call, gas_paid, confirm, approved, executed, error, gas } =
    data || {};

  const sourceChainData = getChainData(call?.chain, chains);
  const destinationChainData = getChainData(
    call?.returnValues?.destinationChain,
    chains
  );

  let addGasButton: React.ReactNode;
  let approveButton: React.ReactNode;
  let executeButton: React.ReactNode;

  if (call && data) {
    // addGasButton
    if (sourceChainData && !isAxelar(call.chain)) {
      if (
        // supported chain
        (isAddGasSupported(call.chain, call.chain_type) &&
          // no gas added response
          response?.message !== 'Pay gas successful' && // not executed / approved / confirmed / not cosmos call or called more than 1 min
          // when need more gas by itself
          ((!executed &&
            !data.is_executed &&
            !approved &&
            !(confirm && !data.confirm_failed) &&
            (call.chain_type !== 'cosmos' ||
              (call.block_timestamp &&
                timeDiff(call.block_timestamp * 1000) >= 60)) &&
            // no gas paid or not enough gas
            (!(gas_paid || data.gas_paid_to_callback) ||
              data.is_insufficient_fee ||
              data.is_invalid_gas_paid ||
              data.not_enough_gas_to_execute ||
              (gas?.gas_remain_amount !== undefined &&
                gas.gas_remain_amount < 0.000001))) ||
            // when need more gas by another
            (data.callbackData &&
              // not enough gas
              (data.callbackData.is_insufficient_fee ||
                data.callbackData.not_enough_gas_to_execute ||
                // some patterns of error is detected
                checkNeedMoreGasFromError(data.callbackData.error)) &&
              data.callbackData.created_at &&
              typeof data.callbackData.created_at === 'object' &&
              'ms' in data.callbackData.created_at &&
              typeof data.callbackData.created_at.ms === 'number' &&
              timeDiff(data.callbackData.created_at.ms) > 60))) ||
        // when need more gas by itself on destination axelar
        (isAxelar(call.returnValues?.destinationChain) &&
          checkNeedMoreGasFromError(error))
      ) {
        addGasButton = (
          <div key="addGas" className={gmpStyles.actionRow}>
            {isWalletConnectedForChain(call.chain, call.chain_type, chains, {
              cosmosWalletStore,
              signer,
              suiWalletStore,
              stellarWalletStore,
              xrplWalletStore,
            }) &&
              sourceChainData &&
              !shouldSwitchChain(
                sourceChainData.chain_id || sourceChainData.id,
                call.chain_type,
                cosmosWalletStore,
                chainId
              ) && (
                <button
                  disabled={processing}
                  onClick={() => addGas(data)}
                  className={clsx(gmpStyles.actionButton(processing))}
                >
                  {gas_paid ? 'Add' : 'Pay'}
                  {processing ? 'ing' : ''} gas{processing ? '...' : ''}
                </button>
              )}
            {renderWalletComponent(call.chain, call.chain_type)}
          </div>
        );
      }
    }

    // approveButton
    const finalityTime = estimatedTimeSpent?.confirm
      ? estimatedTimeSpent.confirm + 15
      : 600;

    if (
      // not amplifier call
      call.chain_type !== 'vm' &&
      // not approved
      !(call.destination_chain_type === 'cosmos'
        ? (call.chain_type === 'cosmos' && executed?.transactionHash) ||
          (confirm && confirm.poll_id !== data.confirm_failed_event?.poll_id)
        : approved || call.destination_chain_type === 'vm') &&
      !data.is_executed &&
      // not executed / wait for IBC
      (!executed ||
        (executed.axelarTransactionHash &&
          !executed.transactionHash &&
          (error ||
            (executed.block_timestamp &&
              timeDiff(executed.block_timestamp * 1000) >= 3600)))) &&
      // confirmed / confirm failed / called more than finality
      (confirm ||
        data.confirm_failed ||
        (call.block_timestamp &&
          timeDiff(call.block_timestamp * 1000) >= finalityTime)) &&
      // confirmed or called more than 1 min
      ((confirm &&
        confirm.block_timestamp &&
        timeDiff(confirm.block_timestamp * 1000) >= 60) ||
        (call.block_timestamp &&
          timeDiff(call.block_timestamp * 1000) >= 60)) &&
      // valid call and sufficient fee / gas
      !data.is_invalid_call &&
      !data.is_insufficient_fee &&
      (gas?.gas_remain_amount ||
        data.gas_paid_to_callback ||
        data.is_call_from_relayer ||
        call.proposal_id)
    ) {
      approveButton = (
        <div key="approve" className={gmpStyles.actionRow}>
          <button
            disabled={processing}
            onClick={() => approve(data)}
            className={clsx(gmpStyles.actionButton(processing))}
          >
            {(!confirm || data.confirm_failed) &&
            !isAxelar(call.chain) &&
            call.chain_type !== 'cosmos'
              ? 'Confirm'
              : call.chain_type === 'cosmos'
                ? 'Execut'
                : 'Approv'}
            {processing
              ? 'ing...'
              : (!confirm || data.confirm_failed) &&
                  !isAxelar(call.chain) &&
                  call.chain_type !== 'cosmos'
                ? ''
                : 'e'}
          </button>
        </div>
      );
    }

    // executeButton
    if (
      call.destination_chain_type !== 'vm' &&
      !isAxelar(call.returnValues?.destinationChain) &&
      call.returnValues?.payload
    ) {
      if (
        // approved
        (call.destination_chain_type === 'cosmos'
          ? confirm || call.chain_type === 'cosmos'
          : approved) &&
        // no executed txhash or the same with error txhash
        (!executed?.transactionHash ||
          equalsIgnoreCase(executed.transactionHash, error?.transactionHash)) &&
        !data.is_executed &&
        // error or confirmed / approved or called more than 5 mins for cosmos, 2 mins for evm
        (error ||
          timeDiff(
            ((call.destination_chain_type === 'cosmos'
              ? confirm?.block_timestamp
              : approved?.block_timestamp) ||
              call.block_timestamp ||
              0) * 1000
          ) >= (call.destination_chain_type === 'cosmos' ? 300 : 120))
      ) {
        executeButton = (
          <div key="execute" className={gmpStyles.actionRow}>
            {(call.destination_chain_type === 'cosmos' ||
              (signer &&
                !shouldSwitchChain(
                  destinationChainData?.chain_id,
                  call.destination_chain_type,
                  cosmosWalletStore,
                  chainId
                ))) && (
              <button
                disabled={processing}
                onClick={() =>
                  call.destination_chain_type === 'cosmos'
                    ? approve(data)
                    : execute(data)
                }
                className={clsx(gmpStyles.actionButton(processing))}
              >
                Execut{processing ? 'ing...' : 'e'}
              </button>
            )}
            {call.destination_chain_type === 'evm' && (
              <EVMWallet connectChainId={destinationChainData?.chain_id} />
            )}
          </div>
        );
      }
    }
  }

  const buttons: GMPButtonMap = {};

  if (addGasButton) {
    buttons.pay_gas = addGasButton;
  }

  if (executeButton) {
    buttons.execute = executeButton;
  }

  let approveKey: keyof GMPButtonMap | 'approve' | 'confirm' | 'execute' =
    'approve';

  if (
    call &&
    data &&
    (!confirm || data.confirm_failed) &&
    !isAxelar(call.chain) &&
    sourceChainData?.chain_type !== 'cosmos'
  ) {
    approveKey = 'confirm';
  } else if (sourceChainData?.chain_type === 'cosmos' && !executeButton) {
    approveKey = 'execute';
  }

  if (approveButton) {
    buttons[approveKey] = approveButton;
  }

  return (
    <GMPContainer data={data}>
      {data && (
        <>
          <Info
            data={data}
            estimatedTimeSpent={estimatedTimeSpent}
            executeData={executeData}
            buttons={buttons}
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
