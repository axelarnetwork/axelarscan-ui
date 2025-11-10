import { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import { providers } from 'ethers';

import { CosmosWalletState } from '@/components/Wallet/CosmosWallet.hooks';
import { StellarWalletState } from '@/components/Wallet/StellarWallet';
import { SuiWalletState } from '@/components/Wallet/SuiWallet.hooks';
import { XRPLWalletState } from '@/components/Wallet/XRPLWallet.hooks';

import { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';

export interface ExecuteActionParams {
  data: GMPMessage;
  sdk: AxelarGMPRecoveryAPI | null;
  provider: providers.Web3Provider | null;
  signer: providers.JsonRpcSigner | null;
  setResponse: (response: GMPToastState) => void;
  setProcessing: (processing: boolean) => void;
  getData: () => Promise<GMPMessage | undefined>;
}

export interface ExecuteButtonProps {
  data: GMPMessage | null;
  processing: boolean;
  onExecute: (data: GMPMessage) => Promise<void>;
  onApprove: (data: GMPMessage) => Promise<void>;
  chains: ChainMetadata[] | null;
  chainId: number | null;
  signer: providers.JsonRpcSigner | null;
  cosmosWalletStore: CosmosWalletState;
  suiWalletStore: SuiWalletState;
  stellarWalletStore: StellarWalletState;
  xrplWalletStore: XRPLWalletState;
}

