import Link from 'next/link';

import { Number } from '@/components/Number';
import { formatUnits } from '@/lib/number';
import type { APRMetricProps } from './Overview.types';
import * as styles from './Overview.styles';

export function APRMetric({
  inflation,
  communityTax,
  bankSupplyAmount,
  bondedTokens,
}: APRMetricProps) {
  const aprValue =
    (inflation *
      100 *
      (formatUnits(bankSupplyAmount, 6) as number) *
      (1 - communityTax) *
      (1 - 0.05)) /
    (formatUnits(bondedTokens, 6) as number);

  return (
    <div className={styles.metricRow}>
      <div className={styles.metricLabel}>
        APR:
      </div>
      <Link
        href="https://wallet.keplr.app/chains/axelar"
        target="_blank"
        className={styles.metricLink}
      >
        <Number
          value={aprValue}
          suffix="%"
          noTooltip={true}
          className={styles.metricValue}
        />
      </Link>
    </div>
  );
}
