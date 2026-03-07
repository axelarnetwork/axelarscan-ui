export interface BlockEntry {
  height: number;
  hash?: string;
  proposer_address?: string;
  num_txs?: number;
  time?: string;
}

export interface BlocksProps {
  height?: string;
}
