import clsx from 'clsx';

import { isString } from '@/lib/string';
import type { GMPEventLog } from '../GMP.types';
import { PendingStep } from './PendingStep.component';
import { CompletedStep } from './CompletedStep.component';
import { resolveStepURL } from './StatusTimeline.utils';
import { statusTimelineStyles } from './StatusTimeline.styles';
import type { StepItemProps } from './StatusTimeline.types';

export function StepItem({
  step,
  stepIndex,
  totalSteps,
  entry,
  expressExecuted,
  estimatedTimeSpent,
  rootCall,
  previousStepStatus,
}: StepItemProps) {
  const { id, title, status, data, chainData } = step;

  const rawStepData =
    id === 'pay_gas' && isString(data) ? entry.originData?.gas_paid : data;

  const stepEventLog =
    typeof rawStepData === 'object' && rawStepData !== null
      ? (rawStepData as GMPEventLog)
      : undefined;

  const stepURL = resolveStepURL(id, stepEventLog, chainData?.explorer);
  const hasPreviousStep = previousStepStatus !== 'pending';

  return (
    <li
      key={id}
      className={clsx(
        statusTimelineStyles.stepWrapper,
        stepIndex !== totalSteps - 1 && statusTimelineStyles.stepSpacing
      )}
    >
      {status === 'pending' ? (
        <PendingStep
          id={id}
          title={title}
          hasPreviousStep={hasPreviousStep}
          expressExecuted={expressExecuted}
          estimatedTimeSpent={estimatedTimeSpent}
          rootCall={rootCall}
        />
      ) : (
        <CompletedStep
          id={id}
          title={title}
          status={status}
          stepURL={stepURL}
        />
      )}
    </li>
  );
}
