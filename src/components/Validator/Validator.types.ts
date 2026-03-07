import type { Validator, Delegation, UptimeBlock, ProposedBlock, EVMVote, Asset } from '@/types';

export interface InfoProps {
  data: Validator;
  address: string;
  delegations: Delegation[] | null;
}

export interface UptimesProps {
  data: UptimeBlock[] | null;
}

export interface ProposedBlocksProps {
  data: ProposedBlock[] | null;
}

export interface VotesProps {
  data: EVMVote[] | null;
}

export interface ValidatorProps {
  address: string;
}

export interface AddressRowProps {
  label: string;
  value: string;
  children: React.ReactNode;
}

export interface DelegationRowProps {
  d: Delegation;
  assets: Asset[] | null | undefined;
}
