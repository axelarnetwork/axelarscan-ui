import clsx from 'clsx';
import _ from 'lodash';

import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { Switch } from '@/components/Switch';
import { ChainWithTotalValue, ProcessedTVLData } from './TVL.types';

interface TVLTableHeaderProps {
  includeITS: boolean;
  onToggleITS: (value: boolean) => void;
  filteredData: ProcessedTVLData[];
  chainsTVL: ChainWithTotalValue[] | false;
}

/**
 * Table header for the TVL table
 * Includes column headers with summary values and chain columns
 */
export function TVLTableHeader({
  includeITS,
  onToggleITS,
  filteredData,
  chainsTVL,
}: TVLTableHeaderProps) {
  const totalLockedValue = _.sumBy(
    filteredData.filter((d: ProcessedTVLData) => d.value > 0),
    'value'
  );

  const totalEVMValue = _.sumBy(
    filteredData.filter((d: ProcessedTVLData) => d.value_on_evm > 0),
    'value_on_evm'
  );

  const totalCosmosValue = _.sumBy(
    filteredData.filter((d: ProcessedTVLData) => d.value_on_cosmos > 0),
    'value_on_cosmos'
  );

  return (
    <thead className="sticky top-0 z-20 bg-white dark:bg-zinc-900">
      <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        <th scope="col" className="px-3 py-4 text-left">
          <div className="flex flex-col gap-y-0.5">
            <span className="whitespace-nowrap">Asset</span>
            <Switch
              value={includeITS}
              onChange={onToggleITS}
              title="Including ITS"
              groupClassName="!gap-x-1.5"
              outerClassName="!h-4 !w-8"
              innerClassName="!h-3 !w-3"
              labelClassName="h-4 flex items-center"
              titleClassName={clsx(
                'text-xs !font-normal',
                !includeITS && '!text-zinc-400 dark:!text-zinc-500'
              )}
            />
          </div>
        </th>
        <th scope="col" className="whitespace-nowrap px-3 py-4 text-left">
          <div className="flex flex-col gap-y-0.5">
            <span className="whitespace-nowrap">Native Chain</span>
            <div className="h-4" />
          </div>
        </th>
        <th scope="col" className="px-3 py-4 text-right">
          <div className="flex flex-col items-end gap-y-0.5">
            <span className="whitespace-nowrap">Total Locked</span>
            <Number
              value={totalLockedValue}
              format="0,0.00a"
              prefix="$"
              noTooltip={true}
              className="text-xs text-green-600 dark:text-green-500"
            />
          </div>
        </th>
        <th scope="col" className="px-3 py-4 text-right">
          <div className="flex flex-col items-end gap-y-0.5">
            <span className="whitespace-nowrap">Moved to EVM</span>
            <Number
              value={totalEVMValue}
              format="0,0.00a"
              prefix="$"
              noTooltip={true}
              className="text-xs text-green-600 dark:text-green-500"
            />
          </div>
        </th>
        <th scope="col" className="px-3 py-4 text-right">
          <div className="flex flex-col items-end gap-y-0.5">
            <span className="whitespace-nowrap">Moved to Cosmos</span>
            <Number
              value={totalCosmosValue}
              format="0,0.00a"
              prefix="$"
              noTooltip={true}
              className="text-xs text-green-600 dark:text-green-500"
            />
          </div>
        </th>
        {chainsTVL !== false &&
          chainsTVL.map((chain: ChainWithTotalValue) => (
            <th key={chain.id} scope="col" className="px-3 py-4 text-right">
              <div className="flex flex-col items-end gap-y-0.5">
                <div className="flex min-w-max items-center gap-x-1.5">
                  <Image src={chain.image} alt="" width={18} height={18} />
                  <span className="whitespace-nowrap">{chain.name}</span>
                </div>
                <Number
                  value={chain.total_value}
                  format="0,0.0a"
                  prefix="$"
                  noTooltip={true}
                  className="text-xs font-medium text-zinc-400 dark:text-zinc-500"
                />
              </div>
            </th>
          ))}
      </tr>
    </thead>
  );
}
