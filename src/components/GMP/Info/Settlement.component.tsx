import { SettlementProps } from './Settlement.types';
import { settlementStyles } from './Settlement.styles';
import { toArray } from '@/lib/parser';

import { Section } from './Section.component';
import { SettlementColumn } from './SettlementColumn.component';
import { GMPSettlementData } from '../GMP.types';

export function Settlement({
  data,
  settlementForwardedEvents,
  settlementFilledEvents,
  txhash,
  sourceChain,
  destinationChain,
  executed,
}: SettlementProps) {
  const settlementForwardedData = toArray(data.settlementForwardedData).filter(
    (entry): entry is GMPSettlementData =>
      typeof entry === 'object' && entry !== null
  );

  const settlementFilledData = toArray(data.settlementFilledData).filter(
    (entry): entry is GMPSettlementData =>
      typeof entry === 'object' && entry !== null
  );

  if (
    (!settlementForwardedEvents || !executed) &&
    (!settlementFilledEvents || settlementForwardedData.length === 0)
  ) {
    return null;
  }

  const forwardedPrimary = settlementForwardedEvents
    ? { value: txhash, chain: sourceChain }
    : undefined;

  const processedPrimary = settlementForwardedEvents
    ? { value: executed?.transactionHash, chain: destinationChain }
    : undefined;

  const processedFallback = settlementForwardedData.filter(
    entry => entry?.executed
  );

  const filledPrimary = settlementFilledEvents
    ? { value: txhash, chain: sourceChain }
    : undefined;

  const releasedPrimary = settlementFilledEvents
    ? { value: executed?.transactionHash, chain: destinationChain }
    : undefined;

  return (
    <Section
      label="Settlement Status"
      valueClassName={settlementStyles.valueSpacing}
    >
      <div className={settlementStyles.grid}>
        <SettlementColumn
          title="Settlement Forwarded"
          primaryLink={forwardedPrimary}
          fallbackEntries={settlementForwardedData}
        />
        <SettlementColumn
          title="Settlement Processed"
          primaryLink={processedPrimary}
          fallbackEntries={processedFallback}
          useExecuted={true}
        />
        <SettlementColumn
          title="Settlement Filled"
          primaryLink={filledPrimary}
          fallbackEntries={settlementFilledData}
        />
        <SettlementColumn
          title="Tokens Released"
          primaryLink={releasedPrimary}
          fallbackEntries={settlementFilledData}
          useExecuted={true}
          showArrow={false}
        />
      </div>
    </Section>
  );
}
