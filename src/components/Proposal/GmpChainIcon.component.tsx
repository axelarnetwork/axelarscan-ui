import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { getChainData } from '@/lib/config';

import type { GmpChainIconProps } from './Proposal.types';
import * as styles from './Proposal.styles';

export function GmpChainIcon({ chain, chains }: GmpChainIconProps) {
  const { name, image } = { ...getChainData(chain, chains) };
  return (
    <div className={styles.gmpChainItem}>
      <Tooltip content={name}>
        <Image src={image} alt="" width={20} height={20} />
      </Tooltip>
    </div>
  );
}
