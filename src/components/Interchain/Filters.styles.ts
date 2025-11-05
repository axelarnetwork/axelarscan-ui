import clsx from 'clsx';

/**
 * Styles for the Filters component
 */

export const filtersStyles = {
  button: {
    base: (filtered: boolean) =>
      clsx(filtered && 'bg-blue-50 dark:bg-blue-950'),
    icon: (filtered: boolean) =>
      clsx(filtered && 'text-blue-600 dark:text-blue-500'),
  },
  dialog: {
    overlay: 'fixed inset-0 bg-zinc-50 bg-opacity-50 transition-opacity dark:bg-zinc-900 dark:bg-opacity-50',
    panel: 'pointer-events-auto w-screen max-w-md',
    form: 'flex h-full flex-col divide-y divide-zinc-200 bg-white shadow-xl',
    header: {
      container: 'h-0 flex-1 overflow-y-auto',
      titleBar: 'flex items-center justify-between bg-blue-600 p-4 sm:px-6',
      title: 'text-base font-semibold leading-6 text-white',
      closeButton: 'relative ml-3 text-blue-200 hover:text-white',
    },
    body: {
      container: 'flex flex-1 flex-col justify-between gap-y-6 px-4 py-6 sm:px-6',
      label: 'text-sm font-medium leading-6 text-zinc-900',
      inputContainer: 'mt-2',
    },
    footer: {
      container: 'flex flex-shrink-0 justify-end p-4',
      resetButton: 'rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50',
      submitButton: (filtered: boolean) =>
        clsx(
          'ml-4 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
          filtered
            ? 'bg-blue-600 hover:bg-blue-500'
            : 'cursor-not-allowed bg-blue-500'
        ),
    },
  },
  transition: {
    overlay: {
      enter: 'transform transition ease-in-out duration-500 sm:duration-700',
      enterFrom: 'opacity-0',
      enterTo: 'opacity-100',
      leave: 'transform transition ease-in-out duration-500 sm:duration-700',
      leaveFrom: 'opacity-100',
      leaveTo: 'opacity-0',
    },
    panel: {
      enter: 'transform transition ease-in-out duration-500 sm:duration-700',
      enterFrom: 'translate-x-full',
      enterTo: 'translate-x-0',
      leave: 'transform transition ease-in-out duration-500 sm:duration-700',
      leaveFrom: 'translate-x-0',
      leaveTo: 'translate-x-full',
    },
  },
} as const;

