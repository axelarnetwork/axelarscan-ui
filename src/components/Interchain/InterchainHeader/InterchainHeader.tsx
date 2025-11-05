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
import { Filters } from '../Filters/Filters';
import { FilterParams } from '../Interchain.types';
import { TIME_RANGE_SHORTCUTS } from '../Interchain.utils';
import { interchainHeaderStyles } from './InterchainHeader.styles';
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
    <div className={interchainHeaderStyles.container}>
      <div className={interchainHeaderStyles.title.container}>
        <div className={interchainHeaderStyles.title.header}>
          <h1 className={interchainHeaderStyles.title.heading}>Statistics</h1>
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
        <div className={interchainHeaderStyles.shortcuts.container}>
          {TIME_RANGE_SHORTCUTS.map((shortcut, index) => (
            <Link
              key={index}
              href={buildShortcutUrl(pathname, params, shortcut.value)}
              className={interchainHeaderStyles.shortcuts.link(
                isShortcutSelected(shortcut.value, fromTime, toTime)
              )}
            >
              <span>{shortcut.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className={interchainHeaderStyles.actions.container}>
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
