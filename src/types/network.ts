export interface InflationData {
  inflation?: number;
  tendermintInflationRate?: number;
  keyMgmtRelativeInflationRate?: number;
  externalChainVotingInflationRate?: number;
  communityTax?: number;
  [key: string]: unknown;
}

export interface CoinAmount {
  amount?: string;
  denom?: string;
}

export interface NetworkParameters {
  bankSupply?: CoinAmount;
  stakingPool?: {
    bonded_tokens?: string;
    not_bonded_tokens?: string;
  };
  [key: string]: unknown;
}
