import Link from 'next/link';

import { STATUSES } from './Validators.types';
import type { ValidatorsHeaderProps } from './Validators.types';
import * as styles from './Validators.styles';

export function ValidatorsHeader({
  status,
  filterCounts,
}: ValidatorsHeaderProps) {
  return (
    <div className={styles.headerRow}>
      <div className={styles.headerLeft}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Validators</h1>
          <span className={styles.titleSeparator}>|</span>
          <Link href="/verifiers" className={styles.verifiersLink}>
            Verifiers
          </Link>
        </div>
        <p className={styles.subtitle}>
          List of {status || 'active'} validators in Axelar Network with the
          latest 10K blocks performance.
          {(!status || status === 'active') && (
            <>
              &nbsp;
              <Link
                href="https://www.axelar.network/blog/how-to-stake-the-axl-token-on-the-axelar-network"
                target="_blank"
                aria-label="How to stake AXL"
                className={styles.stakeLink}
              >
                How to stake AXL
              </Link>
            </>
          )}
        </p>
      </div>
      <nav className={styles.nav}>
        {STATUSES.map((s, i) => (
          <Link
            key={i}
            href={`/validators${s !== 'active' ? `/${s}` : ''}`}
            className={
              s === (status || 'active')
                ? styles.navLinkActive
                : styles.navLinkInactive
            }
          >
            {s} ({filterCounts[s] ?? 0})
          </Link>
        ))}
      </nav>
    </div>
  );
}
