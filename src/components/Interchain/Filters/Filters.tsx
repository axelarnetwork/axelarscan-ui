'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { MdClose, MdOutlineFilterList } from 'react-icons/md';

import { Button } from '@/components/Button';
import { useGlobalStore } from '@/components/Global';
import { isFiltered } from '@/lib/operator';
import { FilterInput } from './FilterInput';
import { FilterSelectInput } from './FilterSelectInput';
import { useFilters } from './Filters.hooks';
import { filtersStyles } from './Filters.styles';
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
        className={filtersStyles.button.base(filtered)}
      >
        <MdOutlineFilterList
          size={20}
          className={filtersStyles.button.icon(filtered)}
        />
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" onClose={onClose} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter={filtersStyles.transition.overlay.enter}
            enterFrom={filtersStyles.transition.overlay.enterFrom}
            enterTo={filtersStyles.transition.overlay.enterTo}
            leave={filtersStyles.transition.overlay.leave}
            leaveFrom={filtersStyles.transition.overlay.leaveFrom}
            leaveTo={filtersStyles.transition.overlay.leaveTo}
          >
            <div className={filtersStyles.dialog.overlay} />
          </Transition.Child>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter={filtersStyles.transition.panel.enter}
                  enterFrom={filtersStyles.transition.panel.enterFrom}
                  enterTo={filtersStyles.transition.panel.enterTo}
                  leave={filtersStyles.transition.panel.leave}
                  leaveFrom={filtersStyles.transition.panel.leaveFrom}
                  leaveTo={filtersStyles.transition.panel.leaveTo}
                >
                  <Dialog.Panel className={filtersStyles.dialog.panel}>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        submitFilters();
                      }}
                      className={filtersStyles.dialog.form}
                    >
                      <div className={filtersStyles.dialog.header.container}>
                        <div className={filtersStyles.dialog.header.titleBar}>
                          <Dialog.Title
                            className={filtersStyles.dialog.header.title}
                          >
                            Filter
                          </Dialog.Title>
                          <button
                            type="button"
                            onClick={() => onClose()}
                            className={filtersStyles.dialog.header.closeButton}
                          >
                            <MdClose size={20} />
                          </button>
                        </div>
                        <div className={filtersStyles.dialog.body.container}>
                          {attributes.map((d, i) => (
                            <div key={i}>
                              <label
                                htmlFor={d.name}
                                className={filtersStyles.dialog.body.label}
                              >
                                {d.label}
                              </label>
                              <div
                                className={
                                  filtersStyles.dialog.body.inputContainer
                                }
                              >
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
                      <div className={filtersStyles.dialog.footer.container}>
                        <button
                          type="button"
                          onClick={() => submitFilters({})}
                          className={filtersStyles.dialog.footer.resetButton}
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={!filtered}
                          className={filtersStyles.dialog.footer.submitButton(
                            filtered
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
