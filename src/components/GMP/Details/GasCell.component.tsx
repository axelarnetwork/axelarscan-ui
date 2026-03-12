import { Number as NumberDisplay } from '@/components/Number';
import { isNumber } from '@/lib/number';

import type { GasCellProps } from '../GMP.types';
import { detailsStyles } from './Details.styles';

export function GasCell({ gasAmount, fees, data }: GasCellProps) {
  const gasElement =
    isNumber(gasAmount) && gasAmount >= 0 && fees?.source_token?.symbol ? (
      <NumberDisplay
        value={gasAmount}
        format="0,0.000000"
        suffix={` ${fees.source_token.symbol}`}
        noTooltip
        className={detailsStyles.textEmphasis}
      />
    ) : null;

  const gasConvertedElement =
    data.originData?.fees?.source_token?.token_price?.usd &&
    data.originData.fees.source_token.token_price.usd > 0 &&
    gasElement &&
    gasAmount !== undefined &&
    fees?.source_token?.token_price?.usd !== undefined ? (
      <NumberDisplay
        value={
          (gasAmount * fees.source_token.token_price.usd) /
          data.originData.fees.source_token.token_price.usd
        }
        format="0,0.000000"
        suffix={` ${data.originData.fees.source_token.symbol ?? ''}`}
        noTooltip
        className={detailsStyles.textSubtle}
      />
    ) : null;

  return (
    <td className={detailsStyles.tableCellNarrow}>
      <div className={detailsStyles.columnStack}>
        {gasElement}
        {gasConvertedElement}
      </div>
    </td>
  );
}
