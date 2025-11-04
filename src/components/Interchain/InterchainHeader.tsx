import clsx from 'clsx';
import _ from 'lodash';
import Link from 'next/link';
import { MdOutlineRefresh } from 'react-icons/md';

import { Button } from '@/components/Button';
import { Profile } from '@/components/Profile';
import { Spinner } from '@/components/Spinner';
import accounts from '@/data/accounts';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { Filters } from './Filters';
import { FilterParams } from './Interchain.types';
import { TIME_RANGE_SHORTCUTS } from './Interchain.utils';
import { buildShortcutUrl, isShortcutSelected } from './InterchainHeader.utils';

interface InterchainHeaderProps {
  pathname: string;
  params: FilterParams;
  contractAddress?: string | string[];
  contractMethod?: string | string[];
  fromTime?: number;
  toTime?: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function InterchainHeader({
  pathname,
  params,
  contractAddress,
  contractMethod,
  fromTime,
  toTime,
  isRefreshing,
  onRefresh,
}: InterchainHeaderProps) {
  return (
    <div className="flex items-center gap-x-6">
      <div className="sm:flex-auto">
        <div className="flex items-center gap-x-4">
          <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            Statistics
          </h1>
          {_.slice(toArray(contractAddress), 0, 1).map((address, index) => (
            <Profile
              key={index}
              i={index}
              address={address}
              chain=""
              width={18}
              height={18}
              customURL=""
              useContractLink={false}
              className="text-xs"
            />
          ))}
          {!contractAddress &&
            equalsIgnoreCase(String(contractMethod || ''), 'SquidCoral') && (
              <Profile
                i={0}
                address={
                  accounts.find(d => equalsIgnoreCase(d.name, 'Squid Coral'))
                    ?.address
                }
                chain=""
                width={18}
                height={18}
                noCopy={true}
                customURL={`/gmp/search?contractMethod=${contractMethod}`}
                useContractLink={false}
                className="text-xs"
              />
            )}
        </div>
        <div className="mt-2 flex max-w-xl flex-wrap items-center">
          {TIME_RANGE_SHORTCUTS.map((shortcut, index) => (
            <Link
              key={index}
              href={buildShortcutUrl(pathname, params, shortcut.value)}
              className={clsx(
                'mb-1 mr-4 flex min-w-max items-center whitespace-nowrap text-xs sm:mb-0 sm:text-sm',
                isShortcutSelected(shortcut.value, fromTime, toTime)
                  ? 'font-semibold text-blue-600 dark:text-blue-500'
                  : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
              )}
            >
              <span>{shortcut.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <Filters />
        {isRefreshing ? (
          <Spinner />
        ) : (
          <Button
            color="default"
            circle="true"
            onClick={onRefresh}
            className=""
          >
            <MdOutlineRefresh size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}
