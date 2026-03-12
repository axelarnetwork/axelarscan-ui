'use client';

import { useNavigationProgress } from './NavigationProgress.hooks';
import * as styles from './NavigationProgress.styles';

export function NavigationProgress() {
  const { progress, visible } = useNavigationProgress();

  if (!visible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.bar} style={styles.barTransition(progress)} />
    </div>
  );
}
