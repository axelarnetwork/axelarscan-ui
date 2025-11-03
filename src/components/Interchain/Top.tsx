import clsx from 'clsx';

import { useGlobalStore } from '@/components/Global';
import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { AssetProfile, Profile } from '@/components/Profile';
import { Spinner } from '@/components/Spinner';
import { getChainData } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { GroupDataItem, InterchainData } from './Interchain.types';
import { TopProps } from './Top.types';

export function Top({
  i,
  data,
  type = 'chain',
  hasTransfers = true,
  hasGMP = true,
  transfersType,
  field = 'num_txs',
  title = '',
  description = '',
  format: _format = '0,0.00a',
  prefix = '',
  className,
}: TopProps) {
  const { chains } = useGlobalStore();

  // Handle union type - cast to the appropriate type
  const dataArray = (Array.isArray(data) ? data : toArray(data)) as (
    | InterchainData
    | GroupDataItem
  )[];

  return (
    <div
      className={clsx(
        'flex flex-col gap-y-3 border-l border-r border-t border-zinc-200 px-4 dark:border-zinc-700 sm:px-6',
        type === 'chain'
          ? i % 3 !== 0
            ? 'sm:border-l-0'
            : i % (hasTransfers ? 6 : 3) !== 0
              ? 'lg:border-l-0'
              : ''
          : !hasTransfers || !hasGMP || i % 4 !== 0
            ? 'sm:border-l-0'
            : '',
        type === 'chain' ? 'py-4 xl:px-4' : 'py-8 xl:px-8'
      )}
    >
      <div className="flex flex-col gap-y-0.5">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        {description && (
          <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
            {description}
          </span>
        )}
      </div>
      <div className="w-full">
        {!data ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div
            className={clsx('flex flex-col gap-y-1 overflow-y-auto', className)}
          >
            {dataArray
              .filter(
                d =>
                  (type !== 'chain' ||
                    split((d as Record<string, unknown>).key as string, {
                      delimiter: '_',
                    }).filter(k => !getChainData(k, chains)).length < 1) &&
                  ((d as Record<string, unknown>)[field] as number) > 0
              )
              .map((d, i) => {
                const dRecord = d as Record<string, unknown>;
                const keys = split(dRecord.key as string, { delimiter: '_' });

                return keys.length > 0 ? (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-x-2"
                  >
                    <div
                      className={clsx(
                        'flex items-center gap-x-1',
                        ['asset', 'contract', 'address'].includes(type)
                          ? 'h-8'
                          : 'h-6'
                      )}
                    >
                      {keys.map((k, j) => {
                        switch (type) {
                          case 'asset':
                            return (
                              <AssetProfile
                                key={j}
                                value={k}
                                chain={undefined}
                                amount={undefined}
                                addressOrDenom={k}
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
                          case 'contract':
                          case 'address':
                            return (
                              <Profile
                                key={j}
                                i={j}
                                address={k}
                                chain={toArray(dRecord.chain)[0] as string}
                                width={20}
                                height={20}
                                noCopy={true}
                                customURL={
                                  type === 'address'
                                    ? `/address/${k}${transfersType ? `?transfersType=${transfersType}` : ''}`
                                    : ''
                                }
                                useContractLink={type === 'contract'}
                                className="text-xs font-medium"
                              />
                            );
                          case 'chain':
                          default:
                            const { name, image } = {
                              ...getChainData(k, chains),
                            };

                            const element = (
                              <div
                                key={j}
                                className="flex items-center gap-x-1.5"
                              >
                                <Image
                                  src={image}
                                  alt=""
                                  width={20}
                                  height={20}
                                />
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
                              <div
                                key={j}
                                className="flex items-center gap-x-1"
                              >
                                {j > 0 && (
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
                        }
                      })}
                    </div>
                    <Number
                      value={dRecord[field] as number}
                      format={_format}
                      prefix={prefix}
                      noTooltip={true}
                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                ) : null;
              })}
          </div>
        )}
      </div>
    </div>
  );
}
