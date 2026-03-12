import { Number } from '@/components/Number';

import type { VotingPowerRowProps } from './Validator.types';
import * as styles from './Validator.styles';

export function VotingPowerRow({
  label,
  value,
  totalPower,
  showPercent,
}: VotingPowerRowProps) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dlLabel}>{label}</dt>
      <dd className={styles.dlValue}>
        <div className={styles.votingPowerRow}>
          <Number
            value={value}
            format="0,0.0a"
            noTooltip={true}
            className={styles.votingPowerValue}
          />
          {showPercent && (
            <Number
              value={(value * 100) / totalPower}
              format="0,0.0a"
              prefix="("
              suffix="%)"
              noTooltip={true}
              className={styles.votingPowerPercent}
            />
          )}
        </div>
      </dd>
    </div>
  );
}
