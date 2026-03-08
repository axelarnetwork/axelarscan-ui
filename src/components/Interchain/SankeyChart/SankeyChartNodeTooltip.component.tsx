import type { SankeyChartNodeTooltipProps } from './SankeyChart.types';
import { sankeyChartNodeTooltipStyles } from './SankeyChartNodeTooltip.styles';

export function SankeyChartNodeTooltip({
  id,
  formattedValue,
  nodeColor,
}: SankeyChartNodeTooltipProps) {
  return (
    <div className={sankeyChartNodeTooltipStyles.container}>
      <div className={sankeyChartNodeTooltipStyles.header}>
        {nodeColor && (
          <div
            className={sankeyChartNodeTooltipStyles.colorSquare}
            style={{ backgroundColor: nodeColor }}
          />
        )}
        <span className={sankeyChartNodeTooltipStyles.label}>{id}</span>
      </div>
      <span>Total: {formattedValue}</span>
    </div>
  );
}
