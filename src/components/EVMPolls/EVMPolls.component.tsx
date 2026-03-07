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
import { IoCheckmarkCircle, IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { searchEVMPolls } from '@/lib/api/validator';
import { getChainData, getAssetData } from '@/lib/config';
import {
  toJson,
  split,
  toArray,
  getValuesOfAxelarAddressKey,
} from '@/lib/parser';
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
  includesSomePatterns,
  ellipse,
  toTitle,
  filterSearchInput,
} from '@/lib/string';
import { isNumber, toNumber, formatUnits, numberFormat } from '@/lib/number';
import { timeDiff } from '@/lib/time';

import type { Chain, FilterOption, FilterAttribute, Validator } from '@/types';

import * as styles from './EVMPolls.styles';

/** Shape of a single vote extracted from poll data via getValuesOfAxelarAddressKey */
interface PollVote {
  voter?: string;
  vote?: boolean;
  confirmed?: boolean;
  id?: string;
  height?: number;
  created_at?: { ms?: number };
  option?: string;
  [key: string]: unknown;
}

/** Aggregated vote option bucket */
interface VoteOption {
  option: string;
  value: number;
  voters?: string[];
  i?: number;
}

/** Confirmation event embedded in a poll record */
interface ConfirmationEvent {
  type?: string;
  txID?: string;
  asset?: string;
  symbol?: string;
  amount?: string | number;
  [key: string]: unknown;
}

/** A single EVM poll record from the API */
interface EVMPollRecord {
  id: string;
  event?: string;
  sender_chain?: string;
  transaction_id?: string;
  transfer_id?: string;
  deposit_address?: string;
  height?: number;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  confirmation?: boolean;
  participants?: string[];
  confirmation_events?: ConfirmationEvent[];
  created_at?: { ms?: number };
  initiated_txhash?: string;
  [key: string]: unknown;
}

/** Enriched poll record after processing */
interface ProcessedPoll extends EVMPollRecord {
  idNumber: number | string;
  status: string;
  confirmation_txhash?: string;
  votes: PollVote[];
  voteOptions: VoteOption[];
  eventName: string;
  url: string;
}

/** Shape of the parsed asset JSON from toJson */
interface AssetJson {
  denom?: string;
  amount?: string | number;
}

/** Search results keyed by parameter hash */
interface SearchResultEntry {
  data: ProcessedPoll[];
  total: number;
}

type SearchResults = Record<string, SearchResultEntry>;

const size = 25;

function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(getParams(searchParams, size));
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const [types, setTypes] = useState<string[]>([]);
  const { handleSubmit } = useForm();
  const chains = useChains();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  useEffect(() => {
    const getTypes = async () => {
      const response = await searchEVMPolls({
        aggs: { types: { terms: { field: 'event.keyword', size: 25 } } },
        size: 0,
      });
      setTypes(toArray(response).map((d) => (d as Record<string, unknown>).key as string));
    };

    getTypes();
  }, []);

  const onSubmit = (_e1: unknown, _e2: unknown, _params?: Record<string, unknown>) => {
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
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains)
          .filter(
            (d: Chain) => d.chain_type === 'evm' && (!d.no_inflation || d.deprecated)
          )
          .map((d: Chain, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map((d) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Event Type',
      name: 'event',
      type: 'select',
      multiple: true,
      options: _.concat(
        { title: 'Any' } as FilterOption,
        types.map(d => ({ value: d, title: toTitle(d, '_', true, true) }))
      ),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      multiple: true,
      options: _.concat(
        { title: 'Any' } as FilterOption,
        ['completed', 'failed', 'expired', 'confirmed', 'pending'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Voter (Broadcaster Address)', name: 'voter' },
    (params.voter as string | undefined)?.startsWith('axelar') && {
      label: 'Vote',
      name: 'vote',
      type: 'select',
      options: _.concat(
        { title: 'Any' } as FilterOption,
        ['yes', 'no', 'unsubmitted'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
    { label: 'Transfer ID', name: 'transferId' },
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
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" onClose={onClose} className={styles.dialogWrapper}>
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={styles.dialogBackdrop} />
          </Transition.Child>
          <div className={styles.dialogOverflowWrapper}>
            <div className={styles.dialogAbsoluteOverflow}>
              <div className={styles.dialogPointerWrapper}>
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className={styles.dialogPanel}>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className={styles.dialogForm}
                    >
                      <div className={styles.dialogScrollArea}>
                        <div className={styles.dialogHeader}>
                          <Dialog.Title className={styles.dialogTitle}>
                            Filter
                          </Dialog.Title>
                          <button
                            type="button"
                            onClick={() => onClose()}
                            className={styles.dialogCloseButton}
                          >
                            <MdClose size={20} />
                          </button>
                        </div>
                        <div className={styles.dialogBody}>
                          {attributes.map((d, i: number) => (
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
                                      onChange={(v: string | string[]) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? (v as string[]).join(',')
                                            : v as string,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const paramValue = params[d.name] as string | undefined;
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(paramValue).includes(v as string)
                                            : v === paramValue ||
                                              equalsIgnoreCase(
                                                v,
                                                paramValue
                                              );
                                        const selectedMulti = d.multiple
                                          ? toArray(d.options).filter((o: FilterOption) =>
                                              isSelected(o.value)
                                            )
                                          : [];
                                        const selectedSingle = !d.multiple
                                          ? toArray(d.options).find((o: FilterOption) =>
                                              isSelected(o.value)
                                            )
                                          : undefined;

                                        return (
                                          <div className={styles.selectRelative}>
                                            <Combobox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectMultiWrapBase,
                                                    selectedMulti.length !==
                                                      0 && styles.selectMultiWrapSelected
                                                  )}
                                                >
                                                  {selectedMulti.length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedMulti.map(
                                                      (v: FilterOption, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedMulti
                                                                  .filter(
                                                                    (_sv: FilterOption) =>
                                                                      _sv.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (_sv: FilterOption) => _sv.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className={styles.selectTag}
                                                        >
                                                          {v.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className={styles.selectTruncate}>
                                                  {selectedSingle?.title}
                                                </span>
                                              )}
                                              <span className={styles.selectIconWrapper}>
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className={styles.selectChevronIcon}
                                                />
                                              </span>
                                            </Combobox.Button>
                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <div className={styles.selectSearchWrapper}>
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
                                                  className={styles.filterInput}
                                                />
                                                <Combobox.Options className={styles.selectOptions}>
                                                  {toArray(d.options)
                                                    .filter((o: FilterOption) =>
                                                      filterSearchInput(
                                                        [o.title, o.value ?? ''],
                                                        searchInput[d.name]
                                                      )
                                                    )
                                                    .map((o: FilterOption, j: number) => (
                                                      <Combobox.Option
                                                        key={j}
                                                        value={o.value ?? ''}
                                                        className={({
                                                          active,
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        }: any) =>
                                                          clsx(
                                                            styles.selectOptionBase,
                                                            active
                                                              ? styles.selectOptionActive
                                                              : styles.selectOptionInactive
                                                          )
                                                        }
                                                      >
                                                        {({
                                                          selected,
                                                          active,
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        }: any) => (
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
                                      onChange={(v: string | string[]) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? (v as string[]).join(',')
                                            : v as string,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const paramValue = params[d.name] as string | undefined;
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(paramValue).includes(v as string)
                                            : v === paramValue ||
                                              equalsIgnoreCase(
                                                v,
                                                paramValue
                                              );
                                        const selectedMulti = d.multiple
                                          ? toArray(d.options).filter((o: FilterOption) =>
                                              isSelected(o.value)
                                            )
                                          : [];
                                        const selectedSingle = !d.multiple
                                          ? toArray(d.options).find((o: FilterOption) =>
                                              isSelected(o.value)
                                            )
                                          : undefined;

                                        return (
                                          <div className={styles.selectRelative}>
                                            <Listbox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectMultiWrapBase,
                                                    selectedMulti.length !==
                                                      0 && styles.selectMultiWrapSelected
                                                  )}
                                                >
                                                  {selectedMulti.length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedMulti.map(
                                                      (v: FilterOption, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedMulti
                                                                  .filter(
                                                                    (_sv: FilterOption) =>
                                                                      _sv.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (_sv: FilterOption) => _sv.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className={styles.selectTag}
                                                        >
                                                          {v.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className={styles.selectTruncate}>
                                                  {selectedSingle?.title}
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
                                                {toArray(d.options).map(
                                                  (o: FilterOption, j: number) => (
                                                    <Listbox.Option
                                                      key={j}
                                                      value={o.value}
                                                      className={({
                                                        active,
                                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                      }: any) =>
                                                        clsx(
                                                          styles.selectOptionBase,
                                                          active
                                                            ? styles.selectOptionActive
                                                            : styles.selectOptionInactive
                                                        )
                                                      }
                                                    >
                                                      {({
                                                        selected,
                                                        active,
                                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                      }: any) => (
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
                                    onChange={(v: Record<string, unknown>) =>
                                      setParams({ ...params, ...v })
                                    }
                                  />
                                ) : (
                                  <input
                                    type={d.type || 'text'}
                                    name={d.name}
                                    placeholder={d.label}
                                    value={(params[d.name] as string) ?? ''}
                                    onChange={e =>
                                      setParams({
                                        ...params,
                                        [d.name]: e.target.value,
                                      })
                                    }
                                    className={styles.filterInput}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.filterActionsWrapper}>
                        <button
                          type="button"
                          onClick={() => onSubmit(undefined, undefined, {})}
                          className={styles.resetButton}
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={!filtered}
                          className={clsx(
                            styles.submitButtonBase,
                            filtered
                              ? styles.submitButtonEnabled
                              : styles.submitButtonDisabled
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

export function EVMPolls() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh)) {
        const response = await searchEVMPolls({ ...params, size }) as Record<string, unknown> | null;
        const { data: rawData, total } = { ...response } as { data?: unknown; total?: number };

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: {
            data: _.orderBy(
              toArray(rawData as EVMPollRecord[]).map((d: EVMPollRecord) => {
                const votes: PollVote[] = getValuesOfAxelarAddressKey(d).map((v) => {
                  const vote = v as PollVote;
                  return {
                    ...vote,
                    option: vote.vote
                      ? 'yes'
                      : typeof vote.vote === 'boolean'
                        ? 'no'
                        : 'unsubmitted',
                  };
                });

                const voteOptions: VoteOption[] = Object.entries(_.groupBy(votes, 'option'))
                  .map(([k, v]: [string, PollVote[]]) => ({
                    option: k,
                    value: v?.length,
                    voters: toArray(v?.map((item: PollVote) => item.voter)),
                  }))
                  .filter((v) => v.value)
                  .map((v) => ({
                    ...v,
                    i: v.option === 'yes' ? 0 : v.option === 'no' ? 1 : 2,
                  }));

                // add unsubmitted option
                if (
                  toArray(d.participants).length > 0 &&
                  voteOptions.findIndex((v) => v.option === 'unsubmitted') < 0 &&
                  _.sumBy(voteOptions, 'value') < (d.participants as string[]).length
                ) {
                  voteOptions.push({
                    option: 'unsubmitted',
                    value:
                      (d.participants as string[]).length - _.sumBy(voteOptions, 'value'),
                  });
                }

                let eventName = split(d.event, {
                  delimiter: '_',
                  toCase: 'lower',
                }).join('_');

                // set eventName and transaction ID from confirmation events
                if (d.confirmation_events) {
                  const { type, txID } = { ...d.confirmation_events[0] };

                  switch (type) {
                    case 'depositConfirmation':
                      if (!eventName) {
                        eventName = 'Transfer';
                      }
                      break;
                    case 'ContractCallApproved':
                      if (!eventName) {
                        eventName = 'ContractCall';
                      }
                      break;
                    case 'ContractCallApprovedWithMint':
                    case 'ContractCallWithMintApproved':
                      if (!eventName) {
                        eventName = 'ContractCallWithToken';
                      }
                      break;
                    default:
                      eventName = type || '';
                      break;
                  }

                  if (!d.transaction_id) {
                    d.transaction_id = txID;
                  }
                }

                const chainExplorer = getChainData(d.sender_chain, chains)?.explorer;
                const { url, transaction_path } = { ...chainExplorer };
                const txhashConfirm = votes.find((v: PollVote) => v.confirmed)?.id;

                return {
                  ...d,
                  idNumber: isNumber(d.id) ? toNumber(d.id) : d.id,
                  status: d.success
                    ? 'completed'
                    : d.failed
                      ? 'failed'
                      : d.expired
                        ? 'expired'
                        : d.confirmation || txhashConfirm
                          ? 'confirmed'
                          : 'pending',
                  height: _.minBy(votes, 'height')?.height || d.height,
                  confirmation_txhash: txhashConfirm,
                  votes: _.orderBy(
                    votes,
                    ['height', 'created_at'],
                    ['desc', 'desc']
                  ),
                  voteOptions: _.orderBy(voteOptions, ['i'], ['asc']),
                  eventName: d.event
                    ? toTitle(eventName, '_', true, true)
                    : eventName,
                  url: includesSomePatterns(eventName, [
                    'operator',
                    'token_deployed',
                  ])
                    ? `${url}${transaction_path?.replace('{tx}', d.transaction_id || '')}`
                    : `/${includesSomePatterns(eventName, ['contract_call', 'ContractCall']) || !(includesSomePatterns(eventName, ['transfer', 'Transfer']) || d.deposit_address) ? 'gmp' : 'transfer'}/${d.transaction_id ? d.transaction_id : d.transfer_id ? `?transferId=${d.transfer_id}` : ''}`,
                } as ProcessedPoll;
              }),
              ['idNumber', 'created_at.ms'],
              ['desc', 'desc']
            ),
            total: total || 0,
          },
        });
        setRefresh(false);
      }
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh, chains]);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params ?? {})] };

  return (
    <Container className={styles.containerClass}>
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.headerRow}>
            <div className={styles.headerAuto}>
              <div className={styles.headingRow}>
                <h1 className={styles.pageTitle}>
                  EVM Polls
                </h1>
                <span className={styles.titleSeparator}>|</span>
                <Link
                  href="/amplifier-polls"
                  className={styles.amplifierLink}
                >
                  Amplifier Polls
                </Link>
              </div>
              <p className={styles.resultText}>
                <Number
                  value={total}
                  suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className={styles.actionsRow}>
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
                <tr className={styles.theadRow}>
                  <th
                    scope="col"
                    className={styles.thFirst}
                  >
                    ID
                  </th>
                  <th scope="col" className={styles.thMiddle}>
                    Chain
                  </th>
                  <th scope="col" className={styles.thMiddle}>
                    Event
                  </th>
                  <th scope="col" className={styles.thMiddle}>
                    Height
                  </th>
                  <th scope="col" className={styles.thMiddle}>
                    Status
                  </th>
                  <th scope="col" className={styles.thMiddle}>
                    Participations
                  </th>
                  <th
                    scope="col"
                    className={styles.thLast}
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {data.map((d: ProcessedPoll) => {
                  const chainData = getChainData(d.sender_chain, chains);
                  const chain = chainData?.id;
                  const { url, transaction_path } = { ...chainData?.explorer };

                  const totalParticipantsPower = _.sumBy(
                    toArray(validators).filter(
                      (val: Validator) =>
                        true ||
                        toArray(d.participants).includes(val.operator_address)
                    ),
                    'quadratic_voting_power'
                  );

                  const eventElement = (
                    <Tag className={clsx(styles.eventTagBase)}>{d.eventName}</Tag>
                  );

                  return (
                    <tr
                      key={d.id}
                      className={styles.tr}
                    >
                      <td className={styles.tdFirst}>
                        <div className={styles.pollIdWrapper}>
                          <Copy value={d.id}>
                            <Link
                              href={`/evm-poll/${d.id}`}
                              target="_blank"
                              className={styles.pollLink}
                            >
                              {ellipse(d.id)}
                            </Link>
                          </Copy>
                          {d.transaction_id && (
                            <div className={styles.txIdRow}>
                              <Copy value={d.transaction_id}>
                                <Link
                                  href={`${url}${transaction_path?.replace('{tx}', d.transaction_id)}`}
                                  target="_blank"
                                  className={styles.pollLink}
                                >
                                  {ellipse(d.transaction_id)}
                                </Link>
                              </Copy>
                              <ExplorerLink
                                value={d.transaction_id}
                                chain={d.sender_chain}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdMiddle}>
                        <ChainProfile value={d.sender_chain} />
                      </td>
                      <td className={styles.tdMiddle}>
                        <div className={styles.eventWrapper}>
                          {d.eventName &&
                            (d.url ? (
                              <Link href={d.url} target="_blank">
                                {eventElement}
                              </Link>
                            ) : (
                              eventElement
                            ))}
                          {toArray(d.confirmation_events).map((e: ConfirmationEvent, i: number) => {
                            let { asset, symbol, amount } = { ...e };

                            // asset is object { denom, amount }
                            const assetObj = toJson<AssetJson>(asset);

                            if (assetObj) {
                              asset = assetObj.denom;
                              amount = assetObj.amount;
                            }

                            // asset data
                            const assetData = getAssetData(
                              asset || symbol,
                              assets
                            );
                            const { decimals, addresses } = { ...assetData };
                            let { image } = { ...assetData };

                            if (assetData) {
                              const chainAddresses = chain ? addresses?.[chain] : undefined;
                              symbol =
                                chainAddresses?.symbol ||
                                assetData.symbol ||
                                symbol;
                              image = image =
                                chainAddresses?.image || image;
                            }

                            const element = symbol && (
                              <div className={styles.assetPill}>
                                <Image
                                  src={image}
                                  alt=""
                                  width={16}
                                  height={16}
                                />
                                {amount && assets ? (
                                  <Number
                                    value={formatUnits(String(amount), decimals)}
                                    format="0,0.000000"
                                    suffix={` ${symbol}`}
                                    className={styles.assetText}
                                  />
                                ) : (
                                  <span className={styles.assetText}>
                                    {symbol}
                                  </span>
                                )}
                              </div>
                            );

                            return (
                              element &&
                              (d.url ? (
                                <Link key={i} href={d.url} target="_blank">
                                  {element}
                                </Link>
                              ) : (
                                <div key={i}>{element}</div>
                              ))
                            );
                          })}
                        </div>
                      </td>
                      <td className={styles.tdMiddle}>
                        {d.height && (
                          <Link
                            href={`/block/${d.height}`}
                            target="_blank"
                            className={styles.blockLink}
                          >
                            <Number value={d.height} />
                          </Link>
                        )}
                      </td>
                      <td className={styles.tdMiddle}>
                        <div className={styles.statusWrapper}>
                          {d.status && (
                            <Tag
                              className={clsx(
                                styles.statusTagBase,
                                ['completed'].includes(d.status)
                                  ? styles.statusTagCompleted
                                  : ['confirmed'].includes(d.status)
                                    ? styles.statusTagConfirmed
                                    : ['failed'].includes(d.status)
                                      ? styles.statusTagFailed
                                      : ['expired'].includes(d.status)
                                        ? styles.statusTagExpired
                                        : styles.statusTagPending
                              )}
                            >
                              {d.status}
                            </Tag>
                          )}
                          <div className={styles.statusLinksWrapper}>
                            {d.initiated_txhash && (
                              <Link
                                href={`/tx/${d.initiated_txhash}`}
                                target="_blank"
                                className={styles.statusLinkRow}
                              >
                                <IoCheckmarkCircle
                                  size={18}
                                  className={styles.statusIconGreen}
                                />
                                <span className={styles.statusLabelMuted}>
                                  Initiated
                                </span>
                              </Link>
                            )}
                            {d.confirmation_txhash && (
                              <Link
                                href={`/tx/${d.confirmation_txhash}`}
                                target="_blank"
                                className={styles.statusLinkRow}
                              >
                                <IoCheckmarkDoneCircle
                                  size={18}
                                  className={styles.statusIconGreen}
                                />
                                <span className={styles.statusLabelGreen}>
                                  Confirmation
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={styles.tdMiddle}>
                        <Link
                          href={`/evm-poll/${d.id}`}
                          target="_blank"
                          className={styles.participationLink}
                        >
                          {d.voteOptions.map((v: VoteOption, i: number) => {
                            const totalVotersPower = _.sumBy(
                              toArray(validators).filter((val: Validator) =>
                                val.broadcaster_address != null &&
                                toArray(v.voters).includes(
                                  val.broadcaster_address
                                )
                              ),
                              'quadratic_voting_power'
                            );

                            const powerDisplay =
                              totalVotersPower > 0 && totalParticipantsPower > 0
                                ? `${numberFormat(totalVotersPower, '0,0.0a')} (${numberFormat((totalVotersPower * 100) / totalParticipantsPower, '0,0.0')}%)`
                                : '';
                            const isDisplayPower =
                              powerDisplay &&
                              timeDiff(d.created_at?.ms, 'days') < 3;

                            return (
                              <Number
                                key={i}
                                value={v.value}
                                format="0,0"
                                suffix={` ${toTitle(v.option.substring(0, ['unsubmitted'].includes(v.option) ? 2 : 1))}${isDisplayPower ? `: ${powerDisplay}` : ''}`}
                                noTooltip={true}
                                className={clsx(
                                  styles.voteOptionBase,
                                  ['no'].includes(v.option)
                                    ? styles.voteOptionNo
                                    : ['yes'].includes(v.option)
                                      ? styles.voteOptionYes
                                      : styles.voteOptionUnsubmitted
                                )}
                              />
                            );
                          })}
                        </Link>
                      </td>
                      <td className={styles.tdLast}>
                        <TimeAgo timestamp={d.created_at?.ms} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(total ?? 0) > size && (
            <div className={styles.paginationWrapper}>
              <Pagination sizePerPage={size} total={total ?? 0} />
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
