import Link from 'next/link';

import { Number } from '@/components/Number';
import { formatUnits } from '@/lib/number';
import type { StakedMetricProps } from './Overview.types';
import * as styles from './Overview.styles';

export function StakedMetric({ bankSupplyAmount, bondedTokens }: StakedMetricProps) {
  return (
    <div className={styles.metricRow}>
      <div className={styles.metricLabel}>
        Staked:
      </div>
      <Link
        href="/validators"
        target="_blank"
        className={styles.metricLink}
      >
        <Number
          value={formatUnits(bondedTokens, 6)}
          format="0,0a"
          noTooltip={true}
          className={styles.metricValue}
        />
        <Number
          value={formatUnits(bankSupplyAmount, 6)}
          format="0,0.00a"
          prefix="/ "
          noTooltip={true}
          className={styles.stakedValueExtra}
        />
      </Link>
    </div>
  );
}
