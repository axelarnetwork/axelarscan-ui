import { ReactNode } from 'react';

export interface ExplorerPaths {
  url?: string;
  block_path?: string;
  transaction_path?: string;
  [key: string]: string | undefined;
}

export interface ChainMetadata {
  id?: string;
  name?: string;
  chain_id?: number;
  chain_name?: string;
  deprecated?: boolean;
  explorer?: ExplorerPaths;
  [key: string]: unknown;
}

export interface AssetAddressEntry {
  symbol?: string;
  gas_price?: number;
  [key: string]: unknown;
}

export interface AssetDataEntry {
  addresses?: Record<string, AssetAddressEntry | undefined>;
  [key: string]: unknown;
}

export interface TimestampInfo {
  ms?: number;
  [key: string]: number | undefined;
}

export interface GMPReturnValues {
  destinationChain?: string;
  destinationContractAddress?: string;
  destinationAddress?: string;
  sourceChain?: string;
  sourceAddress?: string;
  sender?: string;
  messageId?: string;
  commandId?: string;
  payload?: string;
  payloadHash?: string;
  symbol?: string;
  amount?: string;
  decimals?: number;
  formattedAmount?: string;
  transactionHash?: string;
  txHash?: string;
  [key: string]: string | number | undefined;
}

export interface GMPLogReceipt {
  status?: boolean;
  gasUsed?: string;
  logsBloom?: string;
  [key: string]: string | boolean | undefined;
}

export interface GMPTransactionDetails {
  from?: string;
  [key: string]: unknown;
}

export interface GMPEventLog {
  id?: string;
  chain?: string;
  chain_type?: string;
  destination_chain_type?: string;
  transactionHash?: string;
  transactionIndex?: number;
  logIndex?: number;
  eventIndex?: number;
  confirmation_txhash?: string;
  poll_id?: string;
  axelarTransactionHash?: string;
  contract_address?: string;
  blockNumber?: number;
  block_number?: number;
  block_timestamp?: number;
  created_at?: TimestampInfo;
  returnValues?: GMPReturnValues;
  receipt?: GMPLogReceipt;
  transaction?: GMPTransactionDetails;
  [key: string]: unknown;
}

export interface GMPTransactionInfo extends GMPEventLog {
  proposal_id?: string;
  expirationTime?: number;
  transaction?: GMPTransactionDetails;
}

export interface GMPSettlementEvent {
  orderHash?: string;
  executed?: GMPEventLog;
  call?: GMPEventLog;
  [key: string]: unknown;
}

export interface GMPTokenPrice {
  usd?: number;
  [key: string]: number | undefined;
}

export interface GMPTokenInfo {
  symbol?: string;
  decimals?: number;
  gas_price?: number;
  amount?: number;
  amountInUnits?: string;
  token_price?: GMPTokenPrice;
  [key: string]: string | number | GMPTokenPrice | undefined;
}

export interface GMPExpressFeeDetail {
  relayer_fee?: number;
  relayer_fee_usd?: number;
  express_fee?: number;
  express_fee_usd?: number;
  express_gas_overhead_fee?: number;
  express_gas_overhead_fee_usd?: number;
  [key: string]: number | undefined;
}

export interface GMPFees {
  base_fee?: number;
  base_fee_usd?: number;
  express_supported?: boolean;
  express_fee?: number;
  express_fee_usd?: number;
  source_confirm_fee?: number;
  source_confirm_fee_usd?: number;
  destination_confirm_fee?: number;
  destination_confirm_fee_usd?: number;
  source_token?: GMPTokenInfo;
  destination_token?: GMPTokenInfo;
  destination_native_token?: GMPTokenInfo;
  source_express_fee?: GMPExpressFeeDetail;
  [key: string]: unknown;
}

export interface GMPGasInfo {
  gas_paid_amount?: number;
  gas_remain_amount?: number;
  gas_used_amount?: number;
  gas_approve_amount?: number;
  gas_execute_amount?: number;
  gas_express_amount?: number;
  gas_destination_native_amount?: number;
  gas_destination_native_amount_usd?: number;
  gas_refunded_amount?: number;
  gas_price?: number;
  decimals?: number;
  [key: string]: number | boolean | string | undefined;
}

export interface GMPTimeSpent {
  total?: number;
  call_express_executed?: number;
  approve?: number;
  confirm?: number;
  execute?: number;
  finalize?: number;
  [key: string]: number | undefined;
}

export interface GMPInterchainTransfer {
  destinationChain?: string;
  destinationAddress?: string;
  symbol?: string;
  amount?: number;
  amountReceived?: number;
  [key: string]: unknown;
}

export interface GMPSettlementData {
  orderHash?: string;
  settlementHash?: string;
  message_id?: string;
  call?: GMPEventLog;
  executed?: GMPEventLog;
  [key: string]: unknown;
}

export interface GMPContractDeploymentEvent {
  symbol?: string;
  [key: string]: unknown;
}

export interface GMPInterchainTokenDeploymentEvent {
  tokenSymbol?: string;
  destinationChain?: string;
  [key: string]: unknown;
}

export interface GMPLinkTokenEvent {
  symbol?: string;
  destinationChain?: string;
  [key: string]: unknown;
}

export interface GMPTokenMetadataEvent {
  symbol?: string;
  [key: string]: unknown;
}

export interface GMPCustomValues {
  recipientAddress?: string;
  destinationChain?: string;
  projectName?: string;
  [key: string]: unknown;
}

export interface GMPMessage {
  message_id?: string;
  command_id?: string;
  txhash?: string;
  call?: GMPTransactionInfo;
  gas_paid?: GMPEventLog | string;
  gas_paid_to_callback?: GMPEventLog;
  gas_paid_transactions?: GMPEventLog[];
  express_executed?: GMPEventLog;
  confirm?: GMPEventLog;
  confirm_failed?: GMPEventLog;
  confirm_failed_event?: GMPEventLog;
  approved?: GMPEventLog;
  executed?: GMPEventLog;
  is_executed?: boolean;
  refunded?: GMPEventLog & { receipt?: GMPLogReceipt };
  refunded_more_transactions?: GMPEventLog[];
  gas?: GMPGasInfo;
  gas_added_transactions?: GMPEventLog[];
  gas_used_transactions?: GMPEventLog[];
  gas_paid_to_callback_transactions?: GMPEventLog[];
  gas_paid_to_callback_amount?: number;
  gas_paid_to_callback_amount_usd?: number;
  gas_paid_amount_usd?: number;
  error?: GMPEventLog;
  fees?: GMPFees;
  interchain_transfer?: GMPInterchainTransfer;
  token_manager_deployment_started?: GMPContractDeploymentEvent;
  interchain_token_deployment_started?: GMPInterchainTokenDeploymentEvent;
  link_token_started?: GMPLinkTokenEvent;
  token_metadata_registered?: GMPTokenMetadataEvent;
  settlement_forwarded_events?: GMPSettlementEvent[];
  settlement_filled_events?: GMPSettlementEvent[];
  settlementForwardedData?: GMPSettlementData[];
  settlementFilledData?: GMPSettlementData[];
  callback?: GMPEventLog;
  callbackData?: GMPMessage;
  originData?: GMPMessage;
  customValues?: GMPCustomValues;
  status?: string;
  simplified_status?: string;
  is_insufficient_fee?: boolean;
  is_invalid_call?: boolean;
  is_invalid_destination_chain?: boolean;
  is_invalid_gas_paid?: boolean;
  is_invalid_source_address?: boolean;
  is_invalid_contract_address?: boolean;
  not_to_refund?: boolean;
  not_enough_gas_to_execute?: boolean;
  time_spent?: GMPTimeSpent;
  payload_hash?: string;
  event?: string;
  [key: string]: unknown;
}

export interface GMPToastState {
  status?: 'pending' | 'success' | 'failed';
  message?: string;
  hash?: string;
  chain?: string;
}

export interface GMPProps {
  tx?: string;
  lite?: boolean;
}

export type GMPStepStatus = 'pending' | 'success' | 'failed' | string;

export interface GMPStep {
  id: string;
  title: string;
  status: GMPStepStatus;
  data?: GMPEventLog | boolean | string | null | undefined;
  chainData?: ChainMetadata;
}

export type GMPButtonMap = Record<string, ReactNode>;

export interface ChainTimeEstimate {
  key?: string;
  total?: number;
  express_execute?: number;
  confirm?: number;
  execute?: number;
  finalize?: number;
  [key: string]: number | string | undefined;
}

export interface AddGasParams {
  chain?: string;
  chain_type?: string;
  destination_chain_type?: string;
}


