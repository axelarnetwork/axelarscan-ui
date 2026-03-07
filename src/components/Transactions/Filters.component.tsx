'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { FilterDialog } from '@/components/FilterSelect';
import type { FilterAttribute, FilterOption } from '@/components/FilterSelect';
import { searchTransactions } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import { capitalize } from '@/lib/string';

import type { FiltersProps, TypesAggregationBucket } from './Transactions.types';
import { PAGE_SIZE } from './Transactions.types';
import * as styles from './Transactions.styles';

export function Filters({ address }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, string>>(getParams(searchParams, PAGE_SIZE) as Record<string, string>);
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  useEffect(() => {
    const getTypes = async () => {
      const response = await searchTransactions({
        aggs: { types: { terms: { field: 'types.keyword', size: 1000 } } },
        size: 0,
      });
      setTypes(toArray<TypesAggregationBucket>(response as TypesAggregationBucket[] | null).map((d) => d.key));
    };

    getTypes();
  }, []);

  const onSubmit = (e1?: unknown, e2?: unknown, _params?: Record<string, string>) => {
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
    setParams(getParams(searchParams, PAGE_SIZE) as Record<string, string>);
  };

  const attributes: FilterAttribute[] = [
    { label: 'Tx Hash', name: 'txHash' },
    {
      label: 'Type',
      name: 'type',
      type: 'select',
      options: _.concat(
        [{ title: 'Any' } as FilterOption],
        _.orderBy(
          types.map((d: string) => ({ value: d, title: d })),
          ['title'],
          ['asc']
        )
      ),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: _.concat(
        [{ title: 'Any' } as FilterOption],
        ['success', 'failed'].map((d: string) => ({ value: d, title: capitalize(d) }))
      ),
    },
    ...(!address ? [{ label: 'Address', name: 'address' }] : []),
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
        onSubmit={() => onSubmit()}
        onReset={() => onSubmit(undefined, undefined, {})}
        filtered={filtered}
        attributes={attributes}
        params={params}
        setParams={(p) => setParams(p as Record<string, string>)}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
    </>
  );
}
