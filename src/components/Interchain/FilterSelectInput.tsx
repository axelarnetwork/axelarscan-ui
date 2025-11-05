'use client';

import { Combobox, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Fragment } from 'react';
import { LuChevronsUpDown } from 'react-icons/lu';
import { MdCheck } from 'react-icons/md';

import { split, toArray } from '@/lib/parser';
import { equalsIgnoreCase, filterSearchInput } from '@/lib/string';
import { FilterAttribute, FilterOption, FilterParams } from './Interchain.types';

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
          attribute.multiple ? split(params[attribute.name]) : params[attribute.name]
        }
        onChange={handleChange}
        multiple={attribute.multiple}
      >
        {({ open }) => (
          <div className="relative">
            <Combobox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
              {attribute.multiple ? (
                <div
                  className={clsx(
                    'flex flex-wrap',
                    selectedArray.length !== 0 && 'my-1'
                  )}
                >
                  {selectedArray.length === 0 ? (
                    <span className="block truncate">Any</span>
                  ) : (
                    selectedArray.map((v: FilterOption, j: number) => (
                      <div
                        key={j}
                        onClick={() => handleRemoveItem(v)}
                        className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                      >
                        {v?.title}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <span className="block truncate">
                  {selectedSingle?.title || 'Any'}
                </span>
              )}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <LuChevronsUpDown size={20} className="text-zinc-400" />
              </span>
            </Combobox.Button>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="mt-2 gap-y-2">
                <Combobox.Input
                  placeholder={`Search ${attribute.label}`}
                  value={searchInput[attribute.name] || ''}
                  onChange={e =>
                    setSearchInput({
                      ...searchInput,
                      [attribute.name]: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6"
                />
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
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
                          clsx(
                            'relative cursor-default select-none py-2 pl-3 pr-9',
                            active ? 'bg-blue-600 text-white' : 'text-zinc-900'
                          )
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={clsx(
                                'block truncate',
                                selected ? 'font-semibold' : 'font-normal'
                              )}
                            >
                              {o?.title || ''}
                            </span>
                            {selected && (
                              <span
                                className={clsx(
                                  'absolute inset-y-0 right-0 flex items-center pr-4',
                                  active ? 'text-white' : 'text-blue-600'
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
        attribute.multiple ? split(params[attribute.name]) : params[attribute.name]
      }
      onChange={handleChange}
      multiple={attribute.multiple}
    >
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
            {attribute.multiple ? (
              <div
                className={clsx(
                  'flex flex-wrap',
                  selectedArray.length !== 0 && 'my-1'
                )}
              >
                {selectedArray.length === 0 ? (
                  <span className="block truncate">Any</span>
                ) : (
                  selectedArray.map((v: FilterOption, j: number) => (
                    <div
                      key={j}
                      onClick={() => handleRemoveItem(v)}
                      className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                    >
                      {v?.title}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <span className="block truncate">
                {selectedSingle?.title || 'Any'}
              </span>
            )}
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <LuChevronsUpDown size={20} className="text-zinc-400" />
            </span>
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
              {(toArray(attribute.options) as FilterOption[]).map((o, j) => (
                <Listbox.Option
                  key={j}
                  value={o?.value || ''}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-blue-600 text-white' : 'text-zinc-900'
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={clsx(
                          'block truncate',
                          selected ? 'font-semibold' : 'font-normal'
                        )}
                      >
                        {o?.title || ''}
                      </span>
                      {selected && (
                        <span
                          className={clsx(
                            'absolute inset-y-0 right-0 flex items-center pr-4',
                            active ? 'text-white' : 'text-blue-600'
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

