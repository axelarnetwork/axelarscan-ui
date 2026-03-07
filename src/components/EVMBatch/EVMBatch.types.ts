import { ReactNode } from 'react';

import type { Chain, Asset } from '@/types';

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

export interface CommandRowProps {
  command: BatchCommand;
  chain: string;
  url?: string;
  address_path?: string;
  transaction_path?: string;
  chains: Chain[] | null | undefined;
  assets: Asset[] | null | undefined;
}

export interface CommandParamsProps {
  command: BatchCommand;
  chain: string;
  url?: string;
  transaction_path?: string;
  chains: Chain[] | null | undefined;
  assets: Asset[] | null | undefined;
}

// CommandParams sub-component props
export interface AssetBadgeProps {
  image: string | undefined;
  amount: string | undefined;
  assets: unknown;
  decimals: number | undefined;
  symbol: string | undefined;
}

export interface SourceChainInfoProps {
  sourceChainData: Chain;
  sourceTxHash: string | undefined;
  commandId: string;
  contractAddress: string | undefined;
  destinationChainData: Chain | undefined;
  chain: string;
}

export interface MintTransferInfoProps {
  transferID: number;
  account: string | undefined;
  chain: string;
}

export interface SaltInfoProps {
  salt: string;
  depositAddress: string | undefined;
}

export interface NameInfoProps {
  name: string;
  decimals: number | undefined;
  cap: number | undefined;
}

export interface OperatorsInfoProps {
  newOperators: string;
  newWeights: string | undefined;
}

// Info sub-component props
export interface ChainRowProps {
  url: string | undefined;
  addressPath: string | undefined;
  gatewayAddress: string | undefined;
  chain: string;
}

export interface StatusRowProps {
  status: string | undefined;
  executeButton: ReactNode;
}

export interface CommandsSectionProps {
  commands: BatchCommand[];
  chain: string;
  url: string | undefined;
  transaction_path: string | undefined;
  chains: Chain[] | null | undefined;
  assets: Asset[] | null | undefined;
}

export interface TimeRowProps {
  createdAtMs: number | undefined;
}

export interface DataRowProps {
  label: string;
  value: string | undefined;
}

export interface SignaturesRowProps {
  signatures: string[];
}
