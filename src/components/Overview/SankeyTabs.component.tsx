import clsx from 'clsx';

import type { SankeyTabsProps } from './Overview.types';
import * as styles from './Overview.styles';

const SANKEY_TABS = ['transactions', 'volume'];

export function SankeyTabs({ currentTab, onTabChange }: SankeyTabsProps) {
  return (
    <div className={styles.sankeyTabsWrapper}>
      {SANKEY_TABS.map((d, i) => (
        <div
          key={i}
          onClick={() => onTabChange(d)}
          className={clsx(
            styles.sankeyTabBase,
            d === currentTab
              ? styles.sankeyTabActive
              : styles.sankeyTabInactive,
            i > 0 ? 'ml-4' : ''
          )}
        >
          <span>{d}</span>
        </div>
      ))}
    </div>
  );
}
