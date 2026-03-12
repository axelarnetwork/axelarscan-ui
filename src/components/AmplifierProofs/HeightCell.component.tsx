import Link from 'next/link';

import { Number } from '@/components/Number';

import type { HeightCellProps } from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function HeightCell({ height }: HeightCellProps) {
  if (!height) return null;

  return (
    <Link
      href={`/block/${height}`}
      target="_blank"
      className={styles.linkBlueMedium}
    >
      <Number value={height} />
    </Link>
  );
}
