import _ from 'lodash';

import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { headString, lastString } from '@/lib/string';
import { GroupDataItem } from '../Interchain.types';

export interface ProcessedChartDataItem {
  source: string;
  target: string;
  value: number;
  key?: string;
}

/**
 * Processes chart data for Sankey diagram
 */
export function processSankeyChartData(
  data: GroupDataItem[] | GroupDataItem | undefined,
  field: string,
  topN: number,
  chains: unknown
): ProcessedChartDataItem[] {
  if (!data) {
    return [];
  }

  const dataArray = toArray(data) as GroupDataItem[];

  return _.slice(
    _.orderBy(
      dataArray
        .filter(d => ((d[field as keyof GroupDataItem] as number) || 0) > 0)
        .map(d => ({
          source: headString(d.key, '_'),
          target: lastString(d.key, '_'),
          value: parseInt(String(d[field as keyof GroupDataItem])),
          key: d.key,
        })),
      ['value'],
      ['desc']
    ),
    0,
    topN
  ).map(d => ({
    ...d,
    source: getChainData(d.source, chains)?.name || d.source,
    target: `${getChainData(d.target, chains)?.name || d.target} `,
  }));
}

/**
 * Gets the value for a specific key or total
 */
export function getSankeyChartValue(
  data: GroupDataItem[] | GroupDataItem | undefined,
  hoveredKey: string | null,
  field: string,
  totalValue?: number
): number | undefined {
  if (!data) {
    return undefined;
  }

  const dataArray = toArray(data) as GroupDataItem[];
  const item = hoveredKey ? dataArray.find(d => d.key === hoveredKey) : null;

  if (item) {
    return item[field as keyof GroupDataItem] as number;
  }

  return totalValue || _.sumBy(dataArray, field);
}
