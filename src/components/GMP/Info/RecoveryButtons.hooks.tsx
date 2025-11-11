'use client';

import { useSignAndExecuteTransaction as useSuiSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSignAndSubmitTransaction as useXRPLSignAndSubmitTransaction } from '@xrpl-wallet-standard/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { PiCheckCircleFill, PiXCircleFill } from 'react-icons/pi';

import { ExplorerLink } from '@/components/ExplorerLink';
import { useCosmosWalletStore } from '@/components/Wallet/CosmosWallet.hooks';
import { useEVMWalletStore } from '@/components/Wallet/EVMWallet';
import { useStellarWalletStore } from '@/components/Wallet/StellarWallet';
import { useSuiWalletStore } from '@/components/Wallet/SuiWallet';
import { useXRPLWalletStore } from '@/components/Wallet/XRPLWallet';
import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';

import { AddGasButton } from '../AddGasButton/AddGasButton';
import { executeAddGas } from '../AddGasButton/AddGasButton.utils';
import { ApproveButton } from '../ApproveButton/ApproveButton';
import { executeApprove } from '../ApproveButton/ApproveButton.utils';
import { ExecuteButton } from '../ExecuteButton/ExecuteButton';
import { executeExecute } from '../ExecuteButton/ExecuteButton.utils';
import { useEstimatedGasUsed, useGMPRecoveryAPI } from '../GMP.hooks';
import type { GMPMessage, GMPToastState } from '../GMP.types';
import { recoveryButtonsStyles } from './RecoveryButtons.styles';
import { RecoveryButtonsProps } from './RecoveryButtons.types';
import {
  shouldShowAddGasButton,
  shouldShowApproveButton,
  shouldShowExecuteButton,
} from './RecoveryButtons.utils';

type RecoveryButtonEntry = [string, ReactNode];

export function useRecoveryButtons({
  data,
  chains,
  estimatedTimeSpent,
  refreshData,
}: RecoveryButtonsProps): RecoveryButtonEntry[] {
  const [processing, setProcessing] = useState<boolean>(false);
  const [response, setResponse] = useState<GMPToastState | null>(null);

  const { chainId, address, provider, signer } = useEVMWalletStore();
  const cosmosWalletStore = useCosmosWalletStore();
  const suiWalletStore = useSuiWalletStore();
  const stellarWalletStore = useStellarWalletStore();
  const xrplWalletStore = useXRPLWalletStore();
  const { mutateAsync: suiSignAndExecuteTransaction } =
    useSuiSignAndExecuteTransaction();
  const xrplSignAndSubmitTransaction = useXRPLSignAndSubmitTransaction();
  const estimatedGasUsed = useEstimatedGasUsed(data);
  const sdk = useGMPRecoveryAPI();

  const approve = useCallback(
    async (
      message: GMPMessage,
      afterPayGas: boolean = false
    ): Promise<void> => {
      await executeApprove({
        data: message,
        sdk: sdk ?? null,
        provider,
        setResponse,
        setProcessing,
        afterPayGas,
      });
    },
    [provider, sdk]
  );

  const execute = useCallback(
    async (message: GMPMessage): Promise<void> => {
      await executeExecute({
        data: message,
        sdk: sdk ?? null,
        provider,
        signer,
        setResponse,
        setProcessing,
        getData: refreshData,
      });
    },
    [provider, refreshData, sdk, signer]
  );

  const addGas = useCallback(
    async (message: GMPMessage): Promise<void> => {
      await executeAddGas({
        data: message,
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
    },
    [
      address,
      approve,
      chains,
      cosmosWalletStore,
      estimatedGasUsed,
      provider,
      refreshData,
      sdk,
      signer,
      stellarWalletStore,
      suiSignAndExecuteTransaction,
      suiWalletStore,
      xrplSignAndSubmitTransaction,
      xrplWalletStore,
    ]
  );

  useEffect(() => {
    const { status, message, hash, chain } = { ...response };
    const chainData = getChainData(chain, chains);

    toast.remove();

    if (message && status) {
      if ((hash && chainData?.explorer) || status === 'failed') {
        const icon =
          status === 'success' ? (
            <PiCheckCircleFill
              size={20}
              className={recoveryButtonsStyles.toastSuccessIcon}
            />
          ) : status === 'failed' ? (
            <PiXCircleFill
              size={20}
              className={recoveryButtonsStyles.toastFailedIcon}
            />
          ) : null;

        toast.custom(
          <div className={recoveryButtonsStyles.toastContainer}>
            <div className={recoveryButtonsStyles.toastMessageRow}>
              {icon}
              <span className={recoveryButtonsStyles.toastMessageText}>
                {message}
              </span>
            </div>
            {chainData?.explorer && hash && chain && (
              <div className={recoveryButtonsStyles.toastExplorerRow}>
                <ExplorerLink
                  value={hash}
                  chain={chain}
                  iconOnly={false}
                  nonIconClassName={recoveryButtonsStyles.toastExplorerLink}
                />
                <button
                  onClick={() => setResponse(null)}
                  className={recoveryButtonsStyles.toastDismissButton}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>,
          { duration: 60000 }
        );
      } else {
        const duration = 10000;

        switch (status) {
          case 'pending':
            toast.loading(message);
            break;
          case 'success':
            toast.success(message, { duration });
            break;
          default:
            break;
        }
      }
    }
  }, [chains, response]);

  const entries = useMemo<RecoveryButtonEntry[]>(() => {
    const values: RecoveryButtonEntry[] = [];

    if (shouldShowAddGasButton(data, response, chains)) {
      values.push([
        'pay_gas',
        <AddGasButton
          key="pay_gas"
          data={data}
          processing={processing}
          onAddGas={addGas}
          response={response}
          chains={chains}
          chainId={chainId}
          signer={signer}
          cosmosWalletStore={cosmosWalletStore}
          suiWalletStore={suiWalletStore}
          stellarWalletStore={stellarWalletStore}
          xrplWalletStore={xrplWalletStore}
        />,
      ]);
    }

    const executeElement = shouldShowExecuteButton(data) ? (
      <ExecuteButton
        key="execute"
        data={data}
        processing={processing}
        onExecute={execute}
        onApprove={approve}
        chains={chains}
        chainId={chainId}
        signer={signer}
        cosmosWalletStore={cosmosWalletStore}
        suiWalletStore={suiWalletStore}
        stellarWalletStore={stellarWalletStore}
        xrplWalletStore={xrplWalletStore}
      />
    ) : null;

    if (executeElement) {
      values.push(['execute', executeElement]);
    }

    if (
      shouldShowApproveButton(data, chains, estimatedTimeSpent ?? null) &&
      data?.call
    ) {
      const { call, confirm } = data;
      const sourceChainData = getChainData(call?.chain, chains);

      let approveKey: 'approve' | 'confirm' | 'execute' = 'approve';

      if (
        (!confirm || data.confirm_failed) &&
        !isAxelar(call.chain) &&
        sourceChainData?.chain_type !== 'cosmos'
      ) {
        approveKey = 'confirm';
      } else if (sourceChainData?.chain_type === 'cosmos' && !executeElement) {
        approveKey = 'execute';
      }

      values.push([
        approveKey,
        <ApproveButton
          key={approveKey}
          data={data}
          processing={processing}
          onApprove={approve}
          chains={chains}
          estimatedTimeSpent={estimatedTimeSpent ?? null}
        />,
      ]);
    }

    return values;
  }, [
    addGas,
    approve,
    chains,
    cosmosWalletStore,
    data,
    estimatedTimeSpent,
    execute,
    processing,
    response,
    signer,
    stellarWalletStore,
    suiWalletStore,
    xrplWalletStore,
    chainId,
  ]);

  return entries;
}
