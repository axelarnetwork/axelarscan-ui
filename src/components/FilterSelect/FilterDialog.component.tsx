'use client';

import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { MdClose } from 'react-icons/md';

import type { FilterDialogProps } from './FilterSelect.types';
import * as styles from './FilterSelect.styles';
import { FilterField } from './FilterField.component';

export function FilterDialog({
  open,
  onClose,
  onSubmit,
  onReset,
  filtered,
  title = 'Filter',
  attributes,
  params,
  setParams,
  searchInput,
  setSearchInput,
}: FilterDialogProps) {
  const { handleSubmit } = useForm();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" onClose={onClose} className={styles.dialogWrapper}>
        <Transition.Child
          as={Fragment}
          enter="transform transition ease-in-out duration-500 sm:duration-700"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transform transition ease-in-out duration-500 sm:duration-700"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={styles.dialogBackdrop} />
        </Transition.Child>
        <div className={styles.dialogOverflowWrapper}>
          <div className={styles.dialogAbsoluteOverflow}>
            <div className={styles.dialogPointerWrapper}>
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className={styles.dialogPanel}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className={styles.dialogForm}
                  >
                    <div className={styles.dialogScrollArea}>
                      <div className={styles.dialogHeader}>
                        <Dialog.Title className={styles.dialogTitle}>
                          {title}
                        </Dialog.Title>
                        <button
                          type="button"
                          onClick={() => onClose()}
                          className={styles.dialogCloseButton}
                        >
                          <MdClose size={20} />
                        </button>
                      </div>
                      <div className={styles.dialogBody}>
                        {attributes.map((d, i: number) => (
                          <div key={i}>
                            <label
                              htmlFor={d.name}
                              className={styles.filterLabel}
                            >
                              {d.label}
                            </label>
                            <div className={styles.filterFieldWrapper}>
                              <FilterField
                                attribute={d}
                                params={params}
                                setParams={setParams}
                                searchInput={searchInput}
                                setSearchInput={setSearchInput}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={styles.filterActionsWrapper}>
                      <button
                        type="button"
                        onClick={onReset}
                        className={styles.resetButton}
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        disabled={!filtered}
                        className={clsx(
                          styles.submitButtonBase,
                          filtered
                            ? styles.submitButtonEnabled
                            : styles.submitButtonDisabled
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
  );
}
