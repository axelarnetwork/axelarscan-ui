// Validators component styles
// All Tailwind class strings extracted from Validators.jsx

// ─── Layout ─────────────────────────────────────────────────────
export const container = 'sm:mt-8' as const;
export const headerRow = 'flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-0' as const;
export const headerLeft = 'sm:flex-auto' as const;
export const titleRow = 'flex items-center space-x-2' as const;
export const title = 'text-base font-semibold leading-6 text-zinc-900 underline dark:text-zinc-100' as const;
export const titleSeparator = 'text-zinc-400 dark:text-zinc-500' as const;
export const verifiersLink = 'text-base font-medium leading-6 text-blue-600 dark:text-blue-500' as const;
export const subtitle = 'mt-2 text-sm text-zinc-400 dark:text-zinc-500' as const;
export const stakeLink = 'text-sm font-semibold text-blue-600 dark:text-blue-500' as const;

// ─── Status Navigation ──────────────────────────────────────────
export const nav = 'flex gap-x-4' as const;
export const navLinkActive = 'rounded-md px-3 py-2 text-base font-medium capitalize bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' as const;
export const navLinkInactive = 'rounded-md px-3 py-2 text-base font-medium capitalize text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400' as const;

// ─── Table ──────────────────────────────────────────────────────
export const tableWrapper = '-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table = 'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const thead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const theadTr = 'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const tbody = 'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;

// ─── Table Headers ──────────────────────────────────────────────
export const thIndex = 'py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thIndexClickable = 'cursor-pointer py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thDefault = 'cursor-pointer px-3 py-3.5 text-left' as const;
export const thWhitespace = 'cursor-pointer whitespace-nowrap px-3 py-3.5 text-left' as const;
export const thUptimeHidden = 'hidden cursor-pointer px-3 py-3.5 text-left sm:table-cell' as const;
export const thEvmSupported = 'whitespace-nowrap py-3.5 pl-3 pr-4 text-left sm:pr-0' as const;
export const thSortIcon = 'ml-2' as const;
export const thSortFlex = 'flex items-center' as const;

// ─── Table Body Cells ───────────────────────────────────────────
export const tr = 'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const tdIndex = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdDefault = 'px-3 py-4 text-left' as const;
export const tdUptimeHidden = 'hidden px-3 py-4 text-left sm:table-cell' as const;
export const tdEvmSupported = 'table-cell py-4 pl-3 pr-4 text-left sm:pr-0' as const;

// ─── Validator Info Column ──────────────────────────────────────
export const validatorInfoCol = 'flex flex-col gap-y-0.5' as const;
export const operatorAddress = 'font-medium text-zinc-400 dark:text-zinc-500' as const;
export const numberMuted = 'font-medium text-zinc-400 dark:text-zinc-500' as const;

// ─── Status Tags ────────────────────────────────────────────────
export const tagFit = 'w-fit' as const;
export const tagUnbonded = 'w-fit bg-red-600 dark:bg-red-500' as const;
export const tagUnbonding = 'w-fit bg-orange-500 dark:bg-orange-600' as const;
export const tagBonded = 'w-fit bg-green-600 dark:bg-green-500' as const;
export const tagJailed = 'w-fit bg-red-600 dark:bg-red-500' as const;

// ─── Voting Power Column ────────────────────────────────────────
export const votingPowerGrid = 'grid max-w-32 gap-y-2' as const;
export const votingPowerRow = 'flex items-center gap-x-2' as const;
export const votingPowerValue = 'font-medium text-zinc-900 dark:text-zinc-100' as const;
export const votingPowerPct = 'text-zinc-400 dark:text-zinc-500' as const;

// ─── Quadratic Power Column ─────────────────────────────────────
export const quadraticProgressBar = 'bg-orange-400 dark:bg-orange-500' as const;

// ─── Proposed Block Column ───────────────────────────────────────
export const proposedBlockCol = 'flex flex-col' as const;

// ─── Uptime Column ──────────────────────────────────────────────
export const uptimeGrid = 'my-0.5 grid min-w-24 max-w-24 gap-y-2' as const;
export const uptimeLow = 'bg-red-600 dark:bg-red-500' as const;
export const uptimeMed = 'bg-yellow-400 dark:bg-yellow-500' as const;
export const uptimeHigh = 'bg-green-600 dark:bg-green-500' as const;
export const proposedBlockLabel = 'whitespace-nowrap text-xs text-zinc-400 dark:text-zinc-500' as const;
export const proposedBlockRow = 'flex items-center gap-x-2' as const;
export const proposedBlockValue = 'font-medium text-zinc-900 dark:text-zinc-100' as const;
export const proposedBlockPct = 'text-zinc-400 dark:text-zinc-500' as const;

// ─── EVM Supported Column ───────────────────────────────────────
export const evmGrid = 'grid min-w-56 grid-cols-2 gap-x-2 gap-y-1 lg:grid-cols-3' as const;
export const evmChainCell = 'flex justify-start' as const;
export const evmChainRow = 'flex items-center gap-x-2' as const;
export const evmNotSupported = 'whitespace-nowrap text-xs font-medium text-zinc-400 dark:text-zinc-500' as const;
export const evmVotesRow = 'flex items-center gap-x-1' as const;
export const evmVotesPartial = 'text-xs font-medium text-zinc-400 dark:text-zinc-500' as const;
export const evmVotesFull = 'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;

// ─── Tooltip ────────────────────────────────────────────────────
export const tooltipWhitespace = 'whitespace-nowrap' as const;
