import { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import { providers } from 'ethers';

import {
  ChainMetadata,
  GMPMessage,
  GMPToastState,
  WalletContext,
} from '../GMP.types';

type CosmosWalletStore = WalletContext['cosmosWalletStore'];
type SuiWalletStore = WalletContext['suiWalletStore'];
type StellarWalletStore = WalletContext['stellarWalletStore'];
type XRPLWalletStore = WalletContext['xrplWalletStore'];

type GenericAsyncFn = (...args: any[]) => Promise<unknown>;

export interface AddGasActionParams {
  data: GMPMessage;
  sdk: AxelarGMPRecoveryAPI | null;
  chains: ChainMetadata[] | null;
  provider: providers.Web3Provider | null;
  signer: providers.JsonRpcSigner | null;
  address: string | null;
  cosmosWalletStore: CosmosWalletStore;
  suiWalletStore: SuiWalletStore;
  stellarWalletStore: StellarWalletStore;
  xrplWalletStore: XRPLWalletStore;
  estimatedGasUsed: number | null;
  setResponse: (response: GMPToastState) => void;
  setProcessing: (processing: boolean) => void;
  getData: () => Promise<GMPMessage | undefined>;
  approve: (data: GMPMessage, auto?: boolean) => Promise<void>;
  suiSignAndExecuteTransaction: GenericAsyncFn;
  xrplSignAndSubmitTransaction: GenericAsyncFn;
}

export interface AddGasButtonProps {
  data: GMPMessage | null;
  processing: boolean;
  onAddGas: (data: GMPMessage) => Promise<void>;
  response: GMPToastState | null;
  chains: ChainMetadata[] | null;
  chainId: number | null;
  signer: providers.JsonRpcSigner | null;
  cosmosWalletStore: CosmosWalletStore;
  suiWalletStore: SuiWalletStore;
  stellarWalletStore: StellarWalletStore;
  xrplWalletStore: XRPLWalletStore;
}
