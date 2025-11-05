import _ from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getParams, getQueryString } from '@/lib/operator';
import { FilterParams } from './Interchain.types';

export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<FilterParams>(
    getParams(searchParams) as FilterParams
  );
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const submitFilters = (newParams?: FilterParams) => {
    const paramsToUse = newParams ?? params;

    if (!_.isEqual(paramsToUse, getParams(searchParams))) {
      router.push(`${pathname}${getQueryString(paramsToUse)}`);
      setParams(paramsToUse);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams) as FilterParams);
  };

  return {
    open,
    setOpen,
    params,
    setParams,
    searchInput,
    setSearchInput,
    submitFilters,
    onClose,
  };
}
