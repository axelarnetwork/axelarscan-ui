import { Number } from '@/components/Number';
import { formatUnits } from '@/lib/number';

import type { InfoSummaryProps } from './AmplifierRewards.types';
import * as styles from './AmplifierRewards.styles';
import { ChainSelector } from './ChainSelector.component';

export function InfoSummary({
  chain,
  chainId,
  verifierCount,
  cumulativeRewards,
  totalBalance,
  symbol,
}: InfoSummaryProps) {
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoHeaderWrapper}>
        <h3 className={styles.infoHeading}>
          <ChainSelector chain={chain} chainId={chainId} />
        </h3>
      </div>
      <div className={styles.infoBorderTop}>
        <div className={styles.infoGrid}>
          <dl className={styles.infoDl}>
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>No. Verifiers</dt>
              <dd className={styles.infoDd}>
                <Number
                  value={verifierCount}
                  format="0,0"
                  className="font-medium"
                />
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>Cumulative rewards</dt>
              <dd className={styles.infoDd}>
                <Number
                  value={cumulativeRewards}
                  suffix={` ${symbol}`}
                  noTooltip={true}
                  className="font-medium"
                />
              </dd>
            </div>
          </dl>
          <dl className={styles.infoDl}>
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>Total reward pool balance</dt>
              <dd className={styles.infoDd}>
                <Number
                  value={formatUnits(String(totalBalance ?? '0'), 6)}
                  suffix={` ${symbol}`}
                  noTooltip={true}
                  className="font-medium"
                />
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}></dt>
              <dd className={styles.infoDd}></dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
