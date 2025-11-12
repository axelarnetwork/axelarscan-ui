import clsx from 'clsx';

import { getChainData } from '@/lib/config';

import { gmpStyles } from '../GMP.styles';
import { isWalletConnectedForChain, shouldSwitchChain } from '../GMP.utils';
import { WalletSelector } from '../WalletSelector/WalletSelector';
import { AddGasButtonProps } from './AddGasButton.types';

export function AddGasButton({
  data,
  processing,
  onAddGas,
  response: _response,
  chains,
  chainId,
  signer,
  cosmosWalletStore,
  suiWalletStore,
  stellarWalletStore,
  xrplWalletStore,
}: AddGasButtonProps) {
  if (!data?.call) {
    return null;
  }

  const { call, gas_paid } = data;

  const sourceChainData = getChainData(call.chain, chains)!;

  // Compute wallet connection and switch state
  const walletContext = {
    cosmosWalletStore,
    signer,
    suiWalletStore,
    stellarWalletStore,
    xrplWalletStore,
  };

  const isWalletConnected = isWalletConnectedForChain(
    call.chain,
    call.chain_type,
    chains,
    walletContext
  );

  const needsSwitchChain = shouldSwitchChain(
    sourceChainData.chain_id || sourceChainData.id,
    call.chain_type,
    walletContext,
    chainId
  );

  let buttonLabel: string;
  if (processing) {
    buttonLabel = gas_paid ? 'Adding gas...' : 'Paying gas...';
  } else {
    buttonLabel = gas_paid ? 'Add gas' : 'Pay gas';
  }

  return (
    <div key="addGas" className={gmpStyles.actionRow}>
      {isWalletConnected && !needsSwitchChain && (
        <button
          disabled={processing}
          onClick={() => onAddGas(data!)}
          className={clsx(gmpStyles.actionButton(processing))}
        >
          {buttonLabel}
        </button>
      )}
      <WalletSelector
        targetChain={call.chain}
        targetChainType={call.chain_type}
        chains={chains}
      />
    </div>
  );
}
