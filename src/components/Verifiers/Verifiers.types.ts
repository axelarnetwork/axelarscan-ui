import type { Chain } from '@/types';

/** Vote counts for a single chain */
export interface ChainVoteData {
  votes: Record<string, number>;
  total: number;
  total_polls: number;
}

/** Sign counts for a single chain */
export interface ChainSignData {
  signs: Record<string, number>;
  total: number;
  total_proofs: number;
}

/** API response from getVerifiersVotes() */
export interface VerifierVotesResponse {
  data: Record<string, {
    total: number;
    chains: Record<string, ChainVoteData>;
  }>;
  total: number;
}

/** API response from getVerifiersSigns() */
export interface VerifierSignsResponse {
  data: Record<string, {
    total: number;
    chains: Record<string, ChainSignData>;
  }>;
  total: number;
}

/** A raw verifier entry from the global data hook */
export interface RawVerifier {
  address: string;
  supportedChains: string[];
  [key: string]: unknown;
}

/** Enriched verifier data with votes, signs, and computed totals */
export interface VerifierData {
  address: string;
  supportedChains: string[];
  total_polls: number;
  total_votes: number;
  total_yes_votes: number;
  total_no_votes: number;
  total_unsubmitted_votes: number;
  total_proofs: number;
  total_signs: number;
  total_signed_signs: number;
  total_unsubmitted_signs: number;
  votes: {
    total: number;
    chains: Record<string, ChainVoteData>;
  };
  signs: {
    total: number;
    chains: Record<string, ChainSignData>;
  };
  [key: string]: unknown;
}

/** Props for the VerifierRow sub-component */
export interface VerifierRowProps {
  verifier: VerifierData;
  index: number;
  amplifierChains: Chain[];
  additionalAmplifierChains: string[];
}

/** Props for the ChainStats sub-component */
export interface ChainStatsProps {
  chain: string;
  votes: ChainVoteData | undefined;
  signs: ChainSignData | undefined;
  signsTotal: number;
  totalProofs: number;
}

/** Props for the ChainCell sub-component */
export interface ChainCellProps {
  chainEntry: Chain | string;
  votesChains: Record<string, ChainVoteData>;
  signsChains: Record<string, ChainSignData>;
  supportedChains: string[];
}
