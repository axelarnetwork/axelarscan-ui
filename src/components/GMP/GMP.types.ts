import type { providers } from 'ethers';
import type React from 'react';
import type { Chain, Asset } from '@/types';

export type ChainType = 'cosmos' | 'evm' | 'vm';

/**
 * @deprecated Use Chain from @/types instead. Kept as alias for compatibility.
 */
export type ChainMetadata = Chain;

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
  chain_type?: ChainType;
  destination_chain_type?: ChainType;
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
  chain_type?: ChainType;
  destination_chain_type?: ChainType;
}

// Wallet context types
export interface WalletContext {
  cosmosWalletStore: {
    signer?: unknown;
    chainId?: string | null;
  };
  signer: unknown;
  suiWalletStore: {
    address?: string | null;
  };
  stellarWalletStore: {
    address?: string | null;
    provider?: {
      signTransaction?: (txXdr: string) => Promise<{ signedTxXdr?: string }>;
      disconnect?: () => Promise<void>;
    } | null;
    network?: {
      network?: string;
      networkPassphrase?: string;
    } | null;
    sorobanRpcUrl?: string | null;
  };
  xrplWalletStore: {
    address?: string | null;
  };
}

export interface GMPRecoveryActions {
  processing: boolean;
  response: GMPToastState | null;
  chainId: number | null;
  signer: providers.JsonRpcSigner | null;
  cosmosWalletStore: WalletContext['cosmosWalletStore'];
  suiWalletStore: WalletContext['suiWalletStore'];
  stellarWalletStore: WalletContext['stellarWalletStore'];
  xrplWalletStore: WalletContext['xrplWalletStore'];
  onAddGas: (data: GMPMessage) => Promise<void>;
  onApprove: (data: GMPMessage, afterPayGas?: boolean) => Promise<void>;
  onExecute: (data: GMPMessage) => Promise<void>;
}

// SDK response types
export interface AddNativeGasResponse {
  success?: boolean;
  error?: unknown;
  transaction?: {
    transactionHash?: string;
  };
}

export interface ManualRelayResponse {
  success?: boolean;
  error?:
    | {
        message?: string;
      }
    | string;
  confirmTx?: {
    transactionHash?: string;
  };
  signCommandTx?: {
    transactionHash?: string;
  };
  routeMessageTx?: {
    transactionHash?: string;
  };
}

export interface ExecuteResponse {
  success?: boolean;
  error?: unknown;
  transaction?: {
    transactionHash?: string;
  };
}

export interface AddGasToCosmosChainResponse {
  success?: boolean;
  error?: unknown;
  broadcastResult?: {
    transactionHash?: string;
    code?: number;
  };
}

export interface SuiSignAndExecuteResponse {
  error?: unknown;
  digest?: string;
}

export interface StellarSignResponse {
  signedTxXdr?: string;
  error?: unknown;
}

export interface StellarSendTransactionResponse {
  error?: string | unknown;
  status?: string;
  hash?: string;
  errorResult?: unknown;
}

export interface XRPLSignAndSubmitResponse {
  tx_json?: {
    meta?: {
      TransactionResult?: string;
    };
  };
  tx_hash?: string;
  error?: unknown;
}

// Types moved from GMP.hooks.ts
export type ChainCollection = ChainMetadata[] | null | undefined;

export type AssetCollection = Asset[] | null | undefined;

export interface SearchGMPResult {
  data?: GMPMessage[];
}

// Types moved from GMP.utils.ts
export interface ConfirmResolutionContext {
  call?: GMPEventLog;
  confirm?: GMPEventLog;
  confirmFailed?: GMPEventLog;
  confirmFailedEvent?: GMPEventLog;
  approved?: GMPEventLog;
  executed?: GMPEventLog;
  isExecuted?: boolean;
  error?: GMPEventLog | undefined;
  isInvalidCall?: boolean;
  gasPaid?: GMPEventLog | string | undefined;
  gasPaidToCallback?: GMPEventLog | undefined;
  expressExecuted?: GMPEventLog | undefined;
}

export interface ExecuteResolutionContext {
  executed?: GMPEventLog;
  isExecuted?: boolean;
  error?: GMPEventLog | undefined;
  errored: boolean;
  confirm?: GMPEventLog;
  call?: GMPEventLog;
}

// StepRow sub-component prop types

export interface TxHashCellProps {
  stepTX: string | number | undefined;
  stepURL: string | undefined;
  proposalId: string | undefined;
  chainId: string | undefined;
  stepMoreInfos: React.ReactElement[];
  stepMoreTransactions: React.ReactElement[];
}

export interface HeightCellProps {
  blockNumber: number | undefined;
  axelarBlockNumber: string | number | undefined;
  url: string | undefined;
  blockPath: string | undefined;
  axelarChainData: Chain | undefined;
}

export interface BlockNumberLinkProps {
  blockNumber: string | number | undefined;
  url: string | undefined;
  blockPath: string | undefined;
}

export interface AddressCellProps {
  fromAddress: string | undefined;
  toAddress: string | undefined;
  step: GMPStep;
  stepData: GMPEventLog | undefined;
  destinationChainData: Chain | undefined;
}

export interface GasCellProps {
  gasAmount: number | undefined;
  fees: GMPMessage['fees'];
  data: GMPMessage;
}

export interface ExecuteErrorInfoProps {
  data: GMPMessage;
  axelarTransactionHash: string | undefined;
}

export interface ErrorCodeDisplayProps {
  code: string | number;
  destinationChainType: string | undefined;
}

// InfoGasMetrics sub-component prop types

export interface InfoGasMetricsProps {
  data: GMPMessage;
  gasData: GMPMessage['gas'];
  refundedData: GMPMessage['refunded'];
  refundedMoreData: GMPEventLog[];
  showDetails: boolean;
  fees: GMPMessage['fees'];
  gas: GMPMessage['gas'];
  gasPaid: GMPEventLog | undefined;
  gasPaidToCallback: number | undefined;
  isMultihop: boolean;
}

export interface GasChargedSectionProps {
  gasChargedAmount: number;
  sourceToken: GMPTokenInfo | undefined;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
}

export interface GasPaidSectionProps {
  data: GMPMessage;
  gas: GMPMessage['gas'];
  gasPaid: GMPEventLog | undefined;
  gasPaidToCallback: number | undefined;
  combinedFees: GMPMessage['fees'];
  sourceToken: GMPTokenInfo | undefined;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
}

export interface GasUsedSectionProps {
  data: GMPMessage;
  gasData: GMPMessage['gas'];
  sourceToken: GMPTokenInfo | undefined;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
}

// BaseFeeSection sub-component prop types

export interface BaseFeeEntryProps {
  entryFees: GMPFees;
  index: number;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
  renderFiPlus: (index: number) => React.ReactElement | null;
}

export interface BaseFeeSectionProps {
  data: GMPMessage;
  isMultihop: boolean;
  combinedFees: GMPFees | undefined;
  sourceTokenSymbol: string | undefined;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
  renderFiPlus: (index: number) => React.ReactElement | null;
}

export interface MultihopBaseFeeProps {
  data: GMPMessage;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
  renderFiPlus: (index: number) => React.ReactElement | null;
}

export interface SingleBaseFeeProps {
  combinedFees: GMPFees | undefined;
  sourceTokenSymbol: string | undefined;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
}

// ExpressFeeSection sub-component prop types

export interface ExpressFeeEntryProps {
  entryFees: GMPFees;
  index: number;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
  renderFiPlus: (index: number) => React.ReactElement | null;
}

export interface ExpressFeeBreakdownProps {
  sourceExpressFee: GMPExpressFeeDetail;
  tokenSymbol: string | undefined;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
}

export interface ExpressFeeSectionProps {
  data: GMPMessage;
  isMultihop: boolean;
  combinedFees: GMPFees | undefined;
  sourceTokenSymbol: string | undefined;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
  renderFiPlus: (index: number) => React.ReactElement | null;
}

export interface MultihopExpressFeeProps {
  data: GMPMessage;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
  renderFiPlus: (index: number) => React.ReactElement | null;
}

export interface SingleExpressFeeProps {
  data: GMPMessage;
  combinedFees: GMPFees | undefined;
  sourceTokenSymbol: string | undefined;
  formatTokenSuffix: (symbol?: string) => string;
  renderUsdValue: (
    value?: number,
    className?: string
  ) => React.ReactElement | null;
}

// WarningMessages sub-component prop types

export interface WarningMessagesProps {
  entry: GMPMessage;
}

export interface WarningRowProps {
  text: string;
}

export interface InsufficientFeeWarningProps {
  entry: GMPMessage;
}

export interface InvalidGasPaidWarningProps {
  entry: GMPMessage;
}

export interface InsufficientGasWarningProps {
  entry: GMPMessage;
}

// HopLinks sub-component prop types

export interface HopLinksProps {
  sourceChain: string | undefined;
  destinationChain: string | undefined;
  parentMessageID: string | undefined;
  childMessageIDs: unknown[] | undefined;
}

export interface PrevHopLinkProps {
  sourceChain: string | undefined;
  parentMessageID: string | undefined;
}

export interface NextHopLinksProps {
  destinationChain: string | undefined;
  childMessageIDs: unknown[] | undefined;
}

// TimelineEntry sub-component prop types

export interface TimelineEntryProps {
  entry: GMPMessage;
  chains: ChainMetadata[] | null | undefined;
  isMultihop: boolean;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  rootCall?: GMPMessage['call'];
  expressExecuted?: GMPEventLog;
}

export interface ChainPathProps {
  sourceChain: string | undefined;
  destinationChain: string | undefined;
}
