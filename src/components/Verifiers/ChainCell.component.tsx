import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { isString } from '@/lib/string';

import { ChainStats } from './ChainStats.component';
import type { ChainCellProps } from './Verifiers.types';
import * as styles from './Verifiers.styles';

export function ChainCell({ chainEntry, votesChains, signsChains, supportedChains }: ChainCellProps) {
  const { id: chain, name, image } = {
    ...(isString(chainEntry) ? { id: chainEntry, name: chainEntry } : chainEntry),
  } as { id: string; name: string; image?: string };

  const votes = votesChains[chain];
  const chainSigns = signsChains[chain];
  const isSupported = supportedChains.includes(chain);

  return (
    <div key={chain} className={styles.chainItem}>
      <div className={styles.chainInner}>
        <Tooltip
          content={`${name}${!isSupported ? `: Not Supported` : ''}`}
          className="whitespace-nowrap"
        >
          {image ? (
            <Image src={image} alt="" width={20} height={20} />
          ) : (
            <span className={styles.chainName}>{name}</span>
          )}
        </Tooltip>
        {!isSupported ? (
          <span className={styles.notSupported}>Not Supported</span>
        ) : (
          <ChainStats
            chain={chain}
            votes={votes}
            signs={chainSigns}
            signsTotal={signsChains[chain]?.total ?? 0}
            totalProofs={chainSigns?.total_proofs ?? 0}
          />
        )}
      </div>
    </div>
  );
}
