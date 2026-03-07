import type { Chain } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TransferData extends Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  link?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrap?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unwrap?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  erc20_transfer?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirm?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vote?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  command?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ibc_send?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  axelar_transfer?: Record<string, any>;
  type?: string;
  transfer_id?: string;
  simplified_status?: string;
  time_spent?: { total?: number };
  status?: string;
  code?: number;
  message?: string;
}

export interface TransferStep {
  id: string;
  title: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  chainData?: Chain;
}

export interface InfoProps {
  data: TransferData;
  tx?: string;
}

export interface CompletedStepProps {
  step: TransferStep;
  stepURL: string | undefined;
}

export interface StepElementProps {
  step: TransferStep;
}

export interface PendingStepProps {
  step: TransferStep;
  prevStatus?: string;
}

export interface DetailsProps {
  data: TransferData;
}

export interface TransferProps {
  tx?: string;
  lite?: boolean;
}
