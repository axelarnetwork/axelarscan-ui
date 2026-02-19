import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import { useEVMWalletStore } from '@/components/Wallet/EVMWallet';
import { useCosmosWalletStore } from '@/components/Wallet/CosmosWallet.hooks';
import type { KeplrSigner } from '@/types/cosmos';

import { isAxelar } from '@/lib/chain';
import { useGMPRecoveryAPI } from '../GMP.hooks';
import { GMPMessage, GMPToastState } from '../GMP.types';
import { executeApprove } from './ApproveButton.utils';

interface UseApproveActionParams {
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
  cosmosSigner?: KeplrSigner | null;
}

interface UseApproveButtonOptions {
  data: GMPMessage | null;
  processing: boolean;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
}

interface UseApproveButtonResult {
  buttonLabel: string;
  isCosmosWalletConnected: boolean;
  requiresCosmosWallet: boolean;
  isEvmWalletConnected: boolean;
  needsEvmWallet: boolean;
  targetChain: string | undefined;
  targetChainType: string | undefined;
  handleApprove: () => Promise<void>;
}

export function useApproveAction({
  setProcessing,
  setResponse,
  cosmosSigner = null,
}: UseApproveActionParams) {
  const sdk = useGMPRecoveryAPI();
  const { provider } = useEVMWalletStore();

  return useCallback(
    async (message: GMPMessage, afterPayGas: boolean = false) => {
      await executeApprove({
        data: message,
        sdk: sdk ?? null,
        provider,
        cosmosSigner,
        setProcessing: value => setProcessing(value),
        setResponse: response => setResponse(response),
        afterPayGas,
      });
    },
    [cosmosSigner, provider, sdk, setProcessing, setResponse]
  );
}

export function useApproveButton({
  data,
  processing,
  setProcessing,
  setResponse,
}: UseApproveButtonOptions): UseApproveButtonResult {
  const { signer: cosmosSigner } = useCosmosWalletStore();
  const { provider } = useEVMWalletStore();
  const approve = useApproveAction({
    setProcessing,
    setResponse,
    cosmosSigner,
  });

  const call = data?.call;
  const isCosmosWalletConnected = Boolean(cosmosSigner);
  const isEvmWalletConnected = Boolean(provider);
  const isConfirmAction = Boolean(
    call &&
      (!data?.confirm || data?.confirm_failed) &&
      call.chain_type !== 'cosmos'
  );
  const requiresCosmosWallet = Boolean(
    call &&
      (isConfirmAction ||
        call.chain_type === 'cosmos' ||
        call.destination_chain_type === 'cosmos')
  );
  const needsEvmWallet = Boolean(
    call &&
      !requiresCosmosWallet &&
      (call.chain_type === 'evm' || call.destination_chain_type === 'evm')
  );
  const targetChain =
    call?.destination_chain_type === 'evm'
      ? (() => {
          const dest =
            call.returnValues?.destinationChain ?? call.destination_chain;
          return typeof dest === 'string' ? dest : undefined;
        })()
      : call?.chain;
  const targetChainType =
    call?.destination_chain_type === 'evm' ? 'evm' : call?.chain_type;

  const buttonLabel = useMemo(() => {
    if (!call) {
      return '';
    }

    const isConfirmed = Boolean(data.confirm && !data.confirm_failed);
    const isCosmosChain = call.chain_type === 'cosmos';
    const isAxelarChain = isAxelar(call.chain);

    if (!isConfirmed && !isAxelarChain && !isCosmosChain) {
      return processing ? 'Confirming...' : 'Confirm';
    }

    if (isCosmosChain) {
      return processing ? 'Executing...' : 'Execute';
    }

    return processing ? 'Approving...' : 'Approve';
  }, [call, data, processing]);

  const handleApprove = useCallback(async () => {
    if (!data) {
      return;
    }

    await approve(data);
  }, [approve, data]);

  return {
    buttonLabel,
    isCosmosWalletConnected,
    requiresCosmosWallet,
    isEvmWalletConnected,
    needsEvmWallet,
    targetChain,
    targetChainType,
    handleApprove,
  };
}
