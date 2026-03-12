import type {
  Chain,
  Validator as ValidatorType,
  ValidatorsVotesChain,
} from '@/types';

// ─── Constants ─────────────────────────────────────────────────
export const STATUSES = ['active', 'inactive'] as const;

// ─── Store ─────────────────────────────────────────────────────
export interface ValidatorStoreState {
  maintainers: Record<string, string[]> | null;
  setMaintainers: (data: Record<string, string[]>) => void;
}

// ─── Page Data ──────────────────────────────────────────────────
export interface ValidatorsPageData {
  validators: ValidatorType[];
  chains: Chain[];
}

// ─── Props ─────────────────────────────────────────────────────
export interface ValidatorsProps {
  status?: string;
  initialData?: ValidatorsPageData | null;
}

// ─── Sub-component Props ───────────────────────────────────────
export interface ValidatorRowProps {
  validator: ValidatorType;
  index: number;
  status?: string;
  totalVotingPower: number;
  totalQuadraticVotingPower: number;
  cumulativeVotingPower: number;
  cumulativeQuadraticVotingPower: number;
  evmChains: Chain[];
}

export interface EvmChainVoteProps {
  chain: Chain;
  votes: ValidatorsVotesChain | undefined;
  isSupported: boolean;
}

export interface SortHeaderProps {
  label: string;
  sortKey: string;
  order: [string, string];
  onSort: (key: string) => void;
  className?: string;
}

export interface ValidatorsHeaderProps {
  status: string | undefined;
  filterCounts: Record<string, number>;
}
