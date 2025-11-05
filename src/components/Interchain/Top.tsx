import clsx from 'clsx';

import { useGlobalStore } from '@/components/Global';
import { Spinner } from '@/components/Spinner';
import { getChainData } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
import { GroupDataItem, InterchainData } from './Interchain.types';
import { TopProps } from './Top.types';
import { TopItem } from './TopItem';

export function Top({
  index,
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
          ? index % 3 !== 0
            ? 'sm:border-l-0'
            : index % (hasTransfers ? 6 : 3) !== 0
              ? 'lg:border-l-0'
              : ''
          : !hasTransfers || !hasGMP || index % 4 !== 0
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
                dataItem =>
                  (type !== 'chain' ||
                    split((dataItem as Record<string, unknown>).key as string, {
                      delimiter: '_',
                    }).filter(keyPart => !getChainData(keyPart, chains))
                      .length < 1) &&
                  ((dataItem as Record<string, unknown>)[field] as number) > 0
              )
              .map((dataItem, itemIndex) => (
                <TopItem
                  key={itemIndex}
                  data={dataItem as Record<string, unknown>}
                  type={type}
                  field={field}
                  format={_format}
                  prefix={prefix}
                  transfersType={transfersType}
                  chains={chains}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
