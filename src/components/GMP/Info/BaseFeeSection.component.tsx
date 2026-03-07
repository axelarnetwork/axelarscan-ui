import type { BaseFeeSectionProps } from '../GMP.types';
import { MultihopBaseFee } from './MultihopBaseFee.component';
import { SingleBaseFee } from './SingleBaseFee.component';

export function BaseFeeSection({
  data,
  isMultihop,
  combinedFees,
  sourceTokenSymbol,
  formatTokenSuffix,
  renderUsdValue,
  renderFiPlus,
}: BaseFeeSectionProps) {
  if (isMultihop) {
    return (
      <MultihopBaseFee
        data={data}
        formatTokenSuffix={formatTokenSuffix}
        renderUsdValue={renderUsdValue}
        renderFiPlus={renderFiPlus}
      />
    );
  }

  return (
    <SingleBaseFee
      combinedFees={combinedFees}
      sourceTokenSymbol={sourceTokenSymbol}
      formatTokenSuffix={formatTokenSuffix}
      renderUsdValue={renderUsdValue}
    />
  );
}
