import { Number } from '@/components/Number';

import type { SingleBaseFeeProps } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { gasStyles } from './GasMetrics.styles';
import { Section } from './Section.component';

export function SingleBaseFee({
  combinedFees,
  sourceTokenSymbol,
  formatTokenSuffix,
  renderUsdValue,
}: SingleBaseFeeProps) {
  if ((combinedFees?.base_fee ?? 0) <= 0) {
    return null;
  }

  const approveFee =
    (combinedFees?.base_fee ?? 0) - (combinedFees?.source_confirm_fee ?? 0) > 0
      ? (combinedFees?.base_fee ?? 0) - (combinedFees?.source_confirm_fee ?? 0)
      : 0;

  return (
    <Section label="Base Fee">
      <div className={gasStyles.valueColumn}>
        <div className={gasStyles.valueRow}>
          <Number
            value={combinedFees?.base_fee ?? 0}
            format="0,0.000000"
            suffix={formatTokenSuffix(sourceTokenSymbol)}
            noTooltip
            className={infoStyles.inlineNumber}
          />
          {renderUsdValue(combinedFees?.base_fee_usd)}
        </div>
        {(combinedFees?.source_confirm_fee ?? 0) > 0 && (
          <>
            <div className={gasStyles.nestedRow}>
              <span className={gasStyles.inlineLabel}>- Confirm Fee:</span>
              <Number
                value={combinedFees?.source_confirm_fee ?? 0}
                format="0,0.000000"
                suffix={formatTokenSuffix(sourceTokenSymbol)}
                noTooltip
                className={gasStyles.nestedNumber}
              />
              {renderUsdValue(
                (combinedFees?.source_confirm_fee ?? 0) *
                  (combinedFees?.source_token?.token_price?.usd ?? 0),
                gasStyles.nestedNumberMuted
              )}
            </div>
            <div className={gasStyles.nestedRow}>
              <span className={gasStyles.inlineLabel}>- Approve Fee:</span>
              <Number
                value={approveFee}
                format="0,0.000000"
                suffix={formatTokenSuffix(sourceTokenSymbol)}
                noTooltip
                className={gasStyles.nestedNumber}
              />
              {renderUsdValue(
                approveFee *
                  (combinedFees?.source_token?.token_price?.usd ?? 0),
                gasStyles.nestedNumberMuted
              )}
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
