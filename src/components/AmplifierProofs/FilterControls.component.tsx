'use client';

import { Fragment } from 'react';
import { Combobox, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { MdCheck } from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { split, toArray } from '@/lib/parser';
import { filterSearchInput } from '@/lib/string';

import type {
  FilterOption,
  SelectButtonContentProps,
  OptionContentProps,
  SelectFieldProps,
  SearchableSelectProps,
} from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';
import { getSelectedValue } from './AmplifierProofs.utils';

export function SelectButtonContent({
  attribute,
  selectedValue,
  params,
  setParams,
}: SelectButtonContentProps) {
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

export function OptionContent({ selected, active, title }: OptionContentProps) {
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

export function SearchableSelect({ attribute, params, setParams, searchInput, setSearchInput }: SearchableSelectProps) {
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

export function SimpleSelect({ attribute, params, setParams }: SelectFieldProps) {
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
