import { toArray } from '@/lib/parser';

import type { GMPMessage } from '../GMP.types';
import { TimelineEntry } from './TimelineEntry.component';
import { statusTimelineStyles } from './StatusTimeline.styles';
import type { StatusTimelineProps } from './StatusTimeline.types';

export function StatusTimeline({
  timeline,
  chains,
  estimatedTimeSpent,
  isMultihop,
  rootCall,
  expressExecuted,
}: StatusTimelineProps) {
  const entries = toArray(timeline).filter(
    (entry): entry is GMPMessage => typeof entry === 'object' && entry !== null
  );

  if (entries.length === 0) return null;

  return (
    <div className={statusTimelineStyles.list}>
      {entries.map((entry: GMPMessage, index: number) => (
        <TimelineEntry
          key={index}
          entry={entry}
          chains={chains}
          isMultihop={isMultihop}
          estimatedTimeSpent={estimatedTimeSpent}
          rootCall={rootCall}
          expressExecuted={expressExecuted}
        />
      ))}
    </div>
  );
}
