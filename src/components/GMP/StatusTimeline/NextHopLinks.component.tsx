import Link from 'next/link';

import { isAxelar } from '@/lib/chain';
import { toArray } from '@/lib/parser';

import type { NextHopLinksProps } from '../GMP.types';
import { statusTimelineStyles } from './StatusTimeline.styles';

export function NextHopLinks({
  destinationChain,
  childMessageIDs,
}: NextHopLinksProps) {
  if (isAxelar(destinationChain)) return null;

  const ids = toArray(childMessageIDs)
    .map(idValue => {
      if (typeof idValue === 'string') return idValue;
      if (typeof idValue === 'number') return idValue.toString();
      return undefined;
    })
    .filter((idValue): idValue is string => Boolean(idValue));

  return (
    <>
      {ids.map(childId => (
        <div key={childId} className={statusTimelineStyles.hopLinkWrapper}>
          <Link
            href={`/gmp/${childId}`}
            target="_blank"
            className={statusTimelineStyles.hopLink}
          >
            next Hop →
          </Link>
        </div>
      ))}
    </>
  );
}
