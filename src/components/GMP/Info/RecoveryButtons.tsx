import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { PiCheckCircleFill, PiXCircleFill } from 'react-icons/pi';
import { useSignAndExecuteTransaction as useSuiSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSignAndSubmitTransaction as useXRPLSignAndSubmitTransaction } from '@xrpl-wallet-standard/react';

import { ExplorerLink } from '@/components/ExplorerLink';
import { useCosmosWalletStore } from '@/components/Wallet/CosmosWallet.hooks';
import { useEVMWalletStore } from '@/components/Wallet/EVMWallet';
import { useStellarWalletStore } from '@/components/Wallet/StellarWallet';
import { useSuiWalletStore } from '@/components/Wallet/SuiWallet';
import { useXRPLWalletStore } from '@/components/Wallet/XRPLWallet';
import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';
import { toTitle } from '@/lib/string';
import { executeAddGas } from '../AddGasButton/AddGasButton.utils';
import { AddGasButton } from '../AddGasButton/AddGasButton';
import { executeApprove } from '../ApproveButton/ApproveButton.utils';
import { ApproveButton } from '../ApproveButton/ApproveButton';
import { executeExecute } from '../ExecuteButton/ExecuteButton.utils';
import { ExecuteButton } from '../ExecuteButton/ExecuteButton';
import { useEstimatedGasUsed, useGMPRecoveryAPI } from '../GMP.hooks';
import type { GMPMessage, GMPToastState } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { RecoveryButtonsProps } from './RecoveryButtons.types';
import { recoveryButtonsStyles } from './RecoveryButtons.styles';
import {
  shouldShowAddGasButton,
  shouldShowApproveButton,
  shouldShowExecuteButton,
} from './RecoveryButtons.utils';

export function RecoveryButtons({
  data,
  chains,
  estimatedTimeSpent,
  refreshData,
}: RecoveryButtonsProps) {
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
    async (message: GMPMessage, afterPayGas: boolean = false): Promise<void> => {
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
          status === 'success'
            ? <PiCheckCircleFill size={20} className="text-green-600" />
            : status === 'failed'
              ? <PiXCircleFill size={20} className="text-red-600" />
              : null;

        toast.custom(
          <div className="flex flex-col gap-y-1 rounded-lg bg-white px-3 py-2.5 shadow-lg sm:gap-y-0">
            <div className="flex items-center gap-x-1.5 sm:gap-x-2">
              {icon}
              <span className="whitespace-pre-wrap text-zinc-700">
                {message}
              </span>
            </div>
            {chainData?.explorer && hash && chain && (
              <div className="ml-6 flex items-center justify-between gap-x-4 pl-0.5 sm:ml-7 sm:pl-0">
                <ExplorerLink
                  value={hash}
                  chain={chain}
                  iconOnly={false}
                  nonIconClassName="text-zinc-700 text-xs sm:text-sm"
                />
                <button
                  onClick={() => setResponse(null)}
                  className="text-xs font-light text-zinc-400 underline sm:text-sm"
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

  const entries = useMemo(() => {
    const values: Array<[string, ReactNode]> = [];

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
    chainId,
    chains,
    cosmosWalletStore,
    data,
    estimatedTimeSpent,
    addGas,
    approve,
    execute,
    processing,
    response,
    signer,
    stellarWalletStore,
    suiWalletStore,
    xrplWalletStore,
  ]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={infoStyles.section}>
      <dt className={infoStyles.label}>Recovery</dt>
      <dd className={infoStyles.value}>
        <div className={recoveryButtonsStyles.list}>
          {entries.map(([key, node]) => (
            <div key={key} className={recoveryButtonsStyles.item}>
              <span className={recoveryButtonsStyles.label}>
                {toTitle(key)}:
              </span>
              <div className={recoveryButtonsStyles.value}>{node}</div>
            </div>
          ))}
        </div>
      </dd>
    </div>
  );
}
