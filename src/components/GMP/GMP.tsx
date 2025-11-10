/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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
  GMPButtonMap,
  GMPMessage,
  GMPProps,
  GMPSettlementData,
  GMPToastState,
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
    const { commandId } = { ...getParams(searchParams) };

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
          router.push(`/gmp/${parsedMessage.call.parentMessageID}`);
        } else {
          if (
            ['received', 'failed'].includes(parsedMessage.simplified_status) &&
            (parsedMessage.executed || parsedMessage.error) &&
            (parsedMessage.refunded || parsedMessage.not_to_refund)
          ) {
            setEnded(true);
          }

          // callback
          if (parsedMessage.callback?.transactionHash) {
            const { data } = {
              ...(await searchGMP({
                txHash: parsedMessage.callback.transactionHash,
                txIndex: parsedMessage.callback.transactionIndex,
                txLogIndex: parsedMessage.callback.logIndex,
              })),
            };

            parsedMessage.callbackData = toArray(data).find(callbackEntry =>
              equalsIgnoreCase(
                callbackEntry.call?.transactionHash,
                parsedMessage.callback.transactionHash
              )
            );
            parsedMessage.callbackData = await parseCustomData(
              parsedMessage.callbackData
            );
          } else if (parsedMessage.executed?.transactionHash) {
            const { data } = {
              ...(await searchGMP({
                txHash: parsedMessage.executed.transactionHash,
              })),
            };

            parsedMessage.callbackData = toArray(data).find(callbackEntry =>
              equalsIgnoreCase(
                callbackEntry.call?.transactionHash,
                parsedMessage.executed.transactionHash
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
          } else if (toArray(parsedMessage.executed?.childMessageIDs) > 0) {
            const { data } = {
              ...(await searchGMP({
                messageId: parsedMessage.executed.childMessageIDs?.[0],
              })),
            };

            parsedMessage.callbackData = toArray(data).find(callbackEntry =>
              equalsIgnoreCase(
                callbackEntry.call?.returnValues?.messageId,
                parsedMessage.executed.childMessageIDs?.[0]
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
            const { data } = {
              ...(await searchGMP(
                parsedMessage.call.transactionHash
                  ? { txHash: parsedMessage.call.transactionHash }
                  : { messageId: parsedMessage.call.parentMessageID }
              )),
            };

            parsedMessage.originData = toArray(data).find(originEntry =>
              parsedMessage.call.transactionHash
                ? toArray([
                    originEntry.express_executed?.transactionHash,
                    originEntry.executed?.transactionHash,
                  ]).findIndex(transactionHash =>
                    equalsIgnoreCase(
                      transactionHash,
                      parsedMessage.call?.transactionHash
                    )
                  ) > -1
                : toArray([
                    originEntry.express_executed?.messageId,
                    originEntry.executed?.messageId,
                    originEntry.executed?.returnValues?.messageId,
                  ]).findIndex(messageIdValue =>
                    equalsIgnoreCase(
                      messageIdValue,
                      parsedMessage.call?.parentMessageID
                    )
                  ) > -1
            );
            parsedMessage.originData = await parseCustomData(
              parsedMessage.originData
            );
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
                totalEvents > filledEventsAccumulator.length ||
                offset < totalEvents) &&
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
                totalEvents > forwardedEventsAccumulator.length ||
                offset < totalEvents) &&
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

    const interval = !ended && setInterval(() => getData(), 0.5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tx, searchParams, ended, setData, setEnded, getData]);

  // toast
  useEffect(() => {
    const { status, message, hash, chain } = { ...response };
    const chainData = getChainData(chain, chains);

    toast.remove();

    if (message) {
      if ((hash && chainData?.explorer) || status === 'failed') {
        let icon;

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
            {chainData?.explorer && (
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
          case 'failed':
            toast.error(message, { duration });
            break;
          default:
            break;
        }
      }
    }
  }, [response, chains]);

  const isAddGasSupported = (targetChain, targetChainType) => {
    if (targetChainType !== 'vm') return true;

    if (isNumber(getChainData(targetChain, chains)?.chain_id)) return true;

    return ['sui', 'stellar', 'xrpl'].includes(headString(targetChain));
  };

  const isWalletConnectedForChain = (
    targetChain,
    targetChainType,
    chainMetadataList = chains,
    walletContext = {
      cosmosWalletStore,
      signer,
      suiWalletStore,
      stellarWalletStore,
      xrplWalletStore,
    }
  ) => {
    if (targetChainType === 'cosmos') {
      return Boolean(walletContext.cosmosWalletStore?.signer);
    }

    if (isNumber(getChainData(targetChain, chainMetadataList)?.chain_id)) {
      return Boolean(walletContext.signer);
    }

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

  const renderWalletComponent = (targetChain, targetChainType) => {
    const { chain_id: chainIdentifier } = {
      ...getChainData(targetChain, chains),
    };

    if (targetChainType === 'cosmos') {
      return <CosmosWallet connectChainId={chainIdentifier} />;
    }

    if (isNumber(chainIdentifier)) {
      return <EVMWallet connectChainId={chainIdentifier} />;
    }

    const normalizedChain = headString(targetChain);
    if (normalizedChain === 'sui') return <SuiWallet />;
    if (normalizedChain === 'stellar') return <StellarWallet />;
    if (normalizedChain === 'xrpl') return <XRPLWallet />;

    return null;
  };

  const shouldSwitchChain = (
    targetChainId,
    targetChainType,
    cosmosStore = cosmosWalletStore,
    evmChainId = chainId
  ) =>
    targetChainId !==
    (targetChainType === 'cosmos'
      ? cosmosStore?.chainId
      : isNumber(targetChainId)
        ? evmChainId
        : targetChainId);

  // addNativeGas for evm, addGasToCosmosChain for cosmos, amplifier (addGasToSuiChain, addGasToStellarChain, addGasToXrplChain)
  const addGas = async data => {
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
          } else {
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

        const gasLimit = isNumber(estimatedGasUsed) ? estimatedGasUsed : 700000;
        const decimals =
          source_token?.decimals || (headString(chain) === 'sui' ? 9 : 18);

        if (!gasAddedAmount) {
          gasAddedAmount = toBigNumber(
            BigInt(parseUnits((base_fee + express_fee) * 1.1, decimals)) +
              BigInt(parseUnits(gasLimit * source_token?.gas_price, decimals))
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

          const response = await sdk.addNativeGas(
            chain,
            transactionHash,
            gasLimit,
            {
              evmWalletDetails: {
                useWindowEthereum: true,
                provider,
                signer,
              },
              destChain: destinationChain,
              logIndex,
              refundAddress: address,
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
              parseError(error)?.message || error || 'Pay gas successful',
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
          const sendOptions = {
            environment: ENVIRONMENT,
            offlineSigner: cosmosWalletStore.signer,
            txFee: {
              gas: '300000',
              amount: [
                {
                  denom: sourceChainData?.native_token?.denom,
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
            sendOptions,
          });

          console.log('[addGas response]', response);

          const { success, error, broadcastResult } = { ...response };

          if (success) {
            await sleep(1000);
          }

          setResponse({
            status: success ? 'success' : 'failed',
            message:
              parseError(error)?.message || error || 'Pay gas successful',
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

          let response = await sdk.addGasToSuiChain({
            messageId,
            amount: gasAddedAmount,
            gasParams: '0x',
            refundAddress: suiWalletStore.address,
          });

          if (response) {
            response = await suiSignAndExecuteTransaction({
              transaction: response,
              chain: `sui:${ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet'}`,
              options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
              },
            });

            console.log('[addGas response]', response);

            setResponse({
              status: response?.error ? 'failed' : 'success',
              message:
                parseError(response?.error)?.message ||
                response?.error ||
                'Pay gas successful',
              hash: response?.digest,
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

          let response = await sdk.addGasToStellarChain({
            senderAddress: sender,
            messageId,
            amount: gasAddedAmount,
            spender: stellarWalletStore.address,
          });

          if (
            response &&
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
                response,
                stellarWalletStore.network.networkPassphrase
              )
            );

            response = await stellarWalletStore.provider.signTransaction(
              preparedTransaction.toXDR()
            );

            if (response?.signedTxXdr) {
              console.log('[stellar sendTransaction]', {
                ...response,
                network: stellarWalletStore.network,
              });

              try {
                response = await server.sendTransaction(
                  StellarSDK.TransactionBuilder.fromXDR(
                    response.signedTxXdr,
                    stellarWalletStore.network.networkPassphrase
                  )
                );
                response.error = JSON.parse(
                  JSON.stringify(response.errorResult)
                )._attributes.result._switch.name;
              } catch (error) {}
            }

            console.log('[addGas response]', response);

            setResponse({
              status:
                response?.error || response?.status === 'ERROR'
                  ? 'failed'
                  : 'success',
              message:
                parseError(response?.error)?.message ||
                response?.error ||
                'Pay gas successful',
              hash: response?.hash,
              chain,
            });
          }
        } else if (headString(chain) === 'xrpl') {
          console.log('[addGas request]', {
            chain,
            messageId,
            gasAddedAmount: formatUnits(gasAddedAmount, decimals),
            refundAddress: xrplWalletStore.address,
          });

          let response = await sdk.addGasToXrplChain({
            senderAddress: xrplWalletStore.address,
            messageId,
            amount: formatUnits(gasAddedAmount, decimals),
          });

          if (response) {
            response = await xrplSignAndSubmitTransaction(
              response,
              `xrpl:${ENVIRONMENT === 'mainnet' ? '0' : ENVIRONMENT === 'devnet-amplifier' ? '2' : '1'}`
            );

            console.log('[addGas response]', response);

            setResponse({
              status:
                response?.tx_json?.meta?.TransactionResult === 'tesSUCCESS'
                  ? 'success'
                  : 'failed',
              message:
                parseError(response?.error)?.message ||
                response?.error ||
                'Pay gas successful',
              hash: response?.tx_hash,
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
  const approve = async (data, afterPayGas = false) => {
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

        console.log('[manualRelayToDestChain request]', {
          transactionHash,
          logIndex,
          eventIndex,
          message_id,
        });
        const response = await sdk.manualRelayToDestChain(
          transactionHash,
          logIndex,
          eventIndex,
          { useWindowEthereum: true, provider, signer },
          false,
          message_id
        );
        console.log('[manualRelayToDestChain response]', response);

        const { success, error, confirmTx, signCommandTx, routeMessageTx } = {
          ...response,
        };

        if (success) {
          await sleep(15 * 1000);
        }
        if (success || !afterPayGas) {
          setResponse({
            status: success || !error ? 'success' : 'failed',
            message:
              error?.message ||
              error ||
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
  const execute = async data => {
    if (data?.approved && sdk && signer) {
      setProcessing(true);
      setResponse({ status: 'pending', message: 'Executing...' });

      try {
        const { transactionHash, logIndex } = { ...data.call };
        const gasLimitBuffer = '200000';

        console.log('[execute request]', {
          transactionHash,
          logIndex,
          gasLimitBuffer,
        });
        const response = await sdk.execute(transactionHash, logIndex, {
          useWindowEthereum: true,
          provider,
          signer,
          gasLimitBuffer,
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

  const { call, gas_paid, confirm, approved, executed, error, gas } = {
    ...data,
  };

  const sourceChainData = getChainData(call?.chain, chains);
  const destinationChainData = getChainData(
    call?.returnValues?.destinationChain,
    chains
  );

  let addGasButton;
  let approveButton;
  let executeButton;

  if (call) {
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
              timeDiff(call.block_timestamp * 1000) >= 60) &&
            // no gas paid or not enough gas
            (!(gas_paid || data.gas_paid_to_callback) ||
              data.is_insufficient_fee ||
              data.is_invalid_gas_paid ||
              data.not_enough_gas_to_execute ||
              gas?.gas_remain_amount < 0.000001)) ||
            // when need more gas by another
            (data.callbackData &&
              // not enough gas
              (data.callbackData.is_insufficient_fee ||
                data.callbackData.not_enough_gas_to_execute ||
                // some patterns of error is detected
                checkNeedMoreGasFromError(data.callbackData.error)) &&
              timeDiff(data.callbackData.created_at?.ms) > 60))) ||
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
          (error || timeDiff(executed.block_timestamp * 1000) >= 3600))) &&
      // confirmed / confirm failed / called more than finality
      (confirm ||
        data.confirm_failed ||
        timeDiff(call.block_timestamp * 1000) >= finalityTime) &&
      // confirmed or called more than 1 min
      timeDiff((confirm || call).block_timestamp * 1000) >= 60 &&
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
              : approved.block_timestamp) || call.block_timestamp) * 1000
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
    <GMPContainer data={data} lite={lite} tx={tx}>
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
                    ),
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
                    ),
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

/* eslint-enable @typescript-eslint/ban-ts-comment */
