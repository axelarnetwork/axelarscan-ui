'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Combobox, Dialog, Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import _ from 'lodash';
import {
  MdOutlineRefresh,
  MdOutlineFilterList,
  MdClose,
  MdCheck,
} from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { Pagination, TablePagination } from '@/components/Pagination';
import { useGlobalStore } from '@/components/Global';
import { searchTransactions, getTransactions } from '@/lib/api/validator';
import { searchDepositAddresses } from '@/lib/api/token-transfer';
import { getAttributeValue, getMsgIndexFromEvent, getEventByType } from '@/lib/chain/cosmos';
import {
  axelarContracts,
  getAxelarContractAddresses,
  getChainData,
  getAssetData,
} from '@/lib/config';
import {
  getIcapAddress,
  getInputType,
  toJson,
  toHex,
  split,
  toArray,
} from '@/lib/parser';
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
  camel,
  removeDoubleQuote,
  toBoolean,
  lastString,
  find,
  includesSomePatterns,
  ellipse,
  filterSearchInput,
} from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';

const size = 25;
const sizePerPage = 10;

function Filters({ address }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState(getParams(searchParams, size));
  const [searchInput, setSearchInput] = useState({});
  const [types, setTypes] = useState([]);
  const { handleSubmit } = useForm();

  useEffect(() => {
    if (params) {
      setSearchInput({});
    }
  }, [params, setSearchInput]);

  useEffect(() => {
    const getTypes = async () => {
      const response = await searchTransactions({
        aggs: { types: { terms: { field: 'types.keyword', size: 1000 } } },
        size: 0,
      });
      setTypes(toArray(response).map(d => d.key));
    };

    getTypes();
  }, []);

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
    {
      label: 'Type',
      name: 'type',
      type: 'select',
      options: _.concat(
        { title: 'Any' },
        _.orderBy(
          types.map(d => ({ value: d, title: d })),
          ['title'],
          ['asc']
        )
      ),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: _.concat(
        { title: 'Any' },
        ['success', 'failed'].map(d => ({ value: d, title: capitalize(d) }))
      ),
    },
    !address && { label: 'Address', name: 'address' },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
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

export const getType = data => {
  if (!data) return;

  let { types, type } = { ...data };
  const { messages } = { ...data.tx?.body };

  if (Array.isArray(types)) {
    if (types[0]) {
      type = types[0];
    }
  } else {
    types = _.uniq(
      toArray(
        _.concat(
          toArray(messages).map(d =>
            camel(isString(d.msg) ? d.msg : Object.keys({ ...d.msg })[0])
          ),
          toArray(messages).map(d => d.inner_message?.['@type']),
          toArray(data.events)
            .filter(e => equalsIgnoreCase(e.type, 'message'))
            .map(e => getAttributeValue(e.attributes, 'action')),
          toArray(messages).map(m => m['@type'])
        ).map(d => capitalize(lastString(d, '.')))
      )
    );

    type = types.filter(d => !types.includes(`${d}Request`))[0];
  }

  return type?.replace('Request', '');
};

export const getActivities = (data, assets) => {
  const { messages } = { ...data?.tx?.body };
  if (!messages) return;

  let result;

  // Direct send / IBC / client / acknowledgement related messages
  if (
    includesSomePatterns(
      messages.map(d => d['@type']),
      [
        'MsgSend',
        'MsgTransfer',
        'RetryIBCTransferRequest',
        'RouteIBCTransfersRequest',
        'MsgUpdateClient',
        'MsgAcknowledgement',
        'SignCommands',
      ]
    )
  ) {
    result = toArray(
      messages.flatMap((d, i) => {
        let { sender, recipient, amount, source_channel, destination_channel } =
          { ...d };

        sender = d.from_address || d.signer || sender;
        recipient = d.to_address || d.receiver || recipient;

        if (!amount) {
          amount = [d.token];
        }

        // Scope send_packet event to this message via msg_index
        const msgEvents = toArray(data.events).filter(
          e => getMsgIndexFromEvent(e) === i
        );
        const { attributes } = {
          ...getEventByType(msgEvents, 'send_packet'),
        };

        if (attributes) {
          if (!source_channel) {
            source_channel = getAttributeValue(
              attributes,
              'packet_src_channel'
            );
          }

          if (!destination_channel) {
            destination_channel = getAttributeValue(
              attributes,
              'packet_dst_channel'
            );
          }
        }

        const assetData = getAssetData(data.denom, assets);

        const activity = {
          type: lastString(d['@type'], '.'),
          sender,
          recipient,
          signer: d.signer,
          chain: d.chain,
          asset_data: assetData,
          symbol: assetData?.symbol,
          send_packet_data: attributes
            ? Object.fromEntries(attributes.map(a => [a.key, a.value]))
            : undefined,
          packet: d.packet,
          acknowledgement: d.acknowledgement,
          source_channel,
          destination_channel,
          timeout_timestamp: formatUnits(d.timeout_timestamp, 6),
        };

        return (
          amount?.length > 0 &&
          (Array.isArray(amount) && toArray(amount).length > 0
            ? toArray(amount).map(x => ({
                ...x,
                ...activity,
                amount: formatUnits(x.amount, assetData?.decimals || 6),
              }))
            : {
                ...activity,
                amount: formatUnits(amount, assetData?.decimals || 6),
              })
        );
      })
    );
  }
  // Confirm* / Vote-related messages
  else if (
    includesSomePatterns(
      messages.flatMap(d => toArray([d['@type'], d.inner_message?.['@type']])),
      [
        'ConfirmDeposit',
        'ConfirmTokenRequest',
        'ConfirmGatewayTx',
        'ConfirmTransferKey',
        'VoteRequest',
      ]
    )
  ) {
    result = toArray(
      messages.flatMap(d => {
        let { chain, asset, tx_id, status } = { ...d };
        const { poll_id, vote } = { ...d.inner_message };

        chain = vote?.chain || chain;
        asset = asset?.name || asset;
        tx_id = toHex(vote?.events?.[0]?.tx_id || tx_id);
        status = vote?.events?.[0]?.status || status;

        return (
          d.sender && {
            type: lastString(d['@type'], '.'),
            sender: d.sender,
            chain,
            deposit_address: d.deposit_address,
            burner_address: d.burner_address,
            tx_id,
            asset,
            denom: d.denom,
            asset_data: getAssetData(d.denom || asset, assets),
            status,
            poll_id,
            events: toArray(vote?.events).flatMap(e =>
              Object.entries(e)
                .filter(
                  ([, v]) => v && typeof v === 'object' && !Array.isArray(v)
                )
                .map(([k, v]) => ({
                  event: k,
                  ...Object.fromEntries(
                    Object.entries(v).map(([k2, v2]) => [k2, toHex(v2)])
                  ),
                }))
            ),
          }
        );
      })
    );
  }

  if (toArray(result).length < 1) {
    result = toArray(data.events).flatMap(e => {
      if (find(e.type, ['delegate', 'unbond', 'transfer'])) {
        const out = [];
        const template = { type: e.type, action: e.type };
        let _e = _.cloneDeep(template);

        toArray(e.attributes).forEach(a => {
          const { key, value } = { ...a };
          _e[key] = value;

          switch (key) {
            case 'amount': {
              const index =
                split(value, { delimiter: '' }).findIndex(
                  c => !isNumber(c)
                ) || -1;
              if (index > -1) {
                const denom = value.substring(index);
                const assetData = getAssetData(denom, assets);
                _e.denom = assetData?.denom || denom;
                _e.symbol = assetData?.symbol;
                _e[key] = formatUnits(
                  value.replace(denom, ''),
                  assetData?.decimals || 6
                );
              }
              break;
            }
            case 'validator':
              _e.recipient = value;
              break;
            default:
              break;
          }

          if (
            key ===
            (e.attributes.findIndex(a => a.key === 'denom') > -1
              ? 'denom'
              : 'amount')
          ) {
            const { delegator_address } = {
              ...messages.find(x => x.delegator_address),
            };

            switch (e.type.toLowerCase()) {
              case 'delegate':
                _e.sender = _e.sender || delegator_address;
                break;
              case 'unbond':
                _e.recipient = _e.recipient || delegator_address;
                break;
              default:
                break;
            }

            out.push(_e);
            _e = _.cloneDeep(template);
          }
        });

        return out;
      }

      const event = {
        type: e.type,
        ..._.assign.apply(
          _,
          toArray(e.attributes).map(({ key, value }) => {
            const attribute = {};

            switch (key) {
              case 'amount': {
                const i =
                  split(value, { delimiter: '' }).findIndex(
                    c => !isNumber(c)
                  ) || -1;

                if (i > -1) {
                  const denom = value.substring(i);
                  const assetData = getAssetData(denom, assets);

                  attribute.denom = assetData?.denom || denom;
                  attribute.symbol = assetData?.symbol;
                  attribute[key] = formatUnits(
                    value.replace(denom, ''),
                    assetData?.decimals || 6
                  );
                }
                break;
              }
              case 'action':
                attribute[key] = lastString(value, '.');
                break;
              default:
                attribute[key] = removeDoubleQuote(value);
                break;
            }

            let { symbol, amount } = { ...attribute };

            if (
              key === 'amount' &&
              isString(value) &&
              (data.denom || data.asset)
            ) {
              symbol =
                getAssetData(data.denom || data.asset, assets)?.symbol ||
                symbol;
            }

            if (!symbol) {
              const denom = getAttributeValue(e.attributes, 'denom');
              const amountData = getAttributeValue(e.attributes, 'amount');

              if (denom) {
                const assetData = getAssetData(denom, assets);

                attribute.denom = assetData?.denom || denom;

                if (assetData?.symbol) {
                  symbol = assetData.symbol;
                }

                amount = formatUnits(amountData, assetData?.decimals || 6);
              } else {
                const i =
                  split(amountData, { delimiter: '' }).findIndex(
                    c => !isNumber(c)
                  ) || -1;

                if (i > -1) {
                  const denom = amountData.substring(i);
                  const assetData = getAssetData(denom, assets);

                  attribute.denom = assetData?.denom || denom;

                  if (assetData?.symbol) {
                    symbol = assetData.symbol;
                  }

                  amount = formatUnits(
                    amountData.replace(denom, ''),
                    assetData?.decimals || 6
                  );
                }
              }

              attribute.symbol = symbol;
              attribute.amount = amount;
            }

            return attribute;
          })
        ),
      };

      return [
        {
          ...event,
          action: event.action || e.type,
          recipient : _.uniq(
            toArray(e.attributes)
              .filter(a => a.key === 'recipient')
              .map(a => a.value)
          ),
        },
      ];
    });

    const delegateEventTypes = ['delegate', 'unbond'];
    const transferEventTypes = ['transfer'];

    const resultTypes = toArray(result).map(e => e.type);

    if (includesSomePatterns(resultTypes, delegateEventTypes)) {
      result = toArray(result).filter(e => delegateEventTypes.includes(e.type));
    } else if (includesSomePatterns(resultTypes, transferEventTypes)) {
      result = toArray(result).filter(e => transferEventTypes.includes(e.type));
    } else {
      result = _.assign.apply(_, toArray(result));
    }
  }

  if (toArray(result).length < 1 && data.code) {
    return [{ failed: true }];
  }

  return toArray(result).map(d => {
    let { packet_data, symbol } = { ...d };

    if (isString(packet_data)) {
      try {
        packet_data = toJson(packet_data);

        const assetData = getAssetData(packet_data.denom, assets);

        packet_data = {
          ...packet_data,
          amount: formatUnits(packet_data.amount, assetData.decimals),
        };

        if (assetData?.symbol) {
          symbol = assetData.symbol;
        }
      } catch (error) {}
    } else if (d.asset) {
      symbol = getAssetData(d.asset, assets)?.symbol || symbol;
    }

    return { ...d, packet_data, symbol };
  });
};

export const getSender = (data, assets) => {
  if (!data) return;

  const { messages } = { ...data.tx?.body };

  return toArray(
    toArray([
      equalsIgnoreCase(getType(data), 'MsgDelegate') && 'delegator_address',
      equalsIgnoreCase(getType(data), 'MsgUndelegate') && 'validator_address',
      'sender',
      'signer',
    ]).map(
      f =>
        toArray(messages).map(d => d[f])[0] ||
        data[`tx.body.messages.${f}`]?.[0] ||
        toArray(getActivities(data, assets)).find(d => d[f])?.[f]
    )
  )[0];
};

export const getRecipient = (data, assets) => {
  if (!data) return;

  const { messages } = { ...data.tx?.body };

  return toArray(
    toArray([
      equalsIgnoreCase(getType(data), 'MsgDelegate') && 'validator_address',
      equalsIgnoreCase(getType(data), 'MsgUndelegate') && 'delegator_address',
      'recipient',
    ]).map(
      f =>
        toArray(messages).map(d => d[f])[0] ||
        data[`tx.body.messages.${f}`]?.[0] ||
        toArray(getActivities(data, assets)).find(d => d[f])?.[f]
    )
  )[0];
};

export function Transactions({ height, address }) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [page, setPage] = useState(1);
  const { chains, assets } = useGlobalStore();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh) && chains && assets) {
        const addressType = getInputType(address, chains);

        let data;
        let total;

        if (height) {
          // query block's transactions via lcd
          const response = await getTransactions({
            events: `tx.height=${height}`,
          });

          if (response) {
            data = response.data;
            total = response.total;
          }
        } else if (
          (address?.length >= 65 || addressType === 'evmAddress') &&
          !find(
            address,
            _.concat(axelarContracts, getAxelarContractAddresses(chains))
          )
        ) {
          const { deposit_address } = {
            ...(await searchDepositAddresses({ address }))?.data?.[0],
          };

          if (deposit_address || addressType === 'evmAddress') {
            let qAddress = equalsIgnoreCase(address, deposit_address)
              ? deposit_address
              : address;

            // query address's transactions via lcd
            let response;

            switch (addressType) {
              case 'axelarAddress':
                // query message.sender
                response = await getTransactions({
                  events: `message.sender='${qAddress}'`,
                });

                if (response) {
                  data = response.data;
                }

                // query transfer.recipient
                response = await getTransactions({
                  events: `transfer.recipient='${qAddress}'`,
                });

                if (response) {
                  data = _.concat(toArray(response.data), toArray(data));
                }
                break;
              case 'evmAddress':
                qAddress = getIcapAddress(qAddress);

                // query transactions from indexer
                response = await searchTransactions({
                  ...params,
                  address: qAddress,
                  size,
                });

                if (response) {
                  data = response.data;
                }
                break;
              default:
                break;
            }

            // query link.depositAddress
            response = await getTransactions({
              events: `link.depositAddress='${qAddress}'`,
            });

            if (response) {
              data = _.concat(toArray(response.data), toArray(data));
            }

            total = data.length;
          } else {
            // query transactions from indexer
            const response = await searchTransactions({
              ...params,
              address,
              size,
            });

            if (response) {
              data = response.data;
              total = response.total;
            }
          }
        } else {
          // query transactions from indexer
          const response = await searchTransactions({
            ...params,
            address: params.address || address,
            size,
          });

          if (response) {
            data = response.data;
            total = response.total;
          }
        }

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: {
            data: _.orderBy(
              _.uniqBy(toArray(data), 'txhash').map(d => ({
                ...d,
                type: getType(d),
                sender: getSender(d, assets),
                recipient: getRecipient(d, assets),
              })),
              ['height', 'timestamp', 'txhash'],
              ['desc', 'desc', 'asc']
            ),
            total,
          },
        });
        setRefresh(false);
      }
    };

    getData();
  }, [height, address, params, setSearchResults, refresh, setRefresh, chains, assets, searchResults]);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params)] };

  return (
    <Container
      className={clsx(
        height ? 'mx-0 mt-5 pt-0.5' : address ? 'max-w-full' : 'sm:mt-8'
      )}
    >
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className="flex items-center justify-between gap-x-4">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
                Transactions
              </h1>
              {!height && (
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                  <Number
                    value={total}
                    suffix={` result${total > 1 ? 's' : ''}`}
                  />
                </p>
              )}
            </div>
            <div className="flex items-center gap-x-2">
              {!height && <Filters address={address} />}
              {refresh ? (
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
          {refresh && <Overlay />}
          <div
            className={clsx(
              '-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible',
              height || address ? 'mt-0' : 'mt-4'
            )}
          >
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left sm:pl-0"
                  >
                    Tx Hash
                  </th>
                  {!height && (
                    <th scope="col" className="px-3 py-3.5 text-left">
                      Height
                    </th>
                  )}
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Sender
                  </th>
                  {!!address && (
                    <th scope="col" className="px-3 py-3.5 text-left">
                      Recipient
                    </th>
                  )}
                  {!(height || address) && (
                    <th scope="col" className="px-3 py-3.5 text-right">
                      Fee
                    </th>
                  )}
                  <th
                    scope="col"
                    className="py-3.5 pl-3 pr-4 text-right sm:pr-0"
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {(height
                  ? data.filter(
                      (d, i) =>
                        i >= (page - 1) * sizePerPage && i < page * sizePerPage
                    )
                  : data
                ).map((d, i) => (
                  <tr
                    key={i}
                    className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                  >
                    <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                      <div className="flex flex-col gap-y-0.5">
                        <Copy value={d.txhash}>
                          <Link
                            href={`/tx/${d.txhash}`}
                            target="_blank"
                            className="font-semibold text-blue-600 dark:text-blue-500"
                          >
                            {ellipse(d.txhash, 6)}
                          </Link>
                        </Copy>
                      </div>
                    </td>
                    {!height && (
                      <td className="px-3 py-4 text-left">
                        {d.height && (
                          <Link
                            href={`/block/${d.height}`}
                            target="_blank"
                            className="font-medium text-blue-600 dark:text-blue-500"
                          >
                            <Number value={d.height} />
                          </Link>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-4 text-left">
                      {d.type && (
                        <Tag className="w-fit bg-zinc-100 capitalize text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                          {d.type}
                        </Tag>
                      )}
                    </td>
                    <td className="px-3 py-4 text-left">
                      <Tag
                        className={clsx(
                          'w-fit capitalize',
                          d.code
                            ? 'bg-red-600 dark:bg-red-500'
                            : 'bg-green-600 dark:bg-green-500'
                        )}
                      >
                        {d.code ? 'Failed' : 'Success'}
                      </Tag>
                    </td>
                    <td className="px-3 py-4 text-left">
                      <Profile i={i} address={d.sender} />
                    </td>
                    {!!address && (
                      <td className="px-3 py-4 text-left">
                        {!includesSomePatterns(d.type, [
                          'HeartBeat',
                          'SubmitSignature',
                          'SubmitPubKey',
                        ]) && (
                          <div className="flex flex-col gap-y-0.5">
                            {toArray(d.recipient).map((a, j) => (
                              <Profile key={j} i={j} address={a} />
                            ))}
                          </div>
                        )}
                      </td>
                    )}
                    {!(height || address) && (
                      <td className="px-3 py-4 text-right">
                        {d.tx?.auth_info?.fee?.amount && (
                          <Number
                            value={formatUnits(
                              d.tx?.auth_info.fee.amount?.[0]?.amount,
                              6
                            )}
                            format="0,0.00000000"
                            suffix={` ${getChainData('axelarnet', chains)?.native_token?.symbol}`}
                            noTooltip={true}
                            className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                          />
                        )}
                      </td>
                    )}
                    <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
                      <TimeAgo timestamp={d.timestamp} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > (height ? sizePerPage : size) && (
            <div className="mt-8 flex items-center justify-center">
              {height ? (
                <TablePagination
                  data={data}
                  value={page}
                  onChange={page => setPage(page)}
                  sizePerPage={sizePerPage}
                />
              ) : (
                <Pagination sizePerPage={size} total={total} />
              )}
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
