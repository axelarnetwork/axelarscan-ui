'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { FilterDialog } from '@/components/FilterSelect';
import type { FilterAttribute } from '@/components/FilterSelect';
import {
  getParams,
  getQueryString,
  isFiltered,
} from '@/lib/operator';

import { PAGE_SIZE } from './AmplifierRewards.types';
import * as styles from './AmplifierRewards.styles';

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(getParams(searchParams, PAGE_SIZE));
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (_e1?: unknown, _e2?: unknown, _params?: Record<string, unknown>) => {
    const resolvedParams = _params ?? params;

    if (!_.isEqual(resolvedParams, getParams(searchParams, PAGE_SIZE))) {
      router.push(`${pathname}${getQueryString(resolvedParams)}`);
      setParams(resolvedParams);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams, PAGE_SIZE));
  };

  const attributes: FilterAttribute[] = [
    { label: 'Epoch', name: 'epochCount' },
    { label: 'Tx Hash', name: 'txHash' },
    { label: 'Contract', name: 'contractAddress' },
    { label: 'Rewards Contract', name: 'rewardsContractAddress' },
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
        setParams={setParams}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
    </>
  );
}
