'use client';

import clsx from 'clsx';
import _ from 'lodash';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Number } from '@/components/Number';
import { Spinner } from '@/components/Spinner';
import { isNumber, numberFormat } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { ChartDataPoint } from './Interchain.types';
import { useChartData } from './StatsBarChart.hooks';
import { StatsBarChartProps } from './StatsBarChart.types';
import {
  getChartTimeString,
  getChartValue,
  getDomain,
} from './StatsBarChart.utils';
import { StatsBarChartTooltip } from './StatsBarChartTooltip';

export function StatsBarChart({
  i,
  data,
  totalValue,
  field = 'num_txs',
  stacks = ['gmp', 'transfers'],
  colors = {
    gmp: '#ff7d20',
    transfers: '#009ef7',
    transfers_airdrop: '#de3163',
  },
  scale = '',
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
    scale,
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
    <div
      className={clsx(
        'flex flex-col gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 xl:px-8',
        i % 2 !== 0 ? 'sm:border-l-0' : ''
      )}
    >
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-0.5">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </span>
          {description && (
            <span className="hidden text-sm font-normal text-zinc-400 dark:text-zinc-500 lg:block">
              {description}
            </span>
          )}
        </div>
        {isNumber(value) && (
          <div className="flex flex-col items-end gap-y-0.5">
            <Number
              value={value}
              format={valueFormat}
              prefix={valuePrefix}
              noTooltip={true}
              className="!text-base font-semibold text-zinc-900 dark:text-zinc-100"
            />
            <span className="whitespace-nowrap text-right text-sm text-zinc-400 dark:text-zinc-500">
              {timeString}
            </span>
          </div>
        )}
      </div>
      <div className="-mb-2.5 h-64 w-full">
        {!chartData ? (
          <div className="flex h-full w-full items-center justify-center">
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
              margin={{ top: 12, right: 0, bottom: 0, left: scale ? -24 : 0 }}
            >
              <XAxis
                dataKey="timeString"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              {scale && (
                <YAxis
                  dataKey={field}
                  scale={scale as 'auto' | 'linear' | 'pow' | 'sqrt' | 'log'}
                  domain={getDomain(useStack, stacks, chartData, field)}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => numberFormat(v, '0,0a')}
                />
              )}
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
                  minPointSize={scale && i === 0 ? 10 : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
