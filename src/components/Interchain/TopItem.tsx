import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { AssetProfile, Profile } from '@/components/Profile';
import { getChainData } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
import { MdKeyboardArrowRight } from 'react-icons/md';

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
    <div className="flex items-center justify-between gap-x-2">
      <div
        className={clsx(
          'flex items-center gap-x-1',
          ['asset', 'contract', 'address'].includes(type) ? 'h-8' : 'h-6'
        )}
      >
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
            <div key={keyIndex} className="flex items-center gap-x-1.5">
              <Image src={image} alt="" width={20} height={20} />
              {keys.length === 1 && (
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {name}
                </span>
              )}
              {keys.length > 1 && (
                <span className="hidden text-xs font-medium text-zinc-700 dark:text-zinc-300 2xl:hidden">
                  {name}
                </span>
              )}
            </div>
          );

          return keys.length > 1 ? (
            <div key={keyIndex} className="flex items-center gap-x-1">
              {keyIndex > 0 && (
                <MdKeyboardArrowRight
                  size={16}
                  className="text-zinc-700 dark:text-zinc-300"
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
        className="text-xs font-semibold text-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}
