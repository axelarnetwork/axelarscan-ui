import {
  AxelarGMPRecoveryAPI,
  Environment,
} from '@axelar-network/axelarjs-sdk';
import { Contract, providers } from 'ethers';
import { useEffect, useState } from 'react';

import IAxelarExecutable from '@/data/interfaces/gmp/IAxelarExecutable.json';
import {
  estimateTimeSpent as fetchEstimatedTimeSpent,
  searchGMP,
} from '@/lib/api/gmp';
import { getProvider } from '@/lib/chain/evm';
import { ENVIRONMENT, getAssetData, getChainData } from '@/lib/config';
import { toBigNumber, toNumber } from '@/lib/number';
import { toArray, toCase } from '@/lib/parser';

import {
  AssetDataEntry,
  ChainMetadata,
  ChainTimeEstimate,
  GMPMessage,
} from './GMP.types';
import { getDefaultGasLimit } from './GMP.utils';

type ChainCollection = ChainMetadata[] | null | undefined;

type AssetCollection = AssetDataEntry[] | null | undefined;

interface SearchGMPResult {
  data?: GMPMessage[];
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

export function useGMPRecoveryAPI(): AxelarGMPRecoveryAPI | undefined {
  const [sdk, setSDK] = useState<AxelarGMPRecoveryAPI | undefined>();

  useEffect(() => {
    try {
      setSDK(
        new AxelarGMPRecoveryAPI({
          environment: ENVIRONMENT as Environment,
          axelarRpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
          axelarLcdUrl: process.env.NEXT_PUBLIC_LCD_URL,
        })
      );
    } catch (error) {
      setSDK(undefined);
    }
  }, []);

  return sdk;
}
