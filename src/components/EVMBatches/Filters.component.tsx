'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { FilterDialog } from '@/components/FilterSelect';
import type { FilterAttribute, FilterOption } from '@/components/FilterSelect';
import { useChains } from '@/hooks/useGlobalData';
import { searchBatches } from '@/lib/api/token-transfer';
import { toArray } from '@/lib/parser';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import { capitalize } from '@/lib/string';

import type { Chain } from '@/types';

import type { AggBucket } from './EVMBatches.types';
import { PAGE_SIZE } from './EVMBatches.types';
import * as styles from './EVMBatches.styles';

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(
    getParams(searchParams, PAGE_SIZE)
  );
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const [types, setTypes] = useState<string[]>([]);
  const chains = useChains();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  useEffect(() => {
    const getTypes = async () => {
      const response = await searchBatches({
        aggs: {
          types: { terms: { field: 'commands.type.keyword', size: 25 } },
        },
        size: 0,
      });
      setTypes((toArray(response) as AggBucket[]).map(d => d.key));
    };

    getTypes();
  }, []);

  const onSubmit = (
    _e1: unknown,
    _e2: unknown,
    _params?: Record<string, unknown>
  ) => {
    if (!_params) {
      _params = params;
    }

    if (!_.isEqual(_params, getParams(searchParams, PAGE_SIZE))) {
      router.push(`${pathname}${getQueryString(_params)}`);
      setParams(_params);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams, PAGE_SIZE));
  };

  const attributes: FilterAttribute[] = [
    { label: 'Batch ID', name: 'batchId' },
    { label: 'Command ID', name: 'commandId' },
    {
      label: 'Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains)
          .filter(
            (d: Chain) =>
              d.chain_type === 'evm' && (!d.no_inflation || d.deprecated)
          )
          .map((d: Chain, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map((d: Chain & { i: number }) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Command Type',
      name: 'type',
      type: 'select',
      options: _.concat(
        { title: 'Any' } as FilterOption,
        types.map(d => ({ value: d, title: d }))
      ),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: _.concat(
        { title: 'Any' } as FilterOption,
        ['executed', 'unexecuted', 'signed', 'signing', 'aborted'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ];

  const filtered = isFiltered(params);

  return (
    <>
      <Button
        color="default"
        circle="true"
        onClick={() => setOpen(true)}
        className={clsx(filtered && styles.filterButtonActive)}
      >
        <MdOutlineFilterList
          size={20}
          className={clsx(filtered && styles.filterIconActive)}
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
