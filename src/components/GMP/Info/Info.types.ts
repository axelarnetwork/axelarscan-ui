import { ChainTimeEstimate, GMPMessage } from '../GMP.types';

export interface InfoProps {
  data: GMPMessage;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  executeData?: string | null;
  refreshData: () => Promise<GMPMessage | undefined>;
  tx?: string;
  lite?: boolean;
}

export interface UseInfoStateOptions {
  initialSeeMore?: boolean;
}

export interface InfoAssetProps {
  symbol: string;
  sourceChain: string | undefined;
  amount: number | undefined;
  event: string | undefined;
  contractAddress: string | undefined;
}

export interface InfoContractCallDetailsProps {
  data: import('../GMP.types').GMPMessage;
  executeData?: string | null;
  isMultihop: boolean;
}
