'use client';

import { ResponsiveSankey } from '@nivo/sankey';
import _ from 'lodash';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import { useGlobalStore } from '@/components/Global';
import { Number } from '@/components/Number';
import { Spinner } from '@/components/Spinner';
import { getChainData } from '@/lib/config';
import { isNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { GroupDataItem } from '../Interchain.types';
import { useSankeyChartHover } from './SankeyChart.hooks';
import { sankeyChartColors, sankeyChartStyles } from './SankeyChart.styles';
import { SankeyChartProps } from './SankeyChart.types';
import {
  getSankeyChartValue,
  ProcessedChartDataItem,
  processSankeyChartData,
} from './SankeyChart.utils';
import { SankeyChartNodeTooltip } from './SankeyChartNodeTooltip';

export function SankeyChart({
  i,
  data,
  topN = 25,
  totalValue,
  field = 'num_txs',
  title = '',
  description = '',
  valueFormat = '0,0',
  valuePrefix = '',
  noBorder = false,
  className = '',
}: SankeyChartProps) {
  const { resolvedTheme } = useTheme();
  const { chains } = useGlobalStore();
  const { hoveredKey, handleLinkHover, handleMouseLeave } =
    useSankeyChartHover();

  const dataArray = toArray(data) as GroupDataItem[];
  const hoveredItem = hoveredKey
    ? dataArray.find(d => d.key === hoveredKey)
    : null;
  const value = getSankeyChartValue(data, hoveredKey, field, totalValue);
  const keyString = hoveredItem ? hoveredItem.key : undefined;
  const chartData = processSankeyChartData(data, field, topN, chains);

  const linkTooltipRenderer = useCallback(
    (d: {
      link: {
        source: { id: string; nodeColor?: string };
        target: { id: string; nodeColor?: string };
        formattedValue: string;
      };
    }) => {
      // Track hover state
      const linkData = d.link as unknown as ProcessedChartDataItem;
      handleLinkHover(linkData);

      // Get chain colors from the node data (already set when creating nodes)
      const sourceColor = d.link.source.nodeColor;
      const targetColor = d.link.target.nodeColor;

      // Return tooltip matching nodeTooltip style with colored squares
      return (
        <div className={sankeyChartStyles.linkTooltip.container}>
          <div className={sankeyChartStyles.linkTooltip.header}>
            {sourceColor && (
              <div
                className={sankeyChartStyles.linkTooltip.colorSquare}
                style={{ backgroundColor: sourceColor }}
              />
            )}
            <span className={sankeyChartStyles.linkTooltip.label}>
              {d.link.source.id}
            </span>
            <span>→</span>
            {targetColor && (
              <div
                className={sankeyChartStyles.linkTooltip.colorSquare}
                style={{ backgroundColor: targetColor }}
              />
            )}
            <span className={sankeyChartStyles.linkTooltip.label}>
              {d.link.target.id}
            </span>
          </div>
          <span className={sankeyChartStyles.linkTooltip.value}>
            {d.link.formattedValue}
          </span>
        </div>
      );
    },
    [handleLinkHover]
  );

  return (
    <div className={sankeyChartStyles.container(i, noBorder)}>
      <div className={sankeyChartStyles.header.container}>
        <div className={sankeyChartStyles.header.titleContainer}>
          <span className={sankeyChartStyles.header.title}>{title}</span>
          {description && (
            <span className={sankeyChartStyles.header.description}>
              {description}
            </span>
          )}
        </div>
        {isNumber(value) && (
          <div className={sankeyChartStyles.header.valueContainer}>
            <Number
              value={value}
              format={valueFormat}
              prefix={valuePrefix}
              noTooltip={true}
              className={sankeyChartStyles.header.valueNumber}
            />
            <span className={sankeyChartStyles.header.valueKey}>
              {keyString}
            </span>
          </div>
        )}
      </div>
      <div className={sankeyChartStyles.chart.container}>
        {!data ? (
          <div className={sankeyChartStyles.chart.loading}>
            <Spinner />
          </div>
        ) : (
          <div
            className={sankeyChartStyles.chart.wrapper(className)}
            onMouseLeave={handleMouseLeave}
          >
            {chartData.length > 0 && (
              <ResponsiveSankey
                data={{
                  nodes: _.uniq(
                    chartData.flatMap(d => [d.source, d.target])
                  ).map(d => ({
                    id: d,
                    nodeColor: getChainData(d.trim(), chains)?.color,
                  })),
                  links: chartData,
                }}
                valueFormat={`>-${valuePrefix},`}
                margin={{ top: 10, bottom: 10 }}
                theme={{
                  tooltip: {
                    container: {
                      background:
                        resolvedTheme === 'dark'
                          ? sankeyChartColors.tooltip.background.dark
                          : sankeyChartColors.tooltip.background.light,
                      color:
                        resolvedTheme === 'dark'
                          ? sankeyChartColors.tooltip.text.dark
                          : sankeyChartColors.tooltip.text.light,
                      fontSize: 12,
                      fontWeight: 400,
                    },
                  },
                }}
                colors={d => d.nodeColor}
                nodeOpacity={1}
                nodeHoverOpacity={1}
                nodeHoverOthersOpacity={0.35}
                nodeBorderWidth={0}
                nodeBorderRadius={3}
                linkOpacity={resolvedTheme === 'dark' ? 0.2 : 0.4}
                linkHoverOpacity={resolvedTheme === 'dark' ? 0.7 : 0.9}
                linkHoverOthersOpacity={resolvedTheme === 'dark' ? 0.1 : 0.2}
                linkBlendMode={resolvedTheme === 'dark' ? 'lighten' : 'darken'}
                enableLinkGradient={true}
                labelTextColor={
                  resolvedTheme === 'dark'
                    ? sankeyChartColors.label.dark
                    : sankeyChartColors.label.light
                }
                nodeTooltip={d => {
                  const { id, formattedValue, nodeColor } = { ...d.node };
                  return (
                    <SankeyChartNodeTooltip
                      id={id}
                      formattedValue={formattedValue}
                      nodeColor={nodeColor}
                    />
                  );
                }}
                linkTooltip={linkTooltipRenderer}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
