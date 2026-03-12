import clsx from 'clsx';
import { PiClock } from 'react-icons/pi';

import { ConfirmTimeEstimate } from './ConfirmTimeEstimate.component';
import { statusTimelineStyles } from './StatusTimeline.styles';
import type { PendingStepProps } from './StatusTimeline.types';

export function PendingStep({
  id,
  title,
  hasPreviousStep,
  expressExecuted,
  estimatedTimeSpent,
  rootCall,
}: PendingStepProps) {
  return (
    <>
      <div className={statusTimelineStyles.connectorWrapper} aria-hidden="true">
        <div
          className={clsx(
            statusTimelineStyles.connectorLineBase,
            statusTimelineStyles.pendingConnectorLine
          )}
        />
      </div>
      <div
        className={clsx(
          statusTimelineStyles.pendingCircle,
          hasPreviousStep
            ? statusTimelineStyles.pendingBorderActive
            : statusTimelineStyles.pendingBorderDefault
        )}
        aria-current="step"
      >
        {hasPreviousStep && (
          <PiClock
            className={clsx(
              statusTimelineStyles.pendingClock,
              statusTimelineStyles.pendingLabelActive
            )}
          />
        )}
        <span
          className={clsx(
            statusTimelineStyles.pendingLabel,
            hasPreviousStep
              ? statusTimelineStyles.pendingLabelActive
              : statusTimelineStyles.pendingLabelInactive,
            (title ?? '').length <= 5 && statusTimelineStyles.shortTitleSpacing
          )}
        >
          {title}
        </span>
        <ConfirmTimeEstimate
          id={id}
          expressExecuted={expressExecuted}
          estimatedTimeSpent={estimatedTimeSpent}
          rootCall={rootCall}
        />
      </div>
    </>
  );
}
