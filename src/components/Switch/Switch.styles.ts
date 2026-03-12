export const switchStyles = {
  group: 'flex items-center gap-x-3',
  outer:
    'relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
  outerEnabled: 'bg-blue-600 dark:bg-blue-500',
  outerDisabled: 'bg-zinc-200 dark:bg-zinc-800',
  inner:
    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
  innerEnabled: 'translate-x-4',
  innerDisabled: 'translate-x-0',
  label: 'text-sm',
  title: 'font-medium text-zinc-900 dark:text-zinc-100',
} as const;
