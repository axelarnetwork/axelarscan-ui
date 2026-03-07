'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList, MdClose, MdCheck } from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useChains } from '@/hooks/useGlobalData';
import { split, toArray } from '@/lib/parser';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import { equalsIgnoreCase, capitalize, filterSearchInput } from '@/lib/string';
import type { Chain } from '@/types';
import type { SelectOption, FilterAttribute } from './AmplifierPolls.types';
import * as styles from './AmplifierPolls.styles';

const size = 25;

function renderSelectedTags(
  selectedValue: SelectOption[],
  params: Record<string, unknown>,
  fieldName: string,
  setParams: (p: Record<string, unknown>) => void,
) {
  if (selectedValue.length === 0) {
    return <span className={styles.selectTruncate}>Any</span>;
  }

  return selectedValue.map((v: SelectOption, j: number) => (
    <div
      key={j}
      onClick={() =>
        setParams({
          ...params,
          [fieldName]: selectedValue
            .filter((_v: SelectOption) => _v.value !== v.value)
            .map((_v: SelectOption) => _v.value)
            .join(','),
        })
      }
      className={styles.selectTag}
    >
      {v.title}
    </div>
  ));
}

function renderSelectButton(
  d: FilterAttribute,
  selectedValue: SelectOption[] | SelectOption | undefined,
  params: Record<string, unknown>,
  setParams: (p: Record<string, unknown>) => void,
) {
  return (
    <>
      {d.multiple ? (
        <div
          className={clsx(
            styles.selectMultiWrapBase,
            (selectedValue as SelectOption[]).length !== 0 &&
              styles.selectMultiWrapSelected,
          )}
        >
          {renderSelectedTags(
            selectedValue as SelectOption[],
            params,
            d.name,
            setParams,
          )}
        </div>
      ) : (
        <span className={styles.selectTruncate}>
          {(selectedValue as SelectOption | undefined)?.title}
        </span>
      )}
      <span className={styles.selectIconWrapper}>
        <LuChevronsUpDown size={20} className={styles.selectChevronIcon} />
      </span>
    </>
  );
}

function renderOptionContent(selected: boolean, active: boolean, title: string) {
  return (
    <>
      <span
        className={clsx(
          styles.selectTruncate,
          selected ? styles.selectOptionTextSelected : styles.selectOptionTextNormal,
        )}
      >
        {title}
      </span>
      {selected && (
        <span
          className={clsx(
            styles.selectCheckWrapper,
            active ? styles.selectCheckActive : styles.selectCheckInactive,
          )}
        >
          <MdCheck size={20} />
        </span>
      )}
    </>
  );
}

function getSelectedValue(
  d: FilterAttribute,
  params: Record<string, unknown>,
  isSelected: (v: string | undefined) => boolean,
) {
  if (d.multiple) {
    return toArray(d.options).filter((o: SelectOption) => isSelected(o.value));
  }
  return toArray(d.options).find((o: SelectOption) => isSelected(o.value));
}

function makeIsSelected(d: FilterAttribute, params: Record<string, unknown>) {
  return (v: string | undefined) => {
    if (d.multiple) {
      return split(params[d.name] as string).includes(v ?? '');
    }
    return v === params[d.name] || equalsIgnoreCase(v, params[d.name] as string);
  };
}

function renderSearchableCombobox(
  d: FilterAttribute,
  params: Record<string, unknown>,
  setParams: (p: Record<string, unknown>) => void,
  searchInput: Record<string, string>,
  setSearchInput: (s: Record<string, string>) => void,
) {
  return (
    <Combobox
      value={d.multiple ? split(params[d.name]) : params[d.name]}
      onChange={(v: string | string[]) =>
        setParams({
          ...params,
          [d.name]: d.multiple ? (v as string[]).join(',') : v,
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      multiple={d.multiple as any}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(({ open: isOpen }: any) => {
        const isSelected = makeIsSelected(d, params);
        const selectedValue = getSelectedValue(d, params, isSelected);

        return (
          <div className={styles.selectRelative}>
            <Combobox.Button className={styles.selectButton}>
              {renderSelectButton(d, selectedValue, params, setParams)}
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
                  value={searchInput[d.name] || ''}
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
                        searchInput[d.name] || '',
                      ),
                    )
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((o: any, j: number) => (
                      <Combobox.Option
                        key={j}
                        value={o.value}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        className={({ active }: any) =>
                          clsx(
                            styles.selectOptionBase,
                            active
                              ? styles.selectOptionActive
                              : styles.selectOptionInactive,
                          )
                        }
                      >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {({ selected, active }: any) =>
                          renderOptionContent(selected, active, o.title)
                        }
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
  );
}

function renderListbox(
  d: FilterAttribute,
  params: Record<string, unknown>,
  setParams: (p: Record<string, unknown>) => void,
) {
  return (
    <Listbox
      value={d.multiple ? split(params[d.name]) : params[d.name]}
      onChange={(v: string | string[]) =>
        setParams({
          ...params,
          [d.name]: d.multiple ? (v as string[]).join(',') : v,
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      multiple={d.multiple as any}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(({ open: isOpen }: any) => {
        const isSelected = makeIsSelected(d, params);
        const selectedValue = getSelectedValue(d, params, isSelected);

        return (
          <div className={styles.selectRelative}>
            <Listbox.Button className={styles.selectButton}>
              {renderSelectButton(d, selectedValue, params, setParams)}
            </Listbox.Button>
            <Transition
              show={isOpen}
              as={Fragment}
              leave={styles.transitionLeave}
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className={styles.selectOptions}>
                {toArray(d.options).map((o: SelectOption, j: number) => (
                  <Listbox.Option
                    key={j}
                    value={o.value}
                    className={({ active }: { active: boolean }) =>
                      clsx(
                        styles.selectOptionBase,
                        active
                          ? styles.selectOptionActive
                          : styles.selectOptionInactive,
                      )
                    }
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {({ selected, active }: any) =>
                      renderOptionContent(selected, active, o.title)
                    }
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any}
    </Listbox>
  );
}

function renderFilterField(
  d: FilterAttribute,
  params: Record<string, unknown>,
  setParams: (p: Record<string, unknown>) => void,
  searchInput: Record<string, string>,
  setSearchInput: (s: Record<string, string>) => void,
) {
  if (d.type === 'select' && d.searchable) {
    return renderSearchableCombobox(d, params, setParams, searchInput, setSearchInput);
  }

  if (d.type === 'select') {
    return renderListbox(d, params, setParams);
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
      className={styles.filterInput}
    />
  );
}

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<Record<string, unknown>>(
    getParams(searchParams, size),
  );
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const { handleSubmit } = useForm();
  const chains = useChains();

  const onSubmit = (
    _e1?: unknown,
    _e2?: unknown,
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
            (d: Chain) => d.chain_type === 'vm' && (!d.no_inflation || d.deprecated),
          )
          .map((d: Chain, i: number) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc'],
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
        ['completed', 'failed', 'pending'].map((d) => ({
          value: d,
          title: capitalize(d),
        })),
      ),
    },
    { label: 'Voter (Verifier Address)', name: 'voter' },
    params.voter && {
      label: 'Vote',
      name: 'vote',
      type: 'select',
      options: _.concat(
        { title: 'Any', value: undefined as string | undefined },
        ['yes', 'no', 'unsubmitted'].map((d) => ({
          value: d,
          title: capitalize(d),
        })),
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
                          {(attributes as FilterAttribute[]).map(
                            (d: FilterAttribute, i: number) => (
                              <div key={i}>
                                <label
                                  htmlFor={d.name}
                                  className={styles.filterLabel}
                                >
                                  {d.label}
                                </label>
                                <div className={styles.filterFieldWrapper}>
                                  {renderFilterField(
                                    d,
                                    params,
                                    setParams,
                                    searchInput,
                                    setSearchInput,
                                  )}
                                </div>
                              </div>
                            ),
                          )}
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
                              : styles.submitButtonDisabled,
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
