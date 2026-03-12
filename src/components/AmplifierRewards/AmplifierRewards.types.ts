export interface RewardsContractInfo {
  id: string;
  title: string;
  balance?: string | number;
  epoch_duration?: string | number;
  rewards_per_epoch?: string | number;
  last_distribution_epoch?: string | number;
  address?: string;
}

export interface RewardsPoolData {
  balance?: string | number;
  voting_verifier?: RewardsContractInfo;
  multisig?: RewardsContractInfo;
}

export interface Receiver {
  receiver: string;
  amount: string | number;
}

export interface RewardsDistribution {
  txhash: string;
  height?: string | number;
  pool_type?: string;
  total_receivers?: number;
  total_amount?: string | number;
  receivers?: Receiver[];
  contract_address?: string;
  multisig_contract_address?: string;
  created_at?: { ms?: number };
}

export interface SearchResults {
  [key: string]: {
    data: RewardsDistribution[];
    total: number;
  };
}

export interface InfoProps {
  chain: string;
  rewardsPool: RewardsPoolData | null;
  cumulativeRewards: number | null;
}

export interface InfoSummaryProps {
  chain: string;
  chainId: string | undefined;
  verifierCount: number;
  cumulativeRewards: number | null;
  totalBalance: string | number | undefined;
  symbol: string | undefined;
}

export interface ContractsTableProps {
  contracts: RewardsContractInfo[];
  symbol: string | undefined;
  chainName: string | undefined;
  multisigProverAddress: string | undefined;
}

export interface DistributionRowProps {
  distribution: RewardsDistribution;
  distributionExpanded: string | null;
  setDistributionExpanded: (v: string | null) => void;
  symbol: string | undefined;
}

export interface AmplifierRewardsProps {
  chain?: string;
  symbol?: string;
  initialSearchResults?: { data: RewardsDistribution[]; total: number };
  initialRewardsPool?: RewardsPoolData | null;
  initialCumulativeRewards?: number | null;
}

export interface ChainSelectorProps {
  chain: string;
  chainId: string | undefined;
}

export interface ContractFieldCellProps {
  field: string;
  contract: RewardsContractInfo;
  symbol: string | undefined;
  chainName: string | undefined;
  multisigProverAddress: string | undefined;
}

export const PAGE_SIZE = 25;
