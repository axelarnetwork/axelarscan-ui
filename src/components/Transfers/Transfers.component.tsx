/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import {
  MdOutlineRefresh,
  MdOutlineFilterList,
  MdClose,
  MdCheck,
  MdOutlineTimer,
} from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';
import { PiWarningCircle } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo, TimeSpent } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchTransfers } from '@/lib/api/token-transfer';
import { ENVIRONMENT, getAssetData } from '@/lib/config';
import { toCase, split, toArray } from '@/lib/parser';
import {
  getParams,
  getQueryString,
  generateKeyByParams,
  isFiltered,
} from '@/lib/operator';
import {
  isString,
  equalsIgnoreCase,
  capitalize,
  toBoolean,
  ellipse,
  toTitle,
  filterSearchInput,
} from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';
import * as styles from './Transfers.styles';

const size = 25;

function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<any>(getParams(searchParams, size));
  const [searchInput, setSearchInput] = useState<any>({});
  const { handleSubmit } = useForm();
  const chains = useChains();
  const assets = useAssets();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (e1: any, e2: any, _params?: any) => {
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

  const attributes = [
    { label: 'Tx Hash', name: 'txHash' },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d: any, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map((d: any) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Destination Chain',
      name: 'destinationChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d: any, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map((d: any) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'From / To Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d: any, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map((d: any) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        _.uniqBy(
          toArray(assets).map((d: any) => ({ value: d.id, title: d.symbol })),
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
        { title: 'Any' } as any,
        ['executed', 'failed'].map((d: string) => ({ value: d, title: capitalize(d) }))
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
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" onClose={onClose} className={styles.filterDialogRoot}>
          <Transition.Child
            as={Fragment}
            enter={styles.transitionEnter}
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave={styles.transitionLeave}
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={styles.filterBackdrop} />
          </Transition.Child>
          <div className={styles.filterOverflowOuter}>
            <div className={styles.filterOverflowInner}>
              <div className={styles.filterPanelPositioner}>
                <Transition.Child
                  as={Fragment}
                  enter={styles.transitionEnter}
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave={styles.transitionLeave}
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className={styles.filterPanel}>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className={styles.filterForm}
                    >
                      <div className={styles.filterFormScrollArea}>
                        <div className={styles.filterHeader}>
                          <Dialog.Title className={styles.filterHeaderTitle}>
                            Filter
                          </Dialog.Title>
                          <button
                            type="button"
                            onClick={() => onClose()}
                            className={styles.filterCloseBtn}
                          >
                            <MdClose size={20} />
                          </button>
                        </div>
                        <div className={styles.filterAttributesList}>
                          {attributes.map((d: any, i: number) => (
                            <div key={i}>
                              <label
                                htmlFor={d.name}
                                className={styles.filterLabel}
                              >
                                {d.label}
                              </label>
                              <div className={styles.filterFieldWrapper}>
                                {d.type === 'select' ? (
                                  d.searchable ? (
                                    <Combobox
                                      value={
                                        d.multiple
                                          ? split(params[d.name])
                                          : params[d.name]
                                      }
                                      onChange={(v: any) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? v.join(',')
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }: any) => {
                                        const isSelected = (v: any) =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name]
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter((o: any) =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find((o: any) =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className={styles.relativeWrapper}>
                                            <Combobox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectFlexWrap,
                                                    selectedValue.length !==
                                                      0 && styles.selectFlexWrapMargin
                                                  )}
                                                >
                                                  {selectedValue.length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedValue.map(
                                                      (v: any, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedValue
                                                                  .filter(
                                                                    (v: any) =>
                                                                      v.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (v: any) => v.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className={styles.selectMultiTag}
                                                        >
                                                          {v.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className={styles.selectTruncate}>
                                                  {selectedValue?.title}
                                                </span>
                                              )}
                                              <span className={styles.selectChevronWrapper}>
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className={styles.selectChevronIcon}
                                                />
                                              </span>
                                            </Combobox.Button>
                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave={styles.dropdownLeave}
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <div className={styles.comboboxDropdownWrapper}>
                                                <Combobox.Input
                                                  placeholder={`Search ${d.label}`}
                                                  value={
                                                    searchInput[d.name] || ''
                                                  }
                                                  onChange={(e: any) =>
                                                    setSearchInput({
                                                      ...searchInput,
                                                      [d.name]: e.target.value,
                                                    })
                                                  }
                                                  className={styles.comboboxInput}
                                                />
                                                <Combobox.Options className={styles.comboboxOptions}>
                                                  {toArray(d.options)
                                                    .filter((o: any) =>
                                                      filterSearchInput(
                                                        [o.title, o.value],
                                                        searchInput[d.name]
                                                      )
                                                    )
                                                    .map((o: any, j: number) => (
                                                      <Combobox.Option
                                                        key={j}
                                                        value={o.value}
                                                        className={({
                                                          active,
                                                        }: any) =>
                                                          clsx(
                                                            styles.comboboxOptionBase,
                                                            active
                                                              ? styles.comboboxOptionActive
                                                              : styles.comboboxOptionInactive
                                                          )
                                                        }
                                                      >
                                                        {({
                                                          selected,
                                                          active,
                                                        }: any) => (
                                                          <>
                                                            <span
                                                              className={clsx(
                                                                styles.selectTruncate,
                                                                selected
                                                                  ? styles.optionTextSelected
                                                                  : styles.optionTextNormal
                                                              )}
                                                            >
                                                              {o.title}
                                                            </span>
                                                            {selected && (
                                                              <span
                                                                className={clsx(
                                                                  styles.optionCheckWrapper,
                                                                  active
                                                                    ? styles.optionCheckActive
                                                                    : styles.optionCheckInactive
                                                                )}
                                                              >
                                                                <MdCheck
                                                                  size={20}
                                                                />
                                                              </span>
                                                            )}
                                                          </>
                                                        )}
                                                      </Combobox.Option>
                                                    ))}
                                                </Combobox.Options>
                                              </div>
                                            </Transition>
                                          </div>
                                        );
                                      }}
                                    </Combobox>
                                  ) : (
                                    <Listbox
                                      value={
                                        d.multiple
                                          ? split(params[d.name])
                                          : params[d.name]
                                      }
                                      onChange={(v: any) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? v.join(',')
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }: any) => {
                                        const isSelected = (v: any) =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name]
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter((o: any) =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find((o: any) =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className={styles.relativeWrapper}>
                                            <Listbox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectFlexWrap,
                                                    selectedValue.length !==
                                                      0 && styles.selectFlexWrapMargin
                                                  )}
                                                >
                                                  {selectedValue.length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedValue.map(
                                                      (v: any, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedValue
                                                                  .filter(
                                                                    (v: any) =>
                                                                      v.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (v: any) => v.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className={styles.selectMultiTag}
                                                        >
                                                          {v.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className={styles.selectTruncate}>
                                                  {selectedValue?.title}
                                                </span>
                                              )}
                                              <span className={styles.selectChevronWrapper}>
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className={styles.selectChevronIcon}
                                                />
                                              </span>
                                            </Listbox.Button>
                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave={styles.dropdownLeave}
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className={styles.listboxOptions}>
                                                {toArray(d.options).map(
                                                  (o: any, j: number) => (
                                                    <Listbox.Option
                                                      key={j}
                                                      value={o.value}
                                                      className={({ active }: any) =>
                                                        clsx(
                                                          styles.comboboxOptionBase,
                                                          active
                                                            ? styles.comboboxOptionActive
                                                            : styles.comboboxOptionInactive
                                                        )
                                                      }
                                                    >
                                                      {({
                                                        selected,
                                                        active,
                                                      }: any) => (
                                                        <>
                                                          <span
                                                            className={clsx(
                                                              styles.selectTruncate,
                                                              selected
                                                                ? styles.optionTextSelected
                                                                : styles.optionTextNormal
                                                            )}
                                                          >
                                                            {o.title}
                                                          </span>
                                                          {selected && (
                                                            <span
                                                              className={clsx(
                                                                styles.optionCheckWrapper,
                                                                active
                                                                  ? styles.optionCheckActive
                                                                  : styles.optionCheckInactive
                                                              )}
                                                            >
                                                              <MdCheck
                                                                size={20}
                                                              />
                                                            </span>
                                                          )}
                                                        </>
                                                      )}
                                                    </Listbox.Option>
                                                  )
                                                )}
                                              </Listbox.Options>
                                            </Transition>
                                          </div>
                                        );
                                      }}
                                    </Listbox>
                                  )
                                ) : d.type === 'datetimeRange' ? (
                                  <DateRangePicker
                                    params={params}
                                    onChange={(v: any) =>
                                      setParams({ ...params, ...v })
                                    }
                                  />
                                ) : (
                                  <input
                                    type={d.type || 'text'}
                                    name={d.name}
                                    placeholder={d.label}
                                    value={params[d.name]}
                                    onChange={(e: any) =>
                                      setParams({
                                        ...params,
                                        [d.name]: e.target.value,
                                      })
                                    }
                                    className={styles.textInput}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.filterFooter}>
                        <button
                          type="button"
                          onClick={() => onSubmit(undefined, undefined, {})}
                          className={styles.resetBtn}
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={!filtered}
                          className={clsx(
                            styles.submitBtnBase,
                            filtered
                              ? styles.submitBtnEnabled
                              : styles.submitBtnDisabled
                          )}
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

export const normalizeType = (type: any) =>
  ['wrap', 'unwrap', 'erc20_transfer'].includes(type)
    ? 'deposit_service'
    : type || 'deposit_address';

export function Transfers({ address = undefined }: any) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [refresh, setRefresh] = useState<any>(null);
  const assets = useAssets();

  useEffect(() => {
    const _params = getParams(searchParams, size) as any;

    if (address) {
      _params.address = address;
    }

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [address, searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh)) {
        const sort =
          params.sortBy === 'value' ? { 'send.value': 'desc' } : undefined;

        if (params.from === 0) {
          delete params.from;
        }

        const _params = _.cloneDeep(params);
        delete _params.sortBy;

        const response = await searchTransfers({ ..._params, size, sort });

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: {
            ...((response as any)?.total ||
            (Object.keys(_params).length > 0 &&
              !(
                Object.keys(_params).length === 1 && _params.from !== undefined
              )) ||
            ENVIRONMENT !== 'mainnet'
              ? response
              : searchResults?.[generateKeyByParams(params)]),
          },
        });
        setRefresh(
          !isNumber((response as any)?.total) &&
            !searchResults?.[generateKeyByParams(params)] &&
            ENVIRONMENT === 'mainnet'
            ? true
            : false
        );
      }
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh('true'), 0.5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params)] } as any;

  return (
    <Container className={styles.transfersContainer}>
      <div
        role="alert"
        className={styles.deprecationBanner}
      >
        <PiWarningCircle size={20} aria-hidden="true" />
        <span className={styles.deprecationBannerText}>Legacy Token Transfers are deprecated.</span>
      </div>
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.transfersHeaderRow}>
            <div className={styles.transfersHeaderLeft}>
              <h1 className={styles.transfersTitle}>
                Token Transfers
              </h1>
              <p className={styles.transfersSubtitle}>
                <Number
                  value={total}
                  suffix={` result${total > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className={styles.transfersActions}>
              {!address && <Filters />}
              {refresh && refresh !== 'true' ? (
                <Spinner />
              ) : (
                <Button
                  color="default"
                  circle="true"
                  onClick={() => setRefresh(true)}
                >
                  <MdOutlineRefresh size={20} />
                </Button>
              )}
            </div>
          </div>
          {refresh && refresh !== 'true' && <Overlay />}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.theadTr}>
                  <th
                    scope="col"
                    className={styles.thTxHash}
                  >
                    Tx Hash
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Method
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Source
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Destination
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Status
                  </th>
                  <th
                    scope="col"
                    className={styles.thCreatedAt}
                  >
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {data.map((d: any) => {
                  const assetData = getAssetData(d.send.denom, assets);

                  const { addresses } = { ...assetData } as any;
                  let { symbol, image } = {
                    ...addresses?.[d.send.source_chain],
                  };

                  if (!symbol) {
                    symbol = (assetData as any)?.symbol;
                  }

                  if (!image) {
                    image = (assetData as any)?.image;
                  }

                  if (symbol) {
                    switch (d.type) {
                      case 'wrap':
                        const WRAP_PREFIXES = ['w', 'axl'];
                        const i = WRAP_PREFIXES.findIndex(
                          (p: string) =>
                            toCase(symbol, 'lower').startsWith(p) &&
                            !equalsIgnoreCase(p, symbol)
                        );

                        if (i > -1) {
                          symbol = symbol.substring(WRAP_PREFIXES[i].length);
                        }
                        break;
                      default:
                        break;
                    }
                  }

                  const senderAddress =
                    d.wrap?.sender_address ||
                    d.erc20_transfer?.sender_address ||
                    d.send?.sender_address;
                  const recipientAddress =
                    d.unwrap?.recipient_address || d.link?.recipient_address;

                  return (
                    <tr
                      key={d.send.txhash}
                      className={styles.tr}
                    >
                      <td className={styles.tdTxHash}>
                        <div className={styles.tdTxHashRow}>
                          <Copy value={d.send.txhash}>
                            <Link
                              href={`/transfer/${d.send.txhash}`}
                              target="_blank"
                              className={styles.tdTxHashLink}
                            >
                              {ellipse(d.send.txhash, 4, '0x')}
                            </Link>
                          </Copy>
                          <ExplorerLink
                            value={d.send.txhash}
                            chain={d.send.source_chain}
                          />
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.methodCol}>
                          <Tag className={clsx(styles.tagFitCapitalize)}>
                            {toTitle(normalizeType(d.type))}
                          </Tag>
                          {symbol && (
                            <div className={styles.assetBadge}>
                              <Image
                                src={image}
                                alt=""
                                width={16}
                                height={16}
                              />
                              {isNumber(d.send.amount) && assets ? (
                                <Number
                                  value={
                                    isString(d.send.amount)
                                      ? formatUnits(
                                          d.send.amount,
                                          (assetData as any)?.decimals
                                        )
                                      : d.send.amount
                                  }
                                  format="0,0.000000"
                                  suffix={` ${symbol}`}
                                  className={styles.assetNumberText}
                                />
                              ) : (
                                <span className={styles.assetSymbolText}>
                                  {symbol}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.chainCol}>
                          <ChainProfile
                            value={d.send.source_chain}
                            titleClassName="font-semibold"
                          />
                          <Profile
                            address={senderAddress}
                            chain={d.send.source_chain}
                          />
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.chainCol}>
                          <ChainProfile
                            value={
                              d.send.destination_chain ||
                              d.link?.destination_chain
                            }
                            titleClassName="font-semibold"
                          />
                          <Profile
                            address={recipientAddress}
                            chain={
                              d.send.destination_chain ||
                              d.link?.destination_chain
                            }
                          />
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.statusCol}>
                          {d.simplified_status && (
                            <div className={styles.statusRow}>
                              <Tag
                                className={clsx(
                                  styles.tagFitCapitalize,
                                  ['received'].includes(d.simplified_status)
                                    ? styles.statusTagReceived
                                    : ['approved'].includes(d.simplified_status)
                                      ? styles.statusTagApproved
                                      : ['failed'].includes(d.simplified_status)
                                        ? styles.statusTagFailed
                                        : styles.statusTagDefault
                                )}
                              >
                                {d.simplified_status}
                              </Tag>
                              {['received'].includes(d.simplified_status) && (
                                <ExplorerLink
                                  value={
                                    d.unwrap?.tx_hash_unwrap ||
                                    d.command?.transactionHash ||
                                    d.axelar_transfer?.txhash ||
                                    d.ibc_send?.recv_txhash
                                  }
                                  chain={
                                    d.send.destination_chain ||
                                    d.link?.destination_chain
                                  }
                                />
                              )}
                            </div>
                          )}
                          {d.send.insufficient_fee && (
                            <div className={styles.insufficientFeeRow}>
                              <PiWarningCircle size={16} />
                              <span className={styles.insufficientFeeText}>Insufficient Fee</span>
                            </div>
                          )}
                          {d.time_spent?.total > 0 &&
                            ['received'].includes(d.simplified_status) && (
                              <div className={styles.timeSpentRow}>
                                <MdOutlineTimer size={16} />
                                <TimeSpent
                                  fromTimestamp={0}
                                  toTimestamp={d.time_spent.total * 1000}
                                  className={styles.timeSpentText}
                                />
                              </div>
                            )}
                        </div>
                      </td>
                      <td className={styles.tdCreatedAt}>
                        <TimeAgo timestamp={d.send.created_at?.ms} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > size && (
            <div className={styles.paginationWrapper}>
              <Pagination sizePerPage={size} total={total} />
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
