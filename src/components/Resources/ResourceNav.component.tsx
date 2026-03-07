import Link from 'next/link';
import clsx from 'clsx';

import type { ResourceNavProps } from './Resources.types';
import * as styles from './Resources.styles';

const RESOURCES = ['chains', 'assets'];

export function ResourceNav({
  resource,
  filter,
  params,
  chains,
  assets,
}: ResourceNavProps) {
  return (
    <nav className={styles.navRow}>
      {RESOURCES.map((d, i) => {
        const countSuffix =
          d === resource &&
          ((resource === 'chains' && chains) ||
            (resource === 'assets' && assets))
            ? ` (${filter(resource, params).length})`
            : '';

        return (
          <Link
            key={i}
            href={`/resources/${d}`}
            className={clsx(
              styles.navLinkBase,
              d === resource ? styles.navLinkActive : styles.navLinkInactive
            )}
          >
            {d}
            {countSuffix}
          </Link>
        );
      })}
    </nav>
  );
}
