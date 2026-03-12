import { PiInfo } from 'react-icons/pi';

import { Number } from '@/components/Number';
import { Tooltip } from '@/components/Tooltip';
import { isNumber } from '@/lib/number';

import type { GasUsedSectionProps } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { gasStyles } from './GasMetrics.styles';
import { Section } from './Section.component';

export function GasUsedSection({
  data,
  gasData,
  sourceToken,
  formatTokenSuffix,
  renderUsdValue,
}: GasUsedSectionProps) {
  const shouldShow =
    (!data.originData || data.originData.executed) &&
    data.executed &&
    isNumber(gasData?.gas_used_amount);

  if (!shouldShow) {
    return null;
  }

  const gasUsedLabel = (
    <>
      <span className={gasStyles.labelText}>Gas Used</span>
      <Tooltip
        content="The total gas used to accommodate the cross-chain transaction."
        className={gasStyles.inlineTooltipWide}
      >
        <PiInfo className={gasStyles.infoIcon} />
      </Tooltip>
    </>
  );

  return (
    <Section label={gasUsedLabel} labelClassName={gasStyles.labelRow}>
      <div className={gasStyles.valueRow}>
        <Number
          value={gasData!.gas_used_amount}
          format="0,0.000000"
          suffix={formatTokenSuffix(sourceToken?.symbol)}
          noTooltip
          className={infoStyles.inlineNumber}
        />
        {renderUsdValue(
          (gasData!.gas_used_amount ?? 0) * (sourceToken?.token_price?.usd ?? 0)
        )}
      </div>
    </Section>
  );
}
