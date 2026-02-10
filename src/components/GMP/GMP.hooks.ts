'use client';

import { customData } from '@/components/GMPs';
import {
  AxelarGMPRecoveryAPI,
  Environment,
} from '@axelar-network/axelarjs-sdk';
import { Contract, providers } from 'ethers';
import _ from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import IAxelarExecutable from '@/data/interfaces/gmp/IAxelarExecutable.json';
import {
  estimateTimeSpent as fetchEstimatedTimeSpent,
  searchGMP,
} from '@/lib/api/gmp';
import { isAxelar } from '@/lib/chain';
import { getProvider } from '@/lib/chain/evm';
import { ENVIRONMENT, getAssetData, getChainData } from '@/lib/config';
import { isNumber, toBigNumber, toNumber } from '@/lib/number';
import { getParams } from '@/lib/operator';
import { toArray, toCase } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';

import {
  AssetDataEntry,
  ChainMetadata,
  ChainTimeEstimate,
  GMPMessage,
  GMPSettlementData,
} from './GMP.types';
import { getDefaultGasLimit, isGMPMessage } from './GMP.utils';
import { normalizeRecoveryBytes } from './GMP.recovery.utils';

type ChainCollection = ChainMetadata[] | null | undefined;

type AssetCollection = AssetDataEntry[] | null | undefined;

interface SearchGMPResult {
  data?: GMPMessage[];
}

const REFRESH_INTERVAL_MS = 0.5 * 60 * 1000;

async function parseCustomData(
  value: unknown
): Promise<GMPMessage | undefined> {
  const parsed = await customData(value);
  return isGMPMessage(parsed) ? parsed : undefined;
}

function getSearchParamsRecord(
  searchParams: ReturnType<typeof useSearchParams>
): Record<string, unknown> {
  return getParams(searchParams) as unknown as Record<string, unknown>;
}

export function useGMPMessageData(tx?: string): {
  data: GMPMessage | null;
  refresh: () => Promise<GMPMessage | undefined>;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<GMPMessage | null>(null);
  const [ended, setEnded] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async (): Promise<GMPMessage | undefined> => {
    const params = getSearchParamsRecord(searchParams);
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
    }

    if (!tx || ended) {
      return undefined;
    }

    const response = await searchGMP(
      tx.includes('-') ? { messageId: tx } : { txHash: tx }
    );
    const parsedMessage = await parseCustomData(response?.data?.[0]);

    const isSecondHopOfInterchainTransfer = (message: GMPMessage): boolean => {
      const destChain = message.interchain_transfer?.destinationChain;
      const callChain = message.call?.chain;
      return Boolean(destChain && callChain && destChain === callChain);
    };

    if (!parsedMessage) {
      setData({
        status: 'errorOnGetData',
        code: 404,
        message: `GMP: ${tx} not found`,
      });

      return undefined;
    }

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
      return undefined;
    }

    if (
      parsedMessage.simplified_status &&
      ['received', 'failed'].includes(parsedMessage.simplified_status) &&
      (parsedMessage.executed || parsedMessage.error) &&
      (parsedMessage.refunded || parsedMessage.not_to_refund)
    ) {
      setEnded(true);
    }

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
        equalsIgnoreCase(callbackEntry.call?.transactionHash, callbackTxHash)
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
        equalsIgnoreCase(callbackEntry.call?.transactionHash, executedTxHash)
      );
      parsedMessage.callbackData = await parseCustomData(
        parsedMessage.callbackData
      );
    } else if (parsedMessage.callback?.messageIdHash) {
      const messageId = `${parsedMessage.callback.messageIdHash}-${parsedMessage.callback.messageIdIndex}`;
      const { data } = { ...(await searchGMP({ messageId })) };

      parsedMessage.callbackData = toArray(data).find(callbackEntry =>
        equalsIgnoreCase(callbackEntry.call?.returnValues?.messageId, messageId)
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
      isAxelar(parsedMessage.callbackData?.call?.returnValues?.destinationChain)
    ) {
      parsedMessage.callbackData = undefined;
    }

    if (
      parsedMessage.call &&
      (parsedMessage.gas_paid_to_callback ||
        (parsedMessage.is_call_from_relayer &&
          !isAxelar(parsedMessage.call.returnValues?.destinationChain)))
    ) {
      const callbackSearchParams = parsedMessage.call.transactionHash
        ? { txHash: parsedMessage.call.transactionHash }
        : parsedMessage.call.parentMessageID
          ? { messageId: parsedMessage.call.parentMessageID }
          : null;

      if (callbackSearchParams) {
        const { data } = { ...(await searchGMP(callbackSearchParams)) };

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

    if (parsedMessage.settlement_forwarded_events) {
      const size = 10;
      let retryCount = 0;
      let offset = 0;
      let totalEvents: number | undefined;
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
            squidCoralOrderHash: parsedMessage.settlement_forwarded_events.map(
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
          const normalizedResponse = toArray(settlementResponse.data).filter(
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

    if (parsedMessage.settlement_filled_events) {
      const size = 10;
      let retryCount = 0;
      let offset = 0;
      let totalEvents: number | undefined;
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
            squidCoralOrderHash: parsedMessage.settlement_filled_events.map(
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
          const normalizedResponse = toArray(settlementResponse.data).filter(
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
        parsedMessage.settlementForwardedData = forwardedEventsAccumulator;
      }
    }

    console.log('[data]', parsedMessage);
    setData(parsedMessage);

    return parsedMessage;
  }, [ended, router, searchParams, tx]);

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      await refresh();

      if (isActive && !ended) {
        intervalRef.current = setInterval(() => {
          void refresh();
        }, REFRESH_INTERVAL_MS);
      }
    };

    void run();

    return () => {
      isActive = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [ended, refresh]);

  return { data, refresh };
}

export function useEstimatedTimeSpent(
  message: GMPMessage | null
): ChainTimeEstimate | null {
  const [estimatedTimeSpent, setEstimatedTimeSpent] =
    useState<ChainTimeEstimate | null>(null);

  useEffect(() => {
    const fetchEstimateTimeSpent = async () => {
      const sourceChain = message?.call?.chain;

      if (!estimatedTimeSpent && sourceChain) {
        const response = await fetchEstimatedTimeSpent({
          sourceChain,
        });
        const estimates = toArray(response) as ChainTimeEstimate[];
        const matchedEstimate =
          estimates.find(chainEstimate => chainEstimate?.key === sourceChain) ??
          null;
        const adjustedEstimate = matchedEstimate
          ? { ...matchedEstimate }
          : null;

        if (
          adjustedEstimate &&
          message?.call?.chain_type === 'cosmos' &&
          typeof adjustedEstimate.confirm === 'number' &&
          adjustedEstimate.confirm > 30
        ) {
          adjustedEstimate.confirm = 30;
        }

        setEstimatedTimeSpent(adjustedEstimate);
      }
    };

    fetchEstimateTimeSpent();
  }, [message, estimatedTimeSpent]);

  return estimatedTimeSpent;
}

export function useExecuteData(
  message: GMPMessage | null,
  chains: ChainCollection,
  assets: AssetCollection
): string | null {
  const [executeData, setExecuteData] = useState<string | null>(null);

  useEffect(() => {
    const deriveExecuteData = async () => {
      if (
        !executeData &&
        message?.call &&
        message.approved &&
        chains &&
        assets
      ) {
        try {
          const { call, approved, command_id: commandIdFallback } = message;
          const assetEntry = getAssetData(call.returnValues?.symbol, assets) as
            | AssetDataEntry
            | undefined;
          const assetAddresses = assetEntry?.addresses;
          const destinationKeyCandidate = toCase(
            call.returnValues?.destinationChain ?? '',
            'lower'
          );
          const destinationKey =
            typeof destinationKeyCandidate === 'string'
              ? destinationKeyCandidate
              : String(destinationKeyCandidate ?? '');
          const destinationAssetConfig =
            destinationKey && assetAddresses
              ? assetAddresses[destinationKey]
              : undefined;

          const symbol =
            approved.returnValues?.symbol ??
            destinationAssetConfig?.symbol ??
            call.returnValues?.symbol;
          const commandId =
            approved.returnValues?.commandId ?? commandIdFallback;
          const sourceChain =
            approved.returnValues?.sourceChain ??
            getChainData(call.chain, chains)?.chain_name ??
            call.chain;
          const sourceAddress =
            approved.returnValues?.sourceAddress ?? call.returnValues?.sender;
          const contractAddress =
            approved.returnValues?.contractAddress ??
            call.returnValues?.destinationContractAddress;
          const payload = call.returnValues?.payload;
          const amount = toBigNumber(
            approved.returnValues?.amount ?? call.returnValues?.amount
          );
          const destinationChainKey = call.returnValues?.destinationChain;
          if (typeof destinationChainKey !== 'string') {
            return;
          }

          const provider = getProvider(destinationChainKey, chains) as
            | providers.Provider
            | undefined;

          if (
            typeof contractAddress !== 'string' ||
            !commandId ||
            !sourceChain ||
            !provider
          ) {
            return;
          }

          const contract = new Contract(
            contractAddress,
            IAxelarExecutable.abi,
            provider
          );
          const transaction = symbol
            ? await contract.populateTransaction.executeWithToken(
                commandId,
                sourceChain,
                sourceAddress,
                payload,
                symbol,
                amount
              )
            : await contract.populateTransaction.execute(
                commandId,
                sourceChain,
                sourceAddress,
                payload
              );

          setExecuteData(transaction?.data ?? null);
        } catch (error) {
          console.error('[useExecuteData]', error);
        }
      }
    };

    deriveExecuteData();
  }, [message, executeData, chains, assets]);

  return executeData;
}

export function useEstimatedGasUsed(message: GMPMessage | null): number | null {
  const [estimatedGasUsed, setEstimatedGasUsed] = useState<number | null>(null);

  useEffect(() => {
    const determineEstimatedGasUsed = async () => {
      if (
        !estimatedGasUsed &&
        (message?.is_insufficient_fee ||
          (message?.call && !message.gas_paid)) &&
        !message?.confirm &&
        !message?.approved &&
        message?.call?.returnValues?.destinationChain &&
        message?.call?.returnValues?.destinationContractAddress
      ) {
        const { destinationChain, destinationContractAddress } = {
          ...message.call.returnValues,
        };

        const searchResult = (await searchGMP({
          destinationChain,
          destinationContractAddress,
          status: 'executed',
          size: 1,
        })) as SearchGMPResult | undefined;
        const [matchedMessage] = toArray(searchResult?.data) as GMPMessage[];
        const executionLog =
          matchedMessage?.express_executed ?? matchedMessage?.executed;

        const gasUsedValue = executionLog?.receipt?.gasUsed;

        setEstimatedGasUsed(
          gasUsedValue
            ? toNumber(gasUsedValue)
            : getDefaultGasLimit(destinationChain)
        );
      }
    };

    determineEstimatedGasUsed();
  }, [message, estimatedGasUsed]);

  return estimatedGasUsed;
}

const RECOVERY_BYTES_ENDPOINTS = new Set([
  '/confirm_gateway_tx',
  '/create_pending_transfers',
  '/execute_pending_transfers',
  '/route_message',
  '/sign_commands',
]);

export function useGMPRecoveryAPI(): AxelarGMPRecoveryAPI | undefined {
  const [sdk, setSDK] = useState<AxelarGMPRecoveryAPI | undefined>();

  useEffect(() => {
    try {
      const recoverySdk = new AxelarGMPRecoveryAPI({
        environment: ENVIRONMENT as Environment,
        axelarRpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
        axelarLcdUrl: process.env.NEXT_PUBLIC_LCD_URL,
      });

      const originalExecRecoveryUrlFetch =
        recoverySdk.execRecoveryUrlFetch.bind(recoverySdk);

      recoverySdk.execRecoveryUrlFetch = async (endpoint, params) => {
        const response = await originalExecRecoveryUrlFetch(endpoint, params);
        if (!RECOVERY_BYTES_ENDPOINTS.has(endpoint)) {
          return response;
        }
        return normalizeRecoveryBytes(response) ?? response;
      };

      setSDK(recoverySdk);
    } catch (error) {
      setSDK(undefined);
    }
  }, []);

  return sdk;
}
