// Header styles — Tailwind class constants

// ─── MobileNavLink ──────────────────────────────────────────────────
export const mobileNavLink = {
  base: 'block w-full px-2 py-1',
  active: 'text-blue-600 dark:text-blue-500',
  inactive: 'text-zinc-700 dark:text-zinc-300',
} as const;

// ─── MobileNavIcon ──────────────────────────────────────────────────
export const mobileNavIcon = {
  svg: 'h-3.5 w-3.5 overflow-visible stroke-zinc-700 dark:stroke-zinc-300',
  pathTransition: 'origin-center transition',
  pathHidden: 'scale-90 opacity-0',
} as const;

// ─── MobileNavigation ──────────────────────────────────────────────
export const mobileNavigation = {
  button:
    'relative z-10 flex h-8 w-8 items-center justify-center ui-not-focus-visible:outline-none',
  overlay: 'fixed inset-0 bg-zinc-100/50 dark:bg-zinc-900/50',
  panel:
    'absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-white p-4 text-lg tracking-tight text-zinc-900 shadow-xl ring-1 ring-zinc-900/5 dark:bg-zinc-800 dark:text-zinc-100',
  group: 'flex flex-col',
  groupTitle: 'px-2 pb-1 pt-4 font-bold',
  topLevelLink: 'pt-4 font-bold',
} as const;

// ─── EnvironmentLink ────────────────────────────────────────────────
export const environmentLink = {
  base: 'inline-block w-full whitespace-nowrap rounded-lg p-2 text-sm capitalize hover:text-blue-600 dark:hover:text-blue-500',
  active: 'text-blue-600 dark:text-blue-500',
  inactive: 'text-zinc-700 dark:text-zinc-300',
} as const;

// ─── Header (main) ─────────────────────────────────────────────────
export const header = {
  root: 'bg-white py-6 dark:bg-zinc-900',
  tvlWidth: 'lg:w-tvl',
  containerTvl: 'lg:!mx-24',
  nav: 'relative z-50 flex justify-between gap-x-4',
  leftGroup: 'flex items-center xl:gap-x-12',
  logoLink: 'h-10 w-auto',
  desktopNavContainer: 'hidden xl:flex xl:gap-x-4',
  rightGroup: 'flex items-center gap-x-4',
  searchWrapper: 'block',
  environmentWrapper: 'hidden xl:block',
  mobileNavWrapper: '-mr-1 xl:hidden',
} as const;

// ─── Desktop Popover (navigation dropdowns) ─────────────────────────
export const desktopPopover = {
  wrapper: 'relative',
  button: 'whitespace-nowrap rounded-lg text-sm uppercase focus:outline-none',
  buttonActive: 'text-blue-600 dark:text-blue-500',
  buttonInactive: 'text-zinc-700 dark:text-zinc-300',
  linkInner: 'inline-flex items-center gap-x-1 p-2',
  chevron: 'h-4 w-4',
  panel: 'absolute left-1/2 z-10 flex w-screen max-w-min -translate-x-1/2',
  panelInner:
    'shrink rounded-xl bg-white p-2 text-sm shadow-lg ring-1 ring-zinc-900/5 dark:bg-zinc-800',
  topLevelInner: 'flex items-center',
} as const;

// ─── Environment Popover ────────────────────────────────────────────
export const environmentPopover = {
  wrapper: 'relative',
  button:
    'whitespace-nowrap rounded-lg p-2 text-sm capitalize text-zinc-700 focus:outline-none dark:text-zinc-300',
  panel: 'absolute left-1/2 z-10 flex w-screen max-w-min -translate-x-1/2',
  panelInner:
    'shrink rounded-xl bg-white p-2 text-sm shadow-lg ring-1 ring-zinc-900/5 dark:bg-zinc-800',
} as const;
