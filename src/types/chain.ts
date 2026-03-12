export interface ChainExplorer {
  url?: string;
  name?: string;
  icon?: string;
  transaction_path?: string;
  address_path?: string;
  contract_path?: string;
  block_path?: string;
  asset_path?: string;
  cannot_link_contract_via_address_path?: boolean;
  [key: string]: unknown;
}

export interface ChainGateway {
  address?: string;
  [key: string]: unknown;
}

export interface ChainEndpoints {
  lcd?: string[];
  rpc?: string[];
  [key: string]: unknown;
}

export interface ChainVotingVerifier {
  address?: string;
  [key: string]: unknown;
}

export interface Chain {
  id: string;
  chain_id?: number | string;
  chain_name?: string;
  chain_type?: string;
  name?: string;
  image?: string;
  color?: string;
  maintainer_id?: string;
  aliases?: string[];
  prefix_address?: string;
  prefix_chain_ids?: string[];
  deprecated?: boolean;
  no_inflation?: boolean;
  no_tvl?: boolean;
  gateway?: ChainGateway;
  voting_verifier?: ChainVotingVerifier;
  explorer?: ChainExplorer;
  endpoints?: ChainEndpoints;
  [key: string]: unknown;
}
