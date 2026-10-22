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
  [key: string]: unknown;
}

export interface InfoProps {
  data: AccountData;
  address: string;
}

export interface BalancesProps {
  data: BalanceEntry[] | undefined;
}

export interface DelegationRowProps {
  entry: DelegationEntry;
  index: number;
  tab: string;
}

export interface DelegationsProps {
  data: AccountData;
}

export interface AccountProps {
  address: string;
}

export interface BalanceRowProps {
  entry: BalanceEntry;
  index: number;
}
