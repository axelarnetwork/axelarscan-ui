'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { FilterDialog } from '@/components/FilterSelect';
import type { FilterAttribute } from '@/components/FilterSelect';
import { useChains } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import { capitalize } from '@/lib/string';
import type { Chain } from '@/types';

import * as styles from './AmplifierPolls.styles';

const size = 25;

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(
    getParams(searchParams, size),
  );
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const chains = useChains();

  const onSubmit = (
    _e1?: unknown,
    _e2?: unknown,
    _params?: Record<string, unknown>,
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

  const attributes = toArray([
    { label: 'Poll ID', name: 'pollId' },
    { label: 'Tx Hash', name: 'transactionId' },
    {
      label: 'Chain',
      name: 'chain',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        toArray(chains)
          .filter(
            (d: Chain) => d.chain_type === 'vm' && (!d.no_inflation || d.deprecated),
          )
          .map((d: Chain, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc'],
      ).map((d) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    { label: 'Verifier Contract Address', name: 'VerifierContractAddress' },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      multiple: true,
      options: _.concat(
        { title: 'Any', value: undefined as string | undefined },
        ['completed', 'failed', 'pending'].map((d) => ({
          value: d,
          title: capitalize(d),
        })),
      ),
    },
    { label: 'Voter (Verifier Address)', name: 'voter' },
    params.voter && {
      label: 'Vote',
      name: 'vote',
      type: 'select',
      options: _.concat(
        { title: 'Any', value: undefined as string | undefined },
        ['yes', 'no', 'unsubmitted'].map((d) => ({
          value: d,
          title: capitalize(d),
        })),
      ),
    },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ]) as FilterAttribute[];

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
