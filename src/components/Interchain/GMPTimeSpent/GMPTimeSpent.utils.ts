import { toArray } from '@/lib/parser';
import { toFixed } from '@/lib/number';
import { TimeSpentData } from './Interchain.types';

export interface PointData {
  id: string;
  title: string;
  name: string;
  time_spent: number;
  label?: string;
  value?: number;
  width?: string | number;
}

export function calculatePoints(data: TimeSpentData): PointData[] {
  const { express_execute, confirm, approve, total } = { ...data };

  let points: PointData[] = toArray([
    express_execute && {
      id: 'express_execute',
      title: 'X',
      name: 'Express Execute',
      time_spent: express_execute,
    },
    confirm && {
      id: 'confirm',
      title: 'C',
      name: 'Confirm',
      time_spent: confirm,
    },
    approve && {
      id: 'approve',
      title: 'A',
      name: 'Approve',
      time_spent: approve,
    },
    total && {
      id: 'execute',
      title: 'E',
      name: 'Execute',
      label: 'Total',
      time_spent: total,
    },
  ]) as PointData[];

  if (total && typeof total === 'number') {
    points = points.map((d, i) => {
      const value =
        (d.time_spent || 0) - (i > 0 ? points[i - 1].time_spent || 0 : 0);

      return {
        ...d,
        value,
        width: toFixed((value * 100) / total, 2),
      };
    });
  }

  return points;
}
