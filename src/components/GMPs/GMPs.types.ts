// Re-export shared filter types used by GMPs.Filters
export type { FilterOption, FilterAttribute } from '@/types';

export interface GMPsProps {
  address?: string;
  useAnotherHopChain?: boolean;
}

export interface GMPSearchResults {
  [key: string]: {
    data?: GMPRowData[];
    total?: number;
  };
}

export interface InterchainTransferData {
  symbol?: string;
  contract_address?: string;
  destinationAddress?: string;
  destinationChain?: string;
  recipient?: string;
  amount?: number | string;
  [key: string]: unknown;
}

export interface GMPCallData {
  transactionHash: string;
  chain: string;
  chain_type?: string;
  block_timestamp: number;
  proposal_id?: string;
  parentMessageID?: string;
  axelarTransactionHash?: string;
  logIndex?: number;
  messageIdIndex?: number;
  event?: string;
  returnValues?: {
    symbol?: string;
    sender?: string;
    destinationChain?: string;
    destinationContractAddress?: string;
    payload?: string;
    [key: string]: unknown;
  };
  transaction?: { from?: string };
  created_at?: { ms?: number };
  [key: string]: unknown;
}

export interface GMPRowData {
  message_id?: string;
  call: GMPCallData;
  interchain_transfer?: InterchainTransferData;
  interchain_transfers?: InterchainTransferData[];
  token_manager_deployment_started?: { symbol?: string; [key: string]: unknown };
  interchain_token_deployment_started?: { tokenSymbol?: string; [key: string]: unknown };
  link_token_started?: { symbol?: string; [key: string]: unknown };
  token_metadata_registered?: { symbol?: string; [key: string]: unknown };
  settlement_forwarded_events?: unknown;
  settlement_filled_events?: unknown;
  originData?: GMPRowData;
  customValues?: {
    recipientAddress?: string;
    recipientAddresses?: { recipientAddress: unknown; chain: unknown }[];
    destinationChain?: string;
    projectId?: string;
    projectName?: string;
    [key: string]: unknown;
  };
  simplified_status?: string;
  status?: string;
  time_spent?: Record<string, number>;
  express_executed?: { transactionHash?: string };
  executed?: { transactionHash?: string };
  is_insufficient_fee?: boolean;
  is_invalid_gas_paid?: boolean;
  is_invalid_destination_chain?: boolean;
  is_invalid_contract_address?: boolean;
  origin_chain?: string;
  callback_chain?: string;
  callback_destination_address?: string;
  amount?: number | string;
  [key: string]: unknown;
}

export interface GMPRowProps {
  data: GMPRowData;
  useAnotherHopChain: boolean;
}

/** Wider input type for getEvent/getStatusLabel — compatible with both GMPRowData and GMPMessage */
export interface EventDataInput {
  call?: {
    event?: string;
    returnValues?: { destinationChain?: string; [key: string]: unknown };
    [key: string]: unknown;
  };
  interchain_transfer?: Record<string, unknown>;
  token_manager_deployment_started?: Record<string, unknown>;
  interchain_token_deployment_started?: Record<string, unknown>;
  link_token_started?: Record<string, unknown>;
  token_metadata_registered?: Record<string, unknown>;
  settlement_forwarded_events?: unknown;
  settlement_filled_events?: unknown;
  interchain_transfers?: Record<string, unknown>[];
  originData?: EventDataInput;
  simplified_status?: string;
  [key: string]: unknown;
}
