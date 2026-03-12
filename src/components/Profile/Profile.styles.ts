// Profile styles — Tailwind class constants

export const nameService = {
  wrapper: 'flex items-center',
  nameText: 'font-medium',
  addressText: 'font-medium',
  imageRoundedFull: 'rounded-full',
  imageSizeDefault: '3xl:w-8 3xl:h-8 h-6 w-6',
  imageSizeSmall: 'h-5 w-5',
  imageMarginSmall: 'mr-1.5',
  imageMarginDefault: '3xl:mr-3 mr-2',
  linkWrapper: 'flex items-center gap-x-1',
  linkText: 'font-medium text-blue-600 dark:text-blue-500',
} as const;

export const profile = {
  wrapperWithName: 'flex min-w-max items-center',
  gapSmall: 'gap-x-1.5',
  gapDefault: '3xl:gap-x-3 gap-x-2',
  imageRoundedFull: 'rounded-full',
  imageSizeDefault: '3xl:w-8 3xl:h-8 h-6 w-6',
  linkWrapper: 'flex items-center gap-x-1',
  linkText: 'font-medium text-blue-600 dark:text-blue-500',
} as const;

export const chainProfile = {
  wrapper: 'flex min-w-max items-center gap-x-2',
  title: 'whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-100',
} as const;

export const assetProfile = {
  wrapper: 'flex min-w-max items-center',
  gapWithAmount: 'gap-x-1.5',
  gapDefault: 'gap-x-2',
  amountText: 'font-medium text-zinc-900 dark:text-zinc-100',
  symbolText: 'whitespace-nowrap font-medium',
  symbolLink: 'text-blue-600 dark:text-blue-500',
  symbolDefault: 'text-zinc-900 dark:text-zinc-100',
} as const;
