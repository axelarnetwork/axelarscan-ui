import type { Asset, Chain, Validator } from '@/types';
import type {
  TransactionData as BaseTransactionData,
  TransactionActivity,
} from '@/components/Transactions';
import type { IbcPacketData } from '@/lib/chain/ibc';
import type {
  MessageAmount,
  MessageField,
  MessageSummary,
} from '@/lib/chain/txMessages';

export interface TransactionData extends BaseTransactionData {
  sender?: string;
  gas_used?: number;
  gas_wanted?: number;
  raw_log?: string;
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
  initialData?: TransactionData | null;
}

// ─── Activity / Event types ────────────────────────────────────

export interface EventLogAttribute {
  key: string;
  value: unknown;
}

export interface EventLogEvent {
  type?: string;
  attributes?: EventLogAttribute[];
  [key: string]: unknown;
}

export interface EventLogRecord {
  log?: string;
  events?: EventLogEvent[];
  [key: string]: unknown;
}

// ─── Sub-component Props ───────────────────────────────────────

export interface ActivityItemProps {
  activity: TransactionActivity;
  index: number;
  data: TransactionData;
  activitiesCount: number;
  chains: Chain[] | null;
  assets: Asset[] | null;
  validators: Validator[] | null;
}

export interface PacketDataItemProps {
  packet: IbcPacketData;
}

export interface MessageDataItemProps {
  summary: MessageSummary;
}

export interface MessageFieldRowProps {
  field: MessageField;
}

export interface MessageFieldValueProps {
  field: MessageField;
}

export interface MessageAmountValueProps {
  amount: MessageAmount;
}

export interface EventLogEntryProps {
  entry: EventLogRecord;
  index: number;
}
