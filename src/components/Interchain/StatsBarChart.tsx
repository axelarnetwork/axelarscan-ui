'use client';

import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
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
import { headString, lastString, toTitle } from '@/lib/string';
import { ChartDataPoint, CustomTooltipProps } from './Interchain.types';
import { StatsBarChartProps } from './StatsBarChart.types';

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
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [x, setX] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      const chartDataPoints =
        'data' in data && Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
      setChartData(
        chartDataPoints
          .map((d: Record<string, unknown>) => {
            const time = moment(d.timestamp as number).utc();
            const timeString = time.format(dateFormat);

            let focusTimeString;

            switch (granularity) {
              case 'month':
                focusTimeString = time.format('MMM YYYY');
                break;
              case 'week':
                focusTimeString = [
                  time.format(dateFormat),
                  moment(time).add(7, 'days').format(dateFormat),
                ].join(' - ');
                break;
              default:
                focusTimeString = timeString;
                break;
            }

            return {
              ...d,
              timeString,
              focusTimeString,
            };
          })
          .filter(
            (d: ChartDataPoint) =>
              scale !== 'log' ||
              field !== 'volume' ||
              (d[field as keyof ChartDataPoint] as number) > 100
          )
      );
    }
  }, [data, field, scale, dateFormat, granularity]);

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active) return null;

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
          field !== 'volume' ||
          !d.key.includes('airdrop') ||
          (d.value || 0) > 100
      )
      .map(d => ({
        ...d,
        key: d.key === 'transfers_airdrop' ? 'airdrop_participations' : d.key,
      }));

    return (
      <div className="flex flex-col gap-y-1.5 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
        {values.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-x-4">
            <span className="text-xs font-semibold capitalize">
              {toTitle(d.key === 'gmp' ? 'GMPs' : d.key)}
            </span>
            <Number
              value={d.value || 0}
              format={valueFormat}
              prefix={valuePrefix}
              noTooltip={true}
              className="text-xs font-medium"
            />
          </div>
        ))}
      </div>
    );
  };

  const d = toArray(chartData).find(
    item => (item as ChartDataPoint)?.timestamp === x
  ) as ChartDataPoint | undefined;

  const value =
    d && field
      ? (d[field] as number | undefined)
      : chartData && chartData.length > 0 && field
        ? totalValue || _.sumBy(chartData, field)
        : undefined;
  const timeString = d
    ? (d as ChartDataPoint).focusTimeString
    : chartData && chartData.length > 0
      ? toArray([
          headString(
            (_.head(chartData.filter(d => d?.timestamp)) as ChartDataPoint)
              ?.focusTimeString,
            ' - '
          ),
          lastString(
            (_.last(chartData.filter(d => d?.timestamp)) as ChartDataPoint)
              ?.focusTimeString,
            ' - '
          ),
        ]).join(' - ')
      : undefined;

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
                  domain={
                    useStack
                      ? ['dataMin', 'dataMax']
                      : [
                          _.min(
                            stacks.map(
                              s =>
                                _.minBy(chartData, `${s}_${field}`)?.[
                                  `${s}_${field}`
                                ] as number
                            )
                          ) ?? 0,
                          _.max(
                            stacks.map(
                              s =>
                                _.maxBy(chartData, `${s}_${field}`)?.[
                                  `${s}_${field}`
                                ] as number
                            )
                          ) ?? 1,
                        ]
                  }
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => numberFormat(v, '0,0a')}
                />
              )}
              <Tooltip
                content={<CustomTooltip />}
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
