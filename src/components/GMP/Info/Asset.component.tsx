import { AssetProfile, Profile } from '@/components/Profile';
import { Tooltip } from '@/components/Tooltip';
import { Section } from './Section.component';
import { infoStyles } from './Info.styles';
import type { InfoAssetProps } from './Info.types';

export function Asset({
  symbol,
  sourceChain,
  amount,
  event,
  contractAddress,
}: InfoAssetProps) {
  return (
    <Section label="Asset">
      <div className={infoStyles.tokenRow}>
        <AssetProfile
          value={symbol}
          chain={sourceChain}
          amount={amount}
          ITSPossible={true}
          onlyITS={!event?.includes('ContractCall')}
          width={16}
          height={16}
          className={infoStyles.assetChip}
          titleClassName="text-xs"
        />
        {!!contractAddress && (
          <Tooltip content="Token Address" className={infoStyles.tooltip}>
            <Profile
              address={contractAddress}
              chain={sourceChain}
              noResolveName={true}
            />
          </Tooltip>
        )}
      </div>
    </Section>
  );
}
