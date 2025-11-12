import clsx from 'clsx';

import { gmpStyles } from '../GMP.styles';
import { WalletSelector } from '../WalletSelector/WalletSelector';
import { useExecuteButton } from './ExecuteButton.hooks';
import { ExecuteButtonProps } from './ExecuteButton.types';

export function ExecuteButton(props: ExecuteButtonProps) {
  const { data, processing, chains, setProcessing, setResponse, refreshData } =
    props;
  const {
    buttonLabel,
    isCosmosDestination,
    isWalletConnected,
    needsSwitchChain,
    targetChain,
    targetChainType,
    handleExecute,
  } = useExecuteButton({
    data,
    processing,
    chains,
    setProcessing,
    setResponse,
    refreshData,
  });

  if (!data?.call) {
    return null;
  }

  return (
    <div key="execute" className={gmpStyles.actionRow}>
      {(isCosmosDestination || (isWalletConnected && !needsSwitchChain)) && (
        <button
          disabled={processing}
          onClick={handleExecute}
          className={clsx(gmpStyles.actionButton(processing))}
        >
          {buttonLabel}
        </button>
      )}
      {!isCosmosDestination && (
        <WalletSelector
          targetChain={targetChain}
          targetChainType={targetChainType}
          chains={chains}
        />
      )}
    </div>
  );
}
