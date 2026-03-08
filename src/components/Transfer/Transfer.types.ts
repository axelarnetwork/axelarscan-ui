import type { Chain } from '@/types';

export interface TransferData extends Record<string, unknown> {
  link?: Record<string, unknown>;
  send?: Record<string, unknown>;
  wrap?: Record<string, unknown>;
  unwrap?: Record<string, unknown>;
  erc20_transfer?: Record<string, unknown>;
  confirm?: Record<string, unknown>;
  vote?: Record<string, unknown>;
  command?: Record<string, unknown>;
  ibc_send?: Record<string, unknown>;
  axelar_transfer?: Record<string, unknown>;
  type?: string;
  transfer_id?: string;
  simplified_status?: string;
  time_spent?: { total?: number };
  status?: string;
  code?: number;
  message?: string;
}

export interface TransferStepData {
  txhash?: string;
  poll_id?: string;
  batch_id?: string;
  transactionHash?: string;
  recv_txhash?: string;
  ack_txhash?: string;
  failed_txhash?: string;
  tx_hash_unwrap?: string;
  height?: string | number;
  blockNumber?: string | number;
  block_timestamp?: number;
  received_at?: { ms?: number };
  created_at?: { ms?: number };
  [key: string]: unknown;
}

export interface TransferStep {
  id: string;
  title: string;
  status: string;
  data?: TransferStepData;
  chainData?: Chain;
}

export interface InfoProps {
  data: TransferData;
  tx?: string;
}

export interface CompletedStepProps {
  step: TransferStep;
  stepURL: string | undefined;
}

export interface StepElementProps {
  step: TransferStep;
}

export interface PendingStepProps {
  step: TransferStep;
  prevStatus?: string;
}

export interface DetailsProps {
  data: TransferData;
}

export interface StepTxInfo {
  stepTX: string | undefined;
  stepURL: string | undefined;
  stepMoreInfos: React.ReactNode[];
}

export interface DetailsRowProps {
  step: TransferStep;
  stepTX: string | undefined;
  stepURL: string | undefined;
  stepMoreInfos: React.ReactNode[];
  axelarChainData: ReturnType<typeof import('@/lib/config').getChainData>;
}

export interface StatusStepsProps {
  steps: TransferStep[];
  axelarChainData: ReturnType<typeof import('@/lib/config').getChainData>;
  destinationChainData: ReturnType<typeof import('@/lib/config').getChainData>;
  insufficientFee?: boolean;
}

export interface SearchTransfersResult {
  data?: TransferData[];
}

export interface TransferProps {
  tx?: string;
  lite?: boolean;
  initialData?: SearchTransfersResult | null;
}
