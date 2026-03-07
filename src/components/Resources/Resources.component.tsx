'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdCheck } from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { Container } from '@/components/Container';
import { useChains, useAssets, useITSAssets } from '@/hooks/useGlobalData';
import { split, toArray } from '@/lib/parser';
import { getParams, getQueryString } from '@/lib/operator';
import { equalsIgnoreCase, includesSomePatterns } from '@/lib/string';
import type { Chain } from '@/types';
import type { SelectOption, FilterAttribute, ResourcesProps } from './Resources.types';
import { Chain as ChainCard } from './Chain.component';
import { Asset as AssetCard } from './Asset.component';
import * as styles from './Resources.styles';

const CHAIN_TYPES = [
  { label: 'All', value: undefined },
  { label: 'EVM', value: 'evm' },
  { label: 'Cosmos', value: 'cosmos' },
  { label: 'Amplifier', value: 'vm' },
];

const ASSET_TYPES = [
  { label: 'All', value: undefined },
  { label: 'Gateway', value: 'gateway' },
  { label: 'ITS', value: 'its' },
];

const RESOURCES = ['chains', 'assets'];

export function Resources({ resource = undefined }: ResourcesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rendered, setRendered] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useState<Record<string, string>>(getParams(searchParams) as any);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _params = getParams(searchParams) as any;

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (toArray(chains) as any[]).filter(
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

  const filter = (resourceType: string, filterParams: Record<string, string>) => {
    const { type, chain } = { ...filterParams };

    const words = split(input, { delimiter: ' ', toCase: 'lower' });

    switch (resourceType) {
      case 'chains':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (toArray(chains) as any[])
          .filter(
            (d: Chain) =>
              (!type || d.chain_type === type) &&
              (!chain || equalsIgnoreCase(d.id, chain)) &&
              (!d.no_inflation || d.deprecated)
          )
          .filter(
            (d: Chain) =>
              !input ||
              includesSomePatterns(
                _.uniq(
                  toArray(
                    ['id', 'chain_id', 'chain_name', 'name'].map((f: string) =>
                      d[f]?.toString()
                    ),
                    { toCase: 'lower' }
                  ) as string[]
                ),
                words
              )
          );
      case 'assets':
        return _.concat(
          toArray((!type || type === 'gateway') ? assets : null)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((d: any) => !chain || d.addresses?.[chain])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (d: any) =>
                !input ||
                includesSomePatterns(
                  _.uniq(
                    toArray(
                      _.concat(
                        ['denom', 'name', 'symbol'].map((f: string) => d[f]),
                        d.denoms,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        Object.values({ ...d.addresses }).flatMap((a: any) =>
                          toArray([
                            !equalsIgnoreCase(input, 'axl') && a.symbol,
                            a.address,
                            a.ibc_denom,
                          ])
                        )
                      ),
                      { toCase: 'lower' }
                    )
                  ),
                  words
                )
            ),
          toArray((!type || type === 'its') ? itsAssets : null)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((d: any) => !chain || d.chains?.[chain])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (d: any) =>
                !input ||
                includesSomePatterns(
                  _.uniq(
                    toArray(
                      _.concat(
                        ['name', 'symbol'].map((f: string) => d[f]),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        Object.values({ ...d.chains }).flatMap((a: any) =>
                          toArray([
                            !equalsIgnoreCase(input, 'axl') && a.symbol,
                            a.tokenAddress,
                          ])
                        )
                      ),
                      { toCase: 'lower' }
                    )
                  ),
                  words
                )
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((d: any) => ({ ...d, type: 'its' }))
        );
      default:
        return [];
    }
  };

  const renderResourceList = (resourceType: string) => {
    const filtered = filter(resourceType, params);

    if (resourceType === 'chains') {
      return (
        <ul role="list" className={styles.resourceGrid}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filtered.map((d: any, i: number) => (
            <ChainCard key={i} data={d} />
          ))}
        </ul>
      );
    }

    if (resourceType === 'assets') {
      return (
        <ul role="list" className={styles.resourceGrid}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filtered.map((d: any, i: number) => (
            <AssetCard
              key={i}
              data={d}
              focusID={assetFocusID}
              onFocus={(id: string) => setAssetFocusID(id)}
            />
          ))}
        </ul>
      );
    }

    return <div />;
  };

  if (!resource) {
    return null;
  }

  return (
    <Container className={styles.containerWrapper}>
      <div className={styles.topBar}>
        <nav className={styles.navRow}>
          {RESOURCES.map((d, i) => (
            <Link
              key={i}
              href={`/resources/${d}`}
              className={clsx(
                styles.navLinkBase,
                d === resource
                  ? styles.navLinkActive
                  : styles.navLinkInactive
              )}
            >
              {d}
              {d === resource &&
              ((resource === 'chains' && chains) ||
                (resource === 'assets' && assets))
                ? ` (${filter(resource, params).length})`
                : ''}
            </Link>
          ))}
        </nav>
        <div className={styles.filterColumn}>
          <input
            placeholder={`Search by ${resource === 'assets' ? 'Denom / Symbol / Address' : 'Chain Name / ID'}`}
            value={input}
            onChange={e =>
              setInput(
                split(e.target.value, {
                  delimiter: ' ',
                  filterBlank: false,
                }).join(' ')
              )
            }
            className={styles.searchInput}
          />
          <div className={styles.typeFiltersRow}>
            {(resource === 'assets' ? ASSET_TYPES : CHAIN_TYPES).map(
              (d, i) => (
                <Link
                  key={i}
                  href={`${pathname}${getQueryString({ ...params, type: d.value })}`}
                  className={clsx(
                    styles.typeLinkBase,
                    d.value === params.type
                      ? styles.typeLinkActive
                      : styles.typeLinkInactive
                  )}
                >
                  <span>{d.label}</span>
                </Link>
              )
            )}
          </div>
          {attributes.length > 0 && (
            <div className={styles.attributesWrapper}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(attributes as any[]).map((d: FilterAttribute, i: number) => (
                <div key={i} className={styles.attributeRow}>
                  <label
                    htmlFor={d.name}
                    className={styles.attributeLabel}
                  >
                    {d.label}
                  </label>
                  <div className={styles.attributeFieldWrapper}>
                    {d.type === 'select' ? (
                      <Listbox
                        value={
                          d.multiple ? split(params[d.name]) : params[d.name]
                        }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(v: any) => {
                          router.push(
                            `/resources/${resource}${getQueryString({ ...params, [d.name]: d.multiple ? (v as string[]).join(',') : v })}`
                          );
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        multiple={d.multiple as any}
                      >
                        {({ open }) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const isSelected = (v: any) =>
                            d.multiple
                              ? split(params[d.name]).includes(v)
                              : v === params[d.name] ||
                                equalsIgnoreCase(v, params[d.name]);
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const selectedValue: any = d.multiple
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ? (toArray(d.options) as any[]).filter((o: SelectOption) =>
                                isSelected(o.value)
                              )
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            : (toArray(d.options) as any[]).find((o: SelectOption) =>
                                isSelected(o.value)
                              );

                          return (
                            <div className={styles.selectRelative}>
                              <Listbox.Button className={styles.selectButton}>
                                {d.multiple ? (
                                  <div
                                    className={clsx(
                                      styles.selectMultiWrap,
                                      selectedValue.length !== 0 && styles.selectMultiWrapSelected
                                    )}
                                  >
                                    {selectedValue.length === 0 ? (
                                      <span className={styles.selectTruncate}>
                                        Any
                                      </span>
                                    ) : (
                                      selectedValue.map((v: SelectOption, j: number) => (
                                        <div
                                          key={j}
                                          onClick={() => {
                                            router.push(
                                              `/resources/${resource}${getQueryString(
                                                {
                                                  ...params,
                                                  [d.name]: selectedValue
                                                    .filter(
                                                      (s: SelectOption) => s.value !== v.value
                                                    )
                                                    .map((s: SelectOption) => s.value)
                                                    .join(','),
                                                }
                                              )}`
                                            );
                                          }}
                                          className={styles.selectTag}
                                        >
                                          {v.title}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                ) : (
                                  <span className={styles.selectTruncate}>
                                    {selectedValue?.title}
                                  </span>
                                )}
                                <span className={styles.selectIconWrapper}>
                                  <LuChevronsUpDown
                                    size={20}
                                    className={styles.selectChevronIcon}
                                  />
                                </span>
                              </Listbox.Button>
                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className={styles.selectOptions}>
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {(toArray(d.options) as any[]).map((o: SelectOption, j: number) => (
                                    <Listbox.Option
                                      key={j}
                                      value={o.value}
                                      className={({ active }) =>
                                        clsx(
                                          styles.selectOptionBase,
                                          active
                                            ? styles.selectOptionActive
                                            : styles.selectOptionInactive
                                        )
                                      }
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span
                                            className={clsx(
                                              styles.selectTruncate,
                                              selected
                                                ? styles.selectOptionTextSelected
                                                : styles.selectOptionTextNormal
                                            )}
                                          >
                                            {o.title}
                                          </span>
                                          {selected && (
                                            <span
                                              className={clsx(
                                                styles.selectCheckWrapper,
                                                active
                                                  ? styles.selectCheckActive
                                                  : styles.selectCheckInactive
                                              )}
                                            >
                                              <MdCheck size={20} />
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          );
                        }}
                      </Listbox>
                    ) : (
                      <input
                        type={d.type || 'text'}
                        name={d.name}
                        placeholder={d.label}
                        value={params[d.name]}
                        onChange={e => {
                          router.push(
                            `/resources/${getQueryString({ ...params, [d.name]: e.target.value })}`
                          );
                        }}
                        className={styles.filterInput}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {renderResourceList(resource)}
    </Container>
  );
}
