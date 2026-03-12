import clsx from 'clsx';
import { MdClose, MdCheck } from 'react-icons/md';

import type { StepElementProps } from './Transfer.types';
import * as styles from './Transfer.styles';

export function StepElement({ step }: StepElementProps) {
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
