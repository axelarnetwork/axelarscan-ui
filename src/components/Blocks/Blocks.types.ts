export interface BlockEntry {
  height: number;
  hash?: string;
  proposer_address?: string;
  num_txs?: number;
  time?: string;
}

export interface BlocksProps {
  data: BlockEntry[];
  height?: string;
}

export interface BlockRowProps {
  block: BlockEntry;
  index: number;
}
