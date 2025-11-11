import { useMemo, type ReactNode } from 'react';

import { isAxelar } from '@/lib/chain';
import { getChainData } from '@/lib/config';
import { toTitle } from '@/lib/string';
import { AddGasButton } from '../AddGasButton';
import { ApproveButton } from '../ApproveButton';
import { ExecuteButton } from '../ExecuteButton';
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
  recovery,
}: RecoveryButtonsProps) {
  const {
    processing,
    response,
    chainId,
    signer,
    cosmosWalletStore,
    suiWalletStore,
    stellarWalletStore,
    xrplWalletStore,
    onAddGas,
    onApprove,
    onExecute,
  } = recovery;

  const entries = useMemo(() => {
    const values: Array<[string, ReactNode]> = [];

    if (shouldShowAddGasButton(data, response, chains)) {
      values.push([
        'pay_gas',
        <AddGasButton
          key="pay_gas"
          data={data}
          processing={processing}
          onAddGas={onAddGas}
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
        onExecute={onExecute}
        onApprove={onApprove}
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
          onApprove={onApprove}
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
    onAddGas,
    onApprove,
    onExecute,
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
