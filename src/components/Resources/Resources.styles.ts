// Card styles
export const cardWrapper =
  'relative rounded-2xl bg-zinc-50/75 p-6 dark:bg-zinc-800/25' as const;
export const cardHeader = 'flex items-start justify-between' as const;
export const cardImageWrapper = 'overflow-hidden' as const;
export const cardImage = 'object-cover' as const;

// Chain card
export const chainActionsColumn = 'flex flex-col items-end gap-y-2.5' as const;
export const chainActionsRow = 'flex items-center gap-x-2' as const;
export const explorerLink = 'text-blue-600 dark:text-blue-500' as const;
export const statusDotDeprecated = 'text-red-600' as const;
export const statusDotActive = 'text-green-600' as const;
export const chainTypeTag = 'uppercase' as const;
export const chainNameRow = 'mt-3 flex items-center justify-between' as const;
export const chainName = 'font-display text-xl font-medium' as const;
export const chainId =
  'mt-0.5 whitespace-nowrap text-sm font-normal text-zinc-400 dark:text-zinc-500' as const;
export const valueBoxList = 'mb-1 mt-6 flex flex-col gap-y-4' as const;

// Asset card
export const assetActionsColumn = 'flex flex-col items-end gap-y-1' as const;
export const symbolTooltip = 'whitespace-nowrap' as const;
export const denomsWrapper = 'flex flex-wrap items-center' as const;
export const denomTag =
  'ml-1 mt-1 whitespace-nowrap bg-orange-400 font-normal dark:bg-orange-500' as const;
export const assetNameRow = 'mt-3 flex items-center justify-between' as const;
export const assetName = 'font-display text-xl font-medium' as const;
export const assetDecimals =
  'mt-0.5 whitespace-nowrap text-sm font-normal text-zinc-400 dark:text-zinc-500' as const;
export const assetBodyWrapper = 'mb-1 mt-6 flex flex-col gap-y-4' as const;
export const tokensSection = 'flex flex-col gap-y-1' as const;
export const tokensLabel =
  'text-base text-zinc-400 dark:text-zinc-500' as const;
export const tokensIconRow = 'flex flex-wrap items-center' as const;
export const chainIconWrapper = 'mb-1.5 mr-1.5' as const;
export const chainIconTooltip = 'whitespace-nowrap' as const;
export const chainIconSelected =
  'border-2 border-blue-600 dark:border-blue-500' as const;
export const chainIconNative =
  'border-2 border-orange-400 dark:border-orange-500' as const;
export const seeMoreButton =
  '3xl:text-sm 3xl:px-2.5 3xl:py-1.5 mb-1.5 rounded bg-zinc-100 px-1.5 py-1 text-xs font-medium text-blue-600 dark:bg-zinc-800 dark:text-blue-500' as const;
export const focusedChainSection = 'flex flex-col gap-y-3' as const;
export const focusedChainHeader =
  'flex items-center justify-between gap-x-2' as const;
export const focusedChainTag = 'uppercase' as const;

// Resources main component
export const containerWrapper =
  'flex flex-col gap-y-8 sm:mt-8 sm:gap-y-12' as const;
export const topBar =
  'flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2 sm:gap-y-0' as const;
export const navRow = 'flex gap-x-4' as const;
export const navLinkActive =
  'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' as const;
export const navLinkInactive =
  'text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400' as const;
export const navLinkBase =
  'rounded-md px-3 py-2 text-base font-medium capitalize' as const;
export const filterColumn =
  'flex max-w-sm flex-col items-start gap-y-2 sm:items-end' as const;
export const searchInput =
  'h-10 w-full appearance-none rounded-lg border-zinc-200 bg-white px-3 text-sm text-zinc-600 hover:border-blue-300 focus:border-blue-600 focus:ring-0 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-800 dark:focus:border-blue-500 sm:w-80' as const;
export const typeFiltersRow =
  'mt-2 flex max-w-xl flex-wrap items-center' as const;
export const typeLinkActive =
  'font-semibold text-blue-600 dark:text-blue-500' as const;
export const typeLinkInactive =
  'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300' as const;
export const typeLinkBase =
  'mb-1 mr-4 flex min-w-max items-center whitespace-nowrap text-xs sm:mb-0 sm:text-sm' as const;

// Attributes / select filter styles
export const attributesWrapper =
  'mt-2 flex flex-1 flex-col justify-between gap-y-2' as const;
export const attributeRow = 'flex items-center gap-x-4' as const;
export const attributeLabel =
  'text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-500' as const;
export const attributeFieldWrapper = 'w-48' as const;
export const selectButton =
  'relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm dark:border-zinc-800 dark:text-zinc-100 sm:text-sm sm:leading-6' as const;
export const selectMultiWrap = 'flex flex-wrap' as const;
export const selectMultiWrapSelected = 'my-1' as const;
export const selectTruncate = 'block truncate' as const;
export const selectTag =
  'my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900 dark:text-zinc-100' as const;
export const selectIconWrapper =
  'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2' as const;
export const selectChevronIcon = 'text-zinc-400' as const;
export const selectOptions =
  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg dark:bg-zinc-800 sm:text-sm' as const;
export const selectOptionBase =
  'relative cursor-default select-none py-2 pl-3 pr-9' as const;
export const selectOptionActive = 'bg-blue-600 text-white' as const;
export const selectOptionInactive = 'text-zinc-900 dark:text-zinc-100' as const;
export const selectOptionTextSelected = 'font-semibold' as const;
export const selectOptionTextNormal = 'font-normal' as const;
export const selectCheckWrapper =
  'absolute inset-y-0 right-0 flex items-center pr-4' as const;
export const selectCheckActive = 'text-white' as const;
export const selectCheckInactive = 'text-blue-600' as const;
export const selectRelative = 'relative' as const;
export const filterInput =
  'w-full rounded-md border border-zinc-200 bg-white py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:text-sm sm:leading-6' as const;

// Grid
export const resourceGrid =
  'mx-auto grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8' as const;
