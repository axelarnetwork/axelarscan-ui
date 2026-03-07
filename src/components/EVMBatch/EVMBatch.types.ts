import { ReactNode } from 'react';

export interface BatchCommand {
  id: string;
  type?: string;
  executed?: boolean;
  transactionHash?: string;
  deposit_address?: string;
  params?: {
    symbol?: string;
    decimals?: number;
    amount?: string;
    name?: string;
    cap?: number;
    account?: string;
    salt?: string;
    newOwners?: string;
    newOperators?: string;
    newWeights?: string;
    newThreshold?: string;
    sourceChain?: string;
    sourceTxHash?: string;
    contractAddress?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface BatchData {
  key_id?: string;
  commands?: BatchCommand[];
  created_at?: { ms?: number };
  execute_data?: string;
  prev_batched_commands_id?: string;
  status?: string;
  data?: string;
  proof?: { signatures?: string[] };
  signature?: string | string[];
  [key: string]: unknown;
}

export interface ExecuteResponse {
  status?: string;
  message?: string;
  hash?: string;
}

export interface InfoProps {
  data: BatchData;
  chain: string;
  id: string;
  executeButton: ReactNode;
}

export interface EVMBatchProps {
  chain: string;
  id: string;
}
