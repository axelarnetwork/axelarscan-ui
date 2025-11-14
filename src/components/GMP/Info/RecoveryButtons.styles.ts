export const recoveryButtonsStyles = {
  list: 'flex flex-col gap-y-2',
  item: 'grid w-72 grid-cols-3 gap-x-4',
  label: 'font-semibold capitalize',
  value: 'col-span-2 flex items-center',
  toastContainer:
    'flex flex-col gap-y-1 rounded-lg bg-white px-3 py-2.5 shadow-lg sm:gap-y-0',
  toastMessageRow: 'flex items-center gap-x-1.5 sm:gap-x-2',
  toastMessageText: 'whitespace-pre-wrap text-zinc-700',
  toastExplorerRow:
    'ml-6 flex items-center justify-between gap-x-4 pl-0.5 sm:ml-7 sm:pl-0',
  toastExplorerLink: 'text-zinc-700 text-xs sm:text-sm',
  toastDismissButton: 'text-xs font-light text-zinc-400 underline sm:text-sm',
  toastSuccessIcon: 'text-green-600',
  toastFailedIcon: 'text-red-600',
} as const;
