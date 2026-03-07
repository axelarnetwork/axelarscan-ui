import { useSignAndExecuteTransaction as useSuiSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSignAndSubmitTransaction as useXRPLSignAndSubmitTransaction } from '@xrpl-wallet-standard/react';
import { useCallback, useMemo } from 'react';

import { getChainData } from '@/lib/config';

import { useCosmosWalletStore, useEVMWalletStore, useStellarWalletStore, useSuiWalletStore, useXRPLWalletStore } from '@/components/Wallet';

import { useApproveAction } from '../ApproveButton';
import { useEstimatedGasUsed, useGMPRecoveryAPI } from '../GMP.hooks';
import { isWalletConnectedForChain, shouldSwitchChain } from '../GMP.utils';
import { executeAddGas } from './AddGasButton.utils';
import type {
  UseAddGasButtonOptions,
  UseAddGasButtonResult,
} from './AddGasButton.types';

export function useAddGasButton(
  props: UseAddGasButtonOptions
): UseAddGasButtonResult {
  const { data, processing, chains, setProcessing, setResponse, refreshData } =
    props;

  const call = data?.call;
  const sourceChainData = call
    ? getChainData(call.chain, chains ?? null)
    : undefined;

  const { chainId, address, provider, signer } = useEVMWalletStore();
  const cosmosWalletStore = useCosmosWalletStore();
  const suiWalletStore = useSuiWalletStore();
  const stellarWalletStore = useStellarWalletStore();
  const xrplWalletStore = useXRPLWalletStore();
  const { mutateAsync: suiSignAndExecuteTransaction } =
    useSuiSignAndExecuteTransaction();
  const xrplSignAndSubmitTransaction = useXRPLSignAndSubmitTransaction();
  const sdk = useGMPRecoveryAPI();
  const estimatedGasUsed = useEstimatedGasUsed(data);
  const approve = useApproveAction({
    setProcessing,
    setResponse,
    cosmosSigner: cosmosWalletStore.signer,
  });

  const walletContext = useMemo(
    () => ({
      cosmosWalletStore,
      signer,
      suiWalletStore,
      stellarWalletStore,
      xrplWalletStore,
    }),
    [
      cosmosWalletStore,
      signer,
      suiWalletStore,
      stellarWalletStore,
      xrplWalletStore,
    ]
  );

  const isWalletConnected = useMemo(() => {
    if (!call) {
      return false;
    }

    return isWalletConnectedForChain(
      call.chain,
      call.chain_type,
      chains,
      walletContext
    );
  }, [call, chains, walletContext]);

  const needsSwitchChain = useMemo(() => {
    if (!call || !sourceChainData) {
      return false;
    }

    const targetChainId =
      sourceChainData.chain_id ?? (sourceChainData.id as string | undefined);

    return shouldSwitchChain(
      targetChainId,
      call.chain_type,
      walletContext,
      chainId
    );
  }, [call, chainId, sourceChainData, walletContext]);

  const gasPaid = data?.gas_paid;
  const buttonLabel = useMemo(() => {
    if (processing) {
      return gasPaid ? 'Adding gas...' : 'Paying gas...';
    }

    return gasPaid ? 'Add gas' : 'Pay gas';
  }, [gasPaid, processing]);

  const handleAddGas = useCallback(async () => {
    if (!data) {
      return;
    }

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
      getData: refreshData,
      approve,
      suiSignAndExecuteTransaction,
      xrplSignAndSubmitTransaction,
    });
  }, [
    address,
    approve,
    chains,
    cosmosWalletStore,
    data,
    estimatedGasUsed,
    provider,
    refreshData,
    sdk,
    setProcessing,
    setResponse,
    signer,
    stellarWalletStore,
    suiSignAndExecuteTransaction,
    suiWalletStore,
    xrplSignAndSubmitTransaction,
    xrplWalletStore,
  ]);

  return {
    buttonLabel,
    isWalletConnected,
    needsSwitchChain,
    targetChain: call?.chain,
    targetChainType: call?.chain_type,
    handleAddGas,
  };
}
