import clsx from 'clsx';
import { PiClock } from 'react-icons/pi';

import type { PendingStepProps } from './Transfer.types';
import * as styles from './Transfer.styles';

export function PendingStep({ step, prevStatus }: PendingStepProps) {
  const isPrevPending = prevStatus === 'pending';

  return (
    <>
      <div className={styles.stepPendingInset} aria-hidden="true">
        <div className={styles.stepPendingBar} />
      </div>
      <div
        className={clsx(
          styles.stepPendingCircleBase,
          isPrevPending
            ? styles.stepPendingBorderInactive
            : styles.stepPendingBorderActive
        )}
        aria-current="step"
      >
        {!isPrevPending && (
          <PiClock
            className={clsx(
              'h-5 w-5',
              isPrevPending
                ? styles.stepPendingClockInactive
                : styles.stepPendingClockActive
            )}
          />
        )}
        <span
          className={clsx(
            styles.stepPendingLabelBase,
            !isPrevPending
              ? styles.stepPendingLabelActive
              : styles.stepPendingLabelInactive,
            step.title?.length <= 5 ? styles.shortLabelOffset : ''
          )}
        >
          {step.title}
        </span>
      </div>
    </>
  );
}
