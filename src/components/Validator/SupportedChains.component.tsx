import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';

import * as styles from './Validator.styles';

interface SupportedChainsProps {
  supportedChains: string[];
}

export function SupportedChains({ supportedChains }: SupportedChainsProps) {
  const chains = useChains();

  return (
    <div className={styles.dlRow}>
      <dt className={styles.dlLabel}>EVM Supported</dt>
      <dd className={styles.dlValue}>
        <div className={styles.supportedChainsGrid}>
          {supportedChains.map((c: string, i: number) => {
            const { name, image } = { ...getChainData(c, chains) };

            return (
              <Tooltip key={i} content={name} className={styles.chainTooltip}>
                <Image
                  src={image}
                  alt=""
                  width={20}
                  height={20}
                  className={styles.chainImage}
                />
              </Tooltip>
            );
          })}
        </div>
      </dd>
    </div>
  );
}
