import { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import { SignAndExecuteTransaction } from '@mysten/dapp-kit';
import { SignAndSubmitTransaction } from '@xrpl-wallet-standard/react';
import { providers } from 'ethers';

import { CosmosWalletState } from '@/components/Wallet/CosmosWallet.hooks';
import { StellarWalletState } from '@/components/Wallet/StellarWallet';
import { SuiWalletState } from '@/components/Wallet/SuiWallet.hooks';
import { XRPLWalletState } from '@/components/Wallet/XRPLWallet.hooks';

import { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';

export interface AddGasActionParams {
  data: GMPMessage;
  sdk: AxelarGMPRecoveryAPI | null;
  chains: ChainMetadata[] | null;
  provider: providers.Web3Provider | null;
  signer: providers.JsonRpcSigner | null;
  address: string | null;
  cosmosWalletStore: CosmosWalletState;
  suiWalletStore: SuiWalletState;
  stellarWalletStore: StellarWalletState;
  xrplWalletStore: XRPLWalletState;
  estimatedGasUsed: number | null;
  setResponse: (response: GMPToastState) => void;
  setProcessing: (processing: boolean) => void;
  getData: () => Promise<GMPMessage | undefined>;
  approve: (data: GMPMessage, auto?: boolean) => Promise<void>;
  suiSignAndExecuteTransaction: SignAndExecuteTransaction;
  xrplSignAndSubmitTransaction: SignAndSubmitTransaction;
}

export interface AddGasButtonProps {
  data: GMPMessage | null;
  processing: boolean;
  onAddGas: (data: GMPMessage) => Promise<void>;
  response: GMPToastState | null;
  chains: ChainMetadata[] | null;
  chainId: number | null;
  signer: providers.JsonRpcSigner | null;
  cosmosWalletStore: CosmosWalletState;
  suiWalletStore: SuiWalletState;
  stellarWalletStore: StellarWalletState;
  xrplWalletStore: XRPLWalletState;
}

