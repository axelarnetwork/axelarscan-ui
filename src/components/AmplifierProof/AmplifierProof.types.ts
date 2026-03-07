export interface SignOption {
  option: string;
  value: number;
  signers?: string[];
  i?: number;
}

export interface ProofSign {
  signer?: string;
  sign?: boolean;
  height?: number;
  id?: string;
  created_at?: number;
  option?: string;
  verifierData?: VerifierEntry;
  [key: string]: unknown;
}

export interface VerifierEntry {
  address?: string;
  [key: string]: unknown;
}

export interface MessageId {
  message_id?: string;
  id?: string;
  source_chain?: string;
  chain?: string;
}

export interface Timestamp {
  ms?: number;
}

export interface AmplifierProofData {
  session_id?: string;
  multisig_prover_contract_address?: string;
  multisig_contract_address?: string;
  message_ids?: MessageId[];
  message_id?: string;
  source_chain?: string;
  chain?: string;
  destination_chain?: string;
  status?: string;
  height?: number;
  initiated_txhash?: string;
  confirmation_txhash?: string;
  completed_txhash?: string;
  expired_height?: number;
  completed_height?: number;
  gateway_txhash?: string;
  participants?: string[];
  signOptions?: SignOption[];
  signs?: ProofSign[];
  created_at?: Timestamp;
  updated_at?: Timestamp;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  [key: string]: unknown;
}

export interface RPCStatusData {
  latest_block_height?: number;
  [key: string]: unknown;
}

export interface InfoProps {
  data: AmplifierProofData;
  id: string;
}

export interface MessageListProps {
  data: AmplifierProofData;
  chains: import('@/types').Chain[] | null;
}

export interface TxHashRowProps {
  label: string;
  txhash: string;
  /** If true, link to external explorer URL instead of internal /tx/ path */
  external?: { url: string | undefined; transaction_path: string | undefined };
}

export interface SignsProps {
  data: AmplifierProofData;
}

export interface AmplifierProofProps {
  id: string;
}

export interface SignRowProps {
  sign: ProofSign;
  index: number;
  confirmationTxhash?: string;
}
