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
import { LuChevronsUpDown, LuChevronUp, LuChevronDown } from 'react-icons/lu';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import type { Chain } from '@/types';
import { useChains, useVerifiers } from '@/hooks/useGlobalData';
import { searchRewardsDistribution, getRewardsPool } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
import {
  getParams,
  getQueryString,
  generateKeyByParams,
  isFiltered,
} from '@/lib/operator';
import {
  equalsIgnoreCase,
  toBoolean,
  find,
  ellipse,
  toTitle,
  filterSearchInput,
} from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';

import * as styles from './AmplifierRewards.styles';

interface RewardsContractInfo {
  id: string;
  title: string;
  balance?: string | number;
  epoch_duration?: string | number;
  rewards_per_epoch?: string | number;
  last_distribution_epoch?: string | number;
  address?: string;
}

interface RewardsPoolData {
  balance?: string | number;
  voting_verifier?: RewardsContractInfo;
  multisig?: RewardsContractInfo;
}

interface Receiver {
  receiver: string;
  amount: string | number;
}

interface RewardsDistribution {
  txhash: string;
  height?: string | number;
  pool_type?: string;
  total_receivers?: number;
  total_amount?: string | number;
  receivers?: Receiver[];
  contract_address?: string;
  multisig_contract_address?: string;
  created_at?: { ms?: number };
}

interface SearchResults {
  [key: string]: {
    data: RewardsDistribution[];
    total: number;
  };
}

interface InfoProps {
  chain: string;
  rewardsPool: RewardsPoolData | null;
  cumulativeRewards: number | null;
}

interface AmplifierRewardsProps {
  chain?: string;
}

interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  searchable?: boolean;
  multiple?: boolean;
  options?: FilterOption[];
}

interface FilterOption {
  value?: string;
  title: string;
}

function Info({ chain, rewardsPool, cumulativeRewards }: InfoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const chains = useChains();
  const verifiers = useVerifiers();

  const chainData = getChainData(chain, chains);
  const id = chainData?.id;
  const name = chainData?.name;
  const multisig_prover = chainData?.multisig_prover as { address?: string } | undefined;
  const { voting_verifier, multisig } = { ...rewardsPool };

  const contracts = [
    { ...voting_verifier, id: 'voting_verifier', title: 'Verification' },
    { ...multisig, id: 'multisig', title: 'Signing' },
  ];

  const contractsFields = [
    { id: 'balance', title: 'Reward pool balance' },
    { id: 'epoch_duration', title: 'Epoch duration (blocks)' },
    { id: 'rewards_per_epoch', title: 'Rewards per epoch' },
    { id: 'last_distribution_epoch', title: 'Last distribution epoch' },
    { id: 'address', title: 'Contract addresses' },
  ];

  const symbol = (getChainData('axelarnet', chains)?.native_token as { symbol?: string } | undefined)?.symbol;

  return (
    <>
      <div className={styles.infoCard}>
        <div className={styles.infoHeaderWrapper}>
          <h3 className={styles.infoHeading}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Listbox
              value={id}
              onChange={(v: string) => router.push(`${pathname.replace(chain, v)}`)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ className: styles.listboxWrapper } as any)}
            >
              {({ open }) => {
                const isSelected = (v: string) => v === id || equalsIgnoreCase(v, chain);
                const selectedValue = toArray(chains).find((d: Chain) =>
                  isSelected(d.id)
                ) as Chain | undefined;

                return (
                  <div className={styles.listboxRelative}>
                    <Listbox.Button className={styles.listboxButton}>
                      <span className={styles.listboxButtonText}>
                        {selectedValue?.name}
                      </span>
                      <span className={styles.listboxButtonIcon}>
                        <LuChevronsUpDown size={20} className={styles.listboxChevronIcon} />
                      </span>
                    </Listbox.Button>
                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className={styles.listboxOptions}>
                        {toArray(chains)
                          .filter((d: Chain) => d.chain_type === 'vm')
                          .map((d: Chain, j: number) => (
                            <Listbox.Option
                              key={j}
                              value={d.id}
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              className={({ active }: any) =>
                                clsx(
                                  styles.listboxOptionBase,
                                  active
                                    ? styles.listboxOptionActive
                                    : styles.listboxOptionInactive
                                )
                              }
                            >
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {({ selected, active }: any) => (
                                <>
                                  <span
                                    className={clsx(
                                      styles.listboxButtonText,
                                      selected ? styles.listboxOptionTextSelected : styles.listboxOptionTextNormal
                                    )}
                                  >
                                    {d.name}
                                  </span>
                                  {selected && (
                                    <span
                                      className={clsx(
                                        styles.listboxCheckWrapper,
                                        active ? styles.listboxCheckActive : styles.listboxCheckInactive
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
          </h3>
        </div>
        <div className={styles.infoBorderTop}>
          <div className={styles.infoGrid}>
            <dl className={styles.infoDl}>
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>
                  No. Verifiers
                </dt>
                <dd className={styles.infoDd}>
                  <Number
                    value={
                      toArray(verifiers).filter((d: Record<string, unknown>) =>
                        id && find(id, d.supportedChains as string[])
                      ).length
                    }
                    format="0,0"
                    className="font-medium"
                  />
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>
                  Cumulative rewards
                </dt>
                <dd className={styles.infoDd}>
                  <Number
                    value={cumulativeRewards}
                    suffix={` ${symbol}`}
                    noTooltip={true}
                    className="font-medium"
                  />
                </dd>
              </div>
            </dl>
            <dl className={styles.infoDl}>
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>
                  Total reward pool balance
                </dt>
                <dd className={styles.infoDd}>
                  <Number
                    value={formatUnits(String(rewardsPool?.balance ?? '0'), 6)}
                    suffix={` ${symbol}`}
                    noTooltip={true}
                    className="font-medium"
                  />
                </dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}></dt>
                <dd className={styles.infoDd}></dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className={styles.contractsCard}>
        <table className={styles.contractsTable}>
          <thead className={styles.contractsThead}>
            <tr className={styles.contractsTheadRow}>
              <th scope="col" className={styles.contractsTh}></th>
              {contracts.map(({ id, title }) => (
                <th
                  key={id}
                  scope="col"
                  className={styles.contractsTh}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.contractsTbody}>
            {contractsFields.map(f => (
              <tr
                key={f.id}
                className={styles.contractsTr}
              >
                <td className={styles.contractsTdLabel}>
                  <div className={styles.contractsTdLabelText}>
                    {f.title}
                  </div>
                </td>
                {contracts.map((d: RewardsContractInfo) => {
                  let element;

                  switch (f.id) {
                    case 'balance':
                      element = (
                        <Number
                          value={formatUnits(String(d.balance ?? '0'), 6)}
                          suffix={` ${symbol}`}
                          noTooltip={true}
                          className="font-medium"
                        />
                      );
                      break;
                    case 'epoch_duration':
                      element = isNumber(d.epoch_duration) ? (
                        <Number
                          value={d.epoch_duration}
                          format="0,0"
                          className="font-medium"
                        />
                      ) : (
                        '-'
                      );
                      break;
                    case 'rewards_per_epoch':
                      element = (
                        <Number
                          value={formatUnits(String(d.rewards_per_epoch ?? '0'), 6)}
                          suffix={` ${symbol}`}
                          noTooltip={true}
                          className="font-medium"
                        />
                      );
                      break;
                    case 'last_distribution_epoch':
                      element =
                        isNumber(d.epoch_duration) &&
                        d.last_distribution_epoch ? (
                          <Number
                            value={d.last_distribution_epoch}
                            format="0,0"
                            className="font-medium"
                          />
                        ) : (
                          '-'
                        );
                      break;
                    case 'address':
                      element = (
                        <div className={styles.addressFlexCol}>
                          {d.id === 'multisig' && multisig_prover?.address && (
                            <div className={styles.addressRow}>
                              <Profile address={multisig_prover.address} />
                              <span>{name} Prover</span>
                            </div>
                          )}
                          <div className={styles.addressRow}>
                            <Profile address={d.address} />
                            {d.id === 'voting_verifier' ? (
                              <span>{name} Voting Verifier</span>
                            ) : (
                              <Tooltip
                                content="The global Multisig contract is used for the rewards pool for signing"
                                className={styles.tooltipContent}
                              >
                                <span>Global Multisig</span>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      );
                      break;
                    default:
                      break;
                  }

                  return (
                    <td
                      key={`${d.id}_${f.id}`}
                      className={styles.contractsTd}
                    >
                      <div className={styles.contractsTdContent}>
                        {element}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
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

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (_e1?: unknown, _e2?: unknown, _params?: Record<string, unknown>) => {
    const resolvedParams = _params ?? params;

    if (!_.isEqual(resolvedParams, getParams(searchParams, size))) {
      router.push(`${pathname}${getQueryString(resolvedParams)}`);
      setParams(resolvedParams);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams, size));
  };

  const attributes: FilterAttribute[] = [
    { label: 'Epoch', name: 'epochCount' },
    { label: 'Tx Hash', name: 'txHash' },
    { label: 'Contract', name: 'contractAddress' },
    { label: 'Rewards Contract', name: 'rewardsContractAddress' },
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
                                          : params[d.name]
                                      }
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      onChange={(v: any) =>
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
                                        const paramValue = params[d.name] as string | undefined;
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? (v !== undefined && split(paramValue).includes(v))
                                            : v === paramValue ||
                                              equalsIgnoreCase(
                                                v,
                                                paramValue
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter((o: FilterOption) =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find((o: FilterOption) =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className={styles.listboxRelative}>
                                            <Combobox.Button className={styles.comboboxButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.comboboxMultiWrapBase,
                                                    (selectedValue as FilterOption[]).length !==
                                                      0 && styles.comboboxMultiWrapSelected
                                                  )}
                                                >
                                                  {(selectedValue as FilterOption[]).length ===
                                                  0 ? (
                                                    <span className={styles.listboxButtonText}>
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
                                                          className={styles.comboboxTag}
                                                        >
                                                          {v.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className={styles.listboxButtonText}>
                                                  {(selectedValue as FilterOption | undefined)?.title}
                                                </span>
                                              )}
                                              <span className={styles.listboxButtonIcon}>
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className={styles.listboxChevronIcon}
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
                                              <div className={styles.comboboxSearchWrapper}>
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
                                                <Combobox.Options className={styles.comboboxOptions}>
                                                  {toArray(d.options)
                                                    .filter((o: FilterOption) =>
                                                      filterSearchInput(
                                                        [o.title, o.value].filter((s): s is string => s !== undefined),
                                                        searchInput[d.name]
                                                      )
                                                    )
                                                    .map((o: FilterOption, j: number) => (
                                                      <Combobox.Option
                                                        key={j}
                                                        value={o.value}
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        className={({
                                                          active,
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        }: any) =>
                                                          clsx(
                                                            styles.listboxOptionBase,
                                                            active
                                                              ? styles.listboxOptionActive
                                                              : styles.listboxOptionInactive
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
                                                                styles.listboxButtonText,
                                                                selected
                                                                  ? styles.listboxOptionTextSelected
                                                                  : styles.listboxOptionTextNormal
                                                              )}
                                                            >
                                                              {o.title}
                                                            </span>
                                                            {selected && (
                                                              <span
                                                                className={clsx(
                                                                  styles.listboxCheckWrapper,
                                                                  active
                                                                    ? styles.listboxCheckActive
                                                                    : styles.listboxCheckInactive
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
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      onChange={(v: any) =>
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
                                        const paramValue = params[d.name] as string | undefined;
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? (v !== undefined && split(paramValue).includes(v))
                                            : v === paramValue ||
                                              equalsIgnoreCase(
                                                v,
                                                paramValue
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter((o: FilterOption) =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find((o: FilterOption) =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className={styles.listboxRelative}>
                                            <Listbox.Button className={styles.listboxButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.comboboxMultiWrapBase,
                                                    (selectedValue as FilterOption[]).length !==
                                                      0 && styles.comboboxMultiWrapSelected
                                                  )}
                                                >
                                                  {(selectedValue as FilterOption[]).length ===
                                                  0 ? (
                                                    <span className={styles.listboxButtonText}>
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
                                                          className={styles.comboboxTag}
                                                        >
                                                          {v.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className={styles.listboxButtonText}>
                                                  {(selectedValue as FilterOption | undefined)?.title}
                                                </span>
                                              )}
                                              <span className={styles.listboxButtonIcon}>
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className={styles.listboxChevronIcon}
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
                                              <Listbox.Options className={styles.listboxOptions}>
                                                {toArray(d.options).map(
                                                  (o: FilterOption, j: number) => (
                                                    <Listbox.Option
                                                      key={j}
                                                      value={o.value}
                                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                      className={({ active }: any) =>
                                                        clsx(
                                                          styles.listboxOptionBase,
                                                          active
                                                            ? styles.listboxOptionActive
                                                            : styles.listboxOptionInactive
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
                                                              styles.listboxButtonText,
                                                              selected
                                                                ? styles.listboxOptionTextSelected
                                                                : styles.listboxOptionTextNormal
                                                            )}
                                                          >
                                                            {o.title}
                                                          </span>
                                                          {selected && (
                                                            <span
                                                              className={clsx(
                                                                styles.listboxCheckWrapper,
                                                                active
                                                                  ? styles.listboxCheckActive
                                                                  : styles.listboxCheckInactive
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
                                    value={(params[d.name] as string | undefined) ?? ''}
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

export function AmplifierRewards({ chain }: AmplifierRewardsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [distributionExpanded, setDistributionExpanded] = useState<string | null>(null);
  const [rewardsPool, setRewardsPool] = useState<RewardsPoolData | null>(null);
  const [cumulativeRewards, setCumulativeRewards] = useState<number | null>(null);
  const chains = useChains();

  useEffect(() => {
    if (!chain && chains) {
      const path = `${pathname}/${chains.filter((d: Chain) => d.chain_type === 'vm')[0]?.chain_name}`;

      if (path !== pathname) {
        router.push(path);
      }
    }
  }, [chain, router, pathname, chains]);

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (chain && params && toBoolean(refresh) && chains) {
        const chainDataForSearch = getChainData(chain, chains);
        const voting_verifier = chainDataForSearch?.voting_verifier;
        const searchResponse = await searchRewardsDistribution({ ...params, chain, size }) as
          Record<string, unknown> | null;
        const data = searchResponse?.data as Record<string, unknown>[] | undefined;
        const total = searchResponse?.total as number | undefined;

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: {
            data: toArray(data).map((d: Record<string, unknown>) => ({
              ...d,
              pool_type: equalsIgnoreCase(
                (d.contract_address || d.multisig_contract_address) as string | undefined,
                voting_verifier?.address
              )
                ? 'verification'
                : 'signing',
            })) as RewardsDistribution[],
            total: total || toArray(data).length,
          },
        });
        setRefresh(false);

        setDistributionExpanded(null);
        const poolResponse = await getRewardsPool({ chain }) as
          Record<string, unknown> | null;
        setRewardsPool(
          ((poolResponse?.data as RewardsPoolData[] | undefined)?.[0]) ?? null
        );

        const aggsResponse = await searchRewardsDistribution({
          ...params,
          chain,
          aggs: { cumulativeRewards: { sum: { field: 'total_amount' } } },
          size: 0,
        }) as Record<string, unknown> | null;
        const aggs = aggsResponse?.aggs as
          { cumulativeRewards?: { value?: number } } | undefined;

        if (isNumber(aggs?.cumulativeRewards?.value)) {
          setCumulativeRewards(aggs.cumulativeRewards.value);
        }
      }
    };

    getData();
  }, [
    chain,
    params,
    setSearchResults,
    refresh,
    setRefresh,
    setDistributionExpanded,
    setRewardsPool,
    chains,
  ]);

  const resultKey = params ? generateKeyByParams(params) : '';
  const { data, total } = { ...searchResults?.[resultKey] };

  return (
    <Container className={styles.containerClass}>
      {!data ? (
        <Spinner />
      ) : (
        <div className={styles.mainWrapper}>
          <div className={styles.sectionWrapper}>
            <div className={styles.headerRow}>
              <div className={styles.headerAuto}>
                <h1 className={styles.pageTitle}>
                  Amplifier Rewards
                </h1>
              </div>
            </div>
            <Info
              chain={chain ?? ''}
              rewardsPool={rewardsPool}
              cumulativeRewards={cumulativeRewards}
            />
          </div>
          <div>
            <div className={styles.headerRow}>
              <div className={styles.headerAuto}>
                <h2 className={styles.sectionTitle}>
                  Rewards distribution history
                </h2>
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
                      Height
                    </th>
                    <th
                      scope="col"
                      className={styles.thTxHash}
                    >
                      Tx Hash
                    </th>
                    <th scope="col" className={styles.thMiddle}>
                      Pool
                    </th>
                    <th scope="col" className={styles.thMiddle}>
                      Recipients
                    </th>
                    <th scope="col" className={styles.thPayoutRight}>
                      Payout
                    </th>
                    <th
                      scope="col"
                      className={styles.thLast}
                    >
                      Payout at
                    </th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {data.map((d: RewardsDistribution) => (
                    <tr
                      key={d.txhash}
                      className={styles.tr}
                    >
                      <td className={styles.tdFirst}>
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
                        <Copy value={d.txhash}>
                          <Link
                            href={`/tx/${d.txhash}`}
                            target="_blank"
                            className={styles.txLink}
                          >
                            {ellipse(d.txhash)}
                          </Link>
                        </Copy>
                      </td>
                      <td className={styles.tdMiddle}>
                        <Tag className={styles.poolTag}>
                          {toTitle(d.pool_type)}
                        </Tag>
                      </td>
                      <td className={styles.tdMiddle}>
                        <div className={styles.recipientsWrapper}>
                          <div
                            onClick={() =>
                              setDistributionExpanded(
                                equalsIgnoreCase(d.txhash, distributionExpanded)
                                  ? null
                                  : d.txhash
                              )
                            }
                            className={styles.recipientToggle}
                          >
                            <Number
                              value={d.total_receivers}
                              format="0,0"
                              suffix=" Verifiers"
                              noTooltip={true}
                              className={styles.recipientCount}
                            />
                            {equalsIgnoreCase(
                              d.txhash,
                              distributionExpanded
                            ) ? (
                              <LuChevronUp size={18} />
                            ) : (
                              <LuChevronDown size={18} />
                            )}
                          </div>
                          {equalsIgnoreCase(d.txhash, distributionExpanded) && (
                            <div className={styles.recipientGrid}>
                              {toArray(d.receivers).map((r: Receiver, i: number) => (
                                <div
                                  key={i}
                                  className={styles.recipientRow}
                                >
                                  <Profile
                                    address={r.receiver}
                                    width={18}
                                    height={18}
                                    className={styles.recipientProfileClass}
                                  />
                                  <Number
                                    value={r.amount}
                                    noTooltip={true}
                                    className={styles.recipientAmount}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdMiddle}>
                        <div className={styles.payoutWrapper}>
                          <Number
                            value={d.total_amount}
                            suffix={` ${(getChainData('axelarnet', chains)?.native_token as { symbol?: string } | undefined)?.symbol}`}
                            noTooltip={true}
                            className={styles.payoutAmount}
                          />
                        </div>
                      </td>
                      <td className={styles.tdLast}>
                        <TimeAgo timestamp={d.created_at?.ms} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(total ?? 0) > size && (
              <div className={styles.paginationWrapper}>
                <Pagination sizePerPage={size} total={total ?? 0} />
              </div>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}
