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
import { searchTransactions } from '@/lib/api/validator';
import { split, toArray } from '@/lib/parser';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import {
  equalsIgnoreCase,
  capitalize,
  filterSearchInput,
} from '@/lib/string';

import type { FiltersProps, FilterAttribute, FilterOption, TypesAggregationBucket } from './Transactions.types';
import { PAGE_SIZE } from './Transactions.types';
import * as styles from './Transactions.styles';

export function Filters({ address }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, string>>(getParams(searchParams, PAGE_SIZE) as Record<string, string>);
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const [types, setTypes] = useState<string[]>([]);
  const { handleSubmit } = useForm();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  useEffect(() => {
    const getTypes = async () => {
      const response = await searchTransactions({
        aggs: { types: { terms: { field: 'types.keyword', size: 1000 } } },
        size: 0,
      });
      setTypes(toArray<TypesAggregationBucket>(response as TypesAggregationBucket[] | null).map((d) => d.key));
    };

    getTypes();
  }, []);

  const onSubmit = (e1?: unknown, e2?: unknown, _params?: Record<string, string>) => {
    if (!_params) {
      _params = params;
    }

    if (!_.isEqual(_params, getParams(searchParams, PAGE_SIZE))) {
      router.push(`${pathname}${getQueryString(_params)}`);
      setParams(_params);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams, PAGE_SIZE) as Record<string, string>);
  };

  const attributes: FilterAttribute[] = [
    { label: 'Tx Hash', name: 'txHash' },
    {
      label: 'Type',
      name: 'type',
      type: 'select',
      options: _.concat(
        [{ title: 'Any' } as FilterOption],
        _.orderBy(
          types.map((d: string) => ({ value: d, title: d })),
          ['title'],
          ['asc']
        )
      ),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: _.concat(
        [{ title: 'Any' } as FilterOption],
        ['success', 'failed'].map((d: string) => ({ value: d, title: capitalize(d) }))
      ),
    },
    ...(!address ? [{ label: 'Address', name: 'address' }] : []),
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
                          {attributes.map((d: FilterAttribute, i: number) => (
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
                                      {({ open }: { open: boolean }) => {
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v as string)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name]
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray<FilterOption>(d.options).filter((o) =>
                                              isSelected(o.value)
                                            )
                                          : toArray<FilterOption>(d.options).find((o) =>
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
                                                  {toArray<FilterOption>(d.options)
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
                                                        }: { active: boolean }) =>
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
                                                        }: { selected: boolean; active: boolean }) => (
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
                                      {({ open }: { open: boolean }) => {
                                        const isSelected = (v: string | undefined) =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v as string)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name]
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray<FilterOption>(d.options).filter((o) =>
                                              isSelected(o.value)
                                            )
                                          : toArray<FilterOption>(d.options).find((o) =>
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
                                                {toArray<FilterOption>(d.options).map(
                                                  (o: FilterOption, j: number) => (
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
                                                      {({
                                                        selected,
                                                        active,
                                                      }: { selected: boolean; active: boolean }) => (
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
                                    onChange={(v: { fromTime: number | undefined; toTime: number | undefined }) =>
                                      setParams({ ...params, ...Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val !== undefined ? String(val) : ''])) })
                                    }
                                  />
                                ) : (
                                  <input
                                    type={d.type || 'text'}
                                    name={d.name}
                                    placeholder={d.label}
                                    value={params[d.name]}
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
