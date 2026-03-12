'use client';

import { Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';

import { split } from '@/lib/parser';
import { filterSearchInput } from '@/lib/string';

import type { SearchableInputProps } from './Filters.types';
import { filterSelectInputStyles } from './FilterSelectInput.styles';
import { SelectButtonContent } from './SelectButtonContent.component';
import { ChevronIcon } from './ChevronIcon.component';
import { OptionContent } from './OptionContent.component';

export function SearchableInput({
  attribute,
  params,
  searchInput,
  setSearchInput,
  selectedArray,
  selectedSingle,
  options,
  onChange,
  onRemoveItem,
}: SearchableInputProps) {
  const filteredOptions = options.filter(o =>
    filterSearchInput(
      [o?.title || '', o?.value || ''],
      searchInput[attribute.name]
    )
  );

  return (
    <Combobox
      value={
        attribute.multiple
          ? split(params[attribute.name])
          : String(params[attribute.name] ?? '')
      }
      onChange={onChange}
      multiple={attribute.multiple}
    >
      {({ open }) => (
        <div className="relative">
          <Combobox.Button className={filterSelectInputStyles.button.base}>
            <SelectButtonContent
              attribute={attribute}
              selectedArray={selectedArray}
              selectedSingle={selectedSingle}
              onRemoveItem={onRemoveItem}
            />
            <ChevronIcon />
          </Combobox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={filterSelectInputStyles.input.container}>
              <Combobox.Input
                placeholder={`Search ${attribute.label}`}
                value={searchInput[attribute.name] || ''}
                onChange={e =>
                  setSearchInput({
                    ...searchInput,
                    [attribute.name]: e.target.value,
                  })
                }
                className={filterSelectInputStyles.input.field}
              />
              <Combobox.Options
                className={filterSelectInputStyles.options.container}
              >
                {filteredOptions.map((o, j) => (
                  <Combobox.Option
                    key={j}
                    value={o?.value || ''}
                    className={({ active }) =>
                      filterSelectInputStyles.options.option(active)
                    }
                  >
                    {({ selected, active }) => (
                      <OptionContent
                        selected={selected}
                        active={active}
                        title={o?.title || ''}
                      />
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Transition>
        </div>
      )}
    </Combobox>
  );
}
