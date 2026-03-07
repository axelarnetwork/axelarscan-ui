'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineFilterList, MdClose, MdCheck } from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import type { Chain } from '@/types';
import { useChains } from '@/hooks/useGlobalData';
import { split, toArray } from '@/lib/parser';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import {
  equalsIgnoreCase,
  capitalize,
  filterSearchInput,
} from '@/lib/string';

import type { FilterOption, FilterAttribute } from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

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

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

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

  const attributes: FilterAttribute[] = ([
    { label: 'Session ID', name: 'sessionId' },
    { label: 'Message ID', name: 'messageId' },
    {
      label: 'Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        (toArray(chains) as Chain[])
          .filter(
            (d: Chain) => d.chain_type === 'vm' && (!d.no_inflation || d.deprecated)
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
      label: 'Multisig Prover Contract Address',
      name: 'multisigProverContractAddress',
    },
    { label: 'Multisig Contract Address', name: 'multisigContractAddress' },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      multiple: true,
      options: _.concat(
        { value: '', title: 'Any' },
        ['completed', 'failed', 'pending'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    },
    { label: 'Signer (Verifier Address)', name: 'signer' },
    params.signer ? {
      label: 'Sign',
      name: 'sign',
      type: 'select',
      options: _.concat(
        { value: '', title: 'Any' },
        ['signed', 'unsubmitted'].map(d => ({
          value: d,
          title: capitalize(d),
        }))
      ),
    } : undefined,
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ] as (FilterAttribute | undefined)[]).filter((d): d is FilterAttribute => !!d);

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
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
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
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
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
                                    <SearchableSelect
                                      attribute={d}
                                      params={params}
                                      setParams={setParams}
                                      searchInput={searchInput}
                                      setSearchInput={setSearchInput}
                                    />
                                  ) : (
                                    <SimpleSelect
                                      attribute={d}
                                      params={params}
                                      setParams={setParams}
                                    />
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
                                    value={(params[d.name] as string) ?? ''}
                                    onChange={(e) =>
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
                              : styles.submitBtnDisabled
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

// ─── Sub-components ──────────────────────────────────────────────────────────

interface SelectFieldProps {
  attribute: FilterAttribute;
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
}

interface SearchableSelectProps extends SelectFieldProps {
  searchInput: Record<string, string>;
  setSearchInput: (input: Record<string, string>) => void;
}

function SelectButtonContent({
  attribute,
  selectedValue,
  params,
  setParams,
}: {
  attribute: FilterAttribute;
  selectedValue: FilterOption | FilterOption[] | undefined;
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
}) {
  if (!attribute.multiple) {
    return (
      <span className={styles.selectTruncate}>
        {(selectedValue as FilterOption | undefined)?.title}
      </span>
    );
  }

  const multiValues = selectedValue as FilterOption[];
  if (multiValues.length === 0) {
    return (
      <div className={styles.selectFlexWrap}>
        <span className={styles.selectTruncate}>Any</span>
      </div>
    );
  }

  return (
    <div className={clsx(styles.selectFlexWrap, styles.selectFlexWrapMargin)}>
      {multiValues.map((v: FilterOption, j: number) => (
        <div
          key={j}
          onClick={() =>
            setParams({
              ...params,
              [attribute.name]: multiValues
                .filter((_v: FilterOption) => _v.value !== v.value)
                .map((_v: FilterOption) => _v.value)
                .join(','),
            })
          }
          className={styles.selectMultiTag}
        >
          {v.title}
        </div>
      ))}
    </div>
  );
}

function OptionContent({ selected, active, title }: { selected: boolean; active: boolean; title: string }) {
  return (
    <>
      <span
        className={clsx(
          styles.selectTruncate,
          selected ? styles.optionTextSelected : styles.optionTextNormal
        )}
      >
        {title}
      </span>
      {selected && (
        <span
          className={clsx(
            styles.optionCheckWrapper,
            active ? styles.optionCheckActive : styles.optionCheckInactive
          )}
        >
          <MdCheck size={20} />
        </span>
      )}
    </>
  );
}

function getSelectedValue(attribute: FilterAttribute, params: Record<string, unknown>) {
  const paramValue = params[attribute.name] as string | undefined;
  const isSelected = (v: string) =>
    attribute.multiple
      ? split(paramValue).includes(v)
      : v === paramValue || equalsIgnoreCase(v, paramValue);
  const selectedValue = attribute.multiple
    ? toArray(attribute.options).filter((o: FilterOption) => isSelected(o.value ?? ''))
    : toArray(attribute.options).find((o: FilterOption) => isSelected(o.value ?? ''));
  return selectedValue;
}

function SearchableSelect({ attribute, params, setParams, searchInput, setSearchInput }: SearchableSelectProps) {
  const handleChange = (v: string | string[]) =>
    setParams({
      ...params,
      [attribute.name]: attribute.multiple ? (v as string[]).join(',') : v,
    });

  return (
    <Combobox
      value={
        attribute.multiple
          ? split(params[attribute.name])
          : (params[attribute.name] as string)
      }
      onChange={handleChange}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      multiple={attribute.multiple as any}
    >
      {({ open: isOpen }) => {
        const selectedValue = getSelectedValue(attribute, params);

        return (
          <div className="relative">
            <Combobox.Button className={styles.selectButton}>
              <SelectButtonContent
                attribute={attribute}
                selectedValue={selectedValue}
                params={params}
                setParams={setParams}
              />
              <span className={styles.selectChevronWrapper}>
                <LuChevronsUpDown size={20} className={styles.selectChevronIcon} />
              </span>
            </Combobox.Button>
            <Transition
              show={isOpen}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className={styles.comboboxDropdownWrapper}>
                <Combobox.Input
                  placeholder={`Search ${attribute.label}`}
                  value={searchInput[attribute.name] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchInput({
                      ...searchInput,
                      [attribute.name]: e.target.value,
                    })
                  }
                  className={styles.comboboxInput}
                />
                <Combobox.Options className={styles.comboboxOptions}>
                  {toArray(attribute.options)
                    .filter((o: FilterOption) =>
                      filterSearchInput(
                        [o.title, o.value].filter(Boolean) as string[],
                        searchInput[attribute.name]
                      )
                    )
                    .map((o: FilterOption, j: number) => (
                      <Combobox.Option
                        key={j}
                        value={o.value}
                        className={({ active }: { active: boolean }) =>
                          clsx(
                            styles.comboboxOptionBase,
                            active
                              ? styles.comboboxOptionActive
                              : styles.comboboxOptionInactive
                          )
                        }
                      >
                        {({ selected, active }: { selected: boolean; active: boolean }) => (
                          <OptionContent selected={selected} active={active} title={o.title} />
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

function SimpleSelect({ attribute, params, setParams }: SelectFieldProps) {
  const handleChange = (v: string | string[]) =>
    setParams({
      ...params,
      [attribute.name]: attribute.multiple ? (v as string[]).join(',') : v,
    });

  return (
    <Listbox
      value={
        attribute.multiple
          ? split(params[attribute.name])
          : (params[attribute.name] as string)
      }
      onChange={handleChange}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      multiple={attribute.multiple as any}
    >
      {({ open: isOpen }) => {
        const selectedValue = getSelectedValue(attribute, params);

        return (
          <div className="relative">
            <Listbox.Button className={styles.selectButton}>
              <SelectButtonContent
                attribute={attribute}
                selectedValue={selectedValue}
                params={params}
                setParams={setParams}
              />
              <span className={styles.selectChevronWrapper}>
                <LuChevronsUpDown size={20} className={styles.selectChevronIcon} />
              </span>
            </Listbox.Button>
            <Transition
              show={isOpen}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className={styles.listboxOptions}>
                {toArray(attribute.options).map(
                  (o: FilterOption, j: number) => (
                    <Listbox.Option
                      key={j}
                      value={o.value}
                      className={({ active }: { active: boolean }) =>
                        clsx(
                          styles.comboboxOptionBase,
                          active
                            ? styles.comboboxOptionActive
                            : styles.comboboxOptionInactive
                        )
                      }
                    >
                      {({ selected, active }: { selected: boolean; active: boolean }) => (
                        <OptionContent selected={selected} active={active} title={o.title} />
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
  );
}
