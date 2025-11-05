'use client';

import { Combobox, Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { LuChevronsUpDown } from 'react-icons/lu';
import { MdCheck } from 'react-icons/md';

import { split, toArray } from '@/lib/parser';
import { equalsIgnoreCase, filterSearchInput } from '@/lib/string';
import { filterSelectInputStyles } from './FilterSelectInput.styles';
import {
  FilterAttribute,
  FilterOption,
  FilterParams,
} from './Interchain.types';

interface FilterSelectInputProps {
  attribute: FilterAttribute;
  params: FilterParams;
  searchInput: Record<string, string>;
  setParams: (params: FilterParams) => void;
  setSearchInput: (input: Record<string, string>) => void;
}

export function FilterSelectInput({
  attribute,
  params,
  searchInput,
  setParams,
  setSearchInput,
}: FilterSelectInputProps) {
  const isSelected = (v: string) => {
    if (attribute.multiple) {
      return split(params[attribute.name]).includes(v);
    }
    return (
      v === params[attribute.name] ||
      equalsIgnoreCase(v, String(params[attribute.name] || ''))
    );
  };

  const options = toArray(attribute.options) as FilterOption[];
  const selectedValue = attribute.multiple
    ? options.filter(o => isSelected(o?.value || ''))
    : options.find(o => isSelected(o?.value || ''));

  const selectedArray = Array.isArray(selectedValue) ? selectedValue : [];
  const selectedSingle = !Array.isArray(selectedValue)
    ? selectedValue
    : undefined;

  const handleChange = (v: string | string[]) => {
    setParams({
      ...params,
      [attribute.name]: attribute.multiple
        ? Array.isArray(v)
          ? v.join(',')
          : v
        : v,
    });
  };

  const handleRemoveItem = (item: FilterOption) => {
    const filtered = selectedArray
      .filter(sv => sv?.value !== item?.value)
      .map(sv => sv?.value)
      .join(',');
    setParams({
      ...params,
      [attribute.name]: filtered,
    });
  };

  if (attribute.searchable) {
    return (
      <Combobox
        value={
          attribute.multiple
            ? split(params[attribute.name])
            : params[attribute.name]
        }
        onChange={handleChange}
        multiple={attribute.multiple}
      >
        {({ open }) => (
          <div className="relative">
            <Combobox.Button className={filterSelectInputStyles.button.base}>
              {attribute.multiple ? (
                <div
                  className={filterSelectInputStyles.button.selectedContainer(
                    selectedArray.length
                  )}
                >
                  {selectedArray.length === 0 ? (
                    <span
                      className={filterSelectInputStyles.button.placeholder}
                    >
                      Any
                    </span>
                  ) : (
                    selectedArray.map((v: FilterOption, j: number) => (
                      <div
                        key={j}
                        onClick={() => handleRemoveItem(v)}
                        className={filterSelectInputStyles.button.selectedItem}
                      >
                        {v?.title}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <span className={filterSelectInputStyles.button.placeholder}>
                  {selectedSingle?.title || 'Any'}
                </span>
              )}
              <span className={filterSelectInputStyles.button.icon}>
                <LuChevronsUpDown
                  size={20}
                  className={filterSelectInputStyles.button.iconSvg}
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
                  {(toArray(attribute.options) as FilterOption[])
                    .filter(o =>
                      filterSearchInput(
                        [o?.title || '', o?.value || ''],
                        searchInput[attribute.name]
                      )
                    )
                    .map((o, j) => (
                      <Combobox.Option
                        key={j}
                        value={o?.value || ''}
                        className={({ active }) =>
                          filterSelectInputStyles.options.option(active)
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={filterSelectInputStyles.options.optionText(
                                selected
                              )}
                            >
                              {o?.title || ''}
                            </span>
                            {selected && (
                              <span
                                className={filterSelectInputStyles.options.checkIcon(
                                  active
                                )}
                              >
                                <MdCheck size={20} />
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
        )}
      </Combobox>
    );
  }

  return (
    <Listbox
      value={
        attribute.multiple
          ? split(params[attribute.name])
          : params[attribute.name]
      }
      onChange={handleChange}
      multiple={attribute.multiple}
    >
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className={filterSelectInputStyles.button.base}>
            {attribute.multiple ? (
              <div
                className={filterSelectInputStyles.button.selectedContainer(
                  selectedArray.length
                )}
              >
                {selectedArray.length === 0 ? (
                  <span className={filterSelectInputStyles.button.placeholder}>
                    Any
                  </span>
                ) : (
                  selectedArray.map((v: FilterOption, j: number) => (
                    <div
                      key={j}
                      onClick={() => handleRemoveItem(v)}
                      className={filterSelectInputStyles.button.selectedItem}
                    >
                      {v?.title}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <span className={filterSelectInputStyles.button.placeholder}>
                {selectedSingle?.title || 'Any'}
              </span>
            )}
            <span className={filterSelectInputStyles.button.icon}>
              <LuChevronsUpDown
                size={20}
                className={filterSelectInputStyles.button.iconSvg}
              />
            </span>
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
              {(toArray(attribute.options) as FilterOption[]).map((o, j) => (
                <Listbox.Option
                  key={j}
                  value={o?.value || ''}
                  className={({ active }) =>
                    filterSelectInputStyles.options.option(active)
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={filterSelectInputStyles.options.optionText(
                          selected
                        )}
                      >
                        {o?.title || ''}
                      </span>
                      {selected && (
                        <span
                          className={filterSelectInputStyles.options.checkIcon(
                            active
                          )}
                        >
                          <MdCheck size={20} />
                        </span>
                      )}
                    </>
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
