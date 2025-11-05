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
    <div className="flex flex-col space-y-0.5 rounded-sm bg-zinc-100 px-2 py-1.5 text-xs shadow-sm dark:bg-black">
      <div className="flex items-center space-x-2">
        {nodeColor && (
          <div className="h-3 w-3" style={{ backgroundColor: nodeColor }} />
        )}
        <span className="font-bold">{id}</span>
      </div>
      <span>Total: {formattedValue}</span>
    </div>
  );
}
