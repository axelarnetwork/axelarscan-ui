import { Tooltip } from '@/components/Tooltip';
import type { GMPTimeSpentPointProps } from './GMPTimeSpent.types';
import { gmpTimeSpentPointStyles } from './GMPTimeSpentPoint.styles';

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
    <Tooltip content={name} className="whitespace-nowrap">
      {point}
    </Tooltip>
  );
}
