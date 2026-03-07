'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { LuChevronsUpDown } from 'react-icons/lu';

import { split, toArray } from '@/lib/parser';

import type { FilterOption, SelectFieldProps } from './FilterSelect.types';
import * as styles from './FilterSelect.styles';
import { getSelectedValue } from './FilterSelect.utils';
import { SelectButtonContent } from './SelectButtonContent.component';
import { OptionContent } from './OptionContent.component';

export function SimpleSelect({
  attribute,
  params,
  setParams,
}: SelectFieldProps) {
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
      multiple={attribute.multiple as boolean | undefined}
    >
      {({ open: isOpen }) => {
        const selectedValue = getSelectedValue(attribute, params);

        return (
          <div className={styles.selectRelative}>
            <Listbox.Button className={styles.selectButton}>
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
            </Listbox.Button>
            <Transition
              show={isOpen}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className={styles.selectOptions}>
                {toArray(attribute.options).map(
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
