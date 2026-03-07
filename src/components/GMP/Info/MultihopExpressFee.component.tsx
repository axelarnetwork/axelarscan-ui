import { toArray } from '@/lib/parser';

import type {
  GMPFees,
  GMPMessage,
  MultihopExpressFeeProps,
} from '../GMP.types';
import { gasStyles } from './InfoGasMetrics.styles';
import { InfoSection } from './InfoSection.component';
import { ExpressFeeEntry } from './ExpressFeeEntry.component';

export function MultihopExpressFee({
  data,
  formatTokenSuffix,
  renderUsdValue,
  renderFiPlus,
}: MultihopExpressFeeProps) {
  const entries = toArray([data.originData, data, data.callbackData]).filter(
    (entry): entry is GMPMessage => typeof entry === 'object' && entry !== null
  );

  const hasExpressFee =
    entries.findIndex(
      entry =>
        entry.express_executed &&
        entry.fees?.express_supported &&
        (entry.fees.express_fee ?? 0) > 0
    ) > -1;

  if (!hasExpressFee) {
    return null;
  }

  const entriesWithExpressSupport = entries.filter(
    (entry): entry is GMPMessage & { fees: GMPFees } =>
      entry.fees?.express_supported === true
  );

  return (
    <InfoSection label="Express Fee" valueClassName={gasStyles.borderedCard}>
      {entriesWithExpressSupport.map((entry, index) => (
        <ExpressFeeEntry
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
