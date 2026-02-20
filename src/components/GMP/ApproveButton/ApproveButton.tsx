import clsx from 'clsx';
import { useMemo } from 'react';

import { useGlobalStore } from '@/components/Global';
import { CosmosWallet } from '@/components/Wallet/CosmosWallet';
import { getChainData } from '@/lib/config';

import { gmpStyles } from '../GMP.styles';
import { WalletSelector } from '../WalletSelector/WalletSelector';
import { useApproveButton } from './ApproveButton.hooks';
import { ApproveButtonProps } from './ApproveButton.types';

export function ApproveButton(props: ApproveButtonProps) {
  const { chains } = useGlobalStore();
  const { data, processing, setProcessing, setResponse } = props;
  const axelarChainId = useMemo(() => {
    const chainData = getChainData('axelarnet', chains);
    return typeof chainData?.chain_id === 'string'
      ? chainData.chain_id
      : undefined;
  }, [chains]);
  const {
    buttonLabel,
    isCosmosWalletConnected,
    requiresCosmosWallet,
    isEvmWalletConnected,
    needsEvmWallet,
    targetChain,
    targetChainType,
    handleApprove,
  } = useApproveButton({
    data,
    processing,
    setProcessing,
    setResponse,
  });

  if (!data?.call) {
    return null;
  }

  const canApprove = requiresCosmosWallet
    ? isCosmosWalletConnected
    : !needsEvmWallet || isEvmWalletConnected;

  return (
    <div key="approve" className={gmpStyles.actionRow}>
      {canApprove && (
        <button
          disabled={processing}
          onClick={handleApprove}
          className={clsx(gmpStyles.actionButton(processing))}
        >
          {buttonLabel}
        </button>
      )}
      {requiresCosmosWallet && !isCosmosWalletConnected && (
        <CosmosWallet connectChainId={axelarChainId} />
      )}
      {!requiresCosmosWallet && needsEvmWallet && !isEvmWalletConnected && (
        <WalletSelector
          targetChain={targetChain}
          targetChainType={targetChainType}
          chains={chains}
        />
      )}
    </div>
  );
}
