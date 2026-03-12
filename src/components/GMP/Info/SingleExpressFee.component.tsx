import { Number } from '@/components/Number';

import type { SingleExpressFeeProps } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { gasStyles } from './GasMetrics.styles';
import { Section } from './Section.component';
import { ExpressFeeBreakdown } from './ExpressFeeBreakdown.component';

export function SingleExpressFee({
  data,
  combinedFees,
  sourceTokenSymbol,
  formatTokenSuffix,
  renderUsdValue,
}: SingleExpressFeeProps) {
  const hasExpressExecuted = Boolean(
    data.originData?.express_executed || data.express_executed
  );

  if (
    !combinedFees?.express_supported ||
    !hasExpressExecuted ||
    (combinedFees.express_fee ?? 0) <= 0
  ) {
    return null;
  }

  return (
    <Section label="Express Fee">
      <div className={gasStyles.valueColumn}>
        <div className={gasStyles.valueRow}>
          <Number
            value={combinedFees.express_fee}
            format="0,0.000000"
            suffix={formatTokenSuffix(sourceTokenSymbol)}
            noTooltip
            className={infoStyles.inlineNumber}
          />
          {renderUsdValue(combinedFees.express_fee_usd)}
        </div>
        {combinedFees.source_express_fee && (
          <ExpressFeeBreakdown
            sourceExpressFee={combinedFees.source_express_fee}
            tokenSymbol={sourceTokenSymbol}
            formatTokenSuffix={formatTokenSuffix}
            renderUsdValue={renderUsdValue}
          />
        )}
      </div>
    </Section>
  );
}
