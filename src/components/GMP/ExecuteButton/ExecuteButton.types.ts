import type { Dispatch, SetStateAction } from 'react';
import type { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import type { providers } from 'ethers';
import type { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';

export interface ExecuteButtonProps {
  data: GMPMessage | null;
  processing: boolean;
  chains: ChainMetadata[] | null;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
  refreshData: () => Promise<GMPMessage | undefined>;
}

export interface UseExecuteActionParams {
  refreshData: () => Promise<GMPMessage | undefined>;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
}

export interface UseExecuteButtonResult {
  buttonLabel: string;
  isCosmosDestination: boolean;
  isWalletConnected: boolean;
  needsSwitchChain: boolean;
  targetChain: string | undefined;
  targetChainType: string | undefined;
  handleExecute: () => Promise<void>;
}

export interface UseExecuteButtonOptions {
  data: GMPMessage | null;
  processing: boolean;
  chains: ChainMetadata[] | null;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
  refreshData: () => Promise<GMPMessage | undefined>;
}

export interface ExecuteActionParams {
  data: GMPMessage;
  sdk: AxelarGMPRecoveryAPI | null;
  provider: providers.Web3Provider | null;
  signer: providers.JsonRpcSigner | null;
  setResponse: (response: GMPToastState) => void;
  setProcessing: (processing: boolean) => void;
  getData: () => Promise<GMPMessage | undefined>;
}
