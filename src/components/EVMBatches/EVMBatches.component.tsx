'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import {
  MdOutlineCode,
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
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchBatches } from '@/lib/api/token-transfer';
import { ENVIRONMENT, getChainData, getAssetData } from '@/lib/config';
import { toCase, split, toArray } from '@/lib/parser';
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
  filterSearchInput,
} from '@/lib/string';
import { toNumber, formatUnits } from '@/lib/number';

import type { Chain, ChainExplorer, FilterOption, FilterAttribute } from '@/types';

import * as styles from './EVMBatches.styles';

/** Aggregation bucket returned by the searchBatches aggs query */
interface AggBucket {
  key: string;
  doc_count?: number;
}

/** Command params shape nested within a batch command */
interface CommandParams {
  amount?: string;
  name?: string;
  cap?: number;
  account?: string;
  salt?: string;
  newOwners?: string;
  newOperators?: string;
  newWeights?: string;
  newThreshold?: string;
  sourceChain?: string;
  sourceTxHash?: string;
  contractAddress?: string;
  symbol?: string;
  decimals?: number;
}

/** A single command inside an EVM batch */
interface BatchCommand {
  id: string;
  type: string;
  executed?: boolean;
  transactionHash?: string;
  deposit_address?: string;
  params?: CommandParams;
}

/** An EVM batch record returned from the API */
interface BatchRecord {
  batch_id: string;
  chain: string;
  key_id?: string;
  status?: string;
  commands?: BatchCommand[];
  created_at?: { ms: number };
}

/** Shape of the search batches API response */
interface BatchSearchResponse {
  data?: BatchRecord[];
  total?: number;
}

/** Cached search results keyed by serialized params */
type SearchResultsMap = Record<string, BatchSearchResponse>;

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
      const response = await searchBatches({
        aggs: {
          types: { terms: { field: 'commands.type.keyword', size: 25 } },
        },
        size: 0,
      });
      setTypes((toArray(response) as AggBucket[]).map((d) => d.key));
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

  const attributes = [
    { label: 'Batch ID', name: 'batchId' },
    { label: 'Command ID', name: 'commandId' },
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
      ).map((d: Chain & { i: number }) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Command Type',
      name: 'type',
      type: 'select',
      options: _.concat(
        { title: 'Any' } as FilterOption,
        types.map(d => ({ value: d, title: d }))
      ),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: _.concat(
        { title: 'Any' } as FilterOption,
        ['executed', 'unexecuted', 'signed', 'signing', 'aborted'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ];

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
                          {attributes.map((d: FilterAttribute, i: number) => (
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
                                          ? split(params[d.name] as string)
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
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(params[d.name] as string).includes(v ?? '')
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name] as string
                                              );
                                        const selectedValue: FilterOption[] | FilterOption | undefined = d.multiple
                                          ? toArray(d.options).filter((o: FilterOption) =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find((o: FilterOption) =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className={styles.selectRelative}>
                                            <Combobox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectMultiWrapBase,
                                                    (selectedValue as FilterOption[]).length !==
                                                      0 && styles.selectMultiWrapSelected
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
                                                                    (_sv: FilterOption) =>
                                                                      _sv.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (sv: FilterOption) => sv.value
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
                                                  {(selectedValue as FilterOption | undefined)?.title}
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
                                                        value={o.value}
                                                        className={({
                                                          active,
                                                        }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        any) =>
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
                                                        }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        any) => (
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
                                          ? split(params[d.name] as string)
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
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(params[d.name] as string).includes(v ?? '')
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name] as string
                                              );
                                        const selectedValue: FilterOption[] | FilterOption | undefined = d.multiple
                                          ? toArray(d.options).filter((o: FilterOption) =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find((o: FilterOption) =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className={styles.selectRelative}>
                                            <Listbox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectMultiWrapBase,
                                                    (selectedValue as FilterOption[]).length !==
                                                      0 && styles.selectMultiWrapSelected
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
                                                                    (_sv: FilterOption) =>
                                                                      _sv.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (sv: FilterOption) => sv.value
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
                                                  {(selectedValue as FilterOption | undefined)?.title}
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
                                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                      className={({ active }: any) =>
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
                                                      }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                      any) => (
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
                                    value={params[d.name] as string | undefined}
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

export function EVMBatches() {
  const NUM_COMMANDS_TRUNCATE = 10;

  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultsMap | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const chains = useChains();
  const assets = useAssets();

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
        let response = await searchBatches({ ...params, size }) as BatchSearchResponse | null;

        if (
          response &&
          !response.data &&
          !['mainnet', 'testnet'].includes(ENVIRONMENT!)
        ) {
          response = { data: [], total: 0 };
        }

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: { ...response },
        });
        setRefresh(false);
      }
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh]);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params!)] };

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
                  EVM Batches
                </h1>
                <span className={styles.titleSeparator}>|</span>
                <Link
                  href="/amplifier-proofs"
                  className={styles.amplifierLink}
                >
                  Amplifier Proofs
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
                    Commands
                  </th>
                  <th scope="col" className={styles.thRight}>
                    Status
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
                {data.map((d: BatchRecord) => {
                  const { url, transaction_path } = {
                    ...getChainData(d.chain, chains)?.explorer,
                  } as Partial<ChainExplorer>;

                  const executed =
                    toArray(d.commands).length ===
                    toArray(d.commands).filter((c: BatchCommand) => c.executed).length;
                  const status = executed
                    ? 'executed'
                    : toCase(
                        d.status?.replace('BATCHED_COMMANDS_STATUS_', ''),
                        'lower'
                      );

                  return (
                    <tr
                      key={d.batch_id}
                      className={styles.tr}
                    >
                      <td className={styles.tdFirst}>
                        <div className={styles.batchIdWrapper}>
                          <Copy value={d.batch_id}>
                            <Link
                              href={`/evm-batch/${d.chain}/${d.batch_id}`}
                              target="_blank"
                              className={styles.batchLink}
                            >
                              {ellipse(d.batch_id)}
                            </Link>
                          </Copy>
                          <Copy value={d.key_id}>
                            <span>{d.key_id}</span>
                          </Copy>
                        </div>
                      </td>
                      <td className={styles.tdMiddle}>
                        <ChainProfile value={d.chain} />
                      </td>
                      <td className={styles.tdMiddle}>
                        <div className={styles.commandsWrapper}>
                          {_.slice(
                            toArray(d.commands),
                            0,
                            NUM_COMMANDS_TRUNCATE
                          ).map((c: BatchCommand, i: number) => {
                            const { type, deposit_address } = { ...c };
                            const {
                              amount,
                              name,
                              cap,
                              account,
                              salt,
                              newOwners,
                              newOperators,
                              newWeights,
                              newThreshold,
                              sourceChain,
                              sourceTxHash,
                              contractAddress,
                            } = { ...c.params };
                            let { symbol, decimals } = { ...c.params };

                            const transferID = parseInt(c.id, 16);
                            const assetData = getAssetData(symbol, assets);

                            symbol =
                              assetData?.addresses?.[d.chain]?.symbol ||
                              assetData?.symbol ||
                              symbol;
                            decimals =
                              assetData?.addresses?.[d.chain]?.decimals ||
                              assetData?.decimals ||
                              decimals ||
                              18;
                            const image =
                              assetData?.addresses?.[d.chain]?.image ||
                              assetData?.image;

                            const sourceChainData = getChainData(
                              sourceChain,
                              chains
                            );
                            const destinationChainData = getChainData(
                              d.chain,
                              chains
                            );

                            const typeElement = (
                              <Tooltip
                                content={c.executed ? 'Executed' : 'Unexecuted'}
                              >
                                <Tag
                                  className={clsx(
                                    styles.commandTypeTagBase,
                                    c.executed
                                      ? styles.commandTypeTagExecuted
                                      : styles.commandTypeTagUnexecuted
                                  )}
                                >
                                  {type}
                                </Tag>
                              </Tooltip>
                            );

                            return (
                              <div
                                key={i}
                                className={styles.commandRow}
                              >
                                {url && c.transactionHash ? (
                                  <Link
                                    href={`${url}${transaction_path?.replace('{tx}', c.transactionHash)}`}
                                    target="_blank"
                                  >
                                    {typeElement}
                                  </Link>
                                ) : (
                                  typeElement
                                )}
                                {symbol &&
                                  !['approveContractCall'].includes(type) && (
                                    <div className={styles.assetPill}>
                                      <Image
                                        src={image}
                                        alt=""
                                        width={16}
                                        height={16}
                                      />
                                      {amount && assets ? (
                                        <Number
                                          value={formatUnits(amount, decimals)}
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
                                  )}
                                {sourceChainData && (
                                  <div className={styles.sourceChainRow}>
                                    {sourceTxHash && (
                                      <Link
                                        href={`/gmp/${sourceTxHash}${sourceChainData.chain_type === 'cosmos' && c.id ? `?commandId=${c.id}` : ''}`}
                                        target="_blank"
                                        className={styles.gmpLink}
                                      >
                                        GMP
                                      </Link>
                                    )}
                                    <Tooltip
                                      content={sourceChainData.name}
                                      className={styles.chainTooltip}
                                    >
                                      <Image
                                        src={sourceChainData.image}
                                        alt=""
                                        width={20}
                                        height={20}
                                      />
                                    </Tooltip>
                                    {contractAddress && (
                                      <>
                                        <MdOutlineCode
                                          size={20}
                                          className={styles.codeIcon}
                                        />
                                        {destinationChainData && (
                                          <Tooltip
                                            content={destinationChainData.name}
                                            className={styles.chainTooltip}
                                          >
                                            <Image
                                              src={destinationChainData.image}
                                              alt=""
                                              width={20}
                                              height={20}
                                            />
                                          </Tooltip>
                                        )}
                                        <Profile
                                          address={contractAddress}
                                          chain={d.chain}
                                          width={20}
                                          height={20}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}
                                {type === 'mintToken' && (
                                  <div className={styles.mintTransferRow}>
                                    <Link
                                      href={`/transfer?transferId=${transferID}`}
                                      target="_blank"
                                      className={styles.transferLink}
                                    >
                                      Transfer
                                    </Link>
                                    {account && (
                                      <>
                                        <MdOutlineCode
                                          size={20}
                                          className={styles.codeIcon}
                                        />
                                        <Profile
                                          address={account}
                                          chain={d.chain}
                                          width={20}
                                          height={20}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}
                                {salt && (
                                  <div className={styles.saltRow}>
                                    <span className={styles.saltLabel}>
                                      {deposit_address
                                        ? 'Deposit address'
                                        : 'Salt'}
                                      :
                                    </span>
                                    {deposit_address ? (
                                      <Copy size={16} value={deposit_address}>
                                        <Link
                                          href={`/account/${deposit_address}`}
                                          target="_blank"
                                          className={styles.saltValue}
                                        >
                                          {ellipse(deposit_address, 6, '0x')}
                                        </Link>
                                      </Copy>
                                    ) : (
                                      <Copy size={16} value={salt}>
                                        <span className={styles.saltValue}>
                                          {ellipse(salt, 6, '0x')}
                                        </span>
                                      </Copy>
                                    )}
                                  </div>
                                )}
                                {name && (
                                  <div className={styles.tokenNameWrapper}>
                                    <span className={styles.tokenNameText}>
                                      {name}
                                    </span>
                                    <div className={styles.tokenDetailRow}>
                                      {decimals > 0 && (
                                        <Number
                                          value={decimals}
                                          prefix="Decimals: "
                                          className={styles.tokenDetailText}
                                        />
                                      )}
                                      {(cap ?? 0) > 0 && (
                                        <Number
                                          value={cap}
                                          prefix="Cap: "
                                          className={styles.tokenDetailText}
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                                {newOwners && (
                                  <Number
                                    value={
                                      split(newOwners, { delimiter: ';' })
                                        .length
                                    }
                                    suffix={' New Owners'}
                                    className={styles.ownersPill}
                                  />
                                )}
                                {newOperators && (
                                  <div className={styles.operatorsRow}>
                                    <Number
                                      value={
                                        split(newOperators, { delimiter: ';' })
                                          .length
                                      }
                                      suffix={' New Operators'}
                                      className={styles.operatorsPill}
                                    />
                                    {newWeights && (
                                      <Number
                                        value={_.sum(
                                          split(newWeights, {
                                            delimiter: ';',
                                          }).map((w: string) => toNumber(w))
                                        )}
                                        prefix="["
                                        suffix="]"
                                        className={styles.weightsText}
                                      />
                                    )}
                                  </div>
                                )}
                                {newThreshold && (
                                  <Number
                                    value={newThreshold}
                                    prefix={'Threshold: '}
                                    className={styles.thresholdText}
                                  />
                                )}
                              </div>
                            );
                          })}
                          {toArray(d.commands).length >
                            NUM_COMMANDS_TRUNCATE && (
                            <Link
                              href={`/evm-batch/${d.chain}/${d.batch_id}`}
                              target="_blank"
                              className={styles.moreCommandsLink}
                            >
                              <Number
                                value={
                                  toArray(d.commands).length -
                                  NUM_COMMANDS_TRUNCATE
                                }
                                prefix={'and '}
                                suffix={' more'}
                              />
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdRight}>
                        <div className={styles.statusWrapper}>
                          {status && (
                            <Tag
                              className={clsx(
                                styles.statusTagBase,
                                ['executed'].includes(status)
                                  ? styles.statusTagExecuted
                                  : ['signed'].includes(status)
                                    ? styles.statusTagSigned
                                    : ['signing'].includes(status)
                                      ? styles.statusTagSigning
                                      : styles.statusTagAborted
                              )}
                            >
                              {status}
                            </Tag>
                          )}
                        </div>
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
