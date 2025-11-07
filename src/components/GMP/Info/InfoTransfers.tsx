import { MdKeyboardArrowRight } from 'react-icons/md';

import { Image } from '@/components/Image';
import { AssetProfile, Profile } from '@/components/Profile';
import { Tooltip } from '@/components/Tooltip';
import { getChainData } from '@/lib/config';
import { infoStyles } from './Info.styles';
import { InfoSection } from './InfoSection';
import { InfoTransfersProps } from './Info.types';

export function InfoTransfers({ data, chains }: InfoTransfersProps) {
  if (!Array.isArray(data.interchain_transfers) || data.interchain_transfers.length === 0) {
    return null;
  }

  return (
    <InfoSection label="Settlement Filled">
      <div className={infoStyles.transferList}>
        {data.interchain_transfers.map((transfer, index) => {
          const destinationChainData = getChainData(transfer.destinationChain, chains);

          return (
            <div key={`${transfer.destinationChain}-${index}`} className={infoStyles.transferRow}>
              <AssetProfile
                value={transfer.contract_address || transfer.symbol}
                chain={transfer.destinationChain}
                amount={transfer.amount}
                customAssetData={transfer}
                ITSPossible={true}
                width={16}
                height={16}
                className={infoStyles.assetChip}
                titleClassName="text-xs"
              />
              <MdKeyboardArrowRight size={20} className={infoStyles.arrowIcon} />
              {destinationChainData && transfer.recipient && (
                <Tooltip content={destinationChainData.name} className={infoStyles.tooltip}>
                  <Image src={destinationChainData.image} alt="" width={20} height={20} />
                </Tooltip>
              )}
              <Profile
                address={transfer.recipient}
                chain={transfer.destinationChain}
                width={20}
                height={20}
              />
            </div>
          );
        })}
      </div>
    </InfoSection>
  );
}


