'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { PiCheckCircleFill, PiXCircleFill } from 'react-icons/pi';

import { ExplorerLink } from '@/components/ExplorerLink';
import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';

import { AddGasButton } from '../AddGasButton/AddGasButton';
import { ApproveButton } from '../ApproveButton/ApproveButton';
import { ExecuteButton } from '../ExecuteButton/ExecuteButton';
import type { GMPToastState } from '../GMP.types';
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

  useEffect(() => {
    const { status, message, hash, chain } = { ...response };
    const chainData = getChainData(chain, chains);

    toast.remove();

    if (message && status) {
      const hasExplorerLink = Boolean(chainData?.explorer && hash && chain);
      const shouldShowCustomToast = hasExplorerLink || status === 'failed';

      if (shouldShowCustomToast) {
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
            {hasExplorerLink && (
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
      }

      if (!shouldShowCustomToast) {
        const duration = 10000;
        const fallbackStatus = status as GMPToastState['status'];

        switch (fallbackStatus) {
          case 'pending':
            toast.loading(message);
            break;
          case 'success':
            toast.success(message, { duration });
            break;
          case 'failed':
            toast.error(message, { duration });
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
          chains={chains}
          setProcessing={setProcessing}
          setResponse={setResponse}
          refreshData={refreshData}
        />,
      ]);
    }

    const executeElement = shouldShowExecuteButton(data) ? (
      <ExecuteButton
        key="execute"
        data={data}
        processing={processing}
        chains={chains}
        setProcessing={setProcessing}
        setResponse={setResponse}
        refreshData={refreshData}
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
          setProcessing={setProcessing}
          setResponse={setResponse}
        />,
      ]);
    }

    return values;
  }, [chains, data, estimatedTimeSpent, processing, response, refreshData]);

  return entries;
}
