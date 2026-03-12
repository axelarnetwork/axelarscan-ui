import { useState } from 'react';

import { SankeyChart } from '@/components/Interchain';
import { NetworkGraph } from '@/components/NetworkGraph';
import { toNumber } from '@/lib/number';
import _ from 'lodash';

import { SankeyTabs } from './SankeyTabs.component';
import type { NetworkGraphSectionProps } from './Overview.types';
import * as styles from './Overview.styles';

const SANKEY_TABS = ['transactions', 'volume'];

export function NetworkGraphSection({
  data,
  networkGraph,
  chainPairs,
  setChainFocus,
}: NetworkGraphSectionProps) {
  const [sankeyTab, setSankeyTab] = useState(SANKEY_TABS[0]);

  const totalValue =
    sankeyTab === 'transactions'
      ? toNumber(_.sumBy(data.GMPStatsByChains?.source_chains, 'num_txs')) +
        toNumber(data.transfersStats?.total)
      : toNumber(data.GMPTotalVolume) + toNumber(data.transfersTotalVolume);

  const field = sankeyTab === 'transactions' ? 'num_txs' : 'volume';
  const valuePrefix = sankeyTab === 'transactions' ? '' : '$';

  return (
    <div className={styles.sectionWrapper}>
      <h2 className={styles.sectionTitle}>Network Graph</h2>
      <div className={styles.networkGraphGrid}>
        <div className={styles.networkGraphCol}>
          <NetworkGraph
            data={networkGraph}
            hideTable={true}
            setChainFocus={(chain: string | null) => setChainFocus(chain)}
          />
        </div>
        <div className={styles.sankeyWrapper}>
          <SankeyChart
            i={0}
            data={chainPairs}
            topN={40}
            totalValue={totalValue}
            field={field}
            title={
              <SankeyTabs currentTab={sankeyTab} onTabChange={setSankeyTab} />
            }
            valuePrefix={valuePrefix}
            noBorder={true}
            className="h-144"
          />
        </div>
      </div>
    </div>
  );
}
