import { PiRadioButtonFill } from 'react-icons/pi';

import { Tag } from '@/components/Tag';
import type { ConnectedChainsTagProps } from './Overview.types';
import * as styles from './Overview.styles';

export function ConnectedChainsTag({ count }: ConnectedChainsTagProps) {
  return (
    <Tag className={styles.connectedChainsTag}>
      <PiRadioButtonFill
        size={18}
        className={styles.connectedChainsIcon}
      />
      <span className={styles.connectedChainsLabel}>
        Connected chains:{' '}
        <span className={styles.connectedChainsCount}>{count}</span>
      </span>
    </Tag>
  );
}
