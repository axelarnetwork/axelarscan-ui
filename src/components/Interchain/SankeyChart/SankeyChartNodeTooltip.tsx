import { sankeyChartNodeTooltipStyles } from './SankeyChartNodeTooltip.styles';

interface SankeyChartNodeTooltipProps {
  id: string;
  formattedValue: string;
  nodeColor?: string;
}

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
      <span>
        Total: {formattedValue}
      </span>
    </div>
  );
}
