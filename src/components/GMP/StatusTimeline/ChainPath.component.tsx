import { MdKeyboardArrowRight } from 'react-icons/md';

import { ChainProfile } from '@/components/Profile';

import type { ChainPathProps } from '../GMP.types';
import { statusTimelineStyles } from './StatusTimeline.styles';

export function ChainPath({ sourceChain, destinationChain }: ChainPathProps) {
  return (
    <div className={statusTimelineStyles.chainPath}>
      <ChainProfile
        value={sourceChain}
        width={20}
        height={20}
        className={statusTimelineStyles.chainProfileIcon}
        titleClassName={statusTimelineStyles.chainProfileTitle}
      />
      <MdKeyboardArrowRight size={20} />
      <ChainProfile
        value={destinationChain}
        width={20}
        height={20}
        className={statusTimelineStyles.chainProfileIcon}
        titleClassName={statusTimelineStyles.chainProfileTitle}
      />
    </div>
  );
}
