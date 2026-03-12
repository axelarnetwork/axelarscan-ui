import _ from 'lodash';

import { Number } from '@/components/Number';
import { toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import { ChartDataPoint } from '../Interchain.types';
import type { StatsBarChartTooltipProps } from './StatsBarChart.types';
import { statsBarChartTooltipStyles } from './StatsBarChartTooltip.styles';

export function StatsBarChartTooltip({
  active,
  payload,
  stacks,
  field,
  valueFormat,
  valuePrefix,
}: StatsBarChartTooltipProps) {
  if (!active) {
    return null;
  }

  const data = payload?.[0]?.payload;

  const values = toArray(_.concat(stacks, 'total'))
    .map(d => ({
      key: d as string,
      value: (data as ChartDataPoint)?.[
        `${d !== 'total' ? `${d}_` : ''}${field}`
      ] as number | undefined,
    }))
    .filter(
      d =>
        field !== 'volume' || !d.key.includes('airdrop') || (d.value || 0) > 100
    )
    .map(d => ({
      ...d,
      key: d.key === 'transfers_airdrop' ? 'airdrop_participations' : d.key,
    }));

  return (
    <div className={statsBarChartTooltipStyles.container}>
      {values.map((d, i) => (
        <div key={i} className={statsBarChartTooltipStyles.item.container}>
          <span className={statsBarChartTooltipStyles.item.label}>
            {toTitle(d.key === 'gmp' ? 'GMPs' : d.key)}
          </span>
          <Number
            value={d.value || 0}
            format={valueFormat}
            prefix={valuePrefix}
            noTooltip={true}
            className={statsBarChartTooltipStyles.item.value}
          />
        </div>
      ))}
    </div>
  );
}
