import type { Dispatch, SetStateAction } from 'react';
import { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import { providers } from 'ethers';

import { GMPMessage, GMPToastState } from '../GMP.types';

export interface ApproveActionParams {
  data: GMPMessage;
  sdk: AxelarGMPRecoveryAPI | null;
  provider: providers.Web3Provider | null;
  cosmosSigner?: unknown;
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
