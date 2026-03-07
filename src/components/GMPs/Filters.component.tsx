'use client';

import { Fragment, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import {
  MdOutlineFilterList,
  MdClose,
  MdCheck,
} from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useChains, useAssets, useITSAssets } from '@/hooks/useGlobalData';
import { split, toArray } from '@/lib/parser';
import {
  getParams,
  getQueryString,
  isFiltered,
} from '@/lib/operator';
import { equalsIgnoreCase, filterSearchInput } from '@/lib/string';
import type { Chain } from '@/types';
import type { FilterOption, FilterAttribute } from './GMPs.types';

import * as styles from './GMPs.styles';

const size = 25;

export function Filters() {
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

  const chainOptions = _.orderBy(
    toArray(chains).map((d: Chain, i: number) => ({ ...d, i })),
    ['deprecated', 'name', 'i'],
    ['desc', 'asc', 'asc']
  ).map((d) => ({
    value: d.id,
    title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
  }));

  const attributes = toArray([
    { label: 'Tx Hash', name: 'txHash' },
    { label: 'Message ID', name: 'messageId' },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
    },
    {
      label: 'Destination Chain',
      name: 'destinationChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
    },
    {
      label: 'From / To Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: chainOptions,
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
                                {renderFilterField(d, params, setParams, searchInput, setSearchInput)}
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

// ─── Helper: render the correct field widget for a filter attribute ──────────

function renderFilterField(
  d: FilterAttribute,
  params: Record<string, unknown>,
  setParams: (p: Record<string, unknown>) => void,
  searchInput: Record<string, string>,
  setSearchInput: (s: Record<string, string>) => void,
) {
  if (d.type === 'select' && d.searchable) {
    return renderSearchableSelect(d, params, setParams, searchInput, setSearchInput);
  }

  if (d.type === 'select') {
    return renderListboxSelect(d, params, setParams);
  }

  if (d.type === 'datetimeRange') {
    return (
      <DateRangePicker
        params={params}
        onChange={(v: { fromTime: number | undefined; toTime: number | undefined }) =>
          setParams({ ...params, ...v })
        }
      />
    );
  }

  return (
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
  );
}

// ─── Helper: searchable Combobox select ─────────────────────────────────────

function renderSearchableSelect(
  d: FilterAttribute,
  params: Record<string, unknown>,
  setParams: (p: Record<string, unknown>) => void,
  searchInput: Record<string, string>,
  setSearchInput: (s: Record<string, string>) => void,
) {
  return (
    <Combobox
      value={
        d.multiple
          ? split(params[d.name] as string)
          : params[d.name]
      }
      onChange={(v: string | string[]) =>
        setParams({
          ...params,
          [d.name]: Array.isArray(v) ? v.join(',') : v,
        })
      }
      multiple={d.multiple}
    >
      {({ open }: { open: boolean }) => {
        const isSelected = (v: string | undefined) =>
          d.multiple
            ? split(params[d.name] as string).includes(v ?? '')
            : v === params[d.name] ||
              equalsIgnoreCase(v, params[d.name] as string);
        const selectedValue: FilterOption[] | FilterOption | undefined = d.multiple
          ? toArray(d.options).filter((o: FilterOption) => isSelected(o.value))
          : toArray(d.options).find((o: FilterOption) => isSelected(o.value));

        return (
          <div className={styles.selectRelative}>
            <Combobox.Button className={styles.selectButton}>
              {renderSelectButtonContent(d, selectedValue, params, setParams)}
              <span className={styles.selectChevronWrapper}>
                <LuChevronsUpDown size={20} className={styles.selectChevronIcon} />
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
                  value={searchInput[d.name] || ''}
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
                        className={({ active }: { active: boolean }) =>
                          clsx(
                            styles.selectOptionBase,
                            active
                              ? styles.selectOptionActive
                              : styles.selectOptionInactive
                          )
                        }
                      >
                        {({ selected, active }: { selected: boolean; active: boolean }) => (
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
                      </Combobox.Option>
                    ))}
                </Combobox.Options>
              </div>
            </Transition>
          </div>
        );
      }}
    </Combobox>
  );
}

// ─── Helper: Listbox (non-searchable) select ────────────────────────────────

function renderListboxSelect(
  d: FilterAttribute,
  params: Record<string, unknown>,
  setParams: (p: Record<string, unknown>) => void,
) {
  return (
    <Listbox
      value={
        d.multiple
          ? split(params[d.name] as string)
          : params[d.name]
      }
      onChange={(v: string | string[]) =>
        setParams({
          ...params,
          [d.name]: Array.isArray(v) ? v.join(',') : v,
        })
      }
      multiple={d.multiple}
    >
      {(({ open }: { open: boolean }) => {
        const isSelected = (v: string | undefined) =>
          d.multiple
            ? split(params[d.name] as string).includes(v ?? '')
            : v === params[d.name] ||
              equalsIgnoreCase(v, params[d.name] as string);
        const selectedValue: FilterOption[] | FilterOption | undefined = d.multiple
          ? toArray(d.options).filter((o: FilterOption) => isSelected(o.value))
          : toArray(d.options).find((o: FilterOption) => isSelected(o.value));

        return (
          <div className={styles.selectRelative}>
            <Listbox.Button className={styles.selectButton}>
              {renderSelectButtonContent(d, selectedValue, params, setParams)}
              <span className={styles.selectChevronWrapper}>
                <LuChevronsUpDown size={20} className={styles.selectChevronIcon} />
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
                {toArray(d.options).map((o: FilterOption, j: number) => (
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
                    {({ selected, active }: { selected: boolean; active: boolean }) => (
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
      }) as (props: { open: boolean }) => React.ReactElement}
    </Listbox>
  );
}

// ─── Helper: shared button content for both Combobox and Listbox ────────────

function renderSelectButtonContent(
  d: FilterAttribute,
  selectedValue: FilterOption[] | FilterOption | undefined,
  params: Record<string, unknown>,
  setParams: (p: Record<string, unknown>) => void,
) {
  if (!d.multiple) {
    return (
      <span className={styles.selectTruncate}>
        {(selectedValue as FilterOption | undefined)?.title}
      </span>
    );
  }

  const selectedArray = selectedValue as FilterOption[];

  if (selectedArray.length === 0) {
    return (
      <div className={styles.selectMultipleWrap}>
        <span className={styles.selectTruncate}>Any</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        styles.selectMultipleWrap,
        styles.selectMultipleWrapActive
      )}
    >
      {selectedArray.map((v: FilterOption, j: number) => (
        <div
          key={j}
          onClick={() =>
            setParams({
              ...params,
              [d.name]: selectedArray
                .filter((sv: FilterOption) => sv.value !== v.value)
                .map((sv: FilterOption) => sv.value)
                .join(','),
            })
          }
          className={styles.selectMultipleTag}
        >
          {v.title}
        </div>
      ))}
    </div>
  );
}
