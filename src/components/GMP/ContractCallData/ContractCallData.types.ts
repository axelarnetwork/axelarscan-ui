import { GMPMessage } from '../GMP.types';

export interface ContractCallDataProps {
  data?: GMPMessage;
  executeData?: string;
  isMultihop: boolean;
}

export interface TimeSpentSectionProps {
  data: GMPMessage;
}

export interface DataFieldProps {
  label: string;
  value: string | number;
  textClassName?: string;
}

export interface MultihopStatusProps {
  data: GMPMessage;
}
