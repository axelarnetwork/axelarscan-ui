'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';

import { split } from '@/lib/parser';

import type { SimpleInputProps } from './Filters.types';
import { filterSelectInputStyles } from './FilterSelectInput.styles';
import { SelectButtonContent } from './SelectButtonContent.component';
import { ChevronIcon } from './ChevronIcon.component';
import { OptionContent } from './OptionContent.component';

export function SimpleInput({
  attribute,
  params,
  selectedArray,
  selectedSingle,
  options,
  onChange,
  onRemoveItem,
}: SimpleInputProps) {
  return (
    <Listbox
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
          <Listbox.Button className={filterSelectInputStyles.button.base}>
            <SelectButtonContent
              attribute={attribute}
              selectedArray={selectedArray}
              selectedSingle={selectedSingle}
              onRemoveItem={onRemoveItem}
            />
            <ChevronIcon />
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave={filterSelectInputStyles.transition.leave}
            leaveFrom={filterSelectInputStyles.transition.leaveFrom}
            leaveTo={filterSelectInputStyles.transition.leaveTo}
          >
            <Listbox.Options
              className={filterSelectInputStyles.options.container}
            >
              {options.map((o, j) => (
                <Listbox.Option
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
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
