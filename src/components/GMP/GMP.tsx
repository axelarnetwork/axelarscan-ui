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
import { GMPButtonMap, GMPMessage, GMPProps, GMPToastState } from './GMP.types';
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
      const d = await parseCustomData(response?.data?.[0]);

      const isSecondHopOfInterchainTransfer = (
        message: GMPMessage
      ): boolean => {
        const destChain = message.interchain_transfer?.destinationChain;
        const callChain = message.call?.chain;
        return Boolean(destChain && callChain && destChain === callChain);
      };

      if (d) {
        if (
          d.call?.parentMessageID &&
          ((!d.executed?.childMessageIDs &&
            isSecondHopOfInterchainTransfer(d)) ||
            isAxelar(d.call.chain))
        ) {
          router.push(`/gmp/${d.call.parentMessageID}`);
        } else {
          if (
            ['received', 'failed'].includes(d.simplified_status) &&
            (d.executed || d.error) &&
            (d.refunded || d.not_to_refund)
          ) {
            setEnded(true);
          }

          // callback
          if (d.callback?.transactionHash) {
            const { data } = {
              ...(await searchGMP({
                txHash: d.callback.transactionHash,
                txIndex: d.callback.transactionIndex,
                txLogIndex: d.callback.logIndex,
              })),
            };

            d.callbackData = toArray(data).find(_d =>
              equalsIgnoreCase(
                _d.call?.transactionHash,
                d.callback.transactionHash
              )
            );
            d.callbackData = await parseCustomData(d.callbackData);
          } else if (d.executed?.transactionHash) {
            const { data } = {
              ...(await searchGMP({ txHash: d.executed.transactionHash })),
            };

            d.callbackData = toArray(data).find(_d =>
              equalsIgnoreCase(
                _d.call?.transactionHash,
                d.executed.transactionHash
              )
            );
            d.callbackData = await parseCustomData(d.callbackData);
          } else if (d.callback?.messageIdHash) {
            const messageId = `${d.callback.messageIdHash}-${d.callback.messageIdIndex}`;
            const { data } = { ...(await searchGMP({ messageId })) };

            d.callbackData = toArray(data).find(_d =>
              equalsIgnoreCase(_d.call?.returnValues?.messageId, messageId)
            );
            d.callbackData = await parseCustomData(d.callbackData);
          } else if (toArray(d.executed?.childMessageIDs) > 0) {
            const { data } = {
              ...(await searchGMP({
                messageId: d.executed.childMessageIDs?.[0],
              })),
            };

            d.callbackData = toArray(data).find(_d =>
              equalsIgnoreCase(
                _d.call?.returnValues?.messageId,
                d.executed.childMessageIDs?.[0]
              )
            );
            d.callbackData = await parseCustomData(d.callbackData);
          }

          if (isAxelar(d.callbackData?.call?.returnValues?.destinationChain)) {
            d.callbackData = undefined;
          }

          // origin
          if (
            d.call &&
            (d.gas_paid_to_callback ||
              (d.is_call_from_relayer &&
                !isAxelar(d.call.returnValues?.destinationChain)))
          ) {
            const { data } = {
              ...(await searchGMP(
                d.call.transactionHash
                  ? { txHash: d.call.transactionHash }
                  : { messageId: d.call.parentMessageID }
              )),
            };

            d.originData = toArray(data).find(_d =>
              d.call.transactionHash
                ? toArray([
                    _d.express_executed?.transactionHash,
                    _d.executed?.transactionHash,
                  ]).findIndex(tx =>
                    equalsIgnoreCase(tx, d.call.transactionHash)
                  ) > -1
                : toArray([
                    _d.express_executed?.messageId,
                    _d.executed?.messageId,
                    _d.executed?.returnValues?.messageId,
                  ]).findIndex(id =>
                    equalsIgnoreCase(id, d.call.parentMessageID)
                  ) > -1
            );
            d.originData = await parseCustomData(d.originData);
          }

          if (isAxelar(d.originData?.call?.chain)) {
            d.originData = undefined;
          }

          // settlement filled
          if (d.settlement_forwarded_events) {
            const size = 10;
            let i = 0;
            let from = 0;
            let total;
            let data = [];

            while (
              (!isNumber(total) || total > data.length || from < total) &&
              i < 10
            ) {
              const response = {
                ...(await searchGMP({
                  event: 'SquidCoralSettlementFilled',
                  squidCoralOrderHash: d.settlement_forwarded_events.map(
                    e => e.orderHash
                  ),
                  from,
                  size,
                })),
              };

              if (isNumber(response.total)) {
                total = response.total;
              }

              if (response.data) {
                data = _.uniqBy(_.concat(data, response.data), 'id');
                from = data.length;
              } else {
                break;
              }

              i++;
            }

            if (data.length > 0) {
              d.settlementFilledData = data;
            }
          }

          // settlement forwarded
          if (d.settlement_filled_events) {
            const size = 10;
            let i = 0;
            let from = 0;
            let total;
            let data = [];

            while (
              (!isNumber(total) || total > data.length || from < total) &&
              i < 10
            ) {
              const response = {
                ...(await searchGMP({
                  event: 'SquidCoralSettlementForwarded',
                  squidCoralOrderHash: d.settlement_filled_events.map(
                    e => e.orderHash
                  ),
                  from,
                  size,
                })),
              };

              if (isNumber(response.total)) {
                total = response.total;
              }

              if (response.data) {
                data = _.uniqBy(_.concat(data, response.data), 'id');
                from = data.length;
              } else {
                break;
              }

              i++;
            }

            if (data.length > 0) {
              d.settlementForwardedData = data;
            }
          }

          console.log('[data]', d);
          setData(d);

          return d;
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

  const isChainSupportedAddGas = (chain, chainType) => {
    // evm / cosmos
    if (chainType !== 'vm') return true;

    // amplifier chain that actually evm chain
    if (isNumber(getChainData(chain, chains)?.chain_id)) return true;

    // amplifier chains that already custom addGas function
    return ['sui', 'stellar', 'xrpl'].includes(headString(chain));
  };

  const isWalletConnected = (chain, chainType) => {
    // cosmos
    if (chainType === 'cosmos') return !!cosmosWalletStore?.signer;

    // evm / evm amplifier
    if (isNumber(getChainData(chain, chains)?.chain_id)) return !!signer;

    chain = headString(chain);
    if (chain === 'sui') return !!suiWalletStore?.address;
    if (chain === 'stellar') return !!stellarWalletStore?.address;
    if (chain === 'xrpl') return !!xrplWalletStore?.address;

    return;
  };

  const getWalletComponent = (chain, chainType) => {
    const { chain_id } = { ...getChainData(chain, chains) };

    // cosmos
    if (chainType === 'cosmos')
      return <CosmosWallet connectChainId={chain_id} />;

    // evm / evm amplifier
    if (isNumber(chain_id)) return <EVMWallet connectChainId={chain_id} />;

    chain = headString(chain);
    if (chain === 'sui') return <SuiWallet />;
    if (chain === 'stellar') return <StellarWallet />;
    if (chain === 'xrpl') return <XRPLWallet />;

    return;
  };

  const needSwitchChain = (id, chainType) =>
    id !==
    (chainType === 'cosmos'
      ? cosmosWalletStore?.chainId
      : isNumber(id)
        ? chainId
        : id);

  // addNativeGas for evm, addGasToCosmosChain for cosmos, amplifier (addGasToSuiChain, addGasToStellarChain, addGasToXrplChain)
  const addGas = async data => {
    if (
      data?.call &&
      sdk &&
      isWalletConnected(data.call.chain, data.call.chain_type)
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
        (isChainSupportedAddGas(call.chain, call.chain_type) &&
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
          <div key="addGas" className="flex items-center gap-x-1">
            {isWalletConnected(call.chain, call.chain_type) &&
              !needSwitchChain(
                sourceChainData.chain_id || sourceChainData.id,
                call.chain_type
              ) && (
                <button
                  disabled={processing}
                  onClick={() => addGas(data)}
                  className={clsx(
                    'flex h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1 font-display text-white',
                    processing
                      ? 'pointer-events-none bg-blue-400 dark:bg-blue-400'
                      : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
                  )}
                >
                  {gas_paid ? 'Add' : 'Pay'}
                  {processing ? 'ing' : ''} gas{processing ? '...' : ''}
                </button>
              )}
            {getWalletComponent(call.chain, call.chain_type)}
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
        <div key="approve" className="flex items-center gap-x-1">
          <button
            disabled={processing}
            onClick={() => approve(data)}
            className={clsx(
              'flex h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1 font-display text-white',
              processing
                ? 'pointer-events-none bg-blue-400 dark:bg-blue-400'
                : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
            )}
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
          <div key="execute" className="flex items-center gap-x-1">
            {(call.destination_chain_type === 'cosmos' ||
              (signer &&
                !needSwitchChain(
                  destinationChainData?.chain_id,
                  call.destination_chain_type
                ))) && (
              <button
                disabled={processing}
                onClick={() =>
                  call.destination_chain_type === 'cosmos'
                    ? approve(data)
                    : execute(data)
                }
                className={clsx(
                  'flex h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1 font-display text-white',
                  processing
                    ? 'pointer-events-none bg-blue-400 dark:bg-blue-400'
                    : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
                )}
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
