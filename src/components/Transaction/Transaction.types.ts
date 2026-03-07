import type { Chain } from '@/types';

export interface TransactionData extends Record<string, unknown> {
  height?: number;
  type?: string;
  code?: number;
  sender?: string;
  timestamp?: string | number;
  gas_used?: number;
  gas_wanted?: number;
  raw_log?: string;
  tx?: {
    auth_info?: { fee?: { amount?: { amount?: string; denom?: string }[] } };
    body?: { messages?: Record<string, unknown>[]; memo?: string };
  };
  status?: string;
  message?: string;
}

export interface InfoProps {
  data: TransactionData;
  tx: string;
}

export interface DataProps {
  data: TransactionData;
}

export interface TransactionProps {
  tx: string;
}

// ─── Sub-component Props ───────────────────────────────────────

export interface ActivityItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activity: Record<string, any>;
  index: number;
  data: TransactionData;
  activitiesCount: number;
  chains: Chain[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validators: any;
}

export interface EventLogEntryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entry: Record<string, any>;
  index: number;
}
