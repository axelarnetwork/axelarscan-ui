import Link from 'next/link';

import { Number } from '@/components/Number';
import type { InflationMetricProps } from './Overview.types';
import * as styles from './Overview.styles';

export function InflationMetric({ inflation }: InflationMetricProps) {
  return (
    <div className={styles.metricRow}>
      <div className={styles.metricLabel}>
        Inflation:
      </div>
      <Link
        href="/validators"
        target="_blank"
        className={styles.metricLink}
      >
        <Number
          value={inflation * 100}
          suffix="%"
          noTooltip={true}
          className={styles.metricValue}
        />
      </Link>
    </div>
  );
}
