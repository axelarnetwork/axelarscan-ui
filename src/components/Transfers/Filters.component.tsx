'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { FilterDialog } from '@/components/FilterSelect';
import type { FilterAttribute, FilterOption } from '@/components/FilterSelect';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import type { Chain, Asset } from '@/types';
import { toArray } from '@/lib/parser';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import { capitalize } from '@/lib/string';

import * as styles from './Transfers.styles';

const size = 25;

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(
    getParams(searchParams, size)
  );
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const chains = useChains();
  const assets = useAssets();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (
    _e1: unknown,
    _e2: unknown,
    _params?: Record<string, unknown>
  ) => {
    if (!_params) {
      _params = params;
    }

    if (!_.isEqual(_params, getParams(searchParams, size))) {
      router.push(`${pathname}${getQueryString(_params)}`);
      setParams(_params);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams, size));
  };

  const chainOptions = _.orderBy(
    toArray(chains).map((d: Chain, i: number) => ({ ...d, i })),
    ['deprecated', 'name', 'i'],
    ['desc', 'asc', 'asc']
  ).map((d: Chain & { i: number }) => ({
    value: d.id,
    title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
  }));

  const attributes: FilterAttribute[] = [
    { label: 'Tx Hash', name: 'txHash' },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
    },
    {
      label: 'Destination Chain',
      name: 'destinationChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
    },
    {
      label: 'From / To Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
    },
    {
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        _.uniqBy(
          toArray(assets).map((d: Asset) => ({
            value: d.id,
            title: d.symbol ?? d.id,
          })),
          'value'
        ),
        ['title'],
        ['asc']
      ),
    },
    {
      label: 'Type',
      name: 'type',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'deposit_address', title: 'Deposit Address' },
        { value: 'send_token', title: 'Send Token' },
        { value: 'wrap', title: 'Wrap' },
        { value: 'unwrap', title: 'Unwrap' },
        { value: 'erc20_transfer', title: 'ERC20 Transfer' },
      ],
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: _.concat(
        { title: 'Any' } as FilterOption,
        ['executed', 'failed'].map((d: string) => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Sender', name: 'senderAddress' },
    { label: 'Recipient', name: 'recipientAddress' },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
    {
      label: 'Sort By',
      name: 'sortBy',
      type: 'select',
      options: [
        { title: 'Transfer Time' },
        { value: 'value', title: 'Transfer Value' },
      ],
    },
  ];

  const filtered = isFiltered(params);

  return (
    <>
      <Button
        color="default"
        circle="true"
        onClick={() => setOpen(true)}
        className={clsx(filtered && styles.filterBtnFiltered)}
      >
        <MdOutlineFilterList
          size={20}
          className={clsx(filtered && styles.filterIconFiltered)}
        />
      </Button>
      <FilterDialog
        open={open}
        onClose={onClose}
        onSubmit={() => onSubmit(undefined, undefined)}
        onReset={() => onSubmit(undefined, undefined, {})}
        filtered={filtered}
        attributes={attributes}
        params={params}
        setParams={setParams}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
    </>
  );
}
