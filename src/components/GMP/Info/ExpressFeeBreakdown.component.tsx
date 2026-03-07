import { Number } from '@/components/Number';
import { isNumber } from '@/lib/number';

import type { ExpressFeeBreakdownProps } from '../GMP.types';
import { gasStyles } from './InfoGasMetrics.styles';

export function ExpressFeeBreakdown({
  sourceExpressFee,
  tokenSymbol,
  formatTokenSuffix,
  renderUsdValue,
}: ExpressFeeBreakdownProps) {
  return (
    <>
      {isNumber(sourceExpressFee.relayer_fee) && (
        <div className={gasStyles.nestedRow}>
          <span className={gasStyles.inlineLabel}>- Relayer Fee:</span>
          <Number
            value={sourceExpressFee.relayer_fee}
            format="0,0.000000"
            suffix={formatTokenSuffix(tokenSymbol)}
            noTooltip
            className={gasStyles.nestedNumber}
          />
          {renderUsdValue(
            sourceExpressFee.relayer_fee_usd,
            gasStyles.nestedNumberMuted
          )}
        </div>
      )}
      {isNumber(sourceExpressFee.express_gas_overhead_fee) && (
        <div className={gasStyles.nestedRow}>
          <span className={gasStyles.inlineLabel}>- Overhead Fee:</span>
          <Number
            value={sourceExpressFee.express_gas_overhead_fee}
            format="0,0.000000"
            suffix={formatTokenSuffix(tokenSymbol)}
            noTooltip
            className={gasStyles.nestedNumber}
          />
          {renderUsdValue(
            sourceExpressFee.express_gas_overhead_fee_usd,
            gasStyles.nestedNumberMuted
          )}
        </div>
      )}
    </>
  );
}
