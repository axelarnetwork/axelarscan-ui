'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { LuChevronsUpDown } from 'react-icons/lu';

import { split, toArray } from '@/lib/parser';

import type { FilterOption, SelectFieldProps } from './FilterSelect.types';
import * as styles from './FilterSelect.styles';
import { getSelectedValue } from './FilterSelect.utils';
import { SelectButtonContent } from './SelectButtonContent.component';
import { SimpleOptionsList } from './SimpleOptionsList.component';

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

  const options = toArray(attribute.options) as FilterOption[];

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
                <SimpleOptionsList options={options} />
              </Listbox.Options>
            </Transition>
          </div>
        );
      }}
    </Listbox>
  );
}
