import clsx from 'clsx';
import { PiWarningCircle } from 'react-icons/pi';

import { resolveStepURL } from './Transfer.utils';
import { PendingStep } from './PendingStep.component';
import { CompletedStep } from './CompletedStep.component';
import type { StatusStepsProps, TransferStep } from './Transfer.types';
import * as styles from './Transfer.styles';

export function StatusSteps({
  steps,
  axelarChainData,
  destinationChainData,
  insufficientFee,
}: StatusStepsProps) {
  return (
    <div className={styles.statusFlexCol}>
      <nav aria-label="Progress" className={styles.statusNav}>
        <ol role="list" className={styles.statusOl}>
          {steps.map((d: TransferStep, i: number) => {
            const stepURL = resolveStepURL(
              d,
              axelarChainData,
              destinationChainData
            );

            return (
              <li
                key={d.id}
                className={clsx(
                  styles.stepLiBase,
                  i !== steps.length - 1 ? styles.stepLiNotLast : ''
                )}
              >
                {d.status === 'pending' ? (
                  <PendingStep step={d} prevStatus={steps[i - 1]?.status} />
                ) : (
                  <CompletedStep step={d} stepURL={stepURL} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {!!insufficientFee && (
        <div className={styles.insufficientFeeRow}>
          <PiWarningCircle size={16} />
          <span className={styles.insufficientFeeText}>Insufficient Fee</span>
        </div>
      )}
    </div>
  );
}
