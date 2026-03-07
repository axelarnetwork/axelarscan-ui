import moment from 'moment';

import { TimeUntil } from '@/components/Time';
import { timeDiff } from '@/lib/time';
import type { ConfirmTimeEstimateProps } from './StatusTimeline.types';
import { statusTimelineStyles } from './StatusTimeline.styles';

export function ConfirmTimeEstimate({
  id,
  expressExecuted,
  estimatedTimeSpent,
  rootCall,
}: ConfirmTimeEstimateProps) {
  if (id !== 'confirm') return null;
  if (expressExecuted) return null;
  if (!estimatedTimeSpent?.confirm) return null;
  if (!rootCall?.block_timestamp) return null;

  const targetMs = (rootCall.block_timestamp + estimatedTimeSpent.confirm) * 1000;
  if (timeDiff(moment(), 'seconds', targetMs) <= 0) return null;

  return (
    <div className={statusTimelineStyles.pendingTimeWrapper}>
      <TimeUntil
        timestamp={targetMs}
        prefix="("
        suffix=")"
        noTooltip
        className={statusTimelineStyles.pendingTimeText}
      />
    </div>
  );
}
