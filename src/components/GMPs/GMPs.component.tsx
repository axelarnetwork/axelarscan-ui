'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import {
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineArrowRightEndOnRectangle,
} from 'react-icons/hi2';
import {
  MdOutlineRefresh,
  MdOutlineFilterList,
  MdClose,
  MdCheck,
  MdOutlineTimer,
} from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';
import { PiWarningCircle } from 'react-icons/pi';
import { RiTimerFlashLine } from 'react-icons/ri';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile, AssetProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo, TimeSpent } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useChains, useAssets, useITSAssets } from '@/hooks/useGlobalData';
import { searchGMP } from '@/lib/api/gmp';
import { isAxelar } from '@/lib/chain';
import { ENVIRONMENT } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
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
  includesSomePatterns,
  ellipse,
  filterSearchInput,
} from '@/lib/string';
import { isNumber } from '@/lib/number';
import { timeDiff } from '@/lib/time';
import customGMPs from '@/data/custom/gmp';
import type { Chain } from '@/types';

import * as styles from './GMPs.styles';

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
  const assets = useAssets();
  const itsAssets = useITSAssets();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (e1?: unknown, e2?: unknown, _params?: Record<string, unknown>) => {
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
    { label: 'Tx Hash', name: 'txHash' },
    { label: 'Message ID', name: 'messageId' },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d: Chain, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map((d) => ({
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
        toArray(chains).map((d: Chain, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map((d) => ({
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
        toArray(chains).map((d: Chain, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map((d) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Asset Type',
      name: 'assetType',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'gateway', title: 'Gateway Token' },
        { value: 'its', title: 'ITS Token' },
      ],
    },
    {
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        _.uniqBy(
          toArray(
            _.concat(
              (params.assetType !== 'its' &&
                toArray(assets).map((d) => ({
                  value: (d as { id: string }).id,
                  title: `${(d as { symbol?: string }).symbol} (${(d as { id: string }).id})`,
                }))) || [],
              (params.assetType !== 'gateway' &&
                toArray(itsAssets).map((d) => ({
                  value: (d as { symbol: string }).symbol,
                  title: `${(d as { symbol: string }).symbol} (ITS)`,
                }))) || []
            )
          ),
          'value'
        ),
        ['title'],
        ['asc']
      ),
    },
    params.assetType === 'its' && {
      label: 'ITS Token Address',
      name: 'itsTokenAddress',
    },
    {
      label: 'Method',
      name: 'contractMethod',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'callContract', title: 'CallContract' },
        { value: 'callContractWithToken', title: 'CallContractWithToken' },
        { value: 'InterchainTransfer', title: 'InterchainTransfer' },
        {
          value: 'InterchainTokenDeployment',
          title: 'InterchainTokenDeployment',
        },
        { value: 'TokenManagerDeployment', title: 'TokenManagerDeployment' },
        { value: 'LinkToken', title: 'LinkToken' },
        { value: 'TokenMetadataRegistered', title: 'TokenMetadataRegistered' },
        { value: 'SquidCoral', title: 'SquidCoral' },
        {
          value: 'SquidCoralSettlementForwarded',
          title: 'SquidCoralSettlementForwarded',
        },
        {
          value: 'SquidCoralSettlementFilled',
          title: 'SquidCoralSettlementFilled',
        },
      ],
    },
    (params.contractMethod as string | undefined)?.startsWith('SquidCoral') && {
      label: 'Squid Coral OrderHash',
      name: 'squidCoralOrderHash',
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'called', title: 'Called' },
        { value: 'confirming', title: 'Wait for Confirmation' },
        { value: 'express_executed', title: 'Express Executed' },
        { value: 'approving', title: 'Wait for Approval' },
        { value: 'approved', title: 'Approved' },
        { value: 'executing', title: 'Executing' },
        { value: 'executed', title: 'Executed' },
        { value: 'error', title: 'Error Execution' },
        { value: 'insufficient_fee', title: 'Insufficient Fee' },
        { value: 'not_enough_gas_to_execute', title: 'Not Enough Gas' },
      ],
    },
    { label: 'Sender', name: 'senderAddress' },
    { label: 'Source Address', name: 'sourceAddress' },
    { label: 'Destination Contract', name: 'destinationContractAddress' },
    { label: 'Command ID', name: 'commandId' },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
    {
      label: 'Sort By',
      name: 'sortBy',
      type: 'select',
      options: [
        { title: 'ContractCall Time' },
        { value: 'value', title: 'Token Value' },
      ],
    },
    { label: 'Proposal ID', name: 'proposalId' },
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
        <Dialog as="div" onClose={onClose} className={styles.dialogContainer}>
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
          <div className={styles.dialogOuterWrapper}>
            <div className={styles.dialogInnerWrapper}>
              <div className={styles.dialogPanelContainer}>
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
                                className={styles.fieldLabel}
                              >
                                {d.label}
                              </label>
                              <div className={styles.fieldWrapper}>
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
                                          [d.name]: Array.isArray(v)
                                            ? v.join(',')
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }: { open: boolean }) => {
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
                                                    styles.selectMultipleWrap,
                                                    (selectedValue as FilterOption[]).length !==
                                                      0 && styles.selectMultipleWrapActive
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
                                                                    (sv: FilterOption) =>
                                                                      sv.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (sv: FilterOption) => sv.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className={styles.selectMultipleTag}
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
                                              show={open}
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
                                                  className={styles.selectSearchInput}
                                                />
                                                <Combobox.Options className={styles.selectDropdown}>
                                                  {toArray(d.options)
                                                    .filter((o: FilterOption) =>
                                                      filterSearchInput(
                                                        [o.title, o.value ?? ''],
                                                        searchInput[d.name] || ''
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
                                          [d.name]: Array.isArray(v)
                                            ? v.join(',')
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {(({ open }: any) => {
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
                                                    styles.selectMultipleWrap,
                                                    (selectedValue as FilterOption[]).length !==
                                                      0 && styles.selectMultipleWrapActive
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
                                                                    (sv: FilterOption) =>
                                                                      sv.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    (sv: FilterOption) => sv.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className={styles.selectMultipleTag}
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
                                              show={open}
                                              as={Fragment}
                                              leave={styles.transitionLeave}
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className={styles.selectDropdown}>
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

export const getEvent = (data: Record<string, unknown>) => {
  const {
    call,
    interchain_transfer,
    token_manager_deployment_started,
    interchain_token_deployment_started,
    link_token_started,
    token_metadata_registered,
    settlement_forwarded_events,
    settlement_filled_events,
    interchain_transfers,
    originData,
  } = { ...data };

  const origin = originData as Record<string, unknown> | undefined;

  if (interchain_transfer || origin?.interchain_transfer)
    return 'InterchainTransfer';
  if (
    token_manager_deployment_started ||
    origin?.token_manager_deployment_started
  )
    return 'TokenManagerDeployment';
  if (
    interchain_token_deployment_started ||
    origin?.interchain_token_deployment_started
  )
    return 'InterchainTokenDeployment';
  if (link_token_started || origin?.link_token_started) return 'LinkToken';
  if (token_metadata_registered || origin?.token_metadata_registered)
    return 'TokenMetadataRegistered';
  if (settlement_forwarded_events) return 'SquidCoralSettlementForwarded';
  if (settlement_filled_events || interchain_transfers)
    return 'SquidCoralSettlementFilled';

  return (call as Record<string, unknown> | undefined)?.event as string | undefined;
};

export const customData = async (data: Record<string, unknown>) => {
  const { call, interchain_transfer, interchain_transfers } = { ...data } as Record<string, Record<string, unknown> | unknown>;
  const { destinationContractAddress, payload } = { ...((call as Record<string, unknown>)?.returnValues as Record<string, unknown>) };
  if (!(destinationContractAddress && isString(payload))) return data;

  try {
    const customGMP = toArray(customGMPs).find(
      (d: Record<string, unknown>) =>
        toArray(d.addresses as string[]).findIndex((a: string) =>
          equalsIgnoreCase(a, destinationContractAddress as string)
        ) > -1 &&
        (!d.environment || equalsIgnoreCase(d.environment as string, ENVIRONMENT))
    );
    const { id, name, customize } = { ...customGMP } as Record<string, unknown>;

    if (typeof customize === 'function') {
      const customValues = await customize((call as Record<string, unknown>).returnValues, ENVIRONMENT);

      if (
        typeof customValues === 'object' &&
        !Array.isArray(customValues) &&
        Object.keys(customValues as Record<string, unknown>).length > 0
      ) {
        (customValues as Record<string, unknown>).projectId = id;
        (customValues as Record<string, unknown>).projectName = name || capitalize(id as string);
        data.customValues = customValues;
      }
    }

    // interchain transfer
    const it = interchain_transfer as Record<string, unknown> | undefined;
    if (
      it?.destinationAddress &&
      !(data.customValues as Record<string, unknown> | undefined)?.recipientAddress
    ) {
      data.customValues = {
        ...(data.customValues as Record<string, unknown>),
        recipientAddress: it.destinationAddress,
        destinationChain: it.destinationChain,
        projectId: 'its',
        projectName: 'ITS',
      };
    }

    // interchain transfers
    if (
      toArray(interchain_transfers as unknown[]).length > 0 &&
      !(data.customValues as Record<string, unknown> | undefined)?.recipientAddresses
    ) {
      data.customValues = {
        ...(data.customValues as Record<string, unknown>),
        recipientAddresses: (interchain_transfers as Record<string, unknown>[]).map((d: Record<string, unknown>) => ({
          recipientAddress: d.recipient,
          chain: d.destinationChain,
        })),
        projectId: 'squid',
        projectName: 'Squid',
      };
    }
  } catch (error) {}

  return data;
};

export const checkNeedMoreGasFromError = (error: Record<string, unknown> | null | undefined) => {
  if (!error) return false;
  const inner = error.error as Record<string, unknown> | undefined;
  return includesSomePatterns(
    [inner?.reason as string, inner?.message as string],
    ['INSUFFICIENT_GAS']
  );
};

export function GMPs({ address = undefined, useAnotherHopChain = false }: { address?: string; useAnotherHopChain?: boolean }) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<string, unknown> | null>(null);
  const [refresh, setRefresh] = useState<boolean | string | null>(null);

  useEffect(() => {
    const _params = getParams(searchParams, size);

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
        const sort = params.sortBy === 'value' ? { value: 'desc' } : undefined;

        const _params = _.cloneDeep(params);
        delete _params.sortBy;

        const response = await searchGMP({ ..._params, size, sort }) as Record<string, unknown>;

        if (response?.data) {
          response.data = await Promise.all(
            toArray(response.data as unknown[]).map(
              (d: unknown) => new Promise(async resolve => resolve(await customData(d as Record<string, unknown>)))
            )
          );
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

  useEffect(() => {
    const interval = setInterval(() => setRefresh('true'), 0.5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const { data, total } = { ...(searchResults?.[generateKeyByParams(params ?? {})] as Record<string, unknown> | undefined) } as { data?: Record<string, unknown>[]; total?: number };

  return (
    <Container className={styles.containerDefault}>
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.headerRow}>
            <div className={styles.headerLeft}>
              <h1 className={styles.headerTitle}>
                General Message Passing
              </h1>
              <p className={styles.headerSubtitle}>
                <Number
                  value={total}
                  suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className={styles.headerActions}>
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
          <div className={styles.tableScrollContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr className={styles.tableHeadRow}>
                  <th
                    scope="col"
                    className={styles.thFirst}
                  >
                    Tx Hash
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Method
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Sender
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Destination
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Status
                  </th>
                  <th
                    scope="col"
                    className={styles.thLast}
                  >
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.map((d: any) => {
                  const symbol =
                    d.call.returnValues?.symbol ||
                    d.interchain_transfer?.symbol ||
                    d.token_manager_deployment_started?.symbol ||
                    d.interchain_token_deployment_started?.tokenSymbol ||
                    d.link_token_started?.symbol ||
                    d.token_metadata_registered?.symbol;
                  const receivedTransactionHash =
                    d.express_executed?.transactionHash ||
                    d.executed?.transactionHash;
                  const key = d.message_id || d.call.transactionHash;

                  return (
                    <tr
                      key={key}
                      className={styles.tableRow}
                    >
                      <td className={styles.tdFirst}>
                        <div className={styles.txHashWrapper}>
                          <Copy value={key}>
                            <Link
                              href={`/gmp/${d.call.parentMessageID ? d.call.parentMessageID : d.message_id ? d.message_id : `${d.call.chain_type === 'cosmos' && isNumber(d.call.messageIdIndex) ? d.call.axelarTransactionHash : d.call.transactionHash}${isNumber(d.call.logIndex) ? `:${d.call.logIndex}` : d.call.chain_type === 'cosmos' && isNumber(d.call.messageIdIndex) ? `-${d.call.messageIdIndex}` : ''}`}`}
                              target="_blank"
                              className={styles.txHashLink}
                            >
                              {ellipse(key, 8)}
                            </Link>
                          </Copy>
                          {!d.call.proposal_id && (
                            <ExplorerLink
                              value={d.call.transactionHash}
                              chain={d.call.chain}
                            />
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.methodCellWrapper}>
                          <Tag className={clsx(styles.methodTag)}>
                            {getEvent(d)}
                          </Tag>
                          {symbol && (
                            <AssetProfile
                              value={symbol}
                              chain={d.call.chain}
                              amount={d.amount}
                              ITSPossible={true}
                              onlyITS={!getEvent(d)?.includes('ContractCall')}
                              width={16}
                              height={16}
                              className={styles.assetProfileContainer}
                              titleClassName={styles.assetProfileTitle}
                            />
                          )}
                          {d.interchain_transfer?.contract_address &&
                            !isAxelar(d.call.chain) && (
                              <Tooltip
                                content="Token Address"
                                className={styles.tokenAddressTooltip}
                                parentClassName={styles.tokenAddressTooltipParent}
                              >
                                <Profile
                                  address={
                                    d.interchain_transfer.contract_address
                                  }
                                  chain={d.call.chain}
                                  width={16}
                                  height={16}
                                  noResolveName={true}
                                  className={styles.tokenAddressProfile}
                                />
                              </Tooltip>
                            )}
                          {toArray(d.interchain_transfers).length > 0 && (
                            <div className={styles.interchainTransfersWrapper}>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {d.interchain_transfers.map((_d: any, i: number) => (
                                <AssetProfile
                                  key={i}
                                  value={_d.contract_address || _d.symbol}
                                  chain={_d.destinationChain}
                                  amount={_d.amount}
                                  customAssetData={_d}
                                  ITSPossible={true}
                                  width={16}
                                  height={16}
                                  className={styles.assetProfileContainer}
                                  titleClassName={styles.assetProfileTitle}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.senderCellWrapper}>
                          {useAnotherHopChain &&
                          isAxelar(d.call.chain) &&
                          d.origin_chain ? (
                            <div className={styles.senderChainProfileWrapper}>
                              <ChainProfile
                                value={d.origin_chain}
                                className={styles.chainProfileHeight}
                                titleClassName={styles.chainProfileTitleBold}
                              />
                              <ExplorerLink
                                value={d.call.returnValues.sender}
                                chain={d.call.chain}
                                type="address"
                                title="via"
                                iconOnly={false}
                                width={11}
                                height={11}
                                containerClassName={styles.explorerLinkContainerClassName}
                                nonIconClassName={styles.explorerLinkNonIconClassName}
                              />
                            </div>
                          ) : (
                            <ChainProfile
                              value={d.call.chain}
                              titleClassName={styles.chainProfileTitleBold}
                            />
                          )}
                          {useAnotherHopChain &&
                          isAxelar(d.call.chain) &&
                          d.origin_chain ? null : (
                            <Profile
                              address={d.call.transaction?.from}
                              chain={d.call.chain}
                            />
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.destinationCellWrapper}>
                          {d.is_invalid_destination_chain ? (
                            <div className={styles.invalidChainWrapper}>
                              <Tooltip
                                content={d.call.returnValues?.destinationChain}
                              >
                                <div className={styles.invalidChainContent}>
                                  <PiWarningCircle size={20} />
                                  <span>Invalid Chain</span>
                                </div>
                              </Tooltip>
                            </div>
                          ) : (
                            (!isAxelar(d.call.returnValues?.destinationChain) ||
                              !d.customValues?.recipientAddress ||
                              !useAnotherHopChain) && (
                              <ChainProfile
                                value={d.call.returnValues?.destinationChain}
                                titleClassName={styles.chainProfileTitleBold}
                              />
                            )
                          )}
                          {d.is_invalid_contract_address ? (
                            <div className={styles.invalidChainWrapper}>
                              <Tooltip
                                content={
                                  d.call.returnValues
                                    ?.destinationContractAddress
                                }
                              >
                                <div className={styles.invalidChainContent}>
                                  <PiWarningCircle size={20} />
                                  <span>Invalid Contract</span>
                                </div>
                              </Tooltip>
                            </div>
                          ) : (
                            <>
                              {(!isAxelar(
                                d.call.returnValues?.destinationChain
                              ) ||
                                !d.customValues?.recipientAddress ||
                                !useAnotherHopChain) && (
                                <Tooltip
                                  content="Destination Contract"
                                  parentClassName={styles.destinationContractTooltipParent}
                                >
                                  <Profile
                                    address={
                                      d.call.returnValues
                                        ?.destinationContractAddress
                                    }
                                    chain={
                                      d.call.returnValues?.destinationChain
                                    }
                                    useContractLink={true}
                                  />
                                </Tooltip>
                              )}
                              {(d.callback_chain ||
                                d.customValues?.recipientAddress) && (
                                <>
                                  {isAxelar(
                                    d.call.returnValues?.destinationChain
                                  ) && (
                                    <div className={styles.hopChainWrapper}>
                                      <ChainProfile
                                        value={
                                          useAnotherHopChain &&
                                          (d.callback_chain ||
                                            d.customValues?.destinationChain)
                                        }
                                        className={styles.chainProfileHeight}
                                        titleClassName={styles.chainProfileTitleBold}
                                      />
                                      {useAnotherHopChain && (
                                        <ExplorerLink
                                          value={
                                            d.call.returnValues
                                              .destinationContractAddress
                                          }
                                          chain={
                                            d.call.returnValues.destinationChain
                                          }
                                          type="address"
                                          title="via"
                                          iconOnly={false}
                                          width={11}
                                          height={11}
                                          containerClassName={styles.explorerLinkContainerClassName}
                                          nonIconClassName={styles.explorerLinkNonIconClassName}
                                        />
                                      )}
                                    </div>
                                  )}
                                  {(d.customValues?.recipientAddress ||
                                    (useAnotherHopChain &&
                                      d.callback_destination_address)) && (
                                    <Tooltip
                                      content={
                                        isAxelar(
                                          d.call.returnValues?.destinationChain
                                        ) &&
                                        (d.customValues?.projectName ===
                                          'ITS' ||
                                          (!d.customValues?.recipientAddress &&
                                            d.callback_destination_address))
                                          ? 'Destination Address'
                                          : `${d.customValues?.projectName ? d.customValues.projectName : 'Final User'} Recipient`
                                      }
                                      parentClassName={styles.recipientTooltipParent}
                                    >
                                      <Profile
                                        address={
                                          d.customValues?.recipientAddress ||
                                          (useAnotherHopChain &&
                                            d.callback_destination_address)
                                        }
                                        chain={
                                          (useAnotherHopChain &&
                                            d.callback_chain) ||
                                          d.customValues?.destinationChain ||
                                          d.call.returnValues?.destinationChain
                                        }
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.statusCellWrapper}>
                          {d.simplified_status && (
                            <div className={styles.statusRow}>
                              <Tag
                                className={clsx(
                                  styles.statusTagBase,
                                  d.simplified_status === 'received'
                                    ? styles.statusReceived
                                    : d.simplified_status === 'approved'
                                      ? styles.statusApproved
                                      : d.simplified_status === 'failed'
                                        ? styles.statusFailed
                                        : styles.statusPending
                                )}
                              >
                                {d.simplified_status === 'received' &&
                                (getEvent(d) === 'ContractCall' ||
                                  (getEvent(d) === 'InterchainTransfer' &&
                                    isAxelar(
                                      d.call.returnValues?.destinationChain
                                    )))
                                  ? 'Executed'
                                  : d.simplified_status}
                              </Tag>
                              {d.simplified_status === 'received' && (
                                <ExplorerLink
                                  value={receivedTransactionHash}
                                  chain={d.call.returnValues?.destinationChain}
                                />
                              )}
                            </div>
                          )}
                          {d.is_insufficient_fee &&
                            ((!isAxelar(d.call.chain) &&
                              !isAxelar(
                                d.call.returnValues?.destinationChain
                              )) ||
                              timeDiff(d.call.created_at?.ms) > 300) && (
                              <div className={styles.insufficientFeeWrapper}>
                                <PiWarningCircle size={16} />
                                <span className={styles.statusSmallText}>
                                  Insufficient Fee
                                </span>
                              </div>
                            )}
                          {d.is_invalid_gas_paid && (
                            <div className={styles.invalidGasPaidWrapper}>
                              <PiWarningCircle size={16} />
                              <span className={styles.statusSmallText}>Invalid Gas Paid</span>
                            </div>
                          )}
                          {d.time_spent?.call_express_executed > 0 &&
                            ['express_executed', 'executed'].includes(
                              d.status
                            ) && (
                              <div className={styles.expressExecutedWrapper}>
                                <RiTimerFlashLine size={16} />
                                <TimeSpent
                                  fromTimestamp={0}
                                  toTimestamp={
                                    d.time_spent.call_express_executed * 1000
                                  }
                                  className={styles.statusSmallText}
                                />
                              </div>
                            )}
                          {d.time_spent?.total > 0 &&
                            d.status === 'executed' && (
                              <div className={styles.totalTimeWrapper}>
                                <MdOutlineTimer size={16} />
                                <TimeSpent
                                  fromTimestamp={0}
                                  toTimestamp={d.time_spent.total * 1000}
                                  className={styles.statusSmallText}
                                />
                              </div>
                            )}
                          {isAxelar(d.call.returnValues?.destinationChain) && (
                            <div className={styles.hopIndicator}>
                              <HiOutlineArrowRightEndOnRectangle size={16} />
                              <span className={styles.statusSmallText}>1st hop</span>
                            </div>
                          )}
                          {isAxelar(d.call.chain) && (
                            <div className={styles.hopIndicator}>
                              <HiOutlineArrowRightStartOnRectangle size={16} />
                              <span className={styles.statusSmallText}>2nd hop</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdLast}>
                        <TimeAgo timestamp={d.call.block_timestamp * 1000} />
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
