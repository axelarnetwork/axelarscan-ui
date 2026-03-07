export interface ValidatorSetEntry {
  address?: string;
  tokens?: number;
  operator_address?: string;
  [key: string]: unknown;
}

export interface BlockEvent {
  type: string;
  data: Record<string, unknown>[];
}

export interface BlockData {
  block_id?: { hash?: string };
  block?: {
    header?: { proposer_address?: string; time?: string };
    data?: { txs?: unknown[] };
    last_commit?: { round?: number; validators?: unknown[] };
  };
  round?: number;
  validators?: unknown[];
  begin_block_events?: BlockEvent[];
  end_block_events?: BlockEvent[];
  [key: string]: unknown;
}

export interface InfoProps {
  data: BlockData;
  height: string;
  validatorSets: ValidatorSetEntry[] | null;
}

export interface BlockEventsProps {
  data: BlockData;
}

export interface EventDataItemsProps {
  items: Record<string, unknown>[];
  type: string;
  seeMoreTypes: string[];
  onToggleSeeMore: (type: string) => void;
}

export interface EventRowProps {
  event: BlockEvent;
  seeMoreTypes: string[];
  onToggleSeeMore: (type: string) => void;
}

export interface BlockProps {
  height: string;
}
