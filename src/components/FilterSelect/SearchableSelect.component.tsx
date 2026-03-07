'use client';

import { Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { LuChevronsUpDown } from 'react-icons/lu';

import { split, toArray } from '@/lib/parser';
import { filterSearchInput } from '@/lib/string';

import type { FilterOption, SearchableSelectProps } from './FilterSelect.types';
import * as styles from './FilterSelect.styles';
import { getSelectedValue } from './FilterSelect.utils';
import { SelectButtonContent } from './SelectButtonContent.component';
import { OptionContent } from './OptionContent.component';

export function SearchableSelect({
  attribute,
  params,
  setParams,
  searchInput,
  setSearchInput,
}: SearchableSelectProps) {
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
      multiple={attribute.multiple as boolean | undefined}
    >
      {({ open: isOpen }) => {
        const selectedValue = getSelectedValue(attribute, params);

        return (
          <div className={styles.selectRelative}>
            <Combobox.Button className={styles.selectButton}>
              <SelectButtonContent
                attribute={attribute}
                selectedValue={selectedValue}
                params={params}
                setParams={setParams}
              />
              <span className={styles.selectIconWrapper}>
                <LuChevronsUpDown
                  size={20}
                  className={styles.selectChevronIcon}
                />
              </span>
            </Combobox.Button>
            <Transition
              show={isOpen}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className={styles.selectSearchWrapper}>
                <Combobox.Input
                  placeholder={`Search ${attribute.label}`}
                  value={searchInput[attribute.name] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchInput({
                      ...searchInput,
                      [attribute.name]: e.target.value,
                    })
                  }
                  className={styles.filterInput}
                />
                <Combobox.Options className={styles.selectOptions}>
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
                        }: {
                          selected: boolean;
                          active: boolean;
                        }) => (
                          <OptionContent
                            selected={selected}
                            active={active}
                            title={o.title}
                          />
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
