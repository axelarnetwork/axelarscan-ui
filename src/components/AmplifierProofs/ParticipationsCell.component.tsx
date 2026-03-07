import Link from 'next/link';
import clsx from 'clsx';

import { Number } from '@/components/Number';
import { toTitle } from '@/lib/string';

import type { SignOptionEntry, ParticipationsCellProps } from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function ParticipationsCell({ proof }: ParticipationsCellProps) {
  return (
    <Link
      href={`/amplifier-proof/${proof.id}`}
      target="_blank"
      className={styles.linkFitItems}
    >
      {proof.signOptions.map((s: SignOptionEntry, i: number) => (
        <Number
          key={i}
          value={s.value}
          format="0,0"
          suffix={` ${toTitle(s.option.substring(0, ['unsubmitted'].includes(s.option) ? 2 : undefined))}`}
          noTooltip={true}
          className={clsx(
            styles.signOptionBase,
            ['signed'].includes(s.option)
              ? styles.signOptionSigned
              : styles.signOptionOther
          )}
        />
      ))}
    </Link>
  );
}
