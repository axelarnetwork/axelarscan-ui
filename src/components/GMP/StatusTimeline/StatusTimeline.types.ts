import {
  ChainTimeEstimate,
  ChainMetadata,
  GMPEventLog,
  GMPMessage,
  GMPStep,
  GMPStepStatus,
} from '../GMP.types';

export interface StatusTimelineProps {
  timeline: GMPMessage[];
  chains: ChainMetadata[] | null | undefined;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  isMultihop: boolean;
  rootCall: GMPMessage['call'];
  expressExecuted?: GMPMessage['express_executed'];
}

export interface ConfirmTimeEstimateProps {
  id: string;
  expressExecuted?: GMPEventLog;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  rootCall?: { block_timestamp?: number };
}

export interface StepItemProps {
  step: GMPStep;
  stepIndex: number;
  totalSteps: number;
  entry: GMPMessage;
  expressExecuted?: GMPEventLog;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  rootCall?: GMPMessage['call'];
  previousStepStatus?: string;
}

export interface CompletedStepProps {
  id: string;
  title: string;
  status: GMPStepStatus;
  stepURL: string | undefined;
}

export interface PendingStepProps {
  id: string;
  title: string;
  hasPreviousStep: boolean;
  expressExecuted?: GMPEventLog;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  rootCall?: { block_timestamp?: number };
}

export interface StepContentProps {
  id: string;
  title: string;
  status: GMPStepStatus;
}
