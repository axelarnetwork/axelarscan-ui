import clsx from 'clsx';

/**
 * Styles for the FilterSelectInput component
 */

export const filterSelectInputStyles = {
  button: {
    base: 'relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6',
    selectedContainer: (selectedArrayLength: number) =>
      clsx('flex flex-wrap', selectedArrayLength !== 0 && 'my-1'),
    selectedItem:
      'my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900',
    placeholder: 'block truncate',
    icon: 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2',
    iconSvg: 'text-zinc-400',
  },
  input: {
    container: 'mt-2 gap-y-2',
    field:
      'w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6',
  },
  options: {
    container:
      'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm',
    option: (active: boolean) =>
      clsx(
        'relative cursor-default select-none py-2 pl-3 pr-9',
        active ? 'bg-blue-600 text-white' : 'text-zinc-900'
      ),
    optionText: (selected: boolean) =>
      clsx('block truncate', selected ? 'font-semibold' : 'font-normal'),
    checkIcon: (active: boolean) =>
      clsx(
        'absolute inset-y-0 right-0 flex items-center pr-4',
        active ? 'text-white' : 'text-blue-600'
      ),
  },
  transition: {
    leave: 'transition ease-in duration-100',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  },
} as const;
