import { Number } from '@/components/Number';

import type { GasPaidSectionProps } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { gasStyles } from './GasMetrics.styles';
import { Section } from './Section.component';

export function GasPaidSection({
  data,
  gas,
  gasPaid,
  gasPaidToCallback,
  combinedFees,
  sourceToken,
  formatTokenSuffix,
  renderUsdValue,
}: GasPaidSectionProps) {
  if (!((gasPaid && (gas?.gas_paid_amount ?? 0) > 0) || gasPaidToCallback)) {
    return null;
  }

  const gasPaidValue = data.originData
    ? (data.originData.gas?.gas_paid_amount ?? 0)
    : gasPaid
      ? (gas?.gas_paid_amount ?? 0)
      : (gasPaidToCallback ?? 0) * (combinedFees?.source_token?.gas_price ?? 0);

  return (
    <Section label="Gas Paid">
      <div className={gasStyles.valueRow}>
        <Number
          value={gasPaidValue}
          format="0,0.000000"
          suffix={formatTokenSuffix(sourceToken?.symbol)}
          noTooltip
          className={infoStyles.inlineNumber}
        />
        {renderUsdValue(gasPaidValue * (sourceToken?.token_price?.usd ?? 0))}
      </div>
    </Section>
  );
}
