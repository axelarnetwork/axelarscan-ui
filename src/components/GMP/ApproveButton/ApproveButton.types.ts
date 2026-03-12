import type { Dispatch, SetStateAction } from 'react';
import { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import { providers } from 'ethers';
import type { KeplrSigner } from '@/types/cosmos';

import { GMPMessage, GMPToastState } from '../GMP.types';

export interface ApproveActionParams {
  data: GMPMessage;
  sdk: AxelarGMPRecoveryAPI | null;
  provider: providers.Web3Provider | null;
  cosmosSigner?: KeplrSigner | null;
  setResponse: (response: GMPToastState) => void;
  setProcessing: (processing: boolean) => void;
  afterPayGas?: boolean;
}

export interface ApproveButtonProps {
  data: GMPMessage | null;
  processing: boolean;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
}

export interface UseApproveActionParams {
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
  cosmosSigner?: KeplrSigner | null;
}

export interface UseApproveButtonOptions {
  data: GMPMessage | null;
  processing: boolean;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
}

export interface UseApproveButtonResult {
  buttonLabel: string;
  isCosmosWalletConnected: boolean;
  requiresCosmosWallet: boolean;
  isEvmWalletConnected: boolean;
  needsEvmWallet: boolean;
  targetChain: string | undefined;
  targetChainType: string | undefined;
  handleApprove: () => Promise<void>;
}
