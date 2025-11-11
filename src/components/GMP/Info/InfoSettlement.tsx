import { MdKeyboardArrowRight } from 'react-icons/md';

import { ExplorerLink } from '@/components/ExplorerLink';
import { InfoSettlementProps } from './InfoSettlement.types';
import { infoSettlementStyles } from './InfoSettlement.styles';
import { ellipse } from '@/lib/string';
import { toArray } from '@/lib/parser';

import { InfoSection } from './InfoSection';
import { GMPSettlementData } from '../GMP.types';

export function InfoSettlement({
  data,
  settlementForwardedEvents,
  settlementFilledEvents,
  txhash,
  sourceChain,
  destinationChain,
  executed,
}: InfoSettlementProps) {
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

  return (
    <InfoSection
      label="Settlement Status"
      valueClassName={infoSettlementStyles.valueSpacing}
    >
    <div className={infoSettlementStyles.grid}>
      <div className={infoSettlementStyles.column}>
        <div className={infoSettlementStyles.columnContent}>
          <span className={infoSettlementStyles.columnTitle}>
              Settlement Forwarded
            </span>
          <div className={infoSettlementStyles.links}>
              {settlementForwardedEvents ? (
                <ExplorerLink
                  value={txhash}
                  chain={sourceChain}
                  title={ellipse(txhash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              ) : (
                settlementForwardedData.map((entry, index) => (
                  <ExplorerLink
                    key={index}
                    value={entry?.call?.transactionHash}
                    chain="axelarnet"
                    customURL={
                      entry?.message_id ? `/gmp/${entry.message_id}` : undefined
                    }
                    title={ellipse(entry?.call?.transactionHash ?? '', 6, '0x')}
                    iconOnly={false}
                  />
                ))
              )}
            </div>
          </div>
          <MdKeyboardArrowRight size={14} />
        </div>

        <div className={infoSettlementStyles.column}>
          <div className={infoSettlementStyles.columnContent}>
            <span className={infoSettlementStyles.columnTitle}>
              Settlement Processed
            </span>
            <div className={infoSettlementStyles.links}>
              {settlementForwardedEvents ? (
                <ExplorerLink
                  value={executed?.transactionHash}
                  chain={destinationChain}
                  title={ellipse(executed?.transactionHash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              ) : (
                settlementForwardedData
                  .filter(entry => entry?.executed)
                  .map((entry, index) => (
                    <ExplorerLink
                      key={index}
                      value={entry?.executed?.transactionHash}
                      chain={entry?.executed?.chain}
                      title={ellipse(
                        entry?.executed?.transactionHash ?? '',
                        6,
                        '0x'
                      )}
                      iconOnly={false}
                    />
                  ))
              )}
            </div>
          </div>
          <MdKeyboardArrowRight size={14} />
        </div>

        <div className={infoSettlementStyles.column}>
          <div className={infoSettlementStyles.columnContent}>
            <span className={infoSettlementStyles.columnTitle}>
              Settlement Filled
            </span>
            <div className={infoSettlementStyles.links}>
              {settlementFilledEvents ? (
                <ExplorerLink
                  value={txhash}
                  chain={sourceChain}
                  title={ellipse(txhash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              ) : (
                settlementFilledData.map((entry, index) => (
                  <ExplorerLink
                    key={index}
                    value={entry?.call?.transactionHash}
                    chain="axelarnet"
                    customURL={
                      entry?.message_id ? `/gmp/${entry.message_id}` : undefined
                    }
                    title={ellipse(entry?.call?.transactionHash ?? '', 6, '0x')}
                    iconOnly={false}
                  />
                ))
              )}
            </div>
          </div>
          <MdKeyboardArrowRight size={14} />
        </div>

        <div className={infoSettlementStyles.column}>
          <div className={infoSettlementStyles.columnContent}>
            <span className={infoSettlementStyles.columnTitle}>
              Tokens Released
            </span>
            <div className={infoSettlementStyles.links}>
              {settlementFilledEvents ? (
                <ExplorerLink
                  value={executed?.transactionHash}
                  chain={destinationChain}
                  title={ellipse(executed?.transactionHash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              ) : (
                settlementFilledData.map((entry, index) => (
                  <ExplorerLink
                    key={index}
                    value={entry?.executed?.transactionHash}
                    chain={entry?.executed?.chain}
                    title={ellipse(
                      entry?.executed?.transactionHash ?? '',
                      6,
                      '0x'
                    )}
                    iconOnly={false}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </InfoSection>
  );
}
