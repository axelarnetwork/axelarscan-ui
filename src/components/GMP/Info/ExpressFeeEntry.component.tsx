import { Number } from '@/components/Number';

import type { ExpressFeeEntryProps } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { gasStyles } from './InfoGasMetrics.styles';
import { ExpressFeeBreakdown } from './ExpressFeeBreakdown.component';

export function ExpressFeeEntry({
  entryFees,
  index,
  formatTokenSuffix,
  renderUsdValue,
  renderFiPlus,
}: ExpressFeeEntryProps) {
  return (
    <div className={gasStyles.valueRow}>
      {renderFiPlus(index)}
      <div className={gasStyles.valueColumn}>
        <div className={gasStyles.valueRow}>
          <Number
            value={entryFees.express_fee}
            format="0,0.000000"
            suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
            noTooltip
            className={infoStyles.inlineNumber}
          />
          {renderUsdValue(entryFees.express_fee_usd)}
        </div>
        {entryFees.source_express_fee && (
          <ExpressFeeBreakdown
            sourceExpressFee={entryFees.source_express_fee}
            tokenSymbol={entryFees.source_token?.symbol}
            formatTokenSuffix={formatTokenSuffix}
            renderUsdValue={renderUsdValue}
          />
        )}
      </div>
    </div>
  );
}
