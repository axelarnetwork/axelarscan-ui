export interface BlockEntry {
  height: number;
  hash?: string;
  proposer_address?: string;
  num_txs?: number;
  time?: string;
}

export interface BlocksProps {
  initialData: { data: BlockEntry[] };
}

export interface BlockRowProps {
  block: BlockEntry;
  index: number;
}
