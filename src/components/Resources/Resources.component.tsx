'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { useChains, useAssets, useITSAssets } from '@/hooks/useGlobalData';
import { split, toArray } from '@/lib/parser';
import { getParams, getQueryString } from '@/lib/operator';
import type { Chain } from '@/types';
import type {
  SelectOption,
  FilterAttribute,
  ResourcesProps,
} from './Resources.types';
import { ResourceNav } from './ResourceNav.component';
import { SearchInput } from './SearchInput.component';
import { TypeFilters } from './TypeFilters.component';
import { AttributeFilters } from './AttributeFilters.component';
import { ResourceList } from './ResourceList.component';
import * as styles from './Resources.styles';
import { filterChains, filterAssets } from './Resources.utils';

const RESOURCES = ['chains', 'assets'];

export function Resources({ resource = undefined }: ResourcesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rendered, setRendered] = useState(false);
  const [params, setParams] = useState<Record<string, string>>(
    getParams(searchParams) as Record<string, string>
  );
  const [input, setInput] = useState('');
  const [assetFocusID, setAssetFocusID] = useState<string | null>(null);
  const chains = useChains();
  const assets = useAssets();
  const itsAssets = useITSAssets();

  useEffect(() => {
    switch (pathname) {
      case '/resources':
        router.push(`/resources/${RESOURCES[0]}`);
        break;
      case '/assets':
        router.push('/resources/assets');
        break;
      default:
        if (!rendered) {
          setRendered(true);
        } else if (resource) {
          router.push(
            `/resources/${resource}${getQueryString(getParams(searchParams))}`
          );

          setInput('');

          if (resource !== 'assets') {
            setAssetFocusID(null);
          }
        }
        break;
    }
  }, [
    resource,
    router,
    pathname,
    searchParams,
    rendered,
    setRendered,
    setInput,
    setAssetFocusID,
  ]);

  useEffect(() => {
    const _params = getParams(searchParams) as Record<string, string>;

    if (!_.isEqual(_params, params)) {
      setParams(_params);
    }
  }, [searchParams, params, setParams]);

  const attributes = toArray([
    params.type === 'its' && {
      label: 'Chain',
      name: 'chain',
      type: 'select',
      options: _.concat(
        { title: 'Any', value: '' } as SelectOption,
        _.orderBy(
          (toArray(chains) as Chain[]).filter(
            (d: Chain) =>
              !d.deprecated && (params.type !== 'its' || d.chain_type === 'evm')
          ),
          ['name'],
          ['asc']
        ).map((d: Chain) => ({
          value: d.id,
          title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
        }))
      ),
    },
  ]);

  const filter = (
    resourceType: string,
    filterParams: Record<string, string>
  ) => {
    const { type, chain } = { ...filterParams };

    const words = split(input, { delimiter: ' ', toCase: 'lower' });

    switch (resourceType) {
      case 'chains':
        return filterChains(chains, type, chain, input, words);
      case 'assets':
        return filterAssets(assets, itsAssets, type, chain, input, words);
      default:
        return [];
    }
  };

  if (!resource) {
    return null;
  }

  return (
    <Container className={styles.containerWrapper}>
      <div className={styles.topBar}>
        <ResourceNav
          resource={resource}
          filter={filter}
          params={params}
          chains={chains}
          assets={assets}
        />
        <div className={styles.filterColumn}>
          <SearchInput resource={resource} input={input} setInput={setInput} />
          <TypeFilters
            resource={resource}
            params={params}
            pathname={pathname}
          />
          {attributes.length > 0 && (
            <AttributeFilters
              attributes={attributes as FilterAttribute[]}
              params={params}
              resource={resource}
            />
          )}
        </div>
      </div>
      <ResourceList
        resource={resource}
        filter={filter}
        params={params}
        assetFocusID={assetFocusID}
        setAssetFocusID={setAssetFocusID}
      />
    </Container>
  );
}
