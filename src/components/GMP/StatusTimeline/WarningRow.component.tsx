import { PiWarningCircle } from 'react-icons/pi';

import type { WarningRowProps } from '../GMP.types';
import { statusTimelineStyles } from './StatusTimeline.styles';

export function WarningRow({ text }: WarningRowProps) {
  return (
    <div className={statusTimelineStyles.warningRow}>
      <PiWarningCircle size={16} />
      <span className={statusTimelineStyles.warningText}>{text}</span>
    </div>
  );
}
