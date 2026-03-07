import clsx from 'clsx';

import { isAxelar } from '@/lib/chain';
import { toArray } from '@/lib/parser';
import type { GMPStep, TimelineEntryProps } from '../GMP.types';
import { getStep } from '../GMP.utils';
import { StepItem } from './StepItem.component';
import { HopLinks } from './HopLinks.component';
import { WarningMessages } from './WarningMessages.component';
import { ChainPath } from './ChainPath.component';
import { statusTimelineStyles } from './StatusTimeline.styles';

export function TimelineEntry({
  entry,
  chains,
  isMultihop,
  estimatedTimeSpent,
  rootCall,
  expressExecuted,
}: TimelineEntryProps) {
  const { call } = { ...entry };
  const sourceChain = call?.chain;
  const destinationChain =
    call?.returnValues?.destinationChain || entry?.approved?.chain;

  const steps = getStep(entry, chains);
  if (steps.length === 0) return null;

  const parentMessageID = call?.parentMessageID;
  const childMessageIDs = entry?.executed?.childMessageIDs;

  const hasHopNavigation =
    (isAxelar(sourceChain) && toArray(childMessageIDs).length > 0) ||
    (isAxelar(destinationChain) && Boolean(parentMessageID));

  const navHeightClass = hasHopNavigation
    ? statusTimelineStyles.navTallHeight
    : statusTimelineStyles.navDefaultHeight;

  return (
    <div className={statusTimelineStyles.item}>
      {isMultihop && (
        <ChainPath
          sourceChain={sourceChain}
          destinationChain={destinationChain}
        />
      )}

      <nav
        aria-label="Progress"
        className={clsx(statusTimelineStyles.nav, navHeightClass)}
      >
        <ol className={statusTimelineStyles.navList}>
          {steps.map((step: GMPStep, stepIndex: number) => (
            <StepItem
              key={step.id}
              step={step}
              stepIndex={stepIndex}
              totalSteps={steps.length}
              entry={entry}
              expressExecuted={expressExecuted}
              estimatedTimeSpent={estimatedTimeSpent}
              rootCall={rootCall}
              previousStepStatus={steps[stepIndex - 1]?.status}
            />
          ))}
        </ol>
      </nav>

      <HopLinks
        sourceChain={sourceChain}
        destinationChain={destinationChain}
        parentMessageID={parentMessageID as string | undefined}
        childMessageIDs={childMessageIDs as unknown[] | undefined}
      />

      <WarningMessages entry={entry} />
    </div>
  );
}
