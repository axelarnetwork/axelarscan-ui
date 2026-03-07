import type { Chain } from '@/types';

export interface SelectOption {
  value?: string;
  title: string;
}

export interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  multiple?: boolean;
  options?: SelectOption[];
}

export interface ChainProps {
  data: ChainResourceData;
}

export interface AssetProps {
  data: AssetResourceData;
  focusID: string | null;
  onFocus: (id: string) => void;
}

export interface ChainIconProps {
  chainId: string | undefined;
  nativeChain: string | undefined;
  isSelected: boolean;
  onClick: () => void;
  chains: import('@/types').Chain[] | null;
}

export interface FocusedChainDetailProps {
  chain: string;
  chainType: string | undefined;
  asset: string | undefined;
  assetType: string | undefined;
  address: string | undefined;
  ibcDenom: string | undefined;
  tokenSymbol: string | undefined;
  symbol: string | undefined;
  explorerUrl: string | undefined;
  contractPath: string | undefined;
  assetPath: string | undefined;
}

export interface ResourcesProps {
  resource?: string;
}

export interface ContractRef {
  address?: string;
  [key: string]: unknown;
}

export type ChainResourceData = Chain & {
  gateway?: ContractRef;
  multisig_prover?: ContractRef;
  voting_verifier?: ContractRef;
  router?: ContractRef;
  service_registry?: ContractRef;
  rewards?: ContractRef;
  multisig?: ContractRef;
};

export interface AssetAddressEntry {
  address?: string;
  tokenAddress?: string;
  ibc_denom?: string;
  symbol?: string;
  image?: string;
  [key: string]: unknown;
}

export interface AssetResourceData {
  id: string;
  type?: string;
  denom?: string;
  denoms?: string[];
  native_chain?: string;
  symbol?: string;
  name?: string;
  image?: string;
  decimals?: number;
  addresses?: Record<string, AssetAddressEntry>;
  chains?: Record<string, AssetAddressEntry>;
  [key: string]: unknown;
}

export interface NormalizedAssetAddress extends AssetAddressEntry {
  chain?: string;
}

export interface FilterSelectProps {
  attribute: FilterAttribute;
  params: Record<string, string>;
  resource: string;
}

export interface ResourceNavProps {
  resource: string;
  filter: (resourceType: string, filterParams: Record<string, string>) => unknown[];
  params: Record<string, string>;
  chains: unknown;
  assets: unknown;
}

export interface SearchInputProps {
  resource: string;
  input: string;
  setInput: (v: string) => void;
}

export interface TypeFiltersProps {
  resource: string;
  params: Record<string, string>;
  pathname: string;
}

export interface AttributeFiltersProps {
  attributes: FilterAttribute[];
  params: Record<string, string>;
  resource: string;
}

export interface ResourceListProps {
  resource: string;
  filter: (resourceType: string, filterParams: Record<string, string>) => unknown[];
  params: Record<string, string>;
  assetFocusID: string | null;
  setAssetFocusID: (id: string) => void;
}

export interface SelectButtonContentProps {
  attribute: FilterAttribute;
  selectedValue: SelectOption[] | SelectOption | undefined;
  params: Record<string, string>;
  resource: string;
}

export interface SelectOptionItemProps {
  option: SelectOption;
}
