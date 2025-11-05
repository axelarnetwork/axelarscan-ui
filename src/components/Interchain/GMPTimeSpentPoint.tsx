import { TooltipComponent } from '@/components/Tooltip';

interface GMPTimeSpentPointProps {
  title: string;
  name: string;
  noTooltip?: boolean;
}

export function GMPTimeSpentPoint({
  title,
  name,
  noTooltip = false,
}: GMPTimeSpentPointProps) {
  const point = (
    <div className="flex flex-col gap-y-0.5">
      <div className="h-2 w-2 rounded-full bg-blue-600 p-1 dark:bg-blue-500" />
      <span className="text-2xs font-medium uppercase text-blue-600 dark:text-blue-500">
        {title}
      </span>
    </div>
  );

  if (noTooltip) {
    return point;
  }

  return (
    <TooltipComponent content={name} className="whitespace-nowrap">
      {point}
    </TooltipComponent>
  );
}

