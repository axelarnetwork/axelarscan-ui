'use client';

import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import { ResponsiveSankey } from '@nivo/sankey';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuChevronsUpDown } from 'react-icons/lu';
import {
  MdCheck,
  MdClose,
  MdKeyboardArrowRight,
  MdOutlineFilterList,
  MdOutlineRefresh,
} from 'react-icons/md';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useGlobalStore } from '@/components/Global';
import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { Overlay } from '@/components/Overlay';
import { AssetProfile, ChainProfile, Profile } from '@/components/Profile';
import { Spinner } from '@/components/Spinner';
import { TimeSpent } from '@/components/Time';
import { TooltipComponent } from '@/components/Tooltip';
import accounts from '@/data/accounts';
import {
  GMPChart,
  GMPStatsAVGTimes,
  GMPStatsByChains,
  GMPStatsByContracts,
  GMPTopITSAssets,
  GMPTopUsers,
  GMPTotalVolume,
} from '@/lib/api/gmp';
import {
  transfersChart,
  transfersStats,
  transfersTopUsers,
  transfersTotalVolume,
} from '@/lib/api/token-transfer';
import {
  ENVIRONMENT,
  getAssetData,
  getChainData,
  getITSAssetData,
} from '@/lib/config';
import { isNumber, numberFormat, toFixed, toNumber } from '@/lib/number';
import {
  generateKeyByParams,
  getParams,
  getQueryString,
  isFiltered,
} from '@/lib/operator';
import { split, toArray, toCase } from '@/lib/parser';
import {
  equalsIgnoreCase,
  filterSearchInput,
  headString,
  lastString,
  toBoolean,
  toTitle,
} from '@/lib/string';
import { timeDiff } from '@/lib/time';

// Type definitions
interface FilterParams {
  from?: number;
  transfersType?: string | string[];
  sourceChain?: string | string[];
  destinationChain?: string | string[];
  chain?: string | string[];
  asset?: string | string[];
  itsTokenAddress?: string | string[];
  contractMethod?: string | string[];
  contractAddress?: string | string[];
  assetType?: string | string[];
  fromTime?: number;
  toTime?: number;
  [key: string]: string | number | string[] | undefined;
}

interface FilterOption {
  value?: string;
  title: string;
}

interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  searchable?: boolean;
  multiple?: boolean;
  options?: FilterOption[];
}

// Detailed API Response Data Structures
interface SourceChainData {
  key: string;
  destination_chains?: Array<{
    key: string;
    num_txs?: number;
    volume?: number;
  }>;
  num_txs?: number;
  volume?: number;
}

interface TransferStatsItem {
  source_chain?: string;
  destination_chain?: string;
  num_txs?: number;
  volume?: number;
}

interface ChainWithContracts {
  key: string;
  contracts?: ContractData[];
}

interface TopDataItem {
  key?: string;
  num_txs?: number;
  volume?: number;
  express_execute?: number;
  confirm?: number;
  approve?: number;
  total?: number;
  chain?: string | string[];
  contracts?: ContractData[];
  [key: string]: unknown;
}

// Main InterchainData interface - represents the full API response
interface InterchainData {
  // GMP Stats
  GMPStatsByChains?: {
    source_chains?: SourceChainData[];
    total?: number;
    chains?: ChainWithContracts[];
  };
  GMPStatsByContracts?: {
    chains?: ChainWithContracts[];
  };
  GMPChart?: {
    data?: ChartDataPoint[];
  };
  GMPTotalVolume?: number;
  GMPTopUsers?: {
    data?: TopDataItem[];
  };
  GMPTopITSUsers?: {
    data?: TopDataItem[];
  };
  GMPTopITSUsersByVolume?: {
    data?: TopDataItem[];
  };
  GMPTopITSAssets?: {
    data?: TopDataItem[];
  };
  GMPTopITSAssetsByVolume?: {
    data?: TopDataItem[];
  };
  GMPStatsAVGTimes?: {
    time_spents?: TimeSpentData[];
  };

  // Transfer Stats
  transfersStats?: {
    data?: TransferStatsItem[];
    total?: number;
  };
  transfersChart?: {
    data?: ChartDataPoint[];
  };
  transfersAirdropChart?: {
    data?: ChartDataPoint[];
  };
  transfersTotalVolume?: number;
  transfersTopUsers?: {
    data?: TopDataItem[];
  };
  transfersTopUsersByVolume?: {
    data?: TopDataItem[];
  };
}

// Type for data with dynamic properties (used for setData state)
// Allows both API response data and computed/grouped data
type DynamicInterchainData = Record<
  string,
  | InterchainData
  | GroupDataItem[]
  | ChartDataPoint[]
  | TimeSpentData
  | { data?: ChartDataPoint[] }
>;

interface SummaryProps {
  data: InterchainData;
  params: FilterParams;
}

interface StatsBarChartProps {
  i: number;
  data: ChartDataPoint[] | { data?: ChartDataPoint[] };
  totalValue?: number;
  field?: string;
  stacks?: string[];
  colors?: Record<string, string>;
  scale?: string;
  useStack?: boolean;
  title?: string;
  description?: string;
  dateFormat?: string;
  granularity?: string;
  valueFormat?: string;
  valuePrefix?: string;
}

interface SankeyChartProps {
  i: number;
  data: GroupDataItem[];
  topN?: number;
  totalValue?: number;
  field?: string;
  title?: string;
  description?: string;
  valueFormat?: string;
  valuePrefix?: string;
  noBorder?: boolean;
  className?: string;
}

interface TVLContractData {
  is_custom?: boolean;
  price?: number;
  [key: string]: unknown;
}

interface TVLItem {
  contract_data?: TVLContractData;
  [key: string]: unknown;
}

interface TVLData {
  assetType?: string;
  asset?: string;
  total?: number;
  price?: number;
  value?: number;
  total_on_contracts?: number;
  total_on_tokens?: number;
  tvl?: Record<string, TVLItem>;
  [key: string]: unknown;
}

interface ContractData {
  key: string;
  chain?: string;
  num_txs?: number;
  volume?: number;
  [key: string]: unknown;
}

interface GroupDataItem {
  key?: string;
  chain?: string | string[];
  num_txs?: number;
  volume?: number;
  [key: string]: unknown;
}

interface ChartDataPoint {
  timestamp?: number;
  timeString?: string;
  focusTimeString?: string;
  num_txs?: number;
  volume?: number;
  gmp_num_txs?: number;
  gmp_volume?: number;
  transfers_num_txs?: number;
  transfers_volume?: number;
  transfers_airdrop_num_txs?: number;
  transfers_airdrop_volume?: number;
  transfers_airdrop_volume_value?: number;
  data?: ChartDataPoint[];
  [key: string]: number | string | undefined | ChartDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

interface StatsCardProps {
  i: number;
  data: InterchainData | GroupDataItem[];
  type?: string;
  hasTransfers?: boolean;
  hasGMP?: boolean;
  hasITS?: boolean;
  transfersType: string;
  field?: string;
  title?: string;
  description?: string;
  format?: string;
  prefix?: string;
  totalValue?: number;
  className?: string;
}

// Unused interface - kept for potential future use
// interface AssetRowProps {
//   i: number;
//   data: any;
//   types: string[];
//   params: FilterParams;
// }

// InterchainData interface removed - using Record<string, any> for flexibility with dynamic data structures

interface TimeSpentData {
  id: string;
  name: string;
  label?: string;
  value?: number;
  time_spent?: number;
  [key: string]: string | number | undefined;
}

interface DataRowProps {
  data: InterchainData;
  granularity: string;
  params?: FilterParams;
}

interface TimeSpentRowProps {
  data: InterchainData | TimeSpentData;
  format?: string;
  prefix?: string;
}

const getGranularity = (fromTimestamp: number, toTimestamp: number) => {
  if (!fromTimestamp) return 'month';

  const diff = timeDiff(
    moment(fromTimestamp * 1000),
    'days',
    moment(toTimestamp * 1000)
  );

  if (diff >= 180) {
    return 'month';
  } else if (diff >= 60) {
    return 'week';
  }

  return 'day';
};

const TIME_SHORTCUTS = [
  {
    label: 'Last 7 days',
    value: [moment().subtract(7, 'days').startOf('day'), moment().endOf('day')],
  },
  {
    label: 'Last 30 days',
    value: [
      moment().subtract(30, 'days').startOf('day'),
      moment().endOf('day'),
    ],
  },
  {
    label: 'Last 365 days',
    value: [
      moment().subtract(365, 'days').startOf('day'),
      moment().endOf('day'),
    ],
  },
  { label: 'All-time', value: [] },
];

function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<FilterParams>(
    getParams(searchParams) as FilterParams
  );
  const [searchInput, setSearchInput] = useState<Record<string, string>>({});
  const { handleSubmit } = useForm();
  const { chains, assets, itsAssets } = useGlobalStore();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (
    _e1: React.FormEvent | unknown,
    _e2: React.ChangeEvent | unknown,
    _params?: FilterParams
  ) => {
    if (!_params) {
      _params = params;
    }

    if (!_.isEqual(_params, getParams(searchParams))) {
      router.push(`${pathname}${getQueryString(_params)}`);
      setParams(_params);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams) as FilterParams);
  };

  const attributes: FilterAttribute[] = [
    {
      label: 'Transfers Type',
      name: 'transfersType',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'gmp', title: 'General Message Passing' },
        { value: 'transfers', title: 'Token Transfers' },
      ],
    },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Destination Chain',
      name: 'destinationChain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'From / To Chain',
      name: 'chain',
      type: 'select',
      searchable: true,
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc']
      ).map(d => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        _.uniqBy(
          toArray(
            _.concat(
              params.assetType !== 'its'
                ? toArray(assets).map(d => ({
                    value: d.id,
                    title: `${d.symbol} (${d.id})`,
                  }))
                : [],
              params.assetType !== 'gateway'
                ? toArray(itsAssets).map(d => ({
                    value: d.symbol,
                    title: `${d.symbol} (ITS)`,
                  }))
                : []
            )
          ),
          'value'
        ),
        ['title'],
        ['asc']
      ),
    },
    ...(params.assetType === 'its'
      ? [
          {
            label: 'ITS Token Address',
            name: 'itsTokenAddress',
          } as FilterAttribute,
        ]
      : []),
    {
      label: 'Method',
      name: 'contractMethod',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'callContract', title: 'CallContract' },
        { value: 'callContractWithToken', title: 'CallContractWithToken' },
        { value: 'InterchainTransfer', title: 'InterchainTransfer' },
        { value: 'SquidCoral', title: 'SquidCoral' },
      ],
    },
    { label: 'Contract', name: 'contractAddress' },
    {
      label: 'Asset Type',
      name: 'assetType',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'gateway', title: 'Gateway Token' },
        { value: 'its', title: 'ITS Token' },
      ],
    },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
  ] as FilterAttribute[];

  const filtered = isFiltered(params);

  return (
    <>
      <Button
        color="default"
        circle="true"
        onClick={() => setOpen(true)}
        className={clsx(filtered && 'bg-blue-50 dark:bg-blue-950')}
      >
        <MdOutlineFilterList
          size={20}
          className={clsx(filtered && 'text-blue-600 dark:text-blue-500')}
        />
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" onClose={onClose} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-50 bg-opacity-50 transition-opacity dark:bg-zinc-900 dark:bg-opacity-50" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex h-full flex-col divide-y divide-zinc-200 bg-white shadow-xl"
                    >
                      <div className="h-0 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between bg-blue-600 p-4 sm:px-6">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            Filter
                          </Dialog.Title>
                          <button
                            type="button"
                            onClick={() => onClose()}
                            className="relative ml-3 text-blue-200 hover:text-white"
                          >
                            <MdClose size={20} />
                          </button>
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-y-6 px-4 py-6 sm:px-6">
                          {attributes.map((d, i) => (
                            <div key={i}>
                              <label
                                htmlFor={d.name}
                                className="text-sm font-medium leading-6 text-zinc-900"
                              >
                                {d.label}
                              </label>
                              <div className="mt-2">
                                {d.type === 'select' ? (
                                  d.searchable ? (
                                    <Combobox
                                      value={
                                        d.multiple
                                          ? split(params[d.name])
                                          : params[d.name]
                                      }
                                      onChange={(v: string | string[]) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? Array.isArray(v)
                                              ? v.join(',')
                                              : v
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const isSelected = (v: string) =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                String(params[d.name] || '')
                                              );
                                        const options = toArray(
                                          d.options
                                        ) as FilterOption[];
                                        const selectedValue = d.multiple
                                          ? options.filter(o =>
                                              isSelected(o?.value || '')
                                            )
                                          : options.find(o =>
                                              isSelected(o?.value || '')
                                            );

                                        const selectedArray = Array.isArray(
                                          selectedValue
                                        )
                                          ? selectedValue
                                          : [];
                                        const selectedSingle = !Array.isArray(
                                          selectedValue
                                        )
                                          ? selectedValue
                                          : undefined;

                                        return (
                                          <div className="relative">
                                            <Combobox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    'flex flex-wrap',
                                                    selectedArray.length !==
                                                      0 && 'my-1'
                                                  )}
                                                >
                                                  {selectedArray.length ===
                                                  0 ? (
                                                    <span className="block truncate">
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedArray.map(
                                                      (
                                                        v: FilterOption,
                                                        j: number
                                                      ) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedArray
                                                                  .filter(
                                                                    (
                                                                      sv: FilterOption
                                                                    ) =>
                                                                      sv?.value !==
                                                                      v?.value
                                                                  )
                                                                  .map(
                                                                    (
                                                                      sv: FilterOption
                                                                    ) =>
                                                                      sv?.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                                                        >
                                                          {v?.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="block truncate">
                                                  {selectedSingle?.title}
                                                </span>
                                              )}
                                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className="text-zinc-400"
                                                />
                                              </span>
                                            </Combobox.Button>
                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <div className="mt-2 gap-y-2">
                                                <Combobox.Input
                                                  placeholder={`Search ${d.label}`}
                                                  value={
                                                    searchInput[d.name] || ''
                                                  }
                                                  onChange={e =>
                                                    setSearchInput({
                                                      ...searchInput,
                                                      [d.name]: e.target.value,
                                                    })
                                                  }
                                                  className="w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6"
                                                />
                                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
                                                  {(
                                                    toArray(
                                                      d.options
                                                    ) as FilterOption[]
                                                  )
                                                    .filter(o =>
                                                      filterSearchInput(
                                                        [
                                                          o?.title || '',
                                                          o?.value || '',
                                                        ],
                                                        searchInput[d.name]
                                                      )
                                                    )
                                                    .map((o, j) => (
                                                      <Combobox.Option
                                                        key={j}
                                                        value={o?.value || ''}
                                                        className={({
                                                          active,
                                                        }) =>
                                                          clsx(
                                                            'relative cursor-default select-none py-2 pl-3 pr-9',
                                                            active
                                                              ? 'bg-blue-600 text-white'
                                                              : 'text-zinc-900'
                                                          )
                                                        }
                                                      >
                                                        {({
                                                          selected,
                                                          active,
                                                        }) => (
                                                          <>
                                                            <span
                                                              className={clsx(
                                                                'block truncate',
                                                                selected
                                                                  ? 'font-semibold'
                                                                  : 'font-normal'
                                                              )}
                                                            >
                                                              {o?.title || ''}
                                                            </span>
                                                            {selected && (
                                                              <span
                                                                className={clsx(
                                                                  'absolute inset-y-0 right-0 flex items-center pr-4',
                                                                  active
                                                                    ? 'text-white'
                                                                    : 'text-blue-600'
                                                                )}
                                                              >
                                                                <MdCheck
                                                                  size={20}
                                                                />
                                                              </span>
                                                            )}
                                                          </>
                                                        )}
                                                      </Combobox.Option>
                                                    ))}
                                                </Combobox.Options>
                                              </div>
                                            </Transition>
                                          </div>
                                        );
                                      }}
                                    </Combobox>
                                  ) : (
                                    <Listbox
                                      value={
                                        d.multiple
                                          ? split(params[d.name])
                                          : params[d.name]
                                      }
                                      onChange={(v: string | string[]) =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? Array.isArray(v)
                                              ? v.join(',')
                                              : v
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const isSelected = (v: string) =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                String(params[d.name] || '')
                                              );
                                        const options = toArray(
                                          d.options
                                        ) as FilterOption[];
                                        const selectedValue = d.multiple
                                          ? options.filter(o =>
                                              isSelected(o?.value || '')
                                            )
                                          : options.find(o =>
                                              isSelected(o?.value || '')
                                            );

                                        const selectedArray = Array.isArray(
                                          selectedValue
                                        )
                                          ? selectedValue
                                          : [];
                                        const selectedSingle = !Array.isArray(
                                          selectedValue
                                        )
                                          ? selectedValue
                                          : undefined;

                                        return (
                                          <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    'flex flex-wrap',
                                                    selectedArray.length !==
                                                      0 && 'my-1'
                                                  )}
                                                >
                                                  {selectedArray.length ===
                                                  0 ? (
                                                    <span className="block truncate">
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedArray.map(
                                                      (
                                                        v: FilterOption,
                                                        j: number
                                                      ) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedArray
                                                                  .filter(
                                                                    (
                                                                      sv: FilterOption
                                                                    ) =>
                                                                      sv?.value !==
                                                                      v?.value
                                                                  )
                                                                  .map(
                                                                    (
                                                                      sv: FilterOption
                                                                    ) =>
                                                                      sv?.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                                                        >
                                                          {v?.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="block truncate">
                                                  {selectedSingle?.title}
                                                </span>
                                              )}
                                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <LuChevronsUpDown
                                                  size={20}
                                                  className="text-zinc-400"
                                                />
                                              </span>
                                            </Listbox.Button>
                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
                                                {(
                                                  toArray(
                                                    d.options
                                                  ) as FilterOption[]
                                                ).map((o, j) => (
                                                  <Listbox.Option
                                                    key={j}
                                                    value={o?.value || ''}
                                                    className={({ active }) =>
                                                      clsx(
                                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                                        active
                                                          ? 'bg-blue-600 text-white'
                                                          : 'text-zinc-900'
                                                      )
                                                    }
                                                  >
                                                    {({ selected, active }) => (
                                                      <>
                                                        <span
                                                          className={clsx(
                                                            'block truncate',
                                                            selected
                                                              ? 'font-semibold'
                                                              : 'font-normal'
                                                          )}
                                                        >
                                                          {o?.title || ''}
                                                        </span>
                                                        {selected && (
                                                          <span
                                                            className={clsx(
                                                              'absolute inset-y-0 right-0 flex items-center pr-4',
                                                              active
                                                                ? 'text-white'
                                                                : 'text-blue-600'
                                                            )}
                                                          >
                                                            <MdCheck
                                                              size={20}
                                                            />
                                                          </span>
                                                        )}
                                                      </>
                                                    )}
                                                  </Listbox.Option>
                                                ))}
                                              </Listbox.Options>
                                            </Transition>
                                          </div>
                                        );
                                      }}
                                    </Listbox>
                                  )
                                ) : d.type === 'datetimeRange' ? (
                                  <DateRangePicker
                                    params={params}
                                    onChange={(v: Partial<FilterParams>) =>
                                      setParams({ ...params, ...v })
                                    }
                                    className=""
                                  />
                                ) : (
                                  <input
                                    type={d.type || 'text'}
                                    name={d.name}
                                    placeholder={d.label}
                                    value={params[d.name] || ''}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                      setParams({
                                        ...params,
                                        [d.name]: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 justify-end p-4">
                        <button
                          type="button"
                          onClick={() => onSubmit(undefined, undefined, {})}
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={!filtered}
                          className={clsx(
                            'ml-4 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                            filtered
                              ? 'bg-blue-600 hover:bg-blue-500'
                              : 'cursor-not-allowed bg-blue-500'
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
    </>
  );
}

export function Summary({ data, params }: SummaryProps) {
  const pathname = usePathname();
  const globalStore = useGlobalStore();

  if (!data) return null;

  const {
    GMPStatsByChains,
    GMPStatsByContracts,
    GMPTotalVolume,
    transfersStats,
    transfersTotalVolume,
  } = { ...data };

  const contracts = _.orderBy(
    Object.entries(
      _.groupBy(
        (
          toArray(
            GMPStatsByContracts?.chains as ChainWithContracts[]
          ) as ChainWithContracts[]
        ).flatMap((d: ChainWithContracts) =>
          toArray(d.contracts as ContractData[])
            .filter(c => (c as ContractData).key?.includes('_') === false)
            .map(c => {
              const contract = c as ContractData;
              const account = accounts.find(a =>
                equalsIgnoreCase(a.address, contract.key)
              );
              const name = account?.name;

              return {
                ...contract,
                key: name || toCase(contract.key, 'lower'),
                chain: d.key,
              };
            })
        ),
        'key'
      )
    ).map(([k, v]) => ({
      key: k,
      chains: _.uniq(v.map(d => d.chain)),
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
    })),
    ['num_txs', 'volume', 'key'],
    ['desc', 'desc', 'asc']
  );

  const chains = params?.contractAddress
    ? _.uniq(contracts.flatMap(d => d.chains))
    : toArray(globalStore.chains).filter(
        d => !d.deprecated && (!d.maintainer_id || d.gateway?.address)
      );

  const tvlData = toArray(globalStore.tvl?.data).map((d: TVLData) => {
    // set price from other assets with the same symbol
    const assetData =
      d.assetType === 'its'
        ? getITSAssetData(d.asset, globalStore.itsAssets)
        : getAssetData(d.asset, globalStore.assets) ||
          ((d.total_on_contracts || 0) > 0 || (d.total_on_tokens || 0) > 0
            ? {
                ...Object.values(d.tvl || {}).find(
                  (tvlItem: TVLItem) => tvlItem?.contract_data?.is_custom
                )?.contract_data,
              }
            : undefined);
    d.price = toNumber(
      isNumber(d.price)
        ? d.price
        : isNumber(assetData?.price)
          ? assetData.price
          : -1
    );

    return { ...d, value: toNumber(d.total) * d.price };
  });

  console.log(
    '[destinationContracts]',
    contracts.map(d => d.key)
  );

  return (
    <div className="border-b border-b-zinc-200 dark:border-b-zinc-700 lg:border-t lg:border-t-zinc-200 lg:dark:border-t-zinc-700">
      <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 lg:border-t-0 xl:px-8">
          <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
            Transactions
          </dt>
          <dd className="w-full flex-none">
            <Number
              value={
                toNumber(_.sumBy(GMPStatsByChains?.source_chains, 'num_txs')) +
                toNumber(transfersStats?.total)
              }
              format="0,0"
              noTooltip={true}
              className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
            />
          </dd>
          <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
            <Number
              value={toNumber(
                _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
              )}
              format="0,0.00a"
              prefix="GMP: "
              noTooltip={true}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
            <Number
              value={toNumber(transfersStats?.total)}
              format="0,0.00a"
              prefix="Transfer: "
              noTooltip={true}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:border-l-0 sm:px-6 lg:border-t-0 xl:px-8">
          <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
            Volume
          </dt>
          <dd className="w-full flex-none">
            <Number
              value={toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)}
              format="0,0"
              prefix="$"
              noTooltip={true}
              className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
            />
          </dd>
          <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
            <Number
              value={toNumber(GMPTotalVolume)}
              format="0,0.00a"
              prefix="GMP: $"
              noTooltip={true}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
            <Number
              value={toNumber(transfersTotalVolume)}
              format="0,0.00a"
              prefix="Transfer: $"
              noTooltip={true}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
          </dd>
        </div>
        {tvlData.length > 0 && pathname === '/' ? (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 lg:border-l-0 lg:border-t-0 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
              Total Value Locked
            </dt>
            <dd className="w-full flex-none">
              <Number
                value={_.sumBy(
                  tvlData.filter(d => d.value > 0),
                  'value'
                )}
                format="0,0.00a"
                prefix="$"
                noTooltip={true}
                className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
              />
            </dd>
            <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
              <Number
                value={_.sumBy(
                  tvlData.filter(d => d.value > 0 && d.assetType !== 'its'),
                  'value'
                )}
                format="0,0.00a"
                prefix="Gateway: $"
                noTooltip={true}
                className="text-xs text-zinc-400 dark:text-zinc-500"
              />
              <Number
                value={_.sumBy(
                  tvlData.filter(d => d.value > 0 && d.assetType === 'its'),
                  'value'
                )}
                format="0,0.00a"
                prefix="ITS: $"
                noTooltip={true}
                className="text-xs text-zinc-400 dark:text-zinc-500"
              />
            </dd>
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 lg:border-l-0 lg:border-t-0 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
              Average Volume / Transaction
            </dt>
            <dd className="w-full flex-none">
              <Number
                value={
                  (toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)) /
                  (toNumber(
                    _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
                  ) + toNumber(transfersStats?.total) || 1)
                }
                format="0,0"
                prefix="$"
                noTooltip={true}
                className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
              />
            </dd>
            <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
              <Number
                value={
                  toNumber(GMPTotalVolume) /
                  (toNumber(
                    _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
                  ) || 1)
                }
                format="0,0.00a"
                prefix="GMP: $"
                noTooltip={true}
                className="text-xs text-zinc-400 dark:text-zinc-500"
              />
              <Number
                value={
                  toNumber(transfersTotalVolume) /
                  (toNumber(transfersStats?.total) || 1)
                }
                format="0,0.00a"
                prefix="Transfer: $"
                noTooltip={true}
                className="text-xs text-zinc-400 dark:text-zinc-500"
              />
            </dd>
          </div>
        )}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:border-l-0 sm:px-6 lg:border-t-0 xl:px-8">
          <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
            GMP Contracts
          </dt>
          <dd className="w-full flex-none">
            <Number
              value={contracts.length}
              format="0,0"
              noTooltip={true}
              className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
            />
          </dd>
          <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
            <Number
              value={
                chains.filter(
                  d => !d.deprecated && (!d.maintainer_id || !d.no_inflation)
                ).length
              }
              format="0,0"
              prefix="Number of chains: "
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function StatsBarChart({
  i,
  data,
  totalValue,
  field = 'num_txs',
  stacks = ['gmp', 'transfers'],
  colors = {
    gmp: '#ff7d20',
    transfers: '#009ef7',
    transfers_airdrop: '#de3163',
  },
  scale = '',
  useStack = true,
  title = '',
  description = '',
  dateFormat = 'D MMM',
  granularity = 'day',
  valueFormat = '0,0',
  valuePrefix = '',
}: StatsBarChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [x, setX] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      const chartDataPoints =
        'data' in data && Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
      setChartData(
        chartDataPoints
          .map((d: Record<string, unknown>) => {
            const time = moment(d.timestamp as number).utc();
            const timeString = time.format(dateFormat);

            let focusTimeString;

            switch (granularity) {
              case 'month':
                focusTimeString = time.format('MMM YYYY');
                break;
              case 'week':
                focusTimeString = [
                  time.format(dateFormat),
                  moment(time).add(7, 'days').format(dateFormat),
                ].join(' - ');
                break;
              default:
                focusTimeString = timeString;
                break;
            }

            return {
              ...d,
              timeString,
              focusTimeString,
            };
          })
          .filter(
            (d: ChartDataPoint) =>
              scale !== 'log' ||
              field !== 'volume' ||
              (d[field as keyof ChartDataPoint] as number) > 100
          )
      );
    }
  }, [data, field, scale, dateFormat, granularity]);

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active) return null;

    const data = payload?.[0]?.payload;

    const values = toArray(_.concat(stacks, 'total'))
      .map(d => ({
        key: d as string,
        value: (data as ChartDataPoint)?.[
          `${d !== 'total' ? `${d}_` : ''}${field}`
        ] as number | undefined,
      }))
      .filter(
        d =>
          field !== 'volume' ||
          !d.key.includes('airdrop') ||
          (d.value || 0) > 100
      )
      .map(d => ({
        ...d,
        key: d.key === 'transfers_airdrop' ? 'airdrop_participations' : d.key,
      }));

    return (
      <div className="flex flex-col gap-y-1.5 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
        {values.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-x-4">
            <span className="text-xs font-semibold capitalize">
              {toTitle(d.key === 'gmp' ? 'GMPs' : d.key)}
            </span>
            <Number
              value={d.value || 0}
              format={valueFormat}
              prefix={valuePrefix}
              noTooltip={true}
              className="text-xs font-medium"
            />
          </div>
        ))}
      </div>
    );
  };

  const d = toArray(chartData).find(
    item => (item as ChartDataPoint)?.timestamp === x
  ) as ChartDataPoint | undefined;

  const value =
    d && field
      ? (d[field] as number | undefined)
      : chartData && chartData.length > 0 && field
        ? totalValue || _.sumBy(chartData, field)
        : undefined;
  const timeString = d
    ? (d as ChartDataPoint).focusTimeString
    : chartData && chartData.length > 0
      ? toArray([
          headString(
            (_.head(chartData.filter(d => d?.timestamp)) as ChartDataPoint)
              ?.focusTimeString,
            ' - '
          ),
          lastString(
            (_.last(chartData.filter(d => d?.timestamp)) as ChartDataPoint)
              ?.focusTimeString,
            ' - '
          ),
        ]).join(' - ')
      : undefined;

  return (
    <div
      className={clsx(
        'flex flex-col gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 xl:px-8',
        i % 2 !== 0 ? 'sm:border-l-0' : ''
      )}
    >
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-0.5">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </span>
          {description && (
            <span className="hidden text-sm font-normal text-zinc-400 dark:text-zinc-500 lg:block">
              {description}
            </span>
          )}
        </div>
        {isNumber(value) && (
          <div className="flex flex-col items-end gap-y-0.5">
            <Number
              value={value}
              format={valueFormat}
              prefix={valuePrefix}
              noTooltip={true}
              className="!text-base font-semibold text-zinc-900 dark:text-zinc-100"
            />
            <span className="whitespace-nowrap text-right text-sm text-zinc-400 dark:text-zinc-500">
              {timeString}
            </span>
          </div>
        )}
      </div>
      <div className="-mb-2.5 h-64 w-full">
        {!chartData ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              onMouseEnter={e =>
                setX(e?.activePayload?.[0]?.payload?.timestamp)
              }
              onMouseMove={e => setX(e?.activePayload?.[0]?.payload?.timestamp)}
              onMouseLeave={() => setX(null)}
              margin={{ top: 12, right: 0, bottom: 0, left: scale ? -24 : 0 }}
            >
              <XAxis
                dataKey="timeString"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              {scale && (
                <YAxis
                  dataKey={field}
                  scale={scale as 'auto' | 'linear' | 'pow' | 'sqrt' | 'log'}
                  domain={
                    useStack
                      ? ['dataMin', 'dataMax']
                      : [
                          _.min(
                            stacks.map(
                              s =>
                                _.minBy(chartData, `${s}_${field}`)?.[
                                  `${s}_${field}`
                                ] as number
                            )
                          ) ?? 0,
                          _.max(
                            stacks.map(
                              s =>
                                _.maxBy(chartData, `${s}_${field}`)?.[
                                  `${s}_${field}`
                                ] as number
                            )
                          ) ?? 1,
                        ]
                  }
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => numberFormat(v, '0,0a')}
                />
              )}
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'transparent' }}
              />
              {_.reverse(_.cloneDeep(stacks)).map((s, i) => (
                <Bar
                  key={i}
                  stackId={useStack ? field : undefined}
                  dataKey={`${s}_${field}${s.includes('airdrop') ? '_value' : ''}`}
                  fill={colors[s]}
                  minPointSize={scale && i === 0 ? 10 : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function SankeyChart({
  i,
  data,
  topN = 25,
  totalValue,
  field = 'num_txs',
  title = '',
  description = '',
  valueFormat = '0,0',
  valuePrefix = '',
  noBorder = false,
  className = '',
}: SankeyChartProps) {
  const [_x, _setX] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const { chains } = useGlobalStore();

  const dataArray = toArray(data) as GroupDataItem[];
  const d = dataArray.find(d => d.key === _x);

  const value = d
    ? d[field as keyof GroupDataItem]
    : data
      ? totalValue || _.sumBy(dataArray, field)
      : undefined;
  const keyString = d ? d.key : undefined;

  const chartData = _.slice(
    _.orderBy(
      dataArray
        .filter(d => ((d[field as keyof GroupDataItem] as number) || 0) > 0)
        .map(d => ({
          source: headString(d.key, '_'),
          target: lastString(d.key, '_'),
          value: parseInt(String(d[field as keyof GroupDataItem])),
        })),
      ['value'],
      ['desc']
    ),
    0,
    topN
  ).map(d => ({
    ...d,
    source: getChainData(d.source, chains)?.name || d.source,
    target: `${getChainData(d.target, chains)?.name || d.target} `,
  }));

  return (
    <div
      className={clsx(
        'flex flex-col gap-y-2 border-zinc-200 dark:border-zinc-700',
        i % 2 !== 0 ? 'sm:border-l-0' : '',
        !noBorder
          ? 'border-l border-r border-t px-4 py-8 sm:px-6 xl:px-8'
          : 'w-full'
      )}
    >
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-0.5">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </span>
          {description && (
            <span className="hidden text-sm font-normal text-zinc-400 dark:text-zinc-500 lg:block">
              {description}
            </span>
          )}
        </div>
        {isNumber(value) && (
          <div className="flex flex-col items-end gap-y-0.5">
            <Number
              value={value}
              format={valueFormat}
              prefix={valuePrefix}
              noTooltip={true}
              className="!text-base font-semibold text-zinc-900 dark:text-zinc-100"
            />
            <span className="whitespace-nowrap text-right text-sm text-zinc-400 dark:text-zinc-500">
              {keyString}
            </span>
          </div>
        )}
      </div>
      <div className="-mb-2.5 h-full w-full">
        {!data ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className={clsx('h-112 w-full font-semibold', className)}>
            {chartData.length > 0 && (
              <ResponsiveSankey
                data={{
                  nodes: _.uniq(
                    chartData.flatMap(d => [d.source, d.target])
                  ).map(d => ({
                    id: d,
                    nodeColor: getChainData(d.trim(), chains)?.color,
                  })),
                  links: chartData,
                }}
                valueFormat={`>-${valuePrefix},`}
                margin={{ top: 10, bottom: 10 }}
                theme={{
                  tooltip: {
                    container: {
                      background:
                        resolvedTheme === 'dark' ? '#18181b' : '#f4f4f5',
                      color: resolvedTheme === 'dark' ? '#f4f4f5' : '#18181b',
                      fontSize: 12,
                      fontWeight: 400,
                    },
                  },
                }}
                colors={d => d.nodeColor}
                nodeOpacity={1}
                nodeHoverOpacity={1}
                nodeHoverOthersOpacity={0.35}
                nodeBorderWidth={0}
                nodeBorderRadius={3}
                linkOpacity={resolvedTheme === 'dark' ? 0.2 : 0.4}
                linkHoverOpacity={resolvedTheme === 'dark' ? 0.7 : 0.9}
                linkHoverOthersOpacity={resolvedTheme === 'dark' ? 0.1 : 0.2}
                linkBlendMode={resolvedTheme === 'dark' ? 'lighten' : 'darken'}
                enableLinkGradient={true}
                labelTextColor={
                  resolvedTheme === 'dark' ? '#f4f4f5' : '#18181b'
                }
                nodeTooltip={d => {
                  const { id, formattedValue, nodeColor } = { ...d.node };

                  return (
                    <div className="flex flex-col space-y-0.5 rounded-sm bg-zinc-100 px-2 py-1.5 text-xs shadow-sm dark:bg-black">
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3"
                          style={{ backgroundColor: nodeColor }}
                        />
                        <span className="font-bold">{id}</span>
                      </div>
                      <span>Total: {formattedValue}</span>
                    </div>
                  );
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Charts({ data, granularity, params: _params }: DataRowProps) {
  const { chains } = useGlobalStore();

  if (!data) return null;

  const {
    GMPStatsByChains,
    GMPChart,
    GMPTotalVolume,
    transfersStats,
    transfersChart,
    transfersAirdropChart,
    transfersTotalVolume,
  } = { ...data };

  const TIME_FORMAT = granularity === 'month' ? 'MMM' : 'D MMM';

  const chartData = _.orderBy(
    Object.entries(
      _.groupBy(
        _.concat(
          (toArray(GMPChart?.data as ChartDataPoint[]) as ChartDataPoint[]).map(
            (d: ChartDataPoint) => ({
              ...d,
              gmp_num_txs: d.num_txs,
              gmp_volume: d.volume,
            })
          ),
          (
            toArray(
              transfersChart?.data as ChartDataPoint[]
            ) as ChartDataPoint[]
          ).map((d: ChartDataPoint) => ({
            ...d,
            gmp_num_txs: undefined,
            gmp_volume: undefined,
            transfers_num_txs: d.num_txs,
            transfers_volume: d.volume,
          })),
          (
            toArray(
              transfersAirdropChart?.data as ChartDataPoint[]
            ) as ChartDataPoint[]
          ).map((d: ChartDataPoint) => ({
            ...d,
            gmp_num_txs: undefined,
            gmp_volume: undefined,
            transfers_airdrop_num_txs: d.num_txs,
            transfers_airdrop_volume: d.volume,
          }))
        ),
        'timestamp'
      )
    )
      .map(([k, v]) => ({
        timestamp: toNumber(k),
        num_txs: _.sumBy(v, 'num_txs'),
        volume: _.sumBy(v, 'volume'),
        gmp_num_txs: _.sumBy(
          v.filter(v => (v.gmp_num_txs || 0) > 0),
          'gmp_num_txs'
        ),
        gmp_volume: _.sumBy(
          v.filter(v => (v.gmp_volume || 0) > 0),
          'gmp_volume'
        ),
        transfers_num_txs: _.sumBy(
          v.filter(v => (v.transfers_num_txs || 0) > 0),
          'transfers_num_txs'
        ),
        transfers_volume: _.sumBy(
          v.filter(v => (v.transfers_volume || 0) > 0),
          'transfers_volume'
        ),
        transfers_airdrop_num_txs: _.sumBy(
          v.filter(v => (v.transfers_airdrop_num_txs || 0) > 0),
          'transfers_airdrop_num_txs'
        ),
        transfers_airdrop_volume: _.sumBy(
          v.filter(v => (v.transfers_airdrop_volume || 0) > 0),
          'transfers_airdrop_volume'
        ),
      }))
      .map(d => ({
        ...d,
        transfers_airdrop_volume_value:
          d.transfers_airdrop_volume > 0
            ? d.transfers_airdrop_volume > 100000
              ? _.mean([d.gmp_volume, d.transfers_volume]) * 2
              : d.transfers_airdrop_volume
            : 0,
      })),
    ['timestamp'],
    ['asc']
  );

  const maxVolumePerMean =
    (_.maxBy(chartData, 'volume')?.volume || 0) /
    (_.meanBy(chartData, 'volume') || 1);
  const hasAirdropActivities = chartData.find(
    d => d.transfers_airdrop_volume > 0
  )
    ? true
    : false;

  const scale =
    false && maxVolumePerMean > 5 && !hasAirdropActivities ? 'log' : undefined;
  const useStack =
    maxVolumePerMean <= 5 || maxVolumePerMean > 10 || hasAirdropActivities;

  const groupData = (data: GroupDataItem[], by = 'key') =>
    Object.entries(_.groupBy(toArray(data), by)).map(([k, v]) => ({
      key: (v[0] as GroupDataItem)?.key || k,
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
      chain: _.orderBy(
        toArray(
          _.uniq(
            toArray(
              by === 'customKey'
                ? (v[0] as GroupDataItem)?.chain
                : (v as GroupDataItem[]).map((d: GroupDataItem) => d.chain)
            )
          ).map((d: string | string[] | undefined) =>
            getChainData(d as string, chains)
          )
        ),
        ['i'],
        ['asc']
      ).map(d => d.id),
    }));

  const chainPairs = groupData(
    _.concat(
      (
        toArray(
          GMPStatsByChains?.source_chains as SourceChainData[]
        ) as SourceChainData[]
      ).flatMap((s: SourceChainData) =>
        (
          toArray(s.destination_chains) as Array<{
            key: string;
            num_txs?: number;
            volume?: number;
          }>
        ).map(d => ({
          key: `${s.key}_${d.key}`,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
      ),
      (
        toArray(
          transfersStats?.data as TransferStatsItem[]
        ) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: `${d.source_chain}_${d.destination_chain}`,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    )
  );

  return (
    <div className="border-b border-b-zinc-200 dark:border-b-zinc-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:px-2 xl:px-0">
        <StatsBarChart
          i={0}
          data={chartData}
          totalValue={
            toNumber(_.sumBy(GMPStatsByChains?.source_chains, 'num_txs')) +
            toNumber(transfersStats?.total)
          }
          field="num_txs"
          title="Transactions"
          description={`Number of transactions by ${granularity}`}
          dateFormat={TIME_FORMAT}
          granularity={granularity}
        />
        <StatsBarChart
          i={1}
          data={chartData}
          totalValue={toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)}
          field="volume"
          stacks={['transfers_airdrop', 'gmp', 'transfers']}
          colors={
            scale === 'log' && useStack
              ? {
                  gmp: '#33b700',
                  transfers: '#33b700',
                  transfers_airdrop: '#33b700',
                }
              : undefined
          }
          scale={scale}
          useStack={useStack}
          title="Volume"
          description={`Transfer volume by ${granularity}`}
          dateFormat={TIME_FORMAT}
          granularity={granularity}
          valuePrefix="$"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:px-2 xl:px-0">
        <SankeyChart
          i={0}
          data={chainPairs}
          totalValue={
            toNumber(_.sumBy(GMPStatsByChains?.source_chains, 'num_txs')) +
            toNumber(transfersStats?.total)
          }
          field="num_txs"
          title="Transactions"
          description="Total transactions between chains"
        />
        <SankeyChart
          i={1}
          data={chainPairs}
          totalValue={toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)}
          field="volume"
          title="Volume"
          description="Total volume between chains"
          valuePrefix="$"
        />
      </div>
    </div>
  );
}

function Top({
  i,
  data,
  type = 'chain',
  hasTransfers = true,
  hasGMP = true,
  hasITS: _hasITS = true,
  transfersType,
  field = 'num_txs',
  title = '',
  description = '',
  format: _format = '0,0.00a',
  prefix = '',
  className,
}: StatsCardProps) {
  const { chains } = useGlobalStore();

  // Handle union type - cast to the appropriate type
  const dataArray = (Array.isArray(data) ? data : toArray(data)) as (
    | InterchainData
    | GroupDataItem
  )[];

  return (
    <div
      className={clsx(
        'flex flex-col gap-y-3 border-l border-r border-t border-zinc-200 px-4 dark:border-zinc-700 sm:px-6',
        type === 'chain'
          ? i % 3 !== 0
            ? 'sm:border-l-0'
            : i % (hasTransfers ? 6 : 3) !== 0
              ? 'lg:border-l-0'
              : ''
          : !hasTransfers || !hasGMP || i % 4 !== 0
            ? 'sm:border-l-0'
            : '',
        type === 'chain' ? 'py-4 xl:px-4' : 'py-8 xl:px-8'
      )}
    >
      <div className="flex flex-col gap-y-0.5">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        {description && (
          <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
            {description}
          </span>
        )}
      </div>
      <div className="w-full">
        {!data ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div
            className={clsx('flex flex-col gap-y-1 overflow-y-auto', className)}
          >
            {dataArray
              .filter(
                d =>
                  (type !== 'chain' ||
                    split((d as Record<string, unknown>).key as string, {
                      delimiter: '_',
                    }).filter(k => !getChainData(k, chains)).length < 1) &&
                  ((d as Record<string, unknown>)[field] as number) > 0
              )
              .map((d, i) => {
                const dRecord = d as Record<string, unknown>;
                const keys = split(dRecord.key as string, { delimiter: '_' });

                return keys.length > 0 ? (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-x-2"
                  >
                    <div
                      className={clsx(
                        'flex items-center gap-x-1',
                        ['asset', 'contract', 'address'].includes(type)
                          ? 'h-8'
                          : 'h-6'
                      )}
                    >
                      {keys.map((k, j) => {
                        switch (type) {
                          case 'asset':
                            return (
                              <AssetProfile
                                key={j}
                                value={k}
                                chain={undefined}
                                amount={undefined}
                                addressOrDenom={k}
                                customAssetData={undefined}
                                ITSPossible={true}
                                onlyITS={true}
                                isLink={true}
                                width={20}
                                height={20}
                                className="h-5 text-xs font-medium"
                                titleClassName={undefined}
                              />
                            );
                          case 'contract':
                          case 'address':
                            return (
                              <Profile
                                key={j}
                                i={j}
                                address={k}
                                chain={toArray(dRecord.chain)[0] as string}
                                width={20}
                                height={20}
                                noCopy={true}
                                customURL={
                                  type === 'address'
                                    ? `/address/${k}${transfersType ? `?transfersType=${transfersType}` : ''}`
                                    : ''
                                }
                                useContractLink={type === 'contract'}
                                className="text-xs font-medium"
                              />
                            );
                          case 'chain':
                          default:
                            const { name, image } = {
                              ...getChainData(k, chains),
                            };

                            const element = (
                              <div
                                key={j}
                                className="flex items-center gap-x-1.5"
                              >
                                <Image
                                  src={image}
                                  alt=""
                                  width={20}
                                  height={20}
                                />
                                {keys.length === 1 && (
                                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    {name}
                                  </span>
                                )}
                                {keys.length > 1 && (
                                  <span className="hidden text-xs font-medium text-zinc-700 dark:text-zinc-300 2xl:hidden">
                                    {name}
                                  </span>
                                )}
                              </div>
                            );

                            return keys.length > 1 ? (
                              <div
                                key={j}
                                className="flex items-center gap-x-1"
                              >
                                {j > 0 && (
                                  <MdKeyboardArrowRight
                                    size={16}
                                    className="text-zinc-700 dark:text-zinc-300"
                                  />
                                )}
                                {element}
                              </div>
                            ) : (
                              element
                            );
                        }
                      })}
                    </div>
                    <Number
                      value={dRecord[field] as number}
                      format={_format}
                      prefix={prefix}
                      noTooltip={true}
                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                ) : null;
              })}
          </div>
        )}
      </div>
    </div>
  );
}

function Tops({
  data,
  types,
  params,
}: {
  data: InterchainData;
  types: string[];
  params: FilterParams;
}) {
  const { chains, assets, itsAssets } = useGlobalStore();

  if (!data) return null;

  const {
    GMPStatsByChains,
    GMPStatsByContracts,
    GMPTopUsers,
    GMPTopITSUsers,
    GMPTopITSUsersByVolume,
    GMPTopITSAssets,
    GMPTopITSAssetsByVolume,
    transfersStats,
    transfersTopUsers,
    transfersTopUsersByVolume,
  } = { ...data };

  const groupData = (data: GroupDataItem[], by = 'key') =>
    Object.entries(_.groupBy(toArray(data), by)).map(([k, v]) => ({
      key: (v[0] as GroupDataItem)?.key || k,
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
      chain: _.orderBy(
        toArray(
          _.uniq(
            toArray(
              by === 'customKey'
                ? (v[0] as GroupDataItem)?.chain
                : (v as GroupDataItem[]).map((d: GroupDataItem) => d.chain)
            )
          ).map((d: string | string[] | undefined) =>
            getChainData(d as string, chains)
          )
        ),
        ['i'],
        ['asc']
      ).map(d => d.id),
    }));

  const getTopData = (
    data: GroupDataItem[],
    field = 'num_txs',
    n = 5
  ): GroupDataItem[] =>
    _.slice(
      _.orderBy(toArray(data) as GroupDataItem[], [field], ['desc']),
      0,
      n
    );

  const hasTransfers =
    types.includes('transfers') &&
    !(
      params?.assetType === 'its' ||
      toArray(params?.asset).findIndex(a => getITSAssetData(a, itsAssets)) > -1
    );
  const hasGMP = types.includes('gmp');
  const hasITS =
    hasGMP &&
    params?.assetType !== 'gateway' &&
    toArray(params?.asset).findIndex(a => getAssetData(a, assets)) < 0;

  const chainPairs = groupData(
    _.concat(
      (
        toArray(
          GMPStatsByChains?.source_chains as SourceChainData[]
        ) as SourceChainData[]
      ).flatMap((s: SourceChainData) =>
        (
          toArray(s.destination_chains) as Array<{
            key: string;
            num_txs?: number;
            volume?: number;
          }>
        ).map(d => ({
          key: `${s.key}_${d.key}`,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
      ),
      (
        toArray(
          transfersStats?.data as TransferStatsItem[]
        ) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: `${d.source_chain}_${d.destination_chain}`,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    )
  );

  const sourceChains = groupData(
    _.concat(
      (
        toArray(
          GMPStatsByChains?.source_chains as SourceChainData[]
        ) as SourceChainData[]
      ).flatMap((s: SourceChainData) =>
        (
          toArray(s.destination_chains) as Array<{
            key: string;
            num_txs?: number;
            volume?: number;
          }>
        ).map(d => ({
          key: s.key,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
      ),
      (
        toArray(
          transfersStats?.data as TransferStatsItem[]
        ) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: d.source_chain,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    )
  );

  const destionationChains = groupData(
    _.concat(
      (
        toArray(
          GMPStatsByChains?.source_chains as SourceChainData[]
        ) as SourceChainData[]
      ).flatMap((s: SourceChainData) =>
        (
          toArray(s.destination_chains) as Array<{
            key: string;
            num_txs?: number;
            volume?: number;
          }>
        ).map(d => ({
          key: d.key,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
      ),
      (
        toArray(
          transfersStats?.data as TransferStatsItem[]
        ) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: d.destination_chain,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    )
  );

  const transfersUsers = groupData(
    (toArray(transfersTopUsers?.data as TopDataItem[]) as TopDataItem[]).map(
      (d: TopDataItem) => {
        const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
        const name = account?.name;

        return {
          key: d.key,
          customKey: name || d.key,
          num_txs: d.num_txs,
          volume: d.volume,
        };
      }
    ),
    'customKey'
  );

  const transfersUsersByVolume = groupData(
    (
      toArray(transfersTopUsersByVolume?.data as TopDataItem[]) as TopDataItem[]
    ).map((d: TopDataItem) => {
      const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
      const name = account?.name;

      return {
        key: d.key,
        customKey: name || d.key,
        num_txs: d.num_txs,
        volume: d.volume,
      };
    }),
    'customKey'
  );

  const contracts = groupData(
    (
      toArray(
        GMPStatsByContracts?.chains as ChainWithContracts[]
      ) as ChainWithContracts[]
    ).flatMap((d: ChainWithContracts) =>
      (toArray(d.contracts as ContractData[]) as ContractData[]).map(
        (c: ContractData) => {
          const account = accounts.find(a =>
            equalsIgnoreCase(a.address, c.key)
          );
          const name = account?.name;

          return {
            key: toCase(c.key, 'lower'),
            customKey: name || toCase(c.key, 'lower'),
            num_txs: c.num_txs,
            volume: c.volume,
            chain: d.key,
          };
        }
      )
    ),
    'customKey'
  );

  const GMPUsers = groupData(
    (toArray(GMPTopUsers?.data as TopDataItem[]) as TopDataItem[]).map(
      (d: TopDataItem) => {
        const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
        const name = account?.name;

        return {
          key: toCase(d.key, 'lower'),
          customKey: name || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
        };
      }
    ),
    'customKey'
  );

  const ITSUsers = groupData(
    (toArray(GMPTopITSUsers?.data as TopDataItem[]) as TopDataItem[]).map(
      (d: TopDataItem) => {
        const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
        const name = account?.name;

        return {
          key: toCase(d.key, 'lower'),
          customKey: name || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
        };
      }
    ),
    'customKey'
  );

  const ITSUsersByVolume = groupData(
    (toArray(GMPTopITSUsersByVolume?.data as TopDataItem[]) as TopDataItem[])
      .filter((d: TopDataItem) => (d.volume || 0) > 0)
      .map((d: TopDataItem) => {
        const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
        const name = account?.name;

        return {
          key: toCase(d.key, 'lower'),
          customKey: name || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
          volume: d.volume,
        };
      }),
    'customKey'
  );

  const ITSAssets = groupData(
    (toArray(GMPTopITSAssets?.data as TopDataItem[]) as TopDataItem[]).map(
      (d: TopDataItem) => {
        const { symbol } = { ...getITSAssetData(d.key, itsAssets) };

        return {
          key: toCase(d.key, 'lower'),
          customKey: symbol || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
        };
      }
    ),
    'customKey'
  );

  const ITSAssetsByVolume = groupData(
    (toArray(GMPTopITSAssetsByVolume?.data as TopDataItem[]) as TopDataItem[])
      .filter((d: TopDataItem) => (d.volume || 0) > 0)
      .map((d: TopDataItem) => {
        const { symbol } = { ...getITSAssetData(d.key, itsAssets) };

        return {
          key: toCase(d.key, 'lower'),
          customKey: symbol || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
          volume: d.volume,
        };
      }),
    'customKey'
  );

  return (
    <div className="border-b border-b-zinc-200 dark:border-b-zinc-700">
      <div
        className={clsx(
          'grid lg:px-2 xl:px-0',
          hasTransfers && hasGMP ? '' : 'lg:grid-cols-2'
        )}
      >
        <div
          className={clsx(
            'grid grid-cols-2 sm:grid-cols-3',
            hasTransfers && hasGMP ? 'lg:grid-cols-6' : ''
          )}
        >
          <Top
            i={0}
            data={getTopData(chainPairs, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Paths"
            description="by transactions"
            className="h-48"
          />
          <Top
            i={1}
            data={getTopData(sourceChains, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Sources"
            description="by transactions"
            className="h-48"
          />
          <Top
            i={2}
            data={getTopData(destionationChains, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Destinations"
            description="by transactions"
            className="h-48"
          />
          <Top
            i={3}
            data={getTopData(chainPairs, 'volume', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            field="volume"
            title="Top Paths"
            description="by volume"
            prefix="$"
            className="h-48"
          />
          <Top
            i={4}
            data={getTopData(sourceChains, 'volume', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            field="volume"
            title="Top Sources"
            description="by volume"
            prefix="$"
            className="h-48"
          />
          <Top
            i={5}
            data={getTopData(destionationChains, 'volume', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            field="volume"
            title="Top Destinations"
            description="by volume"
            prefix="$"
            className="h-48"
          />
        </div>
        <div
          className={clsx(
            'grid sm:grid-cols-2',
            hasTransfers && hasGMP ? 'lg:grid-cols-4' : ''
          )}
        >
          {hasTransfers && (
            <>
              <Top
                i={0}
                data={getTopData(transfersUsers, 'num_txs', 100)}
                type="address"
                hasTransfers={hasTransfers}
                hasGMP={hasGMP}
                hasITS={hasITS}
                transfersType="transfers"
                title="Top Users"
                description="Top users by token transfers transactions"
                className="h-96"
              />
              <Top
                i={1}
                data={getTopData(transfersUsersByVolume, 'volume', 100)}
                type="address"
                hasTransfers={hasTransfers}
                hasGMP={hasGMP}
                hasITS={hasITS}
                transfersType="transfers"
                field="volume"
                title="Top Users"
                description="Top users by token transfers volume"
                prefix="$"
                className="h-96"
              />
            </>
          )}
          {hasGMP && (
            <>
              <Top
                i={2}
                data={getTopData(contracts, 'num_txs', 100)}
                type="contract"
                hasTransfers={hasTransfers}
                hasGMP={hasGMP}
                transfersType=""
                title="Top Contracts"
                description="Top contracts by GMP transactions"
                className="h-96"
              />
              <Top
                i={3}
                data={getTopData(GMPUsers, 'num_txs', 100)}
                type="address"
                hasTransfers={hasTransfers}
                hasGMP={hasGMP}
                transfersType="gmp"
                title="Top GMP Users"
                description="Top users by GMP transactions"
                className="h-96"
              />
            </>
          )}
        </div>
        {hasITS &&
          !(
            typeof params?.contractMethod === 'string' &&
            equalsIgnoreCase(params.contractMethod, 'SquidCoral')
          ) && (
            <div
              className={clsx(
                'grid sm:grid-cols-2 lg:grid-cols-4',
                !hasTransfers && 'lg:col-span-2'
              )}
            >
              <Top
                i={0}
                data={getTopData(ITSUsers, 'num_txs', 100)}
                type="address"
                transfersType="gmp"
                title="Top ITS Users"
                description="Top users by ITS transactions"
                className="h-96"
              />
              <Top
                i={1}
                data={getTopData(ITSUsersByVolume, 'volume', 100)}
                type="address"
                transfersType="gmp"
                field="volume"
                title="Top ITS Users"
                description="Top users by ITS volume"
                prefix="$"
                className="h-96"
              />
              <Top
                i={2}
                data={getTopData(ITSAssets, 'num_txs', 100)}
                type="asset"
                transfersType="gmp"
                title="Top ITS Assets"
                description="Top assets by ITS transactions"
                className="h-96"
              />
              <Top
                i={3}
                data={getTopData(ITSAssetsByVolume, 'volume', 100)}
                type="asset"
                transfersType="gmp"
                field="volume"
                title="Top ITS Assets"
                description="Top assets by ITS volume"
                prefix="$"
                className="h-96"
              />
            </div>
          )}
      </div>
    </div>
  );
}

function GMPTimeSpent({
  data,
  format: _format = '0,0',
  prefix: _prefix = '',
}: TimeSpentRowProps) {
  if (!data) return null;

  const dataRecord = data as TimeSpentData;
  const { key, num_txs, express_execute, confirm, approve, total } = {
    ...dataRecord,
  };

  const Point = ({
    title,
    name,
    noTooltip = false,
  }: {
    title: string;
    name: string;
    noTooltip?: boolean;
  }) => {
    const point = (
      <div className="flex flex-col gap-y-0.5">
        <div className="h-2 w-2 rounded-full bg-blue-600 p-1 dark:bg-blue-500" />
        <span className="text-2xs font-medium uppercase text-blue-600 dark:text-blue-500">
          {title}
        </span>
      </div>
    );

    if (noTooltip) {
      return point;
    }

    return (
      <TooltipComponent content={name} className="whitespace-nowrap">
        {point}
      </TooltipComponent>
    );
  };

  type PointData = {
    id: string;
    title: string;
    name: string;
    time_spent: number;
    label?: string;
    value?: number;
    width?: string | number;
  };

  let points: PointData[] = toArray([
    express_execute && {
      id: 'express_execute',
      title: 'X',
      name: 'Express Execute',
      time_spent: express_execute,
    },
    confirm && {
      id: 'confirm',
      title: 'C',
      name: 'Confirm',
      time_spent: confirm,
    },
    approve && {
      id: 'approve',
      title: 'A',
      name: 'Approve',
      time_spent: approve,
    },
    total && {
      id: 'execute',
      title: 'E',
      name: 'Execute',
      label: 'Total',
      time_spent: total,
    },
  ]) as PointData[];

  if (total && typeof total === 'number') {
    points = points.map((d, i) => {
      const value =
        (d.time_spent || 0) - (i > 0 ? points[i - 1].time_spent || 0 : 0);

      return {
        ...d,
        value,
        width: toFixed((value * 100) / total, 2),
      };
    });
  }

  return (
    <div className="flex flex-col gap-y-2 rounded-lg bg-zinc-50 px-3 py-4 dark:bg-zinc-800/25 sm:flex-row sm:justify-between sm:gap-x-2 sm:gap-y-0">
      <div className="flex w-40 flex-col gap-y-0.5">
        <ChainProfile
          value={key}
          width={20}
          height={20}
          className="h-5 gap-x-1"
          titleClassName="text-xs"
        />
        <Number
          value={num_txs || 0}
          format="0,0.00a"
          suffix=" records"
          className="whitespace-nowrap text-xs font-medium text-zinc-700 dark:text-zinc-300"
        />
      </div>
      {total && typeof total === 'number' && total > 0 && (
        <div className="flex w-full flex-col gap-y-0.5">
          <div className="flex w-full items-center justify-between">
            <Point title="S" name="Start" />
            {points.map((d, i) => (
              <div
                key={i}
                className="flex justify-between"
                style={{ width: `${d.width}%` }}
              >
                <div
                  className="h-0.5 w-full bg-blue-600 dark:bg-blue-500"
                  style={{ marginTop: '3px' }}
                />
                <TooltipComponent
                  content={
                    <div className="flex flex-col">
                      <span>{d.name}</span>
                      <TimeSpent
                        fromTimestamp={0}
                        toTimestamp={(d.value || 0) * 1000}
                        noTooltip={true}
                        title=""
                        className="font-medium"
                      />
                    </div>
                  }
                  className="whitespace-nowrap"
                >
                  <Point title={d.title} name={d.name} noTooltip={true} />
                </TooltipComponent>
              </div>
            ))}
          </div>
          <div className="ml-2 flex w-full items-center justify-between">
            {points.map((d, i) => (
              <div
                key={i}
                className="flex justify-end"
                style={{ width: `${d.width}%` }}
              >
                {['express_execute', 'execute'].includes(d.id) ? (
                  <TooltipComponent
                    content={d.label || d.name}
                    className="whitespace-nowrap"
                  >
                    <TimeSpent
                      fromTimestamp={0}
                      toTimestamp={d.time_spent * 1000}
                      noTooltip={true}
                      title=""
                      className="whitespace-nowrap text-2xs font-medium text-zinc-900 dark:text-zinc-100"
                    />
                  </TooltipComponent>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GMPTimeSpents({ data }: { data: InterchainData }) {
  if (!data?.GMPStatsAVGTimes?.time_spents) return null;

  return (
    <div className="flex flex-col gap-y-4 border border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 xl:px-8">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-0.5">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            GMP Time Spent
          </span>
          <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
            The median time spent of General Message Passing from each chain
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.GMPStatsAVGTimes.time_spents.map(
          (d: TimeSpentData, i: number) => (
            <GMPTimeSpent key={i} data={d} />
          )
        )}
      </div>
    </div>
  );
}

export function Interchain() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<FilterParams>(
    getParams(searchParams) as FilterParams
  );
  const [types, setTypes] = useState<string[] | string>(
    params.transfersType || ['gmp', 'transfers']
  );
  const [data, setData] = useState<DynamicInterchainData | null>(null);
  const [timeSpentData, setTimeSpentData] =
    useState<DynamicInterchainData | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const globalStore = useGlobalStore();
  const { assets, stats } = { ...globalStore };

  const {
    transfersType: _transfersType,
    contractMethod,
    contractAddress,
    fromTime,
    toTime,
  } = {
    ...params,
  };

  const granularity = getGranularity(fromTime || 0, toTime || 0);

  useEffect(() => {
    const _params = getParams(searchParams) as FilterParams;

    if (!_.isEqual(_params, params)) {
      setParams(_params);

      if (_params.contractMethod) {
        setTypes(['gmp']);
      } else {
        setTypes(_params.transfersType || ['gmp', 'transfers']);
      }

      setRefresh(true);
    }
  }, [searchParams, params]);

  useEffect(() => {
    const metrics = [
      'GMPStatsByChains',
      'GMPStatsByContracts',
      'GMPChart',
      'GMPTotalVolume',
      'GMPTopUsers',
      'GMPTopITSUsers',
      'GMPTopITSUsersByVolume',
      'GMPTopITSAssets',
      'GMPTopITSAssetsByVolume',
      'transfersStats',
      'transfersChart',
      'transfersTotalVolume',
      'transfersTopUsers',
      'transfersTopUsersByVolume',
    ];

    const getData = async () => {
      // assets data require when filtering asset
      if (
        params &&
        toBoolean(refresh) &&
        stats &&
        (!params.asset || (assets && globalStore.itsAssets))
      ) {
        const newData = Object.fromEntries(
          await Promise.all(
            toArray(metrics).map(
              (d: string) =>
                new Promise<[string, unknown]>(async resolve => {
                  const isSearchITSOnTransfers =
                    types.includes('transfers') &&
                    d.startsWith('transfers') &&
                    (params.assetType === 'its' ||
                      toArray(params.asset).findIndex(a =>
                        getITSAssetData(a, globalStore.itsAssets)
                      ) > -1);
                  const hasITS =
                    types.includes('gmp') &&
                    params.assetType !== 'gateway' &&
                    toArray(params.asset).findIndex(a =>
                      getAssetData(a, assets)
                    ) < 0;
                  const noFilter = Object.keys(params).length === 0;

                  switch (d) {
                    case 'GMPStatsByChains':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPStatsByChains(params))),
                      ]);
                      break;
                    case 'GMPStatsByContracts':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPStatsByContracts(params))),
                      ]);
                      break;
                    case 'GMPStatsAVGTimes':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          (await GMPStatsAVGTimes({
                            ...params,
                            fromTime:
                              params.fromTime !== undefined
                                ? params.fromTime
                                : moment()
                                    .subtract(1, 'months')
                                    .startOf('day')
                                    .unix(),
                          })),
                      ]);
                      break;
                    case 'GMPChart':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPChart({
                              ...params,
                              granularity,
                            }))),
                      ]);
                      break;
                    case 'GMPTotalVolume':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPTotalVolume(params))),
                      ]);
                      break;
                    case 'GMPTopUsers':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopUsers({
                              ...params,
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSUsers':
                      resolve([
                        d,
                        hasITS &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopUsers({
                              ...params,
                              assetType: 'its',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSUsersByVolume':
                      resolve([
                        d,
                        hasITS &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopUsers({
                              ...params,
                              assetType: 'its',
                              orderBy: 'volume',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSAssets':
                      resolve([
                        d,
                        hasITS &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopITSAssets({
                              ...params,
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSAssetsByVolume':
                      resolve([
                        d,
                        hasITS &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopITSAssets({
                              ...params,
                              orderBy: 'volume',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'transfersStats':
                      if (isSearchITSOnTransfers) {
                        resolve([d, { data: [] }]);
                      } else {
                        resolve([
                          d,
                          types.includes('transfers') &&
                            ((noFilter && stats[d]) ||
                              (await transfersStats(params))),
                        ]);
                      }
                      break;
                    case 'transfersChart':
                      if (isSearchITSOnTransfers) {
                        resolve([d, { data: [] }]);
                      } else {
                        if (noFilter && stats[d]) {
                          // For noFilter case with cached stats, return both original and airdrop data
                          resolve([
                            [d, stats[d]],
                            [
                              d.replace('transfers', 'transfersAirdrop'),
                              stats[d.replace('transfers', 'transfersAirdrop')],
                            ],
                          ] as unknown as [string, unknown]);
                        } else {
                          let value =
                            types.includes('transfers') &&
                            (await transfersChart({
                              ...params,
                              granularity,
                            }));

                          const values = [[d, value]];

                          if (value?.data && granularity === 'month') {
                            const airdrops = [
                              {
                                date: '08-01-2023',
                                fromTime: undefined,
                                toTime: undefined,
                                chain: 'sei',
                                environment: 'mainnet',
                              },
                            ];

                            // custom transfers chart by adding airdrops data
                            for (const airdrop of airdrops) {
                              const { date, chain, environment } = {
                                ...airdrop,
                              };
                              let fromTime: number =
                                airdrop.fromTime ??
                                moment(date, 'MM-DD-YYYY')
                                  .startOf('month')
                                  .unix();
                              let toTime: number =
                                airdrop.toTime ??
                                moment(date, 'MM-DD-YYYY')
                                  .endOf('month')
                                  .unix();

                              if (
                                environment === ENVIRONMENT &&
                                (!params.fromTime ||
                                  toNumber(params.fromTime) < fromTime) &&
                                (!params.toTime ||
                                  toNumber(params.toTime) > toTime)
                              ) {
                                const response = await transfersChart({
                                  ...params,
                                  chain,
                                  fromTime: fromTime!,
                                  toTime: toTime!,
                                  granularity,
                                });

                                if (toArray(response?.data).length > 0) {
                                  for (const v of toArray(
                                    response.data
                                  ) as ChartDataPoint[]) {
                                    if (v.timestamp && (v.volume || 0) > 0) {
                                      const i = value.data.findIndex(
                                        (vData: Record<string, unknown>) =>
                                          vData.timestamp === v.timestamp
                                      );

                                      if (
                                        i > -1 &&
                                        (value.data[i].volume || 0) >=
                                          (v.volume || 0)
                                      ) {
                                        value.data[i] = {
                                          ...value.data[i],
                                          volume:
                                            (value.data[i].volume || 0) -
                                            (v.volume || 0),
                                        };
                                      }
                                    }
                                  }

                                  values.push([
                                    d.replace('transfers', 'transfersAirdrop'),
                                    response,
                                  ]);
                                }
                              }
                            }
                          }

                          resolve(values as [string, unknown]);
                        }
                      }
                      break;
                    case 'transfersTotalVolume':
                      if (isSearchITSOnTransfers) {
                        resolve([d, 0]);
                      } else {
                        resolve([
                          d,
                          types.includes('transfers') &&
                            ((noFilter && stats[d]) ||
                              (await transfersTotalVolume(params))),
                        ]);
                      }
                      break;
                    case 'transfersTopUsers':
                      if (isSearchITSOnTransfers) {
                        resolve([d, { data: [] }]);
                      } else {
                        resolve([
                          d,
                          types.includes('transfers') &&
                            ((noFilter && stats[d]) ||
                              (await transfersTopUsers({
                                ...params,
                                size: 100,
                              }))),
                        ]);
                      }
                      break;
                    case 'transfersTopUsersByVolume':
                      if (isSearchITSOnTransfers) {
                        resolve([d, { data: [] }]);
                      } else {
                        resolve([
                          d,
                          types.includes('transfers') &&
                            ((noFilter && stats[d]) ||
                              (await transfersTopUsers({
                                ...params,
                                orderBy: 'volume',
                                size: 100,
                              }))),
                        ]);
                      }
                      break;
                    default:
                      resolve([d, undefined]);
                      break;
                  }
                })
            )
          ).then((results: [string, unknown][]) =>
            results
              .filter((d: unknown) => d !== null && d !== undefined)
              .map((d: unknown) =>
                Array.isArray((d as [string, unknown][])[0]) ? d : [d]
              )
              .flatMap((d: unknown) => d as [string, unknown][])
          )
        );

        setData(prevData => ({
          ...prevData,
          [generateKeyByParams(params)]: newData,
        }));
        setRefresh(false);
      }
    };

    getData();
  }, [
    params,
    refresh,
    setRefresh,
    assets,
    stats,
    globalStore.itsAssets,
    types,
    granularity,
  ]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh)) {
        const newData = {
          GMPStatsAVGTimes:
            types.includes('gmp') &&
            (await GMPStatsAVGTimes({
              ...params,
              fromTime:
                params.fromTime ||
                moment().subtract(3, 'months').startOf('day').unix(),
            })),
        };

        setTimeSpentData(prevData => ({
          ...prevData,
          [generateKeyByParams(params)]: newData,
        }));
      }
    };

    getData();
  }, [params, setTimeSpentData, refresh, setRefresh, types]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-y-6">
          <div className="flex items-center gap-x-6">
            <div className="sm:flex-auto">
              <div className="flex items-center gap-x-4">
                <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
                  Statistics
                </h1>
                {_.slice(toArray(contractAddress), 0, 1).map((a, i) => (
                  <Profile
                    key={i}
                    i={i}
                    address={a}
                    chain=""
                    width={18}
                    height={18}
                    customURL=""
                    useContractLink={false}
                    className="text-xs"
                  />
                ))}
                {!contractAddress &&
                  equalsIgnoreCase(
                    String(contractMethod || ''),
                    'SquidCoral'
                  ) && (
                    <Profile
                      i={0}
                      address={
                        accounts.find(d =>
                          equalsIgnoreCase(d.name, 'Squid Coral')
                        )?.address
                      }
                      chain=""
                      width={18}
                      height={18}
                      noCopy={true}
                      customURL={`/gmp/search?contractMethod=${contractMethod}`}
                      useContractLink={false}
                      className="text-xs"
                    />
                  )}
              </div>
              <div className="mt-2 flex max-w-xl flex-wrap items-center">
                {TIME_SHORTCUTS.map((d, i) => {
                  const selected =
                    ((!fromTime && !_.head(d.value)) ||
                      _.head(d.value)?.unix() === toNumber(fromTime)) &&
                    ((!toTime && !_.last(d.value)) ||
                      _.last(d.value)?.unix() === toNumber(toTime));

                  return (
                    <Link
                      key={i}
                      href={`${pathname}${getQueryString({ ...params, fromTime: _.head(d.value)?.unix(), toTime: _.last(d.value)?.unix() })}`}
                      className={clsx(
                        'mb-1 mr-4 flex min-w-max items-center whitespace-nowrap text-xs sm:mb-0 sm:text-sm',
                        selected
                          ? 'font-semibold text-blue-600 dark:text-blue-500'
                          : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                      )}
                    >
                      <span>{d.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <Filters />
              {refresh && typeof refresh !== 'boolean' ? (
                <Spinner />
              ) : (
                <Button
                  color="default"
                  circle="true"
                  onClick={() => setRefresh(true)}
                  className=""
                >
                  <MdOutlineRefresh size={20} />
                </Button>
              )}
            </div>
          </div>
          {refresh && typeof refresh !== 'boolean' && <Overlay />}
          <Summary
            data={data[generateKeyByParams(params)] as InterchainData}
            params={params}
          />
          <Charts
            data={data[generateKeyByParams(params)] as InterchainData}
            granularity={granularity}
            params={params}
          />
          <Tops
            data={data[generateKeyByParams(params)] as InterchainData}
            types={Array.isArray(types) ? types : [types]}
            params={params}
          />
          {types.includes('gmp') && (
            <GMPTimeSpents
              data={
                (timeSpentData?.[
                  generateKeyByParams(params)
                ] as InterchainData) || {}
              }
            />
          )}
        </div>
      )}
    </Container>
  );
}
