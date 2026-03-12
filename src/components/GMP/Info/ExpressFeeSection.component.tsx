import type { ExpressFeeSectionProps } from '../GMP.types';
import { MultihopExpressFee } from './MultihopExpressFee.component';
import { SingleExpressFee } from './SingleExpressFee.component';

export function ExpressFeeSection({
  data,
  isMultihop,
  combinedFees,
  sourceTokenSymbol,
  formatTokenSuffix,
  renderUsdValue,
  renderFiPlus,
}: ExpressFeeSectionProps) {
  if (isMultihop) {
    return (
      <MultihopExpressFee
        data={data}
        formatTokenSuffix={formatTokenSuffix}
        renderUsdValue={renderUsdValue}
        renderFiPlus={renderFiPlus}
      />
    );
  }

  return (
    <SingleExpressFee
      data={data}
      combinedFees={combinedFees}
      sourceTokenSymbol={sourceTokenSymbol}
      formatTokenSuffix={formatTokenSuffix}
      renderUsdValue={renderUsdValue}
    />
  );
}
