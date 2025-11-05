import { TooltipComponent } from '@/components/Tooltip';
import { gmpTimeSpentPointStyles } from './GMPTimeSpentPoint.styles';

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
    <div className={gmpTimeSpentPointStyles.container}>
      <div className={gmpTimeSpentPointStyles.dot} />
      <span className={gmpTimeSpentPointStyles.label}>{title}</span>
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
