import Link from 'next/link';
import clsx from 'clsx';

import type { CompletedStepProps } from './Transfer.types';
import { StepElement } from './StepElement.component';
import * as styles from './Transfer.styles';

export function CompletedStep({ step, stepURL }: CompletedStepProps) {
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
