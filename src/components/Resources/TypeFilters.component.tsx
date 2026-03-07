import Link from 'next/link';
import clsx from 'clsx';

import { getQueryString } from '@/lib/operator';

import type { TypeFiltersProps } from './Resources.types';
import * as styles from './Resources.styles';

const CHAIN_TYPES = [
  { label: 'All', value: undefined },
  { label: 'EVM', value: 'evm' },
  { label: 'Cosmos', value: 'cosmos' },
  { label: 'Amplifier', value: 'vm' },
];

const ASSET_TYPES = [
  { label: 'All', value: undefined },
  { label: 'Gateway', value: 'gateway' },
  { label: 'ITS', value: 'its' },
];

export function TypeFilters({ resource, params, pathname }: TypeFiltersProps) {
  return (
    <div className={styles.typeFiltersRow}>
      {(resource === 'assets' ? ASSET_TYPES : CHAIN_TYPES).map((d, i) => (
        <Link
          key={i}
          href={`${pathname}${getQueryString({ ...params, type: d.value })}`}
          className={clsx(
            styles.typeLinkBase,
            d.value === params.type
              ? styles.typeLinkActive
              : styles.typeLinkInactive
          )}
        >
          <span>{d.label}</span>
        </Link>
      ))}
    </div>
  );
}
