'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import {
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineArrowRightEndOnRectangle,
} from 'react-icons/hi2';
import {
  MdOutlineRefresh,
  MdOutlineFilterList,
  MdClose,
  MdCheck,
  MdOutlineTimer,
} from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';
import { PiWarningCircle } from 'react-icons/pi';
import { RiTimerFlashLine } from 'react-icons/ri';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile, AssetProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo, TimeSpent } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useGlobalStore } from '@/components/Global';
import { searchGMP } from '@/lib/api/gmp';
import { isAxelar } from '@/lib/chain';
import { ENVIRONMENT } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
import {
  getParams,
  getQueryString,
  generateKeyByParams,
  isFiltered,
} from '@/lib/operator';
import {
  isString,
  equalsIgnoreCase,
  capitalize,
  toBoolean,
  includesSomePatterns,
  ellipse,
  filterSearchInput,
} from '@/lib/string';
import { isNumber } from '@/lib/number';
import { timeDiff } from '@/lib/time';
import customGMPs from '@/data/custom/gmp';

const size = 25;

function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState(getParams(searchParams, size));
  const [searchInput, setSearchInput] = useState({});
  const { handleSubmit } = useForm();
  const { chains, assets, itsAssets } = useGlobalStore();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  const onSubmit = (e1, e2, _params) => {
    if (!_params) {
      _params = params;
    }

    if (!_.isEqual(_params, getParams(searchParams, size))) {
      router.push(`${pathname}${getQueryString(_params)}`);
      setParams(_params);
    }

    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setParams(getParams(searchParams, size));
  };

  const attributes = toArray([
    { label: 'Tx Hash', name: 'txHash' },
    { label: 'Message ID', name: 'messageId' },
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
      label: 'Asset Type',
      name: 'assetType',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'gateway', title: 'Gateway Token' },
        { value: 'its', title: 'ITS Token' },
      ],
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
              params.assetType !== 'its' &&
                toArray(assets).map(d => ({
                  value: d.id,
                  title: `${d.symbol} (${d.id})`,
                })),
              params.assetType !== 'gateway' &&
                toArray(itsAssets).map(d => ({
                  value: d.symbol,
                  title: `${d.symbol} (ITS)`,
                }))
            )
          ),
          'value'
        ),
        ['title'],
        ['asc']
      ),
    },
    params.assetType === 'its' && {
      label: 'ITS Token Address',
      name: 'itsTokenAddress',
    },
    {
      label: 'Method',
      name: 'contractMethod',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'callContract', title: 'CallContract' },
        { value: 'callContractWithToken', title: 'CallContractWithToken' },
        { value: 'InterchainTransfer', title: 'InterchainTransfer' },
        {
          value: 'InterchainTokenDeployment',
          title: 'InterchainTokenDeployment',
        },
        { value: 'TokenManagerDeployment', title: 'TokenManagerDeployment' },
        { value: 'LinkToken', title: 'LinkToken' },
        { value: 'TokenMetadataRegistered', title: 'TokenMetadataRegistered' },
        { value: 'SquidCoral', title: 'SquidCoral' },
        {
          value: 'SquidCoralSettlementForwarded',
          title: 'SquidCoralSettlementForwarded',
        },
        {
          value: 'SquidCoralSettlementFilled',
          title: 'SquidCoralSettlementFilled',
        },
      ],
    },
    params.contractMethod?.startsWith('SquidCoral') && {
      label: 'Squid Coral OrderHash',
      name: 'squidCoralOrderHash',
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: [
        { title: 'Any' },
        { value: 'called', title: 'Called' },
        { value: 'confirming', title: 'Wait for Confirmation' },
        { value: 'express_executed', title: 'Express Executed' },
        { value: 'approving', title: 'Wait for Approval' },
        { value: 'approved', title: 'Approved' },
        { value: 'executing', title: 'Executing' },
        { value: 'executed', title: 'Executed' },
        { value: 'error', title: 'Error Execution' },
        { value: 'insufficient_fee', title: 'Insufficient Fee' },
        { value: 'not_enough_gas_to_execute', title: 'Not Enough Gas' },
      ],
    },
    { label: 'Sender', name: 'senderAddress' },
    { label: 'Source Address', name: 'sourceAddress' },
    { label: 'Destination Contract', name: 'destinationContractAddress' },
    { label: 'Command ID', name: 'commandId' },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
    {
      label: 'Sort By',
      name: 'sortBy',
      type: 'select',
      options: [
        { title: 'ContractCall Time' },
        { value: 'value', title: 'Token Value' },
      ],
    },
    { label: 'Proposal ID', name: 'proposalId' },
  ]);

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
                                      onChange={v =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? v.join(',')
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const isSelected = v =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name]
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter(o =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find(o =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className="relative">
                                            <Combobox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    'flex flex-wrap',
                                                    selectedValue.length !==
                                                      0 && 'my-1'
                                                  )}
                                                >
                                                  {selectedValue.length ===
                                                  0 ? (
                                                    <span className="block truncate">
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedValue.map(
                                                      (v, j) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedValue
                                                                  .filter(
                                                                    v =>
                                                                      v.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    v => v.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                                                        >
                                                          {v.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="block truncate">
                                                  {selectedValue?.title}
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
                                                  {toArray(d.options)
                                                    .filter(o =>
                                                      filterSearchInput(
                                                        [o.title, o.value],
                                                        searchInput[d.name]
                                                      )
                                                    )
                                                    .map((o, j) => (
                                                      <Combobox.Option
                                                        key={j}
                                                        value={o.value}
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
                                                              {o.title}
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
                                      onChange={v =>
                                        setParams({
                                          ...params,
                                          [d.name]: d.multiple
                                            ? v.join(',')
                                            : v,
                                        })
                                      }
                                      multiple={d.multiple}
                                    >
                                      {({ open }) => {
                                        const isSelected = v =>
                                          d.multiple
                                            ? split(params[d.name]).includes(v)
                                            : v === params[d.name] ||
                                              equalsIgnoreCase(
                                                v,
                                                params[d.name]
                                              );
                                        const selectedValue = d.multiple
                                          ? toArray(d.options).filter(o =>
                                              isSelected(o.value)
                                            )
                                          : toArray(d.options).find(o =>
                                              isSelected(o.value)
                                            );

                                        return (
                                          <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
                                              {d.multiple ? (
                                                <div
                                                  className={clsx(
                                                    'flex flex-wrap',
                                                    selectedValue.length !==
                                                      0 && 'my-1'
                                                  )}
                                                >
                                                  {selectedValue.length ===
                                                  0 ? (
                                                    <span className="block truncate">
                                                      Any
                                                    </span>
                                                  ) : (
                                                    selectedValue.map(
                                                      (v, j) => (
                                                        <div
                                                          key={j}
                                                          onClick={() =>
                                                            setParams({
                                                              ...params,
                                                              [d.name]:
                                                                selectedValue
                                                                  .filter(
                                                                    v =>
                                                                      v.value !==
                                                                      v.value
                                                                  )
                                                                  .map(
                                                                    v => v.value
                                                                  )
                                                                  .join(','),
                                                            })
                                                          }
                                                          className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                                                        >
                                                          {v.title}
                                                        </div>
                                                      )
                                                    )
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="block truncate">
                                                  {selectedValue?.title}
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
                                                {toArray(d.options).map(
                                                  (o, j) => (
                                                    <Listbox.Option
                                                      key={j}
                                                      value={o.value}
                                                      className={({ active }) =>
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
                                                            {o.title}
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
                                                  )
                                                )}
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
                                    onChange={v =>
                                      setParams({ ...params, ...v })
                                    }
                                  />
                                ) : (
                                  <input
                                    type={d.type || 'text'}
                                    name={d.name}
                                    placeholder={d.label}
                                    value={params[d.name]}
                                    onChange={e =>
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

export const getEvent = data => {
  const {
    call,
    interchain_transfer,
    token_manager_deployment_started,
    interchain_token_deployment_started,
    link_token_started,
    token_metadata_registered,
    settlement_forwarded_events,
    settlement_filled_events,
    interchain_transfers,
    originData,
  } = { ...data };

  if (interchain_transfer || originData?.interchain_transfer)
    return 'InterchainTransfer';
  if (
    token_manager_deployment_started ||
    originData?.token_manager_deployment_started
  )
    return 'TokenManagerDeployment';
  if (
    interchain_token_deployment_started ||
    originData?.interchain_token_deployment_started
  )
    return 'InterchainTokenDeployment';
  if (link_token_started || originData?.link_token_started) return 'LinkToken';
  if (token_metadata_registered || originData?.token_metadata_registered)
    return 'TokenMetadataRegistered';
  if (settlement_forwarded_events) return 'SquidCoralSettlementForwarded';
  if (settlement_filled_events || interchain_transfers)
    return 'SquidCoralSettlementFilled';

  return call?.event;
};

export const customData = async data => {
  const { call, interchain_transfer, interchain_transfers } = { ...data };
  const { destinationContractAddress, payload } = { ...call?.returnValues };
  if (!(destinationContractAddress && isString(payload))) return data;

  try {
    const { id, name, customize } = {
      ...toArray(customGMPs).find(
        d =>
          toArray(d.addresses).findIndex(a =>
            equalsIgnoreCase(a, destinationContractAddress)
          ) > -1 &&
          (!d.environment || equalsIgnoreCase(d.environment, ENVIRONMENT))
      ),
    };

    if (typeof customize === 'function') {
      const customValues = await customize(call.returnValues, ENVIRONMENT);

      if (
        typeof customValues === 'object' &&
        !Array.isArray(customValues) &&
        Object.keys(customValues).length > 0
      ) {
        customValues.projectId = id;
        customValues.projectName = name || capitalize(id);
        data.customValues = customValues;
      }
    }

    // interchain transfer
    if (
      interchain_transfer?.destinationAddress &&
      !data.customValues?.recipientAddress
    ) {
      data.customValues = {
        ...data.customValues,
        recipientAddress: interchain_transfer.destinationAddress,
        destinationChain: interchain_transfer.destinationChain,
        projectId: 'its',
        projectName: 'ITS',
      };
    }

    // interchain transfers
    if (
      toArray(interchain_transfers).length > 0 &&
      !data.customValues?.recipientAddresses
    ) {
      data.customValues = {
        ...data.customValues,
        recipientAddresses: interchain_transfers.map(d => ({
          recipientAddress: d.recipient,
          chain: d.destinationChain,
        })),
        projectId: 'squid',
        projectName: 'Squid',
      };
    }
  } catch (error) {}

  return data;
};

export const checkNeedMoreGasFromError = error =>
  !!error &&
  includesSomePatterns(
    [error.error?.reason, error.error?.message],
    ['INSUFFICIENT_GAS']
  );

export function GMPs({ address, useAnotherHopChain = false }) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [refresh, setRefresh] = useState(null);

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (address) {
      _params.address = address;
    }

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [address, searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh)) {
        const sort = params.sortBy === 'value' ? { value: 'desc' } : undefined;

        const _params = _.cloneDeep(params);
        delete _params.sortBy;

        const response = await searchGMP({ ..._params, size, sort });

        if (response?.data) {
          response.data = await Promise.all(
            toArray(response.data).map(
              d => new Promise(async resolve => resolve(await customData(d)))
            )
          );
        }

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: { ...response },
        });

        setRefresh(false);
      }
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh('true'), 0.5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params)] };

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className="flex items-center justify-between gap-x-4">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
                General Message Passing
              </h1>
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                <Number
                  value={total}
                  suffix={` result${total > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              {!address && <Filters />}
              {refresh && refresh !== 'true' ? (
                <Spinner />
              ) : (
                <Button
                  color="default"
                  circle="true"
                  onClick={() => setRefresh(true)}
                >
                  <MdOutlineRefresh size={20} />
                </Button>
              )}
            </div>
          </div>
          {refresh && refresh !== 'true' && <Overlay />}
          <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left sm:pl-0"
                  >
                    Tx Hash
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Method
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Sender
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Destination
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-3 pr-4 text-right sm:pr-0"
                  >
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {data.map(d => {
                  const symbol =
                    d.call.returnValues?.symbol ||
                    d.interchain_transfer?.symbol ||
                    d.token_manager_deployment_started?.symbol ||
                    d.interchain_token_deployment_started?.tokenSymbol ||
                    d.link_token_started?.symbol ||
                    d.token_metadata_registered?.symbol;
                  const receivedTransactionHash =
                    d.express_executed?.transactionHash ||
                    d.executed?.transactionHash;
                  const key = d.message_id || d.call.transactionHash;

                  return (
                    <tr
                      key={key}
                      className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                    >
                      <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                        <div className="flex items-center gap-x-1">
                          <Copy value={key}>
                            <Link
                              href={`/gmp/${d.call.parentMessageID ? d.call.parentMessageID : d.message_id ? d.message_id : `${d.call.chain_type === 'cosmos' && isNumber(d.call.messageIdIndex) ? d.call.axelarTransactionHash : d.call.transactionHash}${isNumber(d.call.logIndex) ? `:${d.call.logIndex}` : d.call.chain_type === 'cosmos' && isNumber(d.call.messageIdIndex) ? `-${d.call.messageIdIndex}` : ''}`}`}
                              target="_blank"
                              className="font-semibold text-blue-600 dark:text-blue-500"
                            >
                              {ellipse(key, 8)}
                            </Link>
                          </Copy>
                          {!d.call.proposal_id && (
                            <ExplorerLink
                              value={d.call.transactionHash}
                              chain={d.call.chain}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1.5">
                          <Tag className={clsx('w-fit capitalize')}>
                            {getEvent(d)}
                          </Tag>
                          {symbol && (
                            <AssetProfile
                              value={symbol}
                              chain={d.call.chain}
                              amount={d.amount}
                              ITSPossible={true}
                              onlyITS={!getEvent(d)?.includes('ContractCall')}
                              width={16}
                              height={16}
                              className="h-6 w-fit rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800"
                              titleClassName="text-xs"
                            />
                          )}
                          {d.interchain_transfer?.contract_address &&
                            !isAxelar(d.call.chain) && (
                              <Tooltip
                                content="Token Address"
                                className="whitespace-nowrap"
                                parentClassName="!justify-start"
                              >
                                <Profile
                                  address={
                                    d.interchain_transfer.contract_address
                                  }
                                  chain={d.call.chain}
                                  width={16}
                                  height={16}
                                  noResolveName={true}
                                  className="w-fit text-xs"
                                />
                              </Tooltip>
                            )}
                          {toArray(d.interchain_transfers).length > 0 && (
                            <div className="flex flex-col gap-y-1.5">
                              {d.interchain_transfers.map((_d, i) => (
                                <AssetProfile
                                  key={i}
                                  value={_d.contract_address || _d.symbol}
                                  chain={_d.destinationChain}
                                  amount={_d.amount}
                                  customAssetData={_d}
                                  ITSPossible={true}
                                  width={16}
                                  height={16}
                                  className="h-6 w-fit rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800"
                                  titleClassName="text-xs"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1">
                          {useAnotherHopChain &&
                          isAxelar(d.call.chain) &&
                          d.origin_chain ? (
                            <div className="flex items-center gap-x-2">
                              <ChainProfile
                                value={d.origin_chain}
                                className="h-6"
                                titleClassName="font-semibold"
                              />
                              <ExplorerLink
                                value={d.call.returnValues.sender}
                                chain={d.call.chain}
                                type="address"
                                title="via"
                                iconOnly={false}
                                width={11}
                                height={11}
                                containerClassName="!gap-x-1"
                                nonIconClassName="text-blue-600 dark:text-blue-500 !text-opacity-75 text-xs"
                              />
                            </div>
                          ) : (
                            <ChainProfile
                              value={d.call.chain}
                              titleClassName="font-semibold"
                            />
                          )}
                          {useAnotherHopChain &&
                          isAxelar(d.call.chain) &&
                          d.origin_chain ? null : (
                            <Profile
                              address={d.call.transaction?.from}
                              chain={d.call.chain}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1">
                          {d.is_invalid_destination_chain ? (
                            <div className="flex">
                              <Tooltip
                                content={d.call.returnValues?.destinationChain}
                              >
                                <div className="flex h-6 items-center gap-x-1.5 text-red-600 dark:text-red-500">
                                  <PiWarningCircle size={20} />
                                  <span>Invalid Chain</span>
                                </div>
                              </Tooltip>
                            </div>
                          ) : (
                            (!isAxelar(d.call.returnValues?.destinationChain) ||
                              !d.customValues?.recipientAddress ||
                              !useAnotherHopChain) && (
                              <ChainProfile
                                value={d.call.returnValues?.destinationChain}
                                titleClassName="font-semibold"
                              />
                            )
                          )}
                          {d.is_invalid_contract_address ? (
                            <div className="flex">
                              <Tooltip
                                content={
                                  d.call.returnValues
                                    ?.destinationContractAddress
                                }
                              >
                                <div className="flex h-6 items-center gap-x-1.5 text-red-600 dark:text-red-500">
                                  <PiWarningCircle size={20} />
                                  <span>Invalid Contract</span>
                                </div>
                              </Tooltip>
                            </div>
                          ) : (
                            <>
                              {(!isAxelar(
                                d.call.returnValues?.destinationChain
                              ) ||
                                !d.customValues?.recipientAddress ||
                                !useAnotherHopChain) && (
                                <Tooltip
                                  content="Destination Contract"
                                  parentClassName="!justify-start"
                                >
                                  <Profile
                                    address={
                                      d.call.returnValues
                                        ?.destinationContractAddress
                                    }
                                    chain={
                                      d.call.returnValues?.destinationChain
                                    }
                                    useContractLink={true}
                                  />
                                </Tooltip>
                              )}
                              {(d.callback_chain ||
                                d.customValues?.recipientAddress) && (
                                <>
                                  {isAxelar(
                                    d.call.returnValues?.destinationChain
                                  ) && (
                                    <div className="flex items-center gap-x-2">
                                      <ChainProfile
                                        value={
                                          useAnotherHopChain &&
                                          (d.callback_chain ||
                                            d.customValues?.destinationChain)
                                        }
                                        className="h-6"
                                        titleClassName="font-semibold"
                                      />
                                      {useAnotherHopChain && (
                                        <ExplorerLink
                                          value={
                                            d.call.returnValues
                                              .destinationContractAddress
                                          }
                                          chain={
                                            d.call.returnValues.destinationChain
                                          }
                                          type="address"
                                          title="via"
                                          iconOnly={false}
                                          width={11}
                                          height={11}
                                          containerClassName="!gap-x-1"
                                          nonIconClassName="text-blue-600 dark:text-blue-500 !text-opacity-75 text-xs"
                                        />
                                      )}
                                    </div>
                                  )}
                                  {(d.customValues?.recipientAddress ||
                                    (useAnotherHopChain &&
                                      d.callback_destination_address)) && (
                                    <Tooltip
                                      content={
                                        isAxelar(
                                          d.call.returnValues?.destinationChain
                                        ) &&
                                        (d.customValues?.projectName ===
                                          'ITS' ||
                                          (!d.customValues?.recipientAddress &&
                                            d.callback_destination_address))
                                          ? 'Destination Address'
                                          : `${d.customValues?.projectName ? d.customValues.projectName : 'Final User'} Recipient`
                                      }
                                      parentClassName="!justify-start"
                                    >
                                      <Profile
                                        address={
                                          d.customValues?.recipientAddress ||
                                          (useAnotherHopChain &&
                                            d.callback_destination_address)
                                        }
                                        chain={
                                          (useAnotherHopChain &&
                                            d.callback_chain) ||
                                          d.customValues?.destinationChain ||
                                          d.call.returnValues?.destinationChain
                                        }
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1.5">
                          {d.simplified_status && (
                            <div className="flex items-center space-x-1.5">
                              <Tag
                                className={clsx(
                                  'w-fit capitalize',
                                  d.simplified_status === 'received'
                                    ? 'bg-green-600 dark:bg-green-500'
                                    : d.simplified_status === 'approved'
                                      ? 'bg-orange-500 dark:bg-orange-600'
                                      : d.simplified_status === 'failed'
                                        ? 'bg-red-600 dark:bg-red-500'
                                        : 'bg-yellow-400 dark:bg-yellow-500'
                                )}
                              >
                                {d.simplified_status === 'received' &&
                                (getEvent(d) === 'ContractCall' ||
                                  (getEvent(d) === 'InterchainTransfer' &&
                                    isAxelar(
                                      d.call.returnValues?.destinationChain
                                    )))
                                  ? 'Executed'
                                  : d.simplified_status}
                              </Tag>
                              {d.simplified_status === 'received' && (
                                <ExplorerLink
                                  value={receivedTransactionHash}
                                  chain={d.call.returnValues?.destinationChain}
                                />
                              )}
                            </div>
                          )}
                          {d.is_insufficient_fee &&
                            ((!isAxelar(d.call.chain) &&
                              !isAxelar(
                                d.call.returnValues?.destinationChain
                              )) ||
                              timeDiff(d.call.created_at?.ms) > 300) && (
                              <div className="flex items-center gap-x-1 text-red-600 dark:text-red-500">
                                <PiWarningCircle size={16} />
                                <span className="text-xs">
                                  Insufficient Fee
                                </span>
                              </div>
                            )}
                          {d.is_invalid_gas_paid && (
                            <div className="flex items-center gap-x-1 text-red-600 dark:text-red-500">
                              <PiWarningCircle size={16} />
                              <span className="text-xs">Invalid Gas Paid</span>
                            </div>
                          )}
                          {d.time_spent?.call_express_executed > 0 &&
                            ['express_executed', 'executed'].includes(
                              d.status
                            ) && (
                              <div className="flex items-center gap-x-1 text-green-600 dark:text-green-500">
                                <RiTimerFlashLine size={16} />
                                <TimeSpent
                                  fromTimestamp={0}
                                  toTimestamp={
                                    d.time_spent.call_express_executed * 1000
                                  }
                                  className="text-xs"
                                />
                              </div>
                            )}
                          {d.time_spent?.total > 0 &&
                            d.status === 'executed' && (
                              <div className="flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500">
                                <MdOutlineTimer size={16} />
                                <TimeSpent
                                  fromTimestamp={0}
                                  toTimestamp={d.time_spent.total * 1000}
                                  className="text-xs"
                                />
                              </div>
                            )}
                          {isAxelar(d.call.returnValues?.destinationChain) && (
                            <div className="flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500">
                              <HiOutlineArrowRightEndOnRectangle size={16} />
                              <span className="text-xs">1st hop</span>
                            </div>
                          )}
                          {isAxelar(d.call.chain) && (
                            <div className="flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500">
                              <HiOutlineArrowRightStartOnRectangle size={16} />
                              <span className="text-xs">2nd hop</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
                        <TimeAgo timestamp={d.call.block_timestamp * 1000} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > size && (
            <div className="mt-8 flex items-center justify-center">
              <Pagination sizePerPage={size} total={total} />
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
