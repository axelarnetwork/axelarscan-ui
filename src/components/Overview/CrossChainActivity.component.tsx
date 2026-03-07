import { Summary } from '@/components/Interchain';
import type { Chain } from '@/types';
import type { OverviewData } from './Overview.types';
import { ConnectedChainsTag } from './ConnectedChainsTag.component';
import * as styles from './Overview.styles';

interface CrossChainActivityProps {
  data: OverviewData;
  chains: Chain[] | null | undefined;
}

export function CrossChainActivity({ data, chains }: CrossChainActivityProps) {
  const activeChainCount = chains
    ? chains.filter(
        (d) => !d.deprecated && (!d.maintainer_id || d.gateway?.address)
      ).length
    : 0;

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Cross-Chain Activity</h2>
        {chains && (
          <ConnectedChainsTag count={activeChainCount} />
        )}
      </div>
      <Summary data={data} params={{}} />
    </div>
  );
}
