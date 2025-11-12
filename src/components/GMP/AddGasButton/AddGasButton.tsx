import clsx from 'clsx';
import { gmpStyles } from '../GMP.styles';
import { WalletSelector } from '../WalletSelector/WalletSelector';
import { useAddGasButton } from './AddGasButton.hooks';
import { AddGasButtonProps } from './AddGasButton.types';

export function AddGasButton(props: AddGasButtonProps) {
  const { data, processing, chains } = props;
  const {
    buttonLabel,
    isWalletConnected,
    needsSwitchChain,
    targetChain,
    targetChainType,
    handleAddGas,
  } = useAddGasButton(props);

  if (!data?.call) {
    return null;
  }

  return (
    <div key="addGas" className={gmpStyles.actionRow}>
      {isWalletConnected && !needsSwitchChain && (
        <button
          disabled={processing}
          onClick={handleAddGas}
          className={clsx(gmpStyles.actionButton(processing))}
        >
          {buttonLabel}
        </button>
      )}
      <WalletSelector
        targetChain={targetChain}
        targetChainType={targetChainType}
        chains={chains}
      />
    </div>
  );
}
