import clsx from 'clsx';
import { MdCheck, MdClose } from 'react-icons/md';

import { statusTimelineStyles } from './StatusTimeline.styles';
import type { StepContentProps } from './StatusTimeline.types';

export function StepContent({ id, title, status }: StepContentProps) {
  return (
    <>
      <div
        className={clsx(
          statusTimelineStyles.stepCircleBase,
          status === 'failed'
            ? statusTimelineStyles.stepCircleFailed
            : statusTimelineStyles.stepCircleSuccess
        )}
      >
        {status === 'failed' ? (
          <MdClose className={statusTimelineStyles.stepIcon} />
        ) : (
          <MdCheck className={statusTimelineStyles.stepIcon} />
        )}
      </div>
      <span
        className={clsx(
          statusTimelineStyles.stepLabel,
          status === 'failed'
            ? statusTimelineStyles.stepLabelFailed
            : statusTimelineStyles.stepLabelSuccess,
          (title ?? '').length <= 5 && statusTimelineStyles.shortTitleSpacing
        )}
      >
        {title}
      </span>
      {id === 'express' && (
        <div className={statusTimelineStyles.expressLabelWrapper}>
          <span className={statusTimelineStyles.expressLabel}>Received</span>
        </div>
      )}
    </>
  );
}
