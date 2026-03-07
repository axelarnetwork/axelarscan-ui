export interface NameServiceEntry {
  name?: string;
  [key: string]: unknown;
}

export interface NameServicesState {
  ens: Record<string, NameServiceEntry> | null;
  spaceID: Record<string, NameServiceEntry> | null;
  setENS: (data: Record<string, NameServiceEntry>) => void;
  setSpaceID: (data: Record<string, NameServiceEntry>) => void;
}

export interface ValidatorImageEntry {
  image?: string;
  updatedAt?: number;
}

export interface ValidatorImagesState {
  validatorImages: Record<string, ValidatorImageEntry>;
  setValidatorImages: (data: Record<string, ValidatorImageEntry>) => void;
}

export interface SpaceIDProfileProps {
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  className?: string;
}

export interface ENSProfileProps {
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  origin?: string;
  className?: string;
}

export interface EVMProfileProps {
  chain?: string;
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  className?: string;
  [key: string]: unknown;
}

export interface ProfileProps {
  i?: number;
  address: string | number[] | null | undefined;
  chain?: string;
  prefix?: string;
  width?: number;
  height?: number;
  noResolveName?: boolean;
  noCopy?: boolean;
  customURL?: string;
  useContractLink?: boolean;
  className?: string;
}

export interface ChainProfileProps {
  value: string;
  width?: number;
  height?: number;
  className?: string;
  titleClassName?: string;
}

export interface AssetProfileProps {
  value: string;
  chain?: string;
  amount?: number | string;
  addressOrDenom?: string;
  customAssetData?: Record<string, unknown>;
  ITSPossible?: boolean;
  onlyITS?: boolean;
  isLink?: boolean;
  width?: number;
  height?: number;
  className?: string;
  titleClassName?: string;
}
