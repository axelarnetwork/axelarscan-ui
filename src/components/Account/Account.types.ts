export interface DepositAddressData {
  source_chain?: string;
  destination_chain?: string;
  denom?: string;
  sender_address?: string;
  recipient_address?: string;
}

export interface TransferSend {
  source_chain?: string;
  destination_chain?: string;
  sender_address?: string;
  recipient_address?: string;
  txhash?: string;
}

export interface TransferData {
  link?: DepositAddressData;
  send?: TransferSend;
}

export interface BalanceEntry {
  denom?: string;
  amount: number;
  value?: number;
}

export interface DelegationEntry {
  validator_address?: string;
  validator_src_address?: string;
  validator_dst_address?: string;
  amount?: number;
  completion_time?: string;
}

export interface AccountData {
  rewards?: { total?: { amount: number }[] };
  commissions?: { amount: number }[];
  delegations?: { data?: DelegationEntry[] };
  redelegations?: { data?: DelegationEntry[] };
  unbondings?: { data?: DelegationEntry[] };
  balances?: { data?: BalanceEntry[] };
  depositAddressData?: DepositAddressData;
  transferData?: TransferData;
  [key: string]: unknown;
}

export interface DepositAddressProps {
  data: AccountData;
  address: string;
}

export interface InfoProps {
  data: AccountData;
  address: string;
}

export interface BalancesProps {
  data: BalanceEntry[] | undefined;
}

export interface DelegationsProps {
  data: AccountData;
}

export interface AccountProps {
  address: string;
}
