export interface Explorer {
  url?: string;
  name?: string;
  icon?: string;
  address_path?: string;
  contract_path?: string;
  contract_0_path?: string;
  transaction_path?: string;
  block_path?: string;
  no_0x?: boolean;
  cannot_link_contract_via_address_path?: boolean;
}

export interface BuildExplorerURLParams {
  value?: string | number;
  type?: string;
  useContractLink?: boolean;
  hasEventLog?: boolean;
  explorer?: Explorer;
}

export interface ExplorerLinkProps {
  value?: string | number;
  chain?: string;
  type?: string;
  customURL?: string;
  hasEventLog?: boolean;
  useContractLink?: boolean;
  title?: string;
  iconOnly?: boolean;
  width?: number;
  height?: number;
  containerClassName?: string;
  nonIconClassName?: string;
  className?: string;
}
