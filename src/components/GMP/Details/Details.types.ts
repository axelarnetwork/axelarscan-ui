import type { Chain } from '@/types';

import { GMPMessage, GMPStep } from '../GMP.types';

export interface DetailsProps {
  data: GMPMessage;
}

export interface StepRowProps {
  step: GMPStep;
  index: number;
  data: GMPMessage;
  axelarChainData: Chain | undefined;
  destinationChainData: Chain | undefined;
}
