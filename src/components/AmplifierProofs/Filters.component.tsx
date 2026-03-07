'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { FilterDialog } from '@/components/FilterSelect';
import type { FilterAttribute } from '@/components/FilterSelect';
import type { Chain } from '@/types';
import { useChains } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import { capitalize } from '@/lib/string';

import * as styles from './AmplifierProofs.styles';

const size = 25;

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(getParams(searchParams, size));
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const chains = useChains();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (_e1?: unknown, _e2?: unknown, _params?: Record<string, unknown>) => {
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

  const attributes: FilterAttribute[] = ([
    { label: 'Session ID', name: 'sessionId' },
    { label: 'Message ID', name: 'messageId' },
    {
      label: 'Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        (toArray(chains) as Chain[])
          .filter(
            (d: Chain) => d.chain_type === 'vm' && (!d.no_inflation || d.deprecated)
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
      label: 'Multisig Prover Contract Address',
      name: 'multisigProverContractAddress',
    },
    { label: 'Multisig Contract Address', name: 'multisigContractAddress' },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      multiple: true,
      options: _.concat(
        { value: '', title: 'Any' },
        ['completed', 'failed', 'pending'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Signer (Verifier Address)', name: 'signer' },
    params.signer ? {
      label: 'Sign',
      name: 'sign',
      type: 'select',
      options: _.concat(
        { value: '', title: 'Any' },
        ['signed', 'unsubmitted'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    } : undefined,
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ] as (FilterAttribute | undefined)[]).filter((d): d is FilterAttribute => !!d);

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
