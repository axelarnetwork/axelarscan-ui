import Link from 'next/link';

import { Tooltip } from '@/components/Tooltip';
import type { MetricWithTooltipProps } from './Overview.types';
import * as styles from './Overview.styles';

export function MetricWithTooltip({
  tooltipContent,
  href,
  children,
}: MetricWithTooltipProps) {
  return (
    <Link href={href} target="_blank" className={styles.metricLink}>
      <div className={styles.tooltipDesktopOnly}>
        <Tooltip content={tooltipContent} className={styles.tooltipWhitespace}>
          {children}
        </Tooltip>
      </div>
      <div className={styles.mobileOnly}>
        <div className={styles.mobileInner}>{children}</div>
      </div>
    </Link>
  );
}
