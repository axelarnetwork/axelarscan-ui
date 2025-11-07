import { MdKeyboardArrowRight } from 'react-icons/md';

import { ExplorerLink } from '@/components/ExplorerLink';
import { infoStyles } from './Info.styles';
import { InfoSettlementProps } from './Info.types';
import { ellipse } from '@/lib/string';
import { toArray } from '@/lib/parser';

import { InfoSection } from './InfoSection';

export function InfoSettlement({
  data,
  settlementForwardedEvents,
  settlementFilledEvents,
  txhash,
  sourceChain,
  destinationChain,
  executed,
}: InfoSettlementProps) {
  if (
    (!settlementForwardedEvents || !executed) &&
    (!settlementFilledEvents || !data.settlementForwardedData)
  ) {
    return null;
  }

  return (
    <InfoSection label="Settlement Status" valueClassName={infoStyles.settlementValueSpacing}>
      <div className={infoStyles.settlementGrid}>
        <div className={infoStyles.settlementColumn}>
          <div className={infoStyles.settlementColumnContent}>
            <span className={infoStyles.settlementColumnTitle}>Settlement Forwarded</span>
            <div className={infoStyles.settlementLinks}>
              {settlementForwardedEvents ? (
                <ExplorerLink
                  value={txhash}
                  chain={sourceChain}
                  title={ellipse(txhash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              ) : (
                toArray(data.settlementForwardedData).map((entry, index) => (
                  <ExplorerLink
                    key={index}
                    value={entry?.call?.transactionHash}
                    chain="axelarnet"
                    customURL={entry?.message_id ? `/gmp/${entry.message_id}` : undefined}
                    title={ellipse(entry?.call?.transactionHash ?? '', 6, '0x')}
                    iconOnly={false}
                  />
                ))
              )}
            </div>
          </div>
          <MdKeyboardArrowRight size={14} />
        </div>

        <div className={infoStyles.settlementColumn}>
          <div className={infoStyles.settlementColumnContent}>
            <span className={infoStyles.settlementColumnTitle}>Settlement Processed</span>
            <div className={infoStyles.settlementLinks}>
              {settlementForwardedEvents ? (
                <ExplorerLink
                  value={executed?.transactionHash}
                  chain={destinationChain}
                  title={ellipse(executed?.transactionHash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              ) : (
                toArray(data.settlementForwardedData)
                  .filter(entry => entry?.executed)
                  .map((entry, index) => (
                    <ExplorerLink
                      key={index}
                      value={entry?.executed?.transactionHash}
                      chain={entry?.executed?.chain}
                      title={ellipse(entry?.executed?.transactionHash ?? '', 6, '0x')}
                      iconOnly={false}
                    />
                  ))
              )}
            </div>
          </div>
          <MdKeyboardArrowRight size={14} />
        </div>

        <div className={infoStyles.settlementColumn}>
          <div className={infoStyles.settlementColumnContent}>
            <span className={infoStyles.settlementColumnTitle}>Settlement Filled</span>
            <div className={infoStyles.settlementLinks}>
              {settlementFilledEvents ? (
                <ExplorerLink
                  value={txhash}
                  chain={sourceChain}
                  title={ellipse(txhash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              ) : (
                toArray(data.settlementFilledData).map((entry, index) => (
                  <ExplorerLink
                    key={index}
                    value={entry?.call?.transactionHash}
                    chain="axelarnet"
                    customURL={entry?.message_id ? `/gmp/${entry.message_id}` : undefined}
                    title={ellipse(entry?.call?.transactionHash ?? '', 6, '0x')}
                    iconOnly={false}
                  />
                ))
              )}
            </div>
          </div>
          <MdKeyboardArrowRight size={14} />
        </div>

        <div className={infoStyles.settlementColumn}>
          <div className={infoStyles.settlementColumnContent}>
            <span className={infoStyles.settlementColumnTitle}>Tokens Released</span>
            <div className={infoStyles.settlementLinks}>
              {settlementFilledEvents ? (
                <ExplorerLink
                  value={executed?.transactionHash}
                  chain={destinationChain}
                  title={ellipse(executed?.transactionHash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              ) : (
                toArray(data.settlementFilledData).map((entry, index) => (
                  <ExplorerLink
                    key={index}
                    value={entry?.executed?.transactionHash}
                    chain={entry?.executed?.chain}
                    title={ellipse(entry?.executed?.transactionHash ?? '', 6, '0x')}
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


