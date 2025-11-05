'use client';

import _ from 'lodash';
import { useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import { Number } from '@/components/Number';
import { Spinner } from '@/components/Spinner';
import { isNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { ChartDataPoint } from '../Interchain.types';
import { useChartData } from './StatsBarChart.hooks';
import {
  statsBarChartColors,
  statsBarChartStyles,
} from './StatsBarChart.styles';
import { StatsBarChartProps } from './StatsBarChart.types';
import { getChartTimeString, getChartValue } from './StatsBarChart.utils';
import { StatsBarChartTooltip } from './StatsBarChartTooltip';

export function StatsBarChart({
  i,
  data,
  totalValue,
  field = 'num_txs',
  stacks = ['gmp', 'transfers'],
  colors = statsBarChartColors,
  useStack = true,
  title = '',
  description = '',
  dateFormat = 'D MMM',
  granularity = 'day',
  valueFormat = '0,0',
  valuePrefix = '',
}: StatsBarChartProps) {
  const [x, setX] = useState<number | null>(null);
  const chartData = useChartData({
    data,
    field,
    dateFormat,
    granularity,
  });

  const selectedData = chartData
    ? (toArray(chartData).find(
        item => (item as ChartDataPoint)?.timestamp === x
      ) as ChartDataPoint | undefined)
    : undefined;

  const value = getChartValue(selectedData, chartData, field, totalValue);
  const timeString = getChartTimeString(selectedData, chartData);

  return (
    <div className={statsBarChartStyles.container(i)}>
      <div className={statsBarChartStyles.header.container}>
        <div className={statsBarChartStyles.header.titleContainer}>
          <span className={statsBarChartStyles.header.title}>{title}</span>
          {description && (
            <span className={statsBarChartStyles.header.description}>
              {description}
            </span>
          )}
        </div>
        {isNumber(value) && (
          <div className={statsBarChartStyles.header.valueContainer}>
            <Number
              value={value}
              format={valueFormat}
              prefix={valuePrefix}
              noTooltip={true}
              className={statsBarChartStyles.header.valueNumber}
            />
            <span className={statsBarChartStyles.header.timeString}>
              {timeString}
            </span>
          </div>
        )}
      </div>
      <div className={statsBarChartStyles.chart.container}>
        {!chartData ? (
          <div className={statsBarChartStyles.chart.loading}>
            <Spinner />
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              onMouseEnter={e =>
                setX(e?.activePayload?.[0]?.payload?.timestamp)
              }
              onMouseMove={e => setX(e?.activePayload?.[0]?.payload?.timestamp)}
              onMouseLeave={() => setX(null)}
              margin={{ top: 12, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="timeString"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <Tooltip
                content={
                  <StatsBarChartTooltip
                    stacks={stacks}
                    field={field}
                    valueFormat={valueFormat}
                    valuePrefix={valuePrefix}
                  />
                }
                cursor={{ fill: 'transparent' }}
              />
              {_.reverse(_.cloneDeep(stacks)).map((s, i) => (
                <Bar
                  key={i}
                  stackId={useStack ? field : undefined}
                  dataKey={`${s}_${field}${s.includes('airdrop') ? '_value' : ''}`}
                  fill={colors[s]}
                  minPointSize={0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
