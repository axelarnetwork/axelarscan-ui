'use client';

import { MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { FilterDialog } from '@/components/FilterSelect';
import type { FilterAttribute } from '@/components/FilterSelect';
import { useAssets, useChains, useITSAssets } from '@/hooks/useGlobalData';
import { isFiltered } from '@/lib/operator';
import { useFilters } from './Filters.hooks';
import { filtersStyles } from './Filters.styles';
import { getFilterAttributes } from './Filters.utils';

export function Filters() {
  const chains = useChains();
  const assets = useAssets();
  const itsAssets = useITSAssets();
  const {
    open,
    setOpen,
    params,
    setParams,
    searchInput,
    setSearchInput,
    submitFilters,
    onClose,
  } = useFilters();

  const attributes = getFilterAttributes(params, chains, assets, itsAssets);
  const filtered = isFiltered(params);

  return (
    <>
      <Button
        color="default"
        circle="true"
        onClick={() => setOpen(true)}
        className={filtersStyles.button.base(filtered)}
      >
        <MdOutlineFilterList
          size={20}
          className={filtersStyles.button.icon(filtered)}
        />
      </Button>
      <FilterDialog
        open={open}
        onClose={onClose}
        onSubmit={() => submitFilters()}
        onReset={() => submitFilters({})}
        filtered={filtered}
        attributes={attributes as FilterAttribute[]}
        params={params}
        setParams={setParams as (params: Record<string, unknown>) => void}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
    </>
  );
}
