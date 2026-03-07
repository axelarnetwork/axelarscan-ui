import { toArray } from '@/lib/parser';

import type { GMPFees, GMPMessage, MultihopBaseFeeProps } from '../GMP.types';
import { gasStyles } from './InfoGasMetrics.styles';
import { InfoSection } from './InfoSection.component';
import { BaseFeeEntry } from './BaseFeeEntry.component';

export function MultihopBaseFee({
  data,
  formatTokenSuffix,
  renderUsdValue,
  renderFiPlus,
}: MultihopBaseFeeProps) {
  const entries = toArray([data.originData, data, data.callbackData]).filter(
    (entry): entry is GMPMessage => typeof entry === 'object' && entry !== null
  );

  const hasBaseFee =
    entries.findIndex(entry => (entry.fees?.base_fee ?? 0) > 0) > -1;

  if (!hasBaseFee) {
    return null;
  }

  const entriesWithFees = entries.filter(
    (entry): entry is GMPMessage & { fees: GMPFees } => entry.fees !== undefined
  );

  return (
    <InfoSection label="Base Fee" valueClassName={gasStyles.borderedCard}>
      {entriesWithFees.map((entry, index) => (
        <BaseFeeEntry
          key={index}
          entryFees={entry.fees}
          index={index}
          formatTokenSuffix={formatTokenSuffix}
          renderUsdValue={renderUsdValue}
          renderFiPlus={renderFiPlus}
        />
      ))}
    </InfoSection>
  );
}
