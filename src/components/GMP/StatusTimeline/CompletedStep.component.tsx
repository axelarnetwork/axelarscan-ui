import clsx from 'clsx';
import Link from 'next/link';

import type { GMPStepStatus } from '../GMP.types';
import { StepContent } from './StepContent.component';
import { statusTimelineStyles } from './StatusTimeline.styles';

interface CompletedStepProps {
  id: string;
  title: string;
  status: GMPStepStatus;
  stepURL: string | undefined;
}

export function CompletedStep({ id, title, status, stepURL }: CompletedStepProps) {
  const content = <StepContent id={id} title={title} status={status} />;

  return (
    <>
      <div
        className={statusTimelineStyles.connectorWrapper}
        aria-hidden="true"
      >
        <div
          className={clsx(
            statusTimelineStyles.connectorLineBase,
            status === 'failed'
              ? statusTimelineStyles.connectorLineFailed
              : statusTimelineStyles.connectorLineSuccess
          )}
        />
      </div>
      {stepURL ? (
        <Link href={stepURL} target="_blank">
          {content}
        </Link>
      ) : (
        content
      )}
    </>
  );
}
