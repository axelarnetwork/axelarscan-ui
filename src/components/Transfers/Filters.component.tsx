'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
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
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { toArray, split } from '@/lib/parser';
import {
  getParams,
  getQueryString,
  isFiltered,
} from '@/lib/operator';
import {
  equalsIgnoreCase,
  capitalize,
  filterSearchInput,
} from '@/lib/string';

import type { FilterAttribute, FilterOption } from './Transfers.types';
import * as styles from './Transfers.styles';

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

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (
    _e1: unknown,
    _e2: unknown,
    _params?: Record<string, unknown>,
  ) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chainOptions = _.orderBy(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toArray(chains).map((d: any, i: number) => ({ ...d, i })),
    ['deprecated', 'name', 'i'],
    ['desc', 'asc', 'asc'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).map((d: any) => ({
    value: d.id,
    title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
  }));

  const attributes: FilterAttribute[] = [
    { label: 'Tx Hash', name: 'txHash' },
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
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        _.uniqBy(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          toArray(assets).map((d: any) => ({ value: d.id, title: d.symbol })),
          'value',
        ),
        ['title'],
        ['asc'],
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
        { title: 'Any' } as FilterOption,
        ['executed', 'failed'].map((d: string) => ({ value: d, title: capitalize(d) })),
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
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {({ open }: any) => {
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(params[d.name] as string).includes(v as string)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name] as string,
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter(
                                              (o: { value?: string }) =>
                                                isSelected(o.value),
                                            )
                                          : toArray(d.options).find(
                                              (o: { value?: string }) =>
                                                isSelected(o.value),
                                            );

                                        return (
                                          <div className={styles.relativeWrapper}>
                                            <Combobox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectFlexWrap,
                                                    (selectedValue as { value?: string; title: string }[]).length !==
                                                      0 && styles.selectFlexWrapMargin,
                                                  )}
                                                >
                                                  {(selectedValue as { value?: string; title: string }[]).length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    (selectedValue as { value?: string; title: string }[]).map(
                                                      (v, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                (selectedValue as { value?: string; title: string }[])
                                                                  .filter(
                                                                    (sv) =>
                                                                      sv.value !==
                                                                      v.value,
                                                                  )
                                                                  .map(
                                                                    (sv) => sv.value,
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className={styles.selectMultiTag}
                                                        >
                                                          {v.title}
                                                        </div>
                                                      ),
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className={styles.selectTruncate}>
                                                  {(selectedValue as { value?: string; title: string } | undefined)?.title}
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
                                                    .filter((o: { value?: string; title: string }) =>
                                                      filterSearchInput(
                                                        [o.title, o.value].filter((s): s is string => s !== undefined),
                                                        searchInput[d.name],
                                                      ),
                                                    )
                                                    .map((o: { value?: string; title: string }, j: number) => (
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
                                                              : styles.comboboxOptionInactive,
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
                                                                  : styles.optionTextNormal,
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
                                                                    : styles.optionCheckInactive,
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
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {({ open }: any) => {
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(params[d.name] as string).includes(v as string)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name] as string,
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter(
                                              (o: { value?: string }) =>
                                                isSelected(o.value),
                                            )
                                          : toArray(d.options).find(
                                              (o: { value?: string }) =>
                                                isSelected(o.value),
                                            );

                                        return (
                                          <div className={styles.relativeWrapper}>
                                            <Listbox.Button className={styles.selectButton}>
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    styles.selectFlexWrap,
                                                    (selectedValue as { value?: string; title: string }[]).length !==
                                                      0 && styles.selectFlexWrapMargin,
                                                  )}
                                                >
                                                  {(selectedValue as { value?: string; title: string }[]).length ===
                                                  0 ? (
                                                    <span className={styles.selectTruncate}>
                                                      Any
                                                    </span>
                                                  ) : (
                                                    (selectedValue as { value?: string; title: string }[]).map(
                                                      (v, j: number) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                (selectedValue as { value?: string; title: string }[])
                                                                  .filter(
                                                                    (sv) =>
                                                                      sv.value !==
                                                                      v.value,
                                                                  )
                                                                  .map(
                                                                    (sv) => sv.value,
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className={styles.selectMultiTag}
                                                        >
                                                          {v.title}
                                                        </div>
                                                      ),
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className={styles.selectTruncate}>
                                                  {(selectedValue as { value?: string; title: string } | undefined)?.title}
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
                                                  (o: { value?: string; title: string }, j: number) => (
                                                    <Listbox.Option
                                                      key={j}
                                                      value={o.value}
                                                      className={({ active }: { active: boolean }) =>
                                                        clsx(
                                                          styles.comboboxOptionBase,
                                                          active
                                                            ? styles.comboboxOptionActive
                                                            : styles.comboboxOptionInactive,
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
                                                                : styles.optionTextNormal,
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
                                                                  : styles.optionCheckInactive,
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
                                                  ),
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
                                    value={params[d.name] as string}
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
                              : styles.submitBtnDisabled,
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
