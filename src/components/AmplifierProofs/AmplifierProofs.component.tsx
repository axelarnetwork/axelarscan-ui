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
} from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import type { Chain } from '@/types';
import { useChains } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { split, toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import {
  getParams,
  getQueryString,
  generateKeyByParams,
  isFiltered,
} from '@/lib/operator';
import {
  equalsIgnoreCase,
  capitalize,
  toBoolean,
  headString,
  ellipse,
  toTitle,
  filterSearchInput,
  removeHexPrefix,
} from '@/lib/string';

import * as styles from './AmplifierProofs.styles';

const size = 25;

interface FilterOption {
  value?: string;
  title: string;
}

interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  searchable?: boolean;
  multiple?: boolean;
  options?: FilterOption[];
}

interface SignEntry {
  signer?: string;
  sign?: boolean;
  height?: number;
  created_at?: { ms?: number };
  option: string;
  [key: string]: unknown;
}

interface SignOptionEntry {
  option: string;
  value: number | undefined;
  signers: string[] | undefined;
  i: number;
}

interface MessageEntry {
  id?: string;
  message_id?: string;
  source_chain?: string;
  chain?: string;
  [key: string]: unknown;
}

interface AmplifierProofEntry {
  id: string;
  chain?: string;
  destination_chain?: string;
  session_id?: string;
  gateway_txhash?: string;
  multisig_prover_contract_address?: string;
  multisig_contract_address?: string;
  message_ids?: MessageEntry[];
  message_id?: string;
  source_chain?: string;
  height?: number;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  expired_height?: number;
  participants?: string[];
  status: string;
  signs: SignEntry[];
  signOptions: SignOptionEntry[];
  created_at?: { ms?: number };
  [key: string]: unknown;
}

interface BlockData {
  latest_block_height?: number;
  [key: string]: unknown;
}

interface SearchResult {
  data: AmplifierProofEntry[];
  total: number;
}

function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(getParams(searchParams, size));
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const { handleSubmit } = useForm();
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
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" onClose={onClose} className={styles.filterDialogRoot}>
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
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
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
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
                          {attributes.map((d, i) => (
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
                                          : (params[d.name] as string)
                                      }
                                      onChange={(v: string | string[]) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? (v as string[]).join(',')
                                            : v,
                                        })
                                      }
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      multiple={d.multiple as any}
                                    >
                                      {({ open: isOpen }) => {
                                        const paramValue = params[d.name] as string | undefined;
                                        const isSelected = (v: string) =>
                                          d.multiple
                                            ? split(paramValue).includes(v)
                                            : v === paramValue ||
                                              equalsIgnoreCase(
                                                v,
                                                paramValue
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter((o: FilterOption) =>
                                              isSelected(o.value ?? '')
                                            )
                                          : toArray(d.options).find((o: FilterOption) =>
                                              isSelected(o.value ?? '')
                                            );

                                        return (
                                          <div className="relative">
                                            <Combobox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectFlexWrap,
                                                    (selectedValue as FilterOption[]).length !==
                                                      0 && styles.selectFlexWrapMargin
                                                  )}
                                                >
                                                  {(selectedValue as FilterOption[]).length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    (selectedValue as FilterOption[]).map(
                                                      (v: FilterOption, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                (selectedValue as FilterOption[])
                                                                  .filter(
                                                                    (_v: FilterOption) =>
                                                                      _v.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (_v: FilterOption) => _v.value
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
                                                  {(selectedValue as FilterOption | undefined)?.title}
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
                                              show={isOpen}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <div className={styles.comboboxDropdownWrapper}>
                                                <Combobox.Input
                                                  placeholder={`Search ${d.label}`}
                                                  value={
                                                    searchInput[d.name] || ''
                                                  }
                                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setSearchInput({
                                                      ...searchInput,
                                                      [d.name]: e.target.value,
                                                    })
                                                  }
                                                  className={styles.comboboxInput}
                                                />
                                                <Combobox.Options className={styles.comboboxOptions}>
                                                  {toArray(d.options)
                                                    .filter((o: FilterOption) =>
                                                      filterSearchInput(
                                                        [o.title, o.value].filter(Boolean) as string[],
                                                        searchInput[d.name]
                                                      )
                                                    )
                                                    .map((o: FilterOption, j: number) => (
                                                      <Combobox.Option
                                                        key={j}
                                                        value={o.value}
                                                        className={({
                                                          active,
                                                        }: { active: boolean }) =>
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
                                                        }: { selected: boolean; active: boolean }) => (
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
                                          : (params[d.name] as string)
                                      }
                                      onChange={(v: string | string[]) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? (v as string[]).join(',')
                                            : v,
                                        })
                                      }
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      multiple={d.multiple as any}
                                    >
                                      {({ open: isOpen }) => {
                                        const paramValue = params[d.name] as string | undefined;
                                        const isSelected = (v: string) =>
                                          d.multiple
                                            ? split(paramValue).includes(v)
                                            : v === paramValue ||
                                              equalsIgnoreCase(
                                                v,
                                                paramValue
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter((o: FilterOption) =>
                                              isSelected(o.value ?? '')
                                            )
                                          : toArray(d.options).find((o: FilterOption) =>
                                              isSelected(o.value ?? '')
                                            );

                                        return (
                                          <div className="relative">
                                            <Listbox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectFlexWrap,
                                                    (selectedValue as FilterOption[]).length !==
                                                      0 && styles.selectFlexWrapMargin
                                                  )}
                                                >
                                                  {(selectedValue as FilterOption[]).length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    (selectedValue as FilterOption[]).map(
                                                      (v: FilterOption, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                (selectedValue as FilterOption[])
                                                                  .filter(
                                                                    (_v: FilterOption) =>
                                                                      _v.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (_v: FilterOption) => _v.value
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
                                                  {(selectedValue as FilterOption | undefined)?.title}
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
                                              show={isOpen}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className={styles.listboxOptions}>
                                                {toArray(d.options).map(
                                                  (o: FilterOption, j: number) => (
                                                    <Listbox.Option
                                                      key={j}
                                                      value={o.value}
                                                      className={({ active }: { active: boolean }) =>
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
                                                      }: { selected: boolean; active: boolean }) => (
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
                                    onChange={(v: { fromTime: number | undefined; toTime: number | undefined }) =>
                                      setParams({ ...params, ...v })
                                    }
                                  />
                                ) : (
                                  <input
                                    type={d.type || 'text'}
                                    name={d.name}
                                    placeholder={d.label}
                                    value={(params[d.name] as string) ?? ''}
                                    onChange={(e) =>
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

export function AmplifierProofs() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<string, SearchResult> | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const chains = useChains();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus() as BlockData);
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh) && blockData) {
        const response = await searchAmplifierProofs({ ...params, size }) as
          Record<string, unknown> | undefined;
        const { data, total } = {
          ...(response as { data?: unknown[]; total?: number }),
        };

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: {
            data: _.orderBy(
              toArray(data).map((d) => {
                const rawEntry = d as Record<string, unknown>;
                const signs = getValuesOfAxelarAddressKey(rawEntry).map((s) => {
                  const entry = s as Record<string, unknown>;
                  return {
                    ...entry,
                    signer: entry.signer as string | undefined,
                    sign: entry.sign as boolean | undefined,
                    height: entry.height as number | undefined,
                    created_at: entry.created_at as { ms?: number } | undefined,
                    option: entry.sign ? 'signed' : 'unsubmitted',
                  } as SignEntry;
                });

                const signOptions: SignOptionEntry[] = Object.entries(_.groupBy(signs, 'option'))
                  .map(([k, v]) => ({
                    option: k,
                    value: v?.length,
                    signers: toArray(v?.map((entry: SignEntry) => entry.signer)) as string[],
                  }))
                  .filter((s) => s.value)
                  .map((s) => ({
                    ...s,
                    i: s.option === 'signed' ? 0 : 1,
                  }));

                const participants = rawEntry.participants as string[] | undefined;
                // add unsubmitted option
                if (
                  toArray(participants).length > 0 &&
                  signOptions.findIndex((s) => s.option === 'unsubmitted') < 0 &&
                  _.sumBy(signOptions, 'value') < toArray(participants).length
                ) {
                  signOptions.push({
                    option: 'unsubmitted',
                    value:
                      toArray(participants).length - _.sumBy(signOptions, 'value'),
                    signers: undefined,
                    i: 1,
                  });
                }

                return {
                  ...rawEntry,
                  status: rawEntry.success
                    ? 'completed'
                    : rawEntry.failed
                      ? 'failed'
                      : rawEntry.expired ||
                          (rawEntry.expired_height as number) < (blockData?.latest_block_height ?? 0)
                        ? 'expired'
                        : 'pending',
                  height: _.minBy(signs, 'height')?.height || rawEntry.height,
                  signs: _.orderBy(
                    signs,
                    ['height', 'created_at'],
                    ['desc', 'desc']
                  ),
                  signOptions: _.orderBy(signOptions, ['i'], ['asc']),
                } as AmplifierProofEntry;
              }),
              ['created_at.ms'],
              ['desc']
            ),
            total: total ?? 0,
          },
        });
        setRefresh(false);
      }
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh, blockData]);

  const { data, total = 0 } = { ...searchResults?.[generateKeyByParams(params!)] };

  return (
    <Container className={styles.proofsContainer}>
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.proofsHeaderRow}>
            <div className={styles.proofsHeaderLeft}>
              <div className={styles.proofsNavLinks}>
                <Link
                  href="/evm-batches"
                  className={styles.evmBatchesLink}
                >
                  EVM Batches
                </Link>
                <span className={styles.navDivider}>|</span>
                <h1 className={styles.proofsTitle}>
                  Amplifier Proofs
                </h1>
              </div>
              <p className={styles.proofsSubtitle}>
                <Number
                  value={total}
                  suffix={` result${total > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className={styles.proofsActions}>
              <Filters />
              {refresh ? (
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
          {refresh && <Overlay />}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.theadTr}>
                  <th
                    scope="col"
                    className={styles.thSessionId}
                  >
                    Session ID
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Messages
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Height
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Status
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Participations
                  </th>
                  <th
                    scope="col"
                    className={styles.thTime}
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {data.map((d: AmplifierProofEntry) => {
                  const chain = d.chain || d.destination_chain;

                  return (
                    <tr
                      key={d.id}
                      className={styles.tr}
                    >
                      <td className={styles.tdSessionId}>
                        <div className={styles.flexColGapSmall}>
                          <div className={styles.flexItemsGap1}>
                            <Copy value={`${chain}-${d.session_id}`}>
                              <Link
                                href={`/amplifier-proof/${d.id}`}
                                target="_blank"
                                className={styles.linkBlue}
                              >
                                {chain}-{d.session_id}
                              </Link>
                            </Copy>
                            {d.gateway_txhash && (
                              <ExplorerLink
                                value={d.gateway_txhash}
                                chain={chain}
                              />
                            )}
                          </div>
                          {d.multisig_prover_contract_address && (
                            <div className={styles.flexItems}>
                              <Tooltip
                                content="Multisig Prover Contract"
                                className={styles.tooltipWhitespace}
                              >
                                <Copy
                                  value={d.multisig_prover_contract_address}
                                >
                                  {ellipse(d.multisig_prover_contract_address)}
                                </Copy>
                              </Tooltip>
                            </div>
                          )}
                          {d.multisig_contract_address && (
                            <div className={styles.flexItems}>
                              <Tooltip
                                content="Multisig Contract"
                                className={styles.tooltipWhitespace}
                              >
                                <Copy value={d.multisig_contract_address}>
                                  {ellipse(d.multisig_contract_address)}
                                </Copy>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.flexColGapSmall}>
                          {toArray(
                            d.message_ids || {
                              message_id: d.message_id,
                              source_chain: d.source_chain,
                            }
                          ).map((m: MessageEntry, i: number) => {
                            if (!m.message_id) {
                              m.message_id = m.id;
                            }

                            if (!m.source_chain) {
                              m.source_chain = m.chain;
                            }

                            const { url, transaction_path } = {
                              ...getChainData(m.source_chain, chains)?.explorer,
                            };

                            return (
                              <div
                                key={i}
                                className={styles.flexItemsGap4}
                              >
                                <ChainProfile value={m.source_chain} />
                                <div className={styles.flexItemsGap1}>
                                  <Copy value={removeHexPrefix(m.message_id)}>
                                    <Link
                                      href={`${url}${transaction_path?.replace('{tx}', headString(removeHexPrefix(m.message_id)) ?? '')}`}
                                      target="_blank"
                                      className={styles.linkBlue}
                                    >
                                      {ellipse(
                                        removeHexPrefix(m.message_id)
                                      ).toUpperCase()}
                                    </Link>
                                  </Copy>
                                  <ExplorerLink
                                    value={headString(
                                      removeHexPrefix(m.message_id)
                                    )}
                                    chain={m.source_chain}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        {d.height && (
                          <Link
                            href={`/block/${d.height}`}
                            target="_blank"
                            className={styles.linkBlueMedium}
                          >
                            <Number value={d.height} />
                          </Link>
                        )}
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.flexColGap1}>
                          {d.status && (
                            <Tag
                              className={clsx(
                                styles.statusTagBase,
                                ['completed'].includes(d.status)
                                  ? styles.statusCompleted
                                  : ['failed'].includes(d.status)
                                    ? styles.statusFailed
                                    : ['expired'].includes(d.status)
                                      ? styles.statusExpired
                                      : styles.statusPending
                              )}
                            >
                              {d.status}
                            </Tag>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <Link
                          href={`/amplifier-proof/${d.id}`}
                          target="_blank"
                          className={styles.linkFitItems}
                        >
                          {d.signOptions.map((s: SignOptionEntry, i: number) => (
                            <Number
                              key={i}
                              value={s.value}
                              format="0,0"
                              suffix={` ${toTitle(s.option.substring(0, ['unsubmitted'].includes(s.option) ? 2 : undefined))}`}
                              noTooltip={true}
                              className={clsx(
                                styles.signOptionBase,
                                ['signed'].includes(s.option)
                                  ? styles.signOptionSigned
                                  : styles.signOptionOther
                              )}
                            />
                          ))}
                        </Link>
                      </td>
                      <td className={styles.tdTime}>
                        <TimeAgo timestamp={d.created_at?.ms} />
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
