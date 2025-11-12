import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import { useEVMWalletStore } from '@/components/Wallet/EVMWallet';

import { isAxelar } from '@/lib/chain';
import { useGMPRecoveryAPI } from '../GMP.hooks';
import { GMPMessage, GMPToastState } from '../GMP.types';
import { executeApprove } from './ApproveButton.utils';

interface UseApproveActionParams {
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
}

interface UseApproveButtonOptions {
  data: GMPMessage | null;
  processing: boolean;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
}

export function useApproveAction({
  setProcessing,
  setResponse,
}: UseApproveActionParams) {
  const sdk = useGMPRecoveryAPI();
  const { provider, signer } = useEVMWalletStore();

  return useCallback(
    async (message: GMPMessage, afterPayGas: boolean = false) => {
      await executeApprove({
        data: message,
        sdk: sdk ?? null,
        provider,
        signer,
        setProcessing: value => setProcessing(value),
        setResponse: response => setResponse(response),
        afterPayGas,
      });
    },
    [provider, sdk, setProcessing, setResponse, signer]
  );
}

interface UseApproveButtonResult {
  buttonLabel: string;
  handleApprove: () => Promise<void>;
}

export function useApproveButton({
  data,
  processing,
  setProcessing,
  setResponse,
}: UseApproveButtonOptions): UseApproveButtonResult {
  const approve = useApproveAction({ setProcessing, setResponse });

  const buttonLabel = useMemo(() => {
    if (!data?.call) {
      return '';
    }

    const isConfirmed = Boolean(data.confirm && !data.confirm_failed);
    const isCosmosChain = data.call.chain_type === 'cosmos';
    const isAxelarChain = isAxelar(data.call.chain);

    if (!isConfirmed && !isAxelarChain && !isCosmosChain) {
      return processing ? 'Confirming...' : 'Confirm';
    }

    if (isCosmosChain) {
      return processing ? 'Executing...' : 'Execute';
    }

    return processing ? 'Approving...' : 'Approve';
  }, [data, processing]);

  const handleApprove = useCallback(async () => {
    if (!data) {
      return;
    }

    await approve(data);
  }, [approve, data]);

  return { buttonLabel, handleApprove };
}
