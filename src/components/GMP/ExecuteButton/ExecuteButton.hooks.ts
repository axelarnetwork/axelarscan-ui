import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import { getChainData } from '@/lib/config';

import { useCosmosWalletStore } from '@/components/Wallet/CosmosWallet.hooks';
import { useEVMWalletStore } from '@/components/Wallet/EVMWallet';
import { useStellarWalletStore } from '@/components/Wallet/StellarWallet';
import { useSuiWalletStore } from '@/components/Wallet/SuiWallet';
import { useXRPLWalletStore } from '@/components/Wallet/XRPLWallet';

import { useApproveAction } from '../ApproveButton/ApproveButton.hooks';
import { useGMPRecoveryAPI } from '../GMP.hooks';
import { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';
import { shouldSwitchChain } from '../GMP.utils';
import { executeExecute } from './ExecuteButton.utils';

interface UseExecuteActionParams {
  refreshData: () => Promise<GMPMessage | undefined>;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
}

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

interface UseExecuteButtonResult {
  buttonLabel: string;
  isCosmosDestination: boolean;
  isWalletConnected: boolean;
  needsSwitchChain: boolean;
  targetChain: string | undefined;
  targetChainType: string | undefined;
  handleExecute: () => Promise<void>;
}

interface UseExecuteButtonOptions {
  data: GMPMessage | null;
  processing: boolean;
  chains: ChainMetadata[] | null;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
  refreshData: () => Promise<GMPMessage | undefined>;
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
