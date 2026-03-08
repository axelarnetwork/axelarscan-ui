import type { Chain } from '@/types';

export interface SignEntry {
  signer?: string;
  sign?: boolean;
  height?: number;
  created_at?: { ms?: number };
  option: string;
  [key: string]: unknown;
}

export interface SignOptionEntry {
  option: string;
  value: number | undefined;
  signers: string[] | undefined;
  i: number;
}

export interface MessageEntry {
  id?: string;
  message_id?: string;
  source_chain?: string;
  chain?: string;
  [key: string]: unknown;
}

export interface AmplifierProofEntry {
  id: string;
  chain?: string;
  destination_chain?: string;
  session_id?: string;
  gateway_txhash?: string;
  multisig_prover_contract_address?: string;
  multisig_contract_address?: string;
  message_ids?: MessageEntry[];
  message_id?: string;
  source_chain?: string;
  height?: number;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  expired_height?: number;
  participants?: string[];
  status: string;
  signs: SignEntry[];
  signOptions: SignOptionEntry[];
  created_at?: { ms?: number };
  [key: string]: unknown;
}

export interface BlockData {
  latest_block_height?: number;
  [key: string]: unknown;
}

export interface SearchResult {
  data: AmplifierProofEntry[];
  total: number;
}

export interface AmplifierProofsSearchResult {
  data: AmplifierProofEntry[];
  total: number;
  blockData: BlockData | null;
}

export interface AmplifierProofsProps {
  initialData?: AmplifierProofsSearchResult | null;
}

export interface ProofsTableProps {
  data: AmplifierProofEntry[];
  chains: Chain[] | null;
}

export interface ProofRowProps {
  proof: AmplifierProofEntry;
  chains: Chain[] | null;
}

export interface SessionIdCellProps {
  proof: AmplifierProofEntry;
  chain: string | undefined;
}

export interface MessagesCellProps {
  proof: AmplifierProofEntry;
  chains: Chain[] | null;
}

export interface HeightCellProps {
  height: number | undefined;
}

export interface StatusCellProps {
  status: string;
}

export interface ParticipationsCellProps {
  proof: AmplifierProofEntry;
}
