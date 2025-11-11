import { GMPMessage } from '../GMP.types';

export interface ContractCallDataProps {
  data?: GMPMessage;
  executeData?: string;
  isMultihop: boolean;
}
