import Link from 'next/link';
import clsx from 'clsx';
import { MdClose, MdCheck } from 'react-icons/md';
import { PiClock } from 'react-icons/pi';

import type { CompletedStepProps, StepElementProps, PendingStepProps } from './Transfer.types';
import * as styles from './Transfer.styles';

function StepElement({ step }: StepElementProps) {
  return (
    <>
      <div
        className={clsx(
          styles.stepCircleBase,
          step.status === 'failed'
            ? styles.stepCircleFailed
            : styles.stepCircleSuccess
        )}
      >
        {step.status === 'failed' ? (
          <MdClose className={styles.stepIcon} />
        ) : (
          <MdCheck className={styles.stepIcon} />
        )}
      </div>
      <span
        className={clsx(
          styles.stepLabelBase,
          step.status === 'failed'
            ? styles.stepLabelFailed
            : styles.stepLabelSuccess,
          step.title?.length <= 5 ? styles.shortLabelOffset : ''
        )}
      >
        {step.title}
      </span>
    </>
  );
}

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

export function CompletedStep({
  step,
  stepURL,
}: CompletedStepProps) {
  const element = <StepElement step={step} />;

  return (
    <>
      <div className={styles.stepPendingInset} aria-hidden="true">
        <div
          className={clsx(
            styles.stepCompletedBarBase,
            step.status === 'failed'
              ? styles.stepCompletedBarFailed
              : styles.stepCompletedBarSuccess
          )}
        />
      </div>
      {stepURL ? (
        <Link href={stepURL} target="_blank">
          {element}
        </Link>
      ) : (
        element
      )}
    </>
  );
}
