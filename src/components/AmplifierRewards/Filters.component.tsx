'use client';

import { Fragment, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList, MdClose, MdCheck } from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { split, toArray } from '@/lib/parser';
import {
  getParams,
  getQueryString,
  isFiltered,
} from '@/lib/operator';
import { equalsIgnoreCase, filterSearchInput } from '@/lib/string';

import type { FilterAttribute, FilterOption } from './AmplifierRewards.types';
import { PAGE_SIZE } from './AmplifierRewards.types';
import * as styles from './AmplifierRewards.styles';

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(getParams(searchParams, PAGE_SIZE));
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const { handleSubmit } = useForm();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (_e1?: unknown, _e2?: unknown, _params?: Record<string, unknown>) => {
    const resolvedParams = _params ?? params;

    if (!_.isEqual(resolvedParams, getParams(searchParams, PAGE_SIZE))) {
      router.push(`${pathname}${getQueryString(resolvedParams)}`);
      setParams(resolvedParams);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams, PAGE_SIZE));
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
                                                        className={({
                                                          active,
                                                        }: { active: boolean }) =>
                                                          clsx(
                                                            styles.listboxOptionBase,
                                                            active
                                                              ? styles.listboxOptionActive
                                                              : styles.listboxOptionInactive
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
                                                      className={({ active }: { active: boolean }) =>
                                                        clsx(
                                                          styles.listboxOptionBase,
                                                          active
                                                            ? styles.listboxOptionActive
                                                            : styles.listboxOptionInactive
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
