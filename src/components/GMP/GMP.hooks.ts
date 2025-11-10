/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { useEffect, useState } from 'react';
import { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import { Contract } from 'ethers';

import IAxelarExecutable from '@/data/interfaces/gmp/IAxelarExecutable.json';
import { estimateTimeSpent as fetchEstimatedTimeSpent, searchGMP } from '@/lib/api/gmp';
import { getProvider } from '@/lib/chain/evm';
import { ENVIRONMENT, getAssetData, getChainData } from '@/lib/config';
import { toBigNumber, toNumber } from '@/lib/number';
import { toArray, toCase } from '@/lib/parser';

import { ChainTimeEstimate, GMPMessage } from './GMP.types';
import { getDefaultGasLimit } from './GMP.utils';

export function useEstimatedTimeSpent(
  data: GMPMessage | null
): ChainTimeEstimate | null {
  const [estimatedTimeSpent, setEstimatedTimeSpent] =
    useState<ChainTimeEstimate | null>(null);

  useEffect(() => {
    const getEstimateTimeSpent = async () => {
      const chain = data?.call?.chain;

      if (!estimatedTimeSpent && chain) {
        const response = await fetchEstimatedTimeSpent({ sourceChain: chain });
        const match = toArray(response).find(item => item?.key === chain);
        const adjusted = match ? { ...match } : null;

        if (
          adjusted &&
          data?.call?.chain_type === 'cosmos' &&
          typeof adjusted.confirm === 'number' &&
          adjusted.confirm > 30
        ) {
          adjusted.confirm = 30;
        }

        setEstimatedTimeSpent(adjusted);
      }
    };

    getEstimateTimeSpent();
  }, [data, estimatedTimeSpent]);

  return estimatedTimeSpent;
}

export function useExecuteData(
  data: GMPMessage | null,
  chains,
  assets
): string | null {
  const [executeData, setExecuteData] = useState<string | null>(null);

  useEffect(() => {
    const getExecuteData = async () => {
      if (!executeData && data?.call && data.approved && chains && assets) {
        try {
          const { call, approved, command_id } = { ...data };
          const { addresses } = {
            ...getAssetData(call.returnValues?.symbol, assets),
          };

          const symbol =
            approved.returnValues?.symbol ||
            addresses?.[toCase(call.returnValues?.destinationChain, 'lower')]
              ?.symbol ||
            call.returnValues?.symbol;
          const commandId = approved.returnValues?.commandId || command_id;
          const sourceChain =
            approved.returnValues?.sourceChain ||
            getChainData(call.chain, chains)?.chain_name;
          const sourceAddress =
            approved.returnValues?.sourceAddress || call.returnValues?.sender;
          const contractAddress =
            approved.returnValues?.contractAddress ||
            call.returnValues?.destinationContractAddress;
          const payload = call.returnValues?.payload;
          const amount = toBigNumber(
            approved.returnValues?.amount || call.returnValues?.amount
          );

          const contract = new Contract(
            contractAddress,
            IAxelarExecutable.abi,
            getProvider(call.returnValues?.destinationChain, chains)
          );
          const transaction = symbol
            ? await contract /*.executeWithToken*/.populateTransaction.executeWithToken(
                commandId,
                sourceChain,
                sourceAddress,
                payload,
                symbol,
                amount
              )
            : await contract /*.execute*/.populateTransaction.execute(
                commandId,
                sourceChain,
                sourceAddress,
                payload
              );

          setExecuteData(transaction?.data);
        } catch (error) {}
      }
    };

    getExecuteData();
  }, [data, executeData, chains, assets]);

  return executeData;
}

export function useEstimatedGasUsed(data: GMPMessage | null): number | null {
  const [estimatedGasUsed, setEstimatedGasUsed] = useState<number | null>(null);

  useEffect(() => {
    const getEstimatedGasUsed = async () => {
      if (
        !estimatedGasUsed &&
        (data?.is_insufficient_fee || (data?.call && !data.gas_paid)) &&
        !data?.confirm &&
        !data?.approved &&
        data?.call?.returnValues?.destinationChain &&
        data?.call?.returnValues?.destinationContractAddress
      ) {
        const { destinationChain, destinationContractAddress } = {
          ...data.call.returnValues,
        };

        const { express_executed, executed } = {
          ...(await searchGMP({
            destinationChain,
            destinationContractAddress,
            status: 'executed',
            size: 1,
          }))?.data?.[0],
        };

        const { gasUsed } = { ...(express_executed || executed)?.receipt };

        setEstimatedGasUsed(
          gasUsed ? toNumber(gasUsed) : getDefaultGasLimit(destinationChain)
        );
      }
    };

    getEstimatedGasUsed();
  }, [data, estimatedGasUsed]);

  return estimatedGasUsed;
}

export function useGMPRecoveryAPI(): AxelarGMPRecoveryAPI | undefined {
  const [sdk, setSDK] = useState<AxelarGMPRecoveryAPI | undefined>();

  useEffect(() => {
    try {
      setSDK(
        new AxelarGMPRecoveryAPI({
          environment: ENVIRONMENT,
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

