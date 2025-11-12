import clsx from 'clsx';

import { getChainData } from '@/lib/config';

import { gmpStyles } from '../GMP.styles';
import { shouldSwitchChain } from '../GMP.utils';
import { WalletSelector } from '../WalletSelector/WalletSelector';
import { ExecuteButtonProps } from './ExecuteButton.types';

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
  if (!data || !data.call) {
    return null;
  }

  const call = data.call;
  const isCosmosDestination = call.destination_chain_type === 'cosmos';

  // Compute wallet state
  const destinationChainData = getChainData(
    call.returnValues?.destinationChain,
    chains
  );
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

  const buttonLabel = processing ? 'Executing...' : 'Execute';

  return (
    <div key="execute" className={gmpStyles.actionRow}>
      {(isCosmosDestination || (isWalletConnected && !needsSwitchChain)) && (
        <button
          disabled={processing}
          onClick={() =>
            isCosmosDestination ? onApprove(data!) : onExecute(data!)
          }
          className={clsx(gmpStyles.actionButton(processing))}
        >
          {buttonLabel}
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
