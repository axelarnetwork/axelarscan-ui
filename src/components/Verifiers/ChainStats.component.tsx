import clsx from 'clsx';

import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { numberFormat } from '@/lib/number';

import type { ChainStatsProps } from './Verifiers.types';
import * as styles from './Verifiers.styles';

export function ChainStats({ votes, signs, signsTotal, totalProofs }: ChainStatsProps) {
  const voteTotal = votes?.total ?? 0;
  const voteTotalPolls = votes?.total_polls ?? 0;

  return (
    <div className={styles.statsWrapper}>
      <Tooltip
        content={['true', 'false', 'unsubmitted']
          .map((s) => [
            s === 'true' ? 'Y' : s === 'false' ? 'N' : 'UN',
            votes?.votes?.[s],
          ])
          .map(([k, v]) => `${numberFormat(v, '0,0')}${k}`)
          .join(' / ')}
        className="whitespace-nowrap"
      >
        <div className={styles.statsInner}>
          <Number
            value={voteTotal}
            format="0,0.0a"
            prefix="Voting: "
            noTooltip={true}
            className={clsx(
              'text-xs font-medium',
              voteTotal < voteTotalPolls
                ? styles.statsInactive
                : styles.statsActive
            )}
          />
          <Number
            value={voteTotalPolls}
            format="0,0.0a"
            prefix=" / "
            noTooltip={true}
            className={styles.statsActive}
          />
        </div>
      </Tooltip>
      <Tooltip
        content={['true', 'unsubmitted']
          .map((s) => [
            s === 'true' ? ' Signed' : 'UN',
            signs?.signs?.[s],
          ])
          .map(([k, v]) => `${numberFormat(v, '0,0')}${k}`)
          .join(' / ')}
        className="whitespace-nowrap"
      >
        <div className={styles.statsInner}>
          <Number
            value={signsTotal}
            format="0,0.0a"
            prefix="Signing: "
            noTooltip={true}
            className={clsx(
              'text-xs font-medium',
              signsTotal < totalProofs
                ? styles.statsInactive
                : styles.statsActive
            )}
          />
          <Number
            value={totalProofs}
            format="0,0.0a"
            prefix=" / "
            noTooltip={true}
            className={styles.statsActive}
          />
        </div>
      </Tooltip>
    </div>
  );
}
