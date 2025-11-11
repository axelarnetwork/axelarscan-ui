import { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import { providers } from 'ethers';

import type {
  ChainMetadata,
  GMPMessage,
  GMPToastState,
  WalletContext,
} from '../GMP.types';

type CosmosWalletStore = WalletContext['cosmosWalletStore'];
type SuiWalletStore = WalletContext['suiWalletStore'];
type StellarWalletStore = WalletContext['stellarWalletStore'];
type XRPLWalletStore = WalletContext['xrplWalletStore'];

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
  cosmosWalletStore: CosmosWalletStore;
  suiWalletStore: SuiWalletStore;
  stellarWalletStore: StellarWalletStore;
  xrplWalletStore: XRPLWalletStore;
}
