import { Profile } from '@/components/Profile';
import type { ValidatorListProps } from './Block.types';
import * as styles from './Block.styles';

export function ValidatorList({ validators }: ValidatorListProps) {
  return (
    <div className={styles.signerGrid}>
      {validators.map((d, i) => (
        <Profile
          key={i}
          address={d.operator_address}
          width={20}
          height={20}
          className="text-xs"
        />
      ))}
    </div>
  );
}
