import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { AssetProfile, Profile } from '@/components/Profile';
import { getChainData } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { topItemStyles } from './TopItem.styles';

interface TopItemProps {
  data: Record<string, unknown>;
  type: string;
  field: string;
  format: string;
  prefix: string;
  transfersType?: string;
  chains: unknown;
}

export function TopItem({
  data,
  type,
  field,
  format: _format,
  prefix,
  transfersType,
  chains,
}: TopItemProps) {
  const keys = split(data.key as string, { delimiter: '_' });

  if (keys.length === 0) {
    return null;
  }

  return (
    <div className={topItemStyles.container}>
      <div className={topItemStyles.keys.container(type)}>
        {keys.map((keyPart, keyIndex) => {
          if (type === 'asset') {
            return (
              <AssetProfile
                key={keyIndex}
                value={keyPart}
                chain={undefined}
                amount={undefined}
                addressOrDenom={keyPart}
                customAssetData={undefined}
                ITSPossible={true}
                onlyITS={true}
                isLink={true}
                width={20}
                height={20}
                className="h-5 text-xs font-medium"
                titleClassName={undefined}
              />
            );
          }
          if (type === 'contract' || type === 'address') {
            return (
              <Profile
                key={keyIndex}
                i={keyIndex}
                address={keyPart}
                chain={toArray(data.chain)[0] as string}
                width={20}
                height={20}
                noCopy={true}
                customURL={
                  type === 'address'
                    ? `/address/${keyPart}${transfersType ? `?transfersType=${transfersType}` : ''}`
                    : ''
                }
                useContractLink={type === 'contract'}
                className="text-xs font-medium"
              />
            );
          }
          // case 'chain' or default
          const { name, image } = {
            ...getChainData(keyPart, chains),
          };

          const element = (
            <div key={keyIndex} className={topItemStyles.keys.chain.container}>
              <Image src={image} alt="" width={20} height={20} />
              {keys.length === 1 && (
                <span className={topItemStyles.keys.chain.name.single}>
                  {name}
                </span>
              )}
              {keys.length > 1 && (
                <span className={topItemStyles.keys.chain.name.multiple}>
                  {name}
                </span>
              )}
            </div>
          );

          return keys.length > 1 ? (
            <div
              key={keyIndex}
              className={topItemStyles.keys.chainMultiple.container}
            >
              {keyIndex > 0 && (
                <MdKeyboardArrowRight
                  size={16}
                  className={topItemStyles.keys.chainMultiple.arrow}
                />
              )}
              {element}
            </div>
          ) : (
            element
          );
        })}
      </div>
      <Number
        value={data[field] as number}
        format={_format}
        prefix={prefix}
        noTooltip={true}
        className={topItemStyles.value}
      />
    </div>
  );
}
