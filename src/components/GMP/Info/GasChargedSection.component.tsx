import { PiInfo } from 'react-icons/pi';

import { Number } from '@/components/Number';
import { Tooltip } from '@/components/Tooltip';

import type { GasChargedSectionProps } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { gasStyles } from './GasMetrics.styles';
import { Section } from './Section.component';

export function GasChargedSection({
  gasChargedAmount,
  sourceToken,
  formatTokenSuffix,
  renderUsdValue,
}: GasChargedSectionProps) {
  const gasChargedLabel = (
    <>
      <span className={gasStyles.labelText}>Gas Charged</span>
      <Tooltip
        content="The total gas charged to users. This amount may be less than the gas used (Gas Used) due to Axelar's gas subsidy policy."
        className={gasStyles.inlineTooltip}
      >
        <PiInfo className={gasStyles.infoIcon} />
      </Tooltip>
    </>
  );

  return (
    <Section label={gasChargedLabel} labelClassName={gasStyles.labelRow}>
      <div className={gasStyles.valueRow}>
        <Number
          value={gasChargedAmount}
          format="0,0.000000"
          suffix={formatTokenSuffix(sourceToken?.symbol)}
          noTooltip
          className={infoStyles.inlineNumber}
        />
        {renderUsdValue(
          gasChargedAmount * (sourceToken?.token_price?.usd ?? 0)
        )}
      </div>
    </Section>
  );
}
