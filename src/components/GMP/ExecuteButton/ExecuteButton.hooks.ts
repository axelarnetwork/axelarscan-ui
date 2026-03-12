import { useCallback, useMemo } from 'react';

import { getChainData } from '@/lib/config';

import {
  useCosmosWalletStore,
  useEVMWalletStore,
  useStellarWalletStore,
  useSuiWalletStore,
  useXRPLWalletStore,
} from '@/components/Wallet';

import { useApproveAction } from '../ApproveButton';
import { useGMPRecoveryAPI } from '../GMP.hooks';
import type { GMPMessage } from '../GMP.types';
import { shouldSwitchChain } from '../GMP.utils';
import { executeExecute } from './ExecuteButton.utils';
import type {
  UseExecuteActionParams,
  UseExecuteButtonOptions,
  UseExecuteButtonResult,
} from './ExecuteButton.types';

function useExecuteAction({
  refreshData,
  setProcessing,
  setResponse,
}: UseExecuteActionParams) {
  const sdk = useGMPRecoveryAPI();
  const { provider, signer } = useEVMWalletStore();

  return useCallback(
    async (message: GMPMessage) => {
      await executeExecute({
        data: message,
        sdk: sdk ?? null,
        provider,
        signer,
        setProcessing,
        setResponse,
        getData: refreshData,
      });
    },
    [provider, refreshData, sdk, setProcessing, setResponse, signer]
  );
}

export function useExecuteButton(
  props: UseExecuteButtonOptions
): UseExecuteButtonResult {
  const { data, processing, chains, setProcessing, setResponse, refreshData } =
    props;

  const call = data?.call;
  const destinationChain = call?.returnValues?.destinationChain;
  const destinationChainType = call?.destination_chain_type;
  const isCosmosDestination = destinationChainType === 'cosmos';

  const { chainId, signer } = useEVMWalletStore();
  const cosmosWalletStore = useCosmosWalletStore();
  const suiWalletStore = useSuiWalletStore();
  const stellarWalletStore = useStellarWalletStore();
  const xrplWalletStore = useXRPLWalletStore();

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

  const destinationChainData = useMemo(
    () => getChainData(destinationChain, chains ?? null),
    [chains, destinationChain]
  );

  const needsSwitchChain = useMemo(() => {
    if (!call) {
      return false;
    }

    return shouldSwitchChain(
      destinationChainData?.chain_id,
      destinationChainType,
      walletContext,
      chainId
    );
  }, [
    call,
    chainId,
    destinationChainData,
    destinationChainType,
    walletContext,
  ]);

  const isWalletConnected = useMemo(() => {
    if (!call) {
      return false;
    }

    if (call.destination_chain_type === 'cosmos') {
      return Boolean(cosmosWalletStore?.signer);
    }

    return Boolean(signer);
  }, [call, cosmosWalletStore?.signer, signer]);

  const buttonLabel = processing ? 'Executing...' : 'Execute';

  const executeAction = useExecuteAction({
    refreshData,
    setProcessing,
    setResponse,
  });
  const approveAction = useApproveAction({
    setProcessing,
    setResponse,
    cosmosSigner: cosmosWalletStore.signer,
  });

  const handleExecute = useCallback(async () => {
    if (!data) {
      return;
    }

    if (isCosmosDestination) {
      await approveAction(data);
      return;
    }

    await executeAction(data);
  }, [approveAction, data, executeAction, isCosmosDestination]);

  return {
    buttonLabel,
    isCosmosDestination,
    isWalletConnected,
    needsSwitchChain,
    targetChain: destinationChain,
    targetChainType: destinationChainType,
    handleExecute,
  };
}
