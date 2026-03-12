export interface NetworkDataItem {
  id?: string;
  sourceChain: string;
  destinationChain: string;
  num_txs: number;
  volume?: number;
  [key: string]: unknown;
}

export interface NetworkGraphProps {
  data: NetworkDataItem[] | null;
  hideTable?: boolean;
  setChainFocus?: (chainId: string | null) => void;
}

export interface GraphNode {
  id: string;
  image: string;
  label: string;
  color: string;
  num_txs: number;
  tier?: number;
  x?: number;
  y?: number;
  __animatedPos?: { x: number; y: number }[];
}

export interface GraphEdge {
  data: NetworkDataItem;
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  color: string;
  __comet?: { __progress: number };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type ImagesMap = Record<string, HTMLImageElement>;

export interface NetworkGraphTableProps {
  filteredData: NetworkDataItem[];
  page: number | undefined;
  setPage: (page: number | undefined) => void;
}

export interface TierConfig {
  id: number;
  n_sd: number | null;
}
