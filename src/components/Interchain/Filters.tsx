'use client';

import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuChevronsUpDown } from 'react-icons/lu';
import { MdCheck, MdClose, MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useGlobalStore } from '@/components/Global';
import { getParams, getQueryString, isFiltered } from '@/lib/operator';
import { split, toArray } from '@/lib/parser';
import { equalsIgnoreCase, filterSearchInput } from '@/lib/string';
import {
  FilterAttribute,
  FilterOption,
  FilterParams,
} from './Interchain.types';

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<FilterParams>(
    getParams(searchParams) as FilterParams
  );
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const { handleSubmit } = useForm();
  const { chains, assets, itsAssets } = useGlobalStore();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (
    _e1: React.FormEvent | unknown,
    _e2: React.ChangeEvent | unknown,
    _params?: FilterParams
  ) => {
    if (!_params) {
      _params = params;
    }

    if (!_.isEqual(_params, getParams(searchParams))) {
      router.push(`${pathname}${getQueryString(_params)}`);
      setParams(_params);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams) as FilterParams);
  };

  const attributes: FilterAttribute[] = [
    {
      label: 'Transfers Type',
      name: 'transfersType',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'gmp', title: 'General Message Passing' },
        { value: 'transfers', title: 'Token Transfers' },
      ],
    },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Destination Chain',
      name: 'destinationChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'From / To Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        _.uniqBy(
          toArray(
            _.concat(
              params.assetType !== 'its'
                ? toArray(assets).map(d => ({
                    value: d.id,
                    title: `${d.symbol} (${d.id})`,
                  }))
                : [],
              params.assetType !== 'gateway'
                ? toArray(itsAssets).map(d => ({
                    value: d.symbol,
                    title: `${d.symbol} (ITS)`,
                  }))
                : []
            )
          ),
          'value'
        ),
        ['title'],
        ['asc']
      ),
    },
    ...(params.assetType === 'its'
      ? [
          {
            label: 'ITS Token Address',
            name: 'itsTokenAddress',
          } as FilterAttribute,
        ]
      : []),
    {
      label: 'Method',
      name: 'contractMethod',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'callContract', title: 'CallContract' },
        { value: 'callContractWithToken', title: 'CallContractWithToken' },
        { value: 'InterchainTransfer', title: 'InterchainTransfer' },
        { value: 'SquidCoral', title: 'SquidCoral' },
      ],
    },
    { label: 'Contract', name: 'contractAddress' },
    {
      label: 'Asset Type',
      name: 'assetType',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'gateway', title: 'Gateway Token' },
        { value: 'its', title: 'ITS Token' },
      ],
    },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ] as FilterAttribute[];

  const filtered = isFiltered(params);

  return (
    <>
      <Button
        color="default"
        circle="true"
        onClick={() => setOpen(true)}
        className={clsx(filtered && 'bg-blue-50 dark:bg-blue-950')}
      >
        <MdOutlineFilterList
          size={20}
          className={clsx(filtered && 'text-blue-600 dark:text-blue-500')}
        />
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" onClose={onClose} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-50 bg-opacity-50 transition-opacity dark:bg-zinc-900 dark:bg-opacity-50" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex h-full flex-col divide-y divide-zinc-200 bg-white shadow-xl"
                    >
                      <div className="h-0 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between bg-blue-600 p-4 sm:px-6">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            Filter
                          </Dialog.Title>
                          <button
                            type="button"
                            onClick={() => onClose()}
                            className="relative ml-3 text-blue-200 hover:text-white"
                          >
                            <MdClose size={20} />
                          </button>
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-y-6 px-4 py-6 sm:px-6">
                          {attributes.map((d, i) => (
                            <div key={i}>
                              <label
                                htmlFor={d.name}
                                className="text-sm font-medium leading-6 text-zinc-900"
                              >
                                {d.label}
                              </label>
                              <div className="mt-2">
                                {d.type === 'select' ? (
                                  d.searchable ? (
                                    <Combobox
                                      value={
                                        d.multiple
                                          ? split(params[d.name])
                                          : params[d.name]
                                      }
                                      onChange={(v: string | string[]) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? Array.isArray(v)
                                              ? v.join(',')
                                              : v
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const isSelected = (v: string) =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                String(params[d.name] || '')
                                              );
                                        const options = toArray(
                                          d.options
                                        ) as FilterOption[];
                                        const selectedValue = d.multiple
                                          ? options.filter(o =>
                                              isSelected(o?.value || '')
                                            )
                                          : options.find(o =>
                                              isSelected(o?.value || '')
                                            );

                                        const selectedArray = Array.isArray(
                                          selectedValue
                                        )
                                          ? selectedValue
                                          : [];
                                        const selectedSingle = !Array.isArray(
                                          selectedValue
                                        )
                                          ? selectedValue
                                          : undefined;

                                        return (
                                          <div className="relative">
                                            <Combobox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    'flex flex-wrap',
                                                    selectedArray.length !==
                                                      0 && 'my-1'
                                                  )}
                                                >
                                                  {selectedArray.length ===
                                                  0 ? (
                                                    <span className="block truncate">
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedArray.map(
                                                      (
                                                        v: FilterOption,
                                                        j: number
                                                      ) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedArray
                                                                  .filter(
                                                                    (
                                                                      sv: FilterOption
                                                                    ) =>
                                                                      sv?.value !==
                                                                      v?.value
                                                                  )
                                                                  .map(
                                                                    (
                                                                      sv: FilterOption
                                                                    ) =>
                                                                      sv?.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                                                        >
                                                          {v?.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="block truncate">
                                                  {selectedSingle?.title}
                                                </span>
                                              )}
                                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className="text-zinc-400"
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
                                              <div className="mt-2 gap-y-2">
                                                <Combobox.Input
                                                  placeholder={`Search ${d.label}`}
                                                  value={
                                                    searchInput[d.name] || ''
                                                  }
                                                  onChange={e =>
                                                    setSearchInput({
                                                      ...searchInput,
                                                      [d.name]: e.target.value,
                                                    })
                                                  }
                                                  className="w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6"
                                                />
                                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
                                                  {(
                                                    toArray(
                                                      d.options
                                                    ) as FilterOption[]
                                                  )
                                                    .filter(o =>
                                                      filterSearchInput(
                                                        [
                                                          o?.title || '',
                                                          o?.value || '',
                                                        ],
                                                        searchInput[d.name]
                                                      )
                                                    )
                                                    .map((o, j) => (
                                                      <Combobox.Option
                                                        key={j}
                                                        value={o?.value || ''}
                                                        className={({
                                                          active,
                                                        }) =>
                                                          clsx(
                                                            'relative cursor-default select-none py-2 pl-3 pr-9',
                                                            active
                                                              ? 'bg-blue-600 text-white'
                                                              : 'text-zinc-900'
                                                          )
                                                        }
                                                      >
                                                        {({
                                                          selected,
                                                          active,
                                                        }) => (
                                                          <>
                                                            <span
                                                              className={clsx(
                                                                'block truncate',
                                                                selected
                                                                  ? 'font-semibold'
                                                                  : 'font-normal'
                                                              )}
                                                            >
                                                              {o?.title || ''}
                                                            </span>
                                                            {selected && (
                                                              <span
                                                                className={clsx(
                                                                  'absolute inset-y-0 right-0 flex items-center pr-4',
                                                                  active
                                                                    ? 'text-white'
                                                                    : 'text-blue-600'
                                                                )}
                                                              >
                                                                <MdCheck
                                                                  size={20}
                                                                />
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
                                        );
                                      }}
                                    </Combobox>
                                  ) : (
                                    <Listbox
                                      value={
                                        d.multiple
                                          ? split(params[d.name])
                                          : params[d.name]
                                      }
                                      onChange={(v: string | string[]) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? Array.isArray(v)
                                              ? v.join(',')
                                              : v
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const isSelected = (v: string) =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                String(params[d.name] || '')
                                              );
                                        const options = toArray(
                                          d.options
                                        ) as FilterOption[];
                                        const selectedValue = d.multiple
                                          ? options.filter(o =>
                                              isSelected(o?.value || '')
                                            )
                                          : options.find(o =>
                                              isSelected(o?.value || '')
                                            );

                                        const selectedArray = Array.isArray(
                                          selectedValue
                                        )
                                          ? selectedValue
                                          : [];
                                        const selectedSingle = !Array.isArray(
                                          selectedValue
                                        )
                                          ? selectedValue
                                          : undefined;

                                        return (
                                          <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    'flex flex-wrap',
                                                    selectedArray.length !==
                                                      0 && 'my-1'
                                                  )}
                                                >
                                                  {selectedArray.length ===
                                                  0 ? (
                                                    <span className="block truncate">
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedArray.map(
                                                      (
                                                        v: FilterOption,
                                                        j: number
                                                      ) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedArray
                                                                  .filter(
                                                                    (
                                                                      sv: FilterOption
                                                                    ) =>
                                                                      sv?.value !==
                                                                      v?.value
                                                                  )
                                                                  .map(
                                                                    (
                                                                      sv: FilterOption
                                                                    ) =>
                                                                      sv?.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                                                        >
                                                          {v?.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="block truncate">
                                                  {selectedSingle?.title}
                                                </span>
                                              )}
                                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className="text-zinc-400"
                                                />
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
                                                {(
                                                  toArray(
                                                    d.options
                                                  ) as FilterOption[]
                                                ).map((o, j) => (
                                                  <Listbox.Option
                                                    key={j}
                                                    value={o?.value || ''}
                                                    className={({ active }) =>
                                                      clsx(
                                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                                        active
                                                          ? 'bg-blue-600 text-white'
                                                          : 'text-zinc-900'
                                                      )
                                                    }
                                                  >
                                                    {({ selected, active }) => (
                                                      <>
                                                        <span
                                                          className={clsx(
                                                            'block truncate',
                                                            selected
                                                              ? 'font-semibold'
                                                              : 'font-normal'
                                                          )}
                                                        >
                                                          {o?.title || ''}
                                                        </span>
                                                        {selected && (
                                                          <span
                                                            className={clsx(
                                                              'absolute inset-y-0 right-0 flex items-center pr-4',
                                                              active
                                                                ? 'text-white'
                                                                : 'text-blue-600'
                                                            )}
                                                          >
                                                            <MdCheck
                                                              size={20}
                                                            />
                                                          </span>
                                                        )}
                                                      </>
                                                    )}
                                                  </Listbox.Option>
                                                ))}
                                              </Listbox.Options>
                                            </Transition>
                                          </div>
                                        );
                                      }}
                                    </Listbox>
                                  )
                                ) : d.type === 'datetimeRange' ? (
                                  <DateRangePicker
                                    params={params}
                                    onChange={(v: Partial<FilterParams>) =>
                                      setParams({ ...params, ...v })
                                    }
                                    className=""
                                  />
                                ) : (
                                  <input
                                    type={d.type || 'text'}
                                    name={d.name}
                                    placeholder={d.label}
                                    value={params[d.name] || ''}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                      setParams({
                                        ...params,
                                        [d.name]: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 justify-end p-4">
                        <button
                          type="button"
                          onClick={() => onSubmit(undefined, undefined, {})}
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={!filtered}
                          className={clsx(
                            'ml-4 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                            filtered
                              ? 'bg-blue-600 hover:bg-blue-500'
                              : 'cursor-not-allowed bg-blue-500'
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
