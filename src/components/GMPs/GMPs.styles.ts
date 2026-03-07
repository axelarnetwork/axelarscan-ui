// GMPs component styles
// All Tailwind class strings extracted from the component

// ─── Filter Button ───────────────────────────────────────────────
export const filterButtonActive = 'bg-blue-50 dark:bg-blue-950' as const;
export const filterIconActive = 'text-blue-600 dark:text-blue-500' as const;

// ─── Main Layout ────────────────────────────────────────────────
export const containerDefault = 'sm:mt-8' as const;

export const headerRow =
  'flex items-center justify-between gap-x-4' as const;
export const headerLeft = 'sm:flex-auto' as const;
export const headerTitle =
  'text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100' as const;
export const headerSubtitle =
  'mt-2 text-sm text-zinc-400 dark:text-zinc-500' as const;
export const headerActions = 'flex items-center gap-x-2' as const;

// ─── Table ──────────────────────────────────────────────────────
export const tableScrollContainer =
  '-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const tableHead =
  'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const tableHeadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const tableBody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const tableRow =
  'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;

// ─── Table Header Cells ─────────────────────────────────────────
export const thFirst =
  'whitespace-nowrap py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thDefault = 'px-3 py-3.5 text-left' as const;
export const thLast =
  'whitespace-nowrap py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;

// ─── Table Data Cells ───────────────────────────────────────────
export const tdFirst = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdDefault = 'px-3 py-4 text-left' as const;
export const tdLast =
  'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;

// ─── Tx Hash Cell ───────────────────────────────────────────────
export const txHashWrapper = 'flex items-center gap-x-1' as const;
export const txHashLink =
  'font-semibold text-blue-600 dark:text-blue-500' as const;

// ─── Method Cell ────────────────────────────────────────────────
export const methodCellWrapper = 'flex flex-col gap-y-1.5' as const;
export const methodTag = 'w-fit capitalize' as const;
export const assetProfileContainer =
  'h-6 w-fit rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800' as const;
export const assetProfileTitle = 'text-xs' as const;
export const tokenAddressTooltip = 'whitespace-nowrap' as const;
export const tokenAddressTooltipParent = '!justify-start' as const;
export const tokenAddressProfile = 'w-fit text-xs' as const;
export const interchainTransfersWrapper = 'flex flex-col gap-y-1.5' as const;

// ─── Sender Cell ────────────────────────────────────────────────
export const senderCellWrapper = 'flex flex-col gap-y-1' as const;
export const senderChainProfileWrapper =
  'flex items-center gap-x-2' as const;
export const chainProfileHeight = 'h-6' as const;
export const chainProfileTitleBold = 'font-semibold' as const;
export const explorerLinkContainerClassName = '!gap-x-1' as const;
export const explorerLinkNonIconClassName =
  'text-blue-600 dark:text-blue-500 !text-opacity-75 text-xs' as const;

// ─── Destination Cell ───────────────────────────────────────────
export const destinationCellWrapper = 'flex flex-col gap-y-1' as const;
export const invalidChainWrapper = 'flex' as const;
export const invalidChainContent =
  'flex h-6 items-center gap-x-1.5 text-red-600 dark:text-red-500' as const;
export const destinationContractTooltipParent =
  '!justify-start' as const;
export const hopChainWrapper = 'flex items-center gap-x-2' as const;
export const recipientTooltipParent = '!justify-start' as const;

// ─── Status Cell ────────────────────────────────────────────────
export const statusCellWrapper = 'flex flex-col gap-y-1.5' as const;
export const statusRow = 'flex items-center space-x-1.5' as const;
export const statusTagBase = 'w-fit capitalize' as const;
export const statusReceived = 'bg-green-600 dark:bg-green-500' as const;
export const statusApproved = 'bg-orange-500 dark:bg-orange-600' as const;
export const statusFailed = 'bg-red-600 dark:bg-red-500' as const;
export const statusPending = 'bg-yellow-400 dark:bg-yellow-500' as const;
export const insufficientFeeWrapper =
  'flex items-center gap-x-1 text-red-600 dark:text-red-500' as const;
export const invalidGasPaidWrapper =
  'flex items-center gap-x-1 text-red-600 dark:text-red-500' as const;
export const statusSmallText = 'text-xs' as const;
export const expressExecutedWrapper =
  'flex items-center gap-x-1 text-green-600 dark:text-green-500' as const;
export const totalTimeWrapper =
  'flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500' as const;
export const hopIndicator =
  'flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500' as const;

// ─── Pagination ─────────────────────────────────────────────────
export const paginationWrapper =
  'mt-8 flex items-center justify-center' as const;

// ─── Status Tag Helper ──────────────────────────────────────────
export function getStatusTagClass(simplifiedStatus: string): string {
  switch (simplifiedStatus) {
    case 'received':
      return statusReceived;
    case 'approved':
      return statusApproved;
    case 'failed':
      return statusFailed;
    default:
      return statusPending;
  }
}
