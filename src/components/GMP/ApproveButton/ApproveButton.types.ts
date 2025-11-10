import { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import { providers } from 'ethers';

import { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';

export interface ApproveActionParams {
  data: GMPMessage;
  sdk: AxelarGMPRecoveryAPI | null;
  provider: providers.Web3Provider | null;
  setResponse: (response: GMPToastState) => void;
  setProcessing: (processing: boolean) => void;
  afterPayGas?: boolean;
}

export interface ApproveButtonProps {
  data: GMPMessage | null;
  processing: boolean;
  onApprove: (data: GMPMessage) => Promise<void>;
  chains: ChainMetadata[] | null;
  estimatedTimeSpent: { confirm?: number } | null;
}

