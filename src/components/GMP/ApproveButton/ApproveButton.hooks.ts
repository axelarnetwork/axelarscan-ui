import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import { useEVMWalletStore } from '@/components/Wallet/EVMWallet';
import { useCosmosWalletStore } from '@/components/Wallet/CosmosWallet.hooks';

import { isAxelar } from '@/lib/chain';
import { useGMPRecoveryAPI } from '../GMP.hooks';
import { GMPMessage, GMPToastState } from '../GMP.types';
import { executeApprove } from './ApproveButton.utils';

interface UseApproveActionParams {
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
  cosmosSigner: ReturnType<typeof useCosmosWalletStore>['signer'];
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
  handleApprove: () => Promise<void>;
}

export function useApproveAction({
  setProcessing,
  setResponse,
  cosmosSigner,
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
  const cosmosWalletStore = useCosmosWalletStore();
  const cosmosSigner = cosmosWalletStore.signer;
  const approve = useApproveAction({ setProcessing, setResponse, cosmosSigner });

  const call = data?.call;
  const isCosmosWalletConnected = Boolean(cosmosSigner);

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

  return { buttonLabel, isCosmosWalletConnected, handleApprove };
}
