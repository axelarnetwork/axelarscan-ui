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
import { ExplorerLink, buildExplorerURL } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useChains } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
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
  ellipse,
  toTitle,
  filterSearchInput,
} from '@/lib/string';
import type { Chain } from '@/types';
import * as styles from './AmplifierPolls.styles';

interface SelectOption {
  value?: string;
  title: string;
}

interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  multiple?: boolean;
  searchable?: boolean;
  options?: SelectOption[];
}

interface PollVoteOption {
  option: string;
  value: number;
  voters?: string[];
  i?: number;
}

interface AmplifierPollEntry {
  id: string;
  poll_id?: string;
  contract_address?: string;
  transaction_id?: string;
  sender_chain?: string;
  status?: string;
  height?: number;
  participants?: string[];
  voteOptions?: PollVoteOption[];
  created_at?: { ms?: number };
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  expired_height?: number;
  [key: string]: unknown;
}

interface PollVote {
  voter?: string;
  vote?: boolean;
  height?: number;
  option?: string;
  [key: string]: unknown;
}

const size = 25;

function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(getParams(searchParams, size));
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const { handleSubmit } = useForm();
  const chains = useChains();

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
            (d: Chain) => d.chain_type === 'vm' && (!d.no_inflation || d.deprecated)
          )
          .map((d: Chain, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
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
        ['completed', 'failed', 'pending'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Voter (Verifier Address)', name: 'voter' },
    params.voter && {
      label: 'Vote',
      name: 'vote',
      type: 'select',
      options: _.concat(
        { title: 'Any', value: undefined as string | undefined },
        ['yes', 'no', 'unsubmitted'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ]);

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
            enter={styles.transitionEnter}
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave={styles.transitionEnter}
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
                  enter={styles.transitionEnter}
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave={styles.transitionEnter}
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
                          {(attributes as FilterAttribute[]).map((d: FilterAttribute, i: number) => (
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
                                            : v,
                                        })
                                      }
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      multiple={d.multiple as any}
                                    >
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {(({ open: isOpen }: any) => {
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(params[d.name] as string).includes(v ?? '')
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name] as string
                                              );
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const selectedValue: any = d.multiple
                                          ? toArray(d.options).filter((o: SelectOption) =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find((o: SelectOption) =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className={styles.selectRelative}>
                                            <Combobox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectMultiWrapBase,
                                                    selectedValue.length !==
                                                      0 && styles.selectMultiWrapSelected
                                                  )}
                                                >
                                                  {selectedValue.length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedValue.map(
                                                      (v: SelectOption, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                (selectedValue as SelectOption[])
                                                                  .filter(
                                                                    (_v: SelectOption) =>
                                                                      _v.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (_v: SelectOption) => _v.value
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
                                                  {selectedValue?.title}
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
                                              show={isOpen}
                                              as={Fragment}
                                              leave={styles.transitionLeave}
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
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    .filter((o: any) =>
                                                      filterSearchInput(
                                                        [o.title, o.value],
                                                        searchInput[d.name] || ''
                                                      )
                                                    )
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    .map((o: any, j: number) => (
                                                      <Combobox.Option
                                                        key={j}
                                                        value={o.value}
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      }) as any}
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
                                            : v,
                                        })
                                      }
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      multiple={d.multiple as any}
                                    >
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {(({ open: isOpen }: any) => {
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(params[d.name] as string).includes(v ?? '')
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name] as string
                                              );
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const selectedValue: any = d.multiple
                                          ? toArray(d.options).filter((o: SelectOption) =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find((o: SelectOption) =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className={styles.selectRelative}>
                                            <Listbox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectMultiWrapBase,
                                                    selectedValue.length !==
                                                      0 && styles.selectMultiWrapSelected
                                                  )}
                                                >
                                                  {selectedValue.length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedValue.map(
                                                      (v: SelectOption, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                (selectedValue as SelectOption[])
                                                                  .filter(
                                                                    (_v: SelectOption) =>
                                                                      _v.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (_v: SelectOption) => _v.value
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
                                              show={isOpen}
                                              as={Fragment}
                                              leave={styles.transitionLeave}
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className={styles.selectOptions}>
                                                {toArray(d.options).map(
                                                  (o: SelectOption, j: number) => (
                                                    <Listbox.Option
                                                      key={j}
                                                      value={o.value}
                                                      className={({ active }: { active: boolean }) =>
                                                        clsx(
                                                          styles.selectOptionBase,
                                                          active
                                                            ? styles.selectOptionActive
                                                            : styles.selectOptionInactive
                                                        )
                                                      }
                                                    >
                                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      }) as any}
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
                                    value={params[d.name] as string | undefined}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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

export function AmplifierPolls() {
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<string, { data: AmplifierPollEntry[]; total: number }> | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [blockData, setBlockData] = useState<{ latest_block_height?: number; [key: string]: unknown } | null>(null);
  const chains = useChains();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus() as Record<string, unknown>);
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh) && blockData) {
        const response = await searchAmplifierPolls({ ...params, size }) as { data?: AmplifierPollEntry[]; total?: number } | undefined;
        const { data, total } = { ...response };

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: {
            data: _.orderBy(
              (toArray(data) as AmplifierPollEntry[]).map(d => {
                const votes = (getValuesOfAxelarAddressKey(d as unknown as Record<string, unknown>) as PollVote[]).map(v => ({
                  ...v,
                  option: v.vote
                    ? 'yes'
                    : typeof v.vote === 'boolean'
                      ? 'no'
                      : 'unsubmitted',
                }));

                const voteOptions: PollVoteOption[] = Object.entries(_.groupBy(votes, 'option'))
                  .map(([k, v]) => ({
                    option: k,
                    value: v?.length,
                    voters: (v?.map(item => item.voter)).filter(Boolean) as string[],
                  }))
                  .filter(v => v.value)
                  .map(v => ({
                    ...v,
                    i: v.option === 'yes' ? 0 : v.option === 'no' ? 1 : 2,
                  }));

                // add unsubmitted option
                if (
                  toArray(d.participants).length > 0 &&
                  voteOptions.findIndex(v => v.option === 'unsubmitted') < 0 &&
                  _.sumBy(voteOptions, 'value') < (d.participants?.length ?? 0)
                ) {
                  voteOptions.push({
                    option: 'unsubmitted',
                    value:
                      (d.participants?.length ?? 0) - _.sumBy(voteOptions, 'value'),
                  });
                }

                return {
                  ...d,
                  status: d.success
                    ? 'completed'
                    : d.failed
                      ? 'failed'
                      : d.expired ||
                          (d.expired_height ?? 0) < (blockData.latest_block_height ?? 0)
                        ? 'expired'
                        : 'pending',
                  height: _.minBy(votes, 'height')?.height || d.height,
                  votes: _.orderBy(
                    votes,
                    ['height', 'created_at'],
                    ['desc', 'desc']
                  ),
                  voteOptions: _.orderBy(voteOptions, ['i'], ['asc']),
                  url: `/gmp/${d.transaction_id || 'search'}`,
                } as AmplifierPollEntry;
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
  }, [params, setSearchResults, refresh, setRefresh, blockData, chains]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, total } = { ...searchResults?.[generateKeyByParams(params as any)] };

  return (
    <Container className={styles.containerClass}>
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.headerRow}>
            <div className={styles.headerAuto}>
              <div className={styles.headingRow}>
                <Link
                  href="/evm-polls"
                  className={styles.evmPollsLink}
                >
                  EVM Polls
                </Link>
                <span className={styles.titleSeparator}>|</span>
                <h1 className={styles.pageTitle}>
                  Amplifier Polls
                </h1>
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
                {data.map((d: AmplifierPollEntry) => {
                  const explorer = {
                    ...getChainData(d.sender_chain, chains)?.explorer,
                  };
                  const txHref = buildExplorerURL({
                    value: d.transaction_id,
                    type: 'tx',
                    useContractLink: false,
                    hasEventLog: false,
                    explorer,
                  });

                  return (
                    <tr
                      key={d.id}
                      className={styles.tr}
                    >
                      <td className={styles.tdFirst}>
                        <div className={styles.cellColumn}>
                          <Copy value={d.poll_id}>
                            <Link
                              href={`/amplifier-poll/${d.id}`}
                              target="_blank"
                              className={styles.pollLink}
                            >
                              {d.poll_id}
                            </Link>
                          </Copy>
                          {d.transaction_id && (
                            <div className={styles.txRow}>
                              <Copy value={d.transaction_id}>
                                <Link
                                  href={txHref}
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
                        <div className={styles.cellColumn}>
                          <ChainProfile value={d.sender_chain} />
                          {d.contract_address && (
                            <div className="flex items-center">
                              <Tooltip
                                content="Verifier Contract"
                                className={styles.verifierTooltip}
                              >
                                <Copy value={d.contract_address}>
                                  {ellipse(d.contract_address)}
                                </Copy>
                              </Tooltip>
                            </div>
                          )}
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
                        <div className={styles.statusColumn}>
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
                      <td className={styles.tdMiddle}>
                        <Link
                          href={`/amplifier-poll/${d.id}`}
                          target="_blank"
                          className={styles.participationLink}
                        >
                          {d.voteOptions?.map((v: PollVoteOption, i: number) => (
                            <Number
                              key={i}
                              value={v.value}
                              format="0,0"
                              suffix={` ${toTitle(v.option.substring(0, ['unsubmitted'].includes(v.option) ? 2 : 1))}`}
                              noTooltip={true}
                              className={clsx(
                                styles.voteOptionBase,
                                ['no'].includes(v.option)
                                  ? styles.voteOptionNo
                                  : ['yes'].includes(v.option)
                                    ? styles.voteOptionYes
                                    : styles.voteOptionDefault
                              )}
                            />
                          ))}
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
