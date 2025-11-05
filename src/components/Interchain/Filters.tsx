'use client';

import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Fragment } from 'react';
import { MdClose, MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { useGlobalStore } from '@/components/Global';
import { isFiltered } from '@/lib/operator';
import { FilterInput } from './FilterInput';
import { FilterSelectInput } from './FilterSelectInput';
import { useFilters } from './Filters.hooks';
import { getFilterAttributes } from './Filters.utils';

export function Filters() {
  const { chains, assets, itsAssets } = useGlobalStore();
  const {
    open,
    setOpen,
    params,
    setParams,
    searchInput,
    setSearchInput,
    submitFilters,
    onClose,
  } = useFilters();

  const attributes = getFilterAttributes(params, chains, assets, itsAssets);
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
                      onSubmit={e => {
                        e.preventDefault();
                        submitFilters();
                      }}
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
                                  <FilterSelectInput
                                    attribute={d}
                                    params={params}
                                    searchInput={searchInput}
                                    setParams={setParams}
                                    setSearchInput={setSearchInput}
                                  />
                                ) : (
                                  <FilterInput
                                    attribute={d}
                                    params={params}
                                    setParams={setParams}
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
                          onClick={() => submitFilters({})}
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
