import { MdKeyboardArrowRight } from 'react-icons/md';

import { ExplorerLink } from '@/components/ExplorerLink';
import { ellipse } from '@/lib/string';

import { infoSettlementStyles } from './InfoSettlement.styles';
import type { SettlementColumnProps } from './InfoSettlement.types';

export function SettlementColumn({
  title,
  primaryLink,
  fallbackEntries,
  useExecuted = false,
  showArrow = true,
}: SettlementColumnProps) {
  return (
    <div className={infoSettlementStyles.column}>
      <div className={infoSettlementStyles.columnContent}>
        <span className={infoSettlementStyles.columnTitle}>{title}</span>
        <div className={infoSettlementStyles.links}>
          {primaryLink ? (
            <ExplorerLink
              value={primaryLink.value}
              chain={primaryLink.chain}
              title={ellipse(primaryLink.value ?? '', 6, '0x')}
              iconOnly={false}
            />
          ) : (
            fallbackEntries.map((entry, index) => {
              const txHash = useExecuted
                ? entry?.executed?.transactionHash
                : entry?.call?.transactionHash;
              const chain = useExecuted ? entry?.executed?.chain : 'axelarnet';
              const customURL =
                !useExecuted && entry?.message_id
                  ? `/gmp/${entry.message_id}`
                  : undefined;

              return (
                <ExplorerLink
                  key={index}
                  value={txHash}
                  chain={chain}
                  customURL={customURL}
                  title={ellipse(txHash ?? '', 6, '0x')}
                  iconOnly={false}
                />
              );
            })
          )}
        </div>
      </div>
      {showArrow && <MdKeyboardArrowRight size={14} />}
    </div>
  );
}
