import { Number } from '@/components/Number';

import type { BaseFeeEntryProps } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { gasStyles } from './InfoGasMetrics.styles';

export function BaseFeeEntry({
  entryFees,
  index,
  formatTokenSuffix,
  renderUsdValue,
  renderFiPlus,
}: BaseFeeEntryProps) {
  const approveFee =
    (entryFees.base_fee ?? 0) - (entryFees.source_confirm_fee ?? 0) > 0
      ? (entryFees.base_fee ?? 0) - (entryFees.source_confirm_fee ?? 0)
      : 0;

  return (
    <div className={gasStyles.valueRow}>
      {renderFiPlus(index)}
      <div className={gasStyles.valueColumn}>
        <div className={gasStyles.valueRow}>
          <Number
            value={entryFees.base_fee}
            format="0,0.000000"
            suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
            noTooltip
            className={infoStyles.inlineNumber}
          />
          {renderUsdValue(entryFees.base_fee_usd)}
        </div>
        {(entryFees.source_confirm_fee ?? 0) > 0 && (
          <>
            <div className={gasStyles.nestedRow}>
              <span className={gasStyles.inlineLabel}>- Confirm Fee:</span>
              <Number
                value={entryFees.source_confirm_fee}
                format="0,0.000000"
                suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
                noTooltip
                className={gasStyles.nestedNumber}
              />
              {renderUsdValue(
                (entryFees.source_confirm_fee ?? 0) *
                  (entryFees.source_token?.token_price?.usd ?? 0),
                gasStyles.nestedNumberMuted
              )}
            </div>
            <div className={gasStyles.nestedRow}>
              <span className={gasStyles.inlineLabel}>- Approve Fee:</span>
              <Number
                value={approveFee}
                format="0,0.000000"
                suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
                noTooltip
                className={gasStyles.nestedNumber}
              />
              {renderUsdValue(
                approveFee * (entryFees.source_token?.token_price?.usd ?? 0),
                gasStyles.nestedNumberMuted
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
