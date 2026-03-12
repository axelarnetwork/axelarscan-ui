import Link from 'next/link';

import { isAxelar } from '@/lib/chain';

import type { PrevHopLinkProps } from '../GMP.types';
import { statusTimelineStyles } from './StatusTimeline.styles';

export function PrevHopLink({
  sourceChain,
  parentMessageID,
}: PrevHopLinkProps) {
  if (isAxelar(sourceChain) || !parentMessageID) return null;

  return (
    <div className={statusTimelineStyles.hopLinkWrapper}>
      <Link
        href={`/gmp/${parentMessageID}`}
        target="_blank"
        className={statusTimelineStyles.hopLink}
      >
        ← prev Hop
      </Link>
    </div>
  );
}
