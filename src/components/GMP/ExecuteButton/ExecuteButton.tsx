import clsx from 'clsx';

import { getChainData } from '@/lib/config';

import { gmpStyles } from '../GMP.styles';
import { shouldSwitchChain } from '../GMP.utils';
import { WalletSelector } from '../WalletSelector';
import { ExecuteButtonProps } from './ExecuteButton.types';
import { shouldShowExecuteButton } from './ExecuteButton.utils';

export function ExecuteButton({
  data,
  processing,
  onExecute,
  onApprove,
  chains,
  chainId,
  signer,
  cosmosWalletStore,
  suiWalletStore,
  stellarWalletStore,
  xrplWalletStore,
}: ExecuteButtonProps) {
  // Check if button should be shown
  if (!shouldShowExecuteButton(data, chains)) {
    return null;
  }

  const { call } = data!;
  const isCosmosDestination = call.destination_chain_type === 'cosmos';

  // Compute wallet state
  const destinationChainData = getChainData(call.returnValues?.destinationChain, chains);
  const walletContext = {
    cosmosWalletStore,
    signer,
    suiWalletStore,
    stellarWalletStore,
    xrplWalletStore,
  };

  const isWalletConnected = Boolean(signer);
  const needsSwitchChain = shouldSwitchChain(
    destinationChainData?.chain_id,
    call.destination_chain_type,
    walletContext,
    chainId
  );

  return (
    <div key="execute" className={gmpStyles.actionRow}>
      {(isCosmosDestination || (isWalletConnected && !needsSwitchChain)) && (
        <button
          disabled={processing}
          onClick={() => (isCosmosDestination ? onApprove(data!) : onExecute(data!))}
          className={clsx(gmpStyles.actionButton(processing))}
        >
          Execut{processing ? 'ing...' : 'e'}
        </button>
      )}
      {!isCosmosDestination && (
        <WalletSelector
          targetChain={call.returnValues?.destinationChain}
          targetChainType={call.destination_chain_type}
          chains={chains}
        />
      )}
    </div>
  );
}
