import { useSignAndExecuteTransaction as useSuiSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSignAndSubmitTransaction as useXRPLSignAndSubmitTransaction } from '@xrpl-wallet-standard/react';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import { getChainData } from '@/lib/config';

import { useCosmosWalletStore } from '@/components/Wallet/CosmosWallet.hooks';
import { useEVMWalletStore } from '@/components/Wallet/EVMWallet';
import { useStellarWalletStore } from '@/components/Wallet/StellarWallet';
import { useSuiWalletStore } from '@/components/Wallet/SuiWallet';
import { useXRPLWalletStore } from '@/components/Wallet/XRPLWallet';

import { useApproveAction } from '../ApproveButton/ApproveButton.hooks';
import { useEstimatedGasUsed, useGMPRecoveryAPI } from '../GMP.hooks';
import type { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';
import { isWalletConnectedForChain, shouldSwitchChain } from '../GMP.utils';
import { executeAddGas } from './AddGasButton.utils';

interface UseAddGasButtonResult {
  buttonLabel: string;
  isWalletConnected: boolean;
  needsSwitchChain: boolean;
  targetChain: string | undefined;
  targetChainType: string | undefined;
  handleAddGas: () => Promise<void>;
}

interface UseAddGasButtonOptions {
  data: GMPMessage | null;
  processing: boolean;
  chains: ChainMetadata[] | null;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
  refreshData: () => Promise<GMPMessage | undefined>;
}

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
