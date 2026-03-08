'use client';

import { Combobox, Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { LuChevronsUpDown } from 'react-icons/lu';
import { MdCheck } from 'react-icons/md';

import { split, toArray } from '@/lib/parser';
import { equalsIgnoreCase, filterSearchInput } from '@/lib/string';
import {
  FilterAttribute,
  FilterOption,
  FilterParams,
  InterchainOptionContentProps,
} from '../Interchain.types';
import { filterSelectInputStyles } from './FilterSelectInput.styles';

interface FilterSelectInputProps {
  attribute: FilterAttribute;
  params: FilterParams;
  searchInput: Record<string, string>;
  setParams: (params: FilterParams) => void;
  setSearchInput: (input: Record<string, string>) => void;
}

// ---- Shared small pieces ----

function OptionContent({
  selected,
  active,
  title,
}: InterchainOptionContentProps) {
  return (
    <>
      <span className={filterSelectInputStyles.options.optionText(selected)}>
        {title}
      </span>
      {selected && (
        <span className={filterSelectInputStyles.options.checkIcon(active)}>
          <MdCheck size={20} />
        </span>
      )}
    </>
  );
}

function SelectButtonContent({
  attribute,
  selectedArray,
  selectedSingle,
  onRemoveItem,
}: {
  attribute: FilterAttribute;
  selectedArray: FilterOption[];
  selectedSingle: FilterOption | undefined;
  onRemoveItem: (item: FilterOption) => void;
}) {
  if (!attribute.multiple) {
    return (
      <span className={filterSelectInputStyles.button.placeholder}>
        {selectedSingle?.title || 'Any'}
      </span>
    );
  }

  return (
    <div
      className={filterSelectInputStyles.button.selectedContainer(
        selectedArray.length
      )}
    >
      {selectedArray.length === 0 ? (
        <span className={filterSelectInputStyles.button.placeholder}>Any</span>
      ) : (
        selectedArray.map((v: FilterOption, j: number) => (
          <div
            key={j}
            onClick={() => onRemoveItem(v)}
            className={filterSelectInputStyles.button.selectedItem}
          >
            {v?.title}
          </div>
        ))
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <span className={filterSelectInputStyles.button.icon}>
      <LuChevronsUpDown
        size={20}
        className={filterSelectInputStyles.button.iconSvg}
      />
    </span>
  );
}

// ---- Main component ----

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
  const selectedArray = options.filter(o => isSelected(o?.value || ''));
  const selectedSingle = !attribute.multiple
    ? options.find(o => isSelected(o?.value || ''))
    : undefined;

  const handleChange = (v: string | string[] | null) => {
    if (v === null) return;
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
    setParams({ ...params, [attribute.name]: filtered });
  };

  if (attribute.searchable) {
    return (
      <SearchableInput
        attribute={attribute}
        params={params}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedArray={selectedArray}
        selectedSingle={selectedSingle}
        options={options}
        onChange={handleChange}
        onRemoveItem={handleRemoveItem}
      />
    );
  }

  return (
    <SimpleInput
      attribute={attribute}
      params={params}
      selectedArray={selectedArray}
      selectedSingle={selectedSingle}
      options={options}
      onChange={handleChange}
      onRemoveItem={handleRemoveItem}
    />
  );
}

// ---- Searchable (Combobox) ----

function SearchableInput({
  attribute,
  params,
  searchInput,
  setSearchInput,
  selectedArray,
  selectedSingle,
  options,
  onChange,
  onRemoveItem,
}: {
  attribute: FilterAttribute;
  params: FilterParams;
  searchInput: Record<string, string>;
  setSearchInput: (input: Record<string, string>) => void;
  selectedArray: FilterOption[];
  selectedSingle: FilterOption | undefined;
  options: FilterOption[];
  onChange: (v: string | string[] | null) => void;
  onRemoveItem: (item: FilterOption) => void;
}) {
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

// ---- Simple (Listbox) ----

function SimpleInput({
  attribute,
  params,
  selectedArray,
  selectedSingle,
  options,
  onChange,
  onRemoveItem,
}: {
  attribute: FilterAttribute;
  params: FilterParams;
  selectedArray: FilterOption[];
  selectedSingle: FilterOption | undefined;
  options: FilterOption[];
  onChange: (v: string | string[] | null) => void;
  onRemoveItem: (item: FilterOption) => void;
}) {
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
