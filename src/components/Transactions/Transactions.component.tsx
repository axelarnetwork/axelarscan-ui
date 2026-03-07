/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { Pagination, TablePagination } from '@/components/Pagination';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchTransactions, getTransactions } from '@/lib/api/validator';
import { searchDepositAddresses } from '@/lib/api/token-transfer';
import {
  getAttributeValue,
  getMsgIndexFromEvent,
  getEventByType,
  normalizeEvents,
} from '@/lib/chain/cosmos';
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
  generateKeyByParams,
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
} from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';

import type { TransactionsProps, SearchResults } from './Transactions.types';
import { PAGE_SIZE, SIZE_PER_PAGE } from './Transactions.types';
import { Filters } from './Filters.component';
import * as styles from './Transactions.styles';

// ─── Exported utility functions ─────────────────────────────────

export const getType = (data: any) => {
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
          toArray(messages).map((d: any) =>
            camel(isString(d.msg) ? d.msg : Object.keys({ ...d.msg })[0])
          ),
          toArray(messages).map((d: any) => d.inner_message?.['@type']),
          normalizeEvents(data)
            .filter((e: any) => equalsIgnoreCase(e.type, 'message'))
            .map((e: any) => getAttributeValue(e.attributes, 'action')),
          toArray(messages).map((m: any) => m['@type'])
        ).map((d: any) => capitalize(lastString(d, '.')))
      )
    );

    type = types.filter((d: any) => !types.includes(`${d}Request`))[0];
  }

  return type?.replace('Request', '');
};

export const getActivities = (data: any, assets: any) => {
  const { messages } = { ...data?.tx?.body };
  if (!messages) return;

  let result: any;

  // Direct send / IBC / client / acknowledgement related messages
  if (
    includesSomePatterns(
      messages.map((d: any) => d['@type']),
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
    // Normalize events once outside the loop for better performance
    const normalizedEvents = normalizeEvents(data);

    result = toArray(
      messages.flatMap((d: any, i: number) => {
        let { sender, recipient, amount, source_channel, destination_channel } =
          { ...d };

        sender = d.from_address || d.signer || sender;
        recipient = d.to_address || d.receiver || recipient;

        if (!amount) {
          amount = [d.token];
        }

        // Scope send_packet event to this message via msg_index
        const msgEvents = normalizedEvents.filter(
          (e: any) => getMsgIndexFromEvent(e) === i
        );
        const { attributes } = {
          ...(getEventByType(msgEvents, 'send_packet') as any),
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
            ? Object.fromEntries(attributes.map((a: any) => [a.key, a.value]))
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
            ? toArray(amount).map((x: any) => ({
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
      messages.flatMap((d: any) => toArray([d['@type'], d.inner_message?.['@type']])),
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
      messages.flatMap((d: any) => {
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
            events: toArray(vote?.events).flatMap((e: any) =>
              Object.entries(e)
                .filter(
                  ([, v]) => v && typeof v === 'object' && !Array.isArray(v)
                )
                .map(([k, v]: any) => ({
                  event: k,
                  ...Object.fromEntries(
                    Object.entries(v).map(([k2, v2]: any) => [k2, toHex(v2)])
                  ),
                }))
            ),
          }
        );
      })
    );
  }

  if (toArray(result).length < 1) {
    result = normalizeEvents(data).flatMap((e: any) => {
      if (find(e.type, ['delegate', 'unbond', 'transfer'])) {
        const out: any[] = [];
        const template = { type: e.type, action: e.type };
        let _e: any = _.cloneDeep(template);

        toArray(e.attributes).forEach((a: any) => {
          const { key, value } = { ...a };
          _e[key] = value;

          switch (key) {
            case 'amount': {
              const index =
                split(value, { delimiter: '' }).findIndex((c: any) => !isNumber(c)) ||
                -1;
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
            (e.attributes.findIndex((a: any) => a.key === 'denom') > -1
              ? 'denom'
              : 'amount')
          ) {
            const { delegator_address } = {
              ...messages.find((x: any) => x.delegator_address),
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

      const event: any = {
        type: e.type,
        ...(_.assign as any).apply(
          _,
          toArray(e.attributes).map(({ key, value }: any) => {
            const attribute: any = {};

            switch (key) {
              case 'amount': {
                const i =
                  split(value, { delimiter: '' }).findIndex(
                    (c: any) => !isNumber(c)
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
              const denom = getAttributeValue(e.attributes, 'denom') as any;
              const amountData = getAttributeValue(e.attributes, 'amount') as any;

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
                    (c: any) => !isNumber(c)
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
            }

            attribute.symbol = symbol;
            attribute.amount = amount;

            return attribute;
          })
        ),
      };

      return [
        {
          ...event,
          action: event.action || e.type,
          recipient: _.uniq(
            toArray(e.attributes)
              .filter((a: any) => a.key === 'recipient')
              .map((a: any) => a.value)
          ),
        },
      ];
    });

    const delegateEventTypes = ['delegate', 'unbond'];
    const transferEventTypes = ['transfer'];

    const resultTypes = toArray(result).map((e: any) => e.type);

    if (includesSomePatterns(resultTypes, delegateEventTypes)) {
      result = toArray(result).filter((e: any) => delegateEventTypes.includes(e.type));
    } else if (includesSomePatterns(resultTypes, transferEventTypes)) {
      result = toArray(result).filter((e: any) => transferEventTypes.includes(e.type));
    } else {
      result = [(_.assign as any).apply(_, toArray(result))];
    }
  }

  if (toArray(result).length < 1 && data.code) {
    return [{ failed: true }];
  }

  return toArray(result).map((d: any) => {
    let { packet_data, symbol } = { ...d };

    if (isString(packet_data)) {
      try {
        packet_data = toJson(packet_data);

        const assetData = getAssetData(packet_data.denom, assets);

        packet_data = {
          ...packet_data,
          amount: formatUnits(packet_data.amount, assetData?.decimals),
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

export const getSender = (data: any, assets: any) => {
  if (!data) return;

  const { messages } = { ...data.tx?.body };

  return toArray(
    toArray([
      equalsIgnoreCase(getType(data), 'MsgDelegate') && 'delegator_address',
      equalsIgnoreCase(getType(data), 'MsgUndelegate') && 'validator_address',
      'sender',
      'signer',
    ]).map(
      (f: any) =>
        toArray(messages).map((d: any) => d[f])[0] ||
        data[`tx.body.messages.${f}`]?.[0] ||
        toArray(getActivities(data, assets)).find((d: any) => d[f])?.[f]
    )
  )[0];
};

export const getRecipient = (data: any, assets: any) => {
  if (!data) return;

  const { messages } = { ...data.tx?.body };

  return toArray(
    toArray([
      equalsIgnoreCase(getType(data), 'MsgDelegate') && 'validator_address',
      equalsIgnoreCase(getType(data), 'MsgUndelegate') && 'delegator_address',
      'recipient',
    ]).map(
      (f: any) =>
        toArray(messages).map((d: any) => d[f])[0] ||
        data[`tx.body.messages.${f}`]?.[0] ||
        toArray(getActivities(data, assets)).find((d: any) => d[f])?.[f]
    )
  )[0];
};

// ─── Main component ─────────────────────────────────────────────

export function Transactions({ height, address }: TransactionsProps) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [refresh, setRefresh] = useState<any>(null);
  const [page, setPage] = useState(1);
  const chains = useChains();
  const assets = useAssets();

  useEffect(() => {
    const _params = getParams(searchParams, PAGE_SIZE);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh) || !chains || !assets) return;

      const addressType = getInputType(address as any, chains);

      let data: any;
      let total: any;

      if (height) {
        const response = await getTransactions({
          events: `tx.height=${height}`,
        }) as any;

        if (response) {
          data = response.data;
          total = response.total;
        }
      } else if (
        ((address as any)?.length >= 65 || addressType === 'evmAddress') &&
        !find(
          address!,
          _.concat(axelarContracts, getAxelarContractAddresses(chains))
        )
      ) {
        const { deposit_address } = {
          ...((await searchDepositAddresses({ address })) as any)?.data?.[0],
        };

        if (deposit_address || addressType === 'evmAddress') {
          let qAddress = equalsIgnoreCase(address, deposit_address)
            ? deposit_address
            : address;

          let response: any;

          switch (addressType) {
            case 'axelarAddress':
              response = await getTransactions({
                events: `message.sender='${qAddress}'`,
              });

              if (response) {
                data = response.data;
              }

              response = await getTransactions({
                events: `transfer.recipient='${qAddress}'`,
              });

              if (response) {
                data = _.concat(toArray(response.data), toArray(data));
              }
              break;
            case 'evmAddress':
              qAddress = getIcapAddress(qAddress);

              response = await searchTransactions({
                ...params,
                address: qAddress,
                size: PAGE_SIZE,
              });

              if (response) {
                data = response.data;
              }
              break;
            default:
              break;
          }

          response = await getTransactions({
            events: `link.depositAddress='${qAddress}'`,
          });

          if (response) {
            data = _.concat(toArray(response.data), toArray(data));
          }

          total = data.length;
        } else {
          const response = await searchTransactions({
            ...params,
            address,
            size: PAGE_SIZE,
          }) as any;

          if (response) {
            data = response.data;
            total = response.total;
          }
        }
      } else {
        const response = await searchTransactions({
          ...params,
          address: params.address || address,
          size: PAGE_SIZE,
        }) as any;

        if (response) {
          data = response.data;
          total = response.total;
        }
      }

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          data: _.orderBy(
            _.uniqBy(toArray(data), 'txhash').map((d: any) => ({
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
    };

    getData();
  }, [
    height,
    address,
    params,
    setSearchResults,
    refresh,
    setRefresh,
    chains,
    assets,
  ]);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params)] };

  if (!data) {
    return (
      <Container
        className={clsx(
          height ? styles.containerHeight : address ? styles.containerAddress : styles.containerDefault
        )}
      >
        <Spinner />
      </Container>
    );
  }

  return (
    <Container
      className={clsx(
        height ? styles.containerHeight : address ? styles.containerAddress : styles.containerDefault
      )}
    >
      <div>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>
              Transactions
            </h1>
            {!height && (
              <p className={styles.headerSubtitle}>
                <Number
                  value={total}
                  suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
                />
              </p>
            )}
          </div>
          <div className={styles.headerActions}>
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
            styles.tableScrollContainer,
            height || address ? styles.tableScrollContainerNoMargin : styles.tableScrollContainerMargin
          )}
        >
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableHeadRow}>
                <th
                  scope="col"
                  className={styles.thFirst}
                >
                  Tx Hash
                </th>
                {!height && (
                  <th scope="col" className={styles.thDefault}>
                    Height
                  </th>
                )}
                <th scope="col" className={styles.thDefault}>
                  Type
                </th>
                <th scope="col" className={styles.thDefault}>
                  Status
                </th>
                <th scope="col" className={styles.thDefault}>
                  Sender
                </th>
                {!!address && (
                  <th scope="col" className={styles.thDefault}>
                    Recipient
                  </th>
                )}
                {!(height || address) && (
                  <th scope="col" className={styles.thRight}>
                    Fee
                  </th>
                )}
                <th
                  scope="col"
                  className={styles.thLast}
                >
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {(height
                ? data.filter(
                    (d: any, i: number) =>
                      i >= (page - 1) * SIZE_PER_PAGE && i < page * SIZE_PER_PAGE
                  )
                : data
              ).map((d: any, i: number) => (
                <tr
                  key={i}
                  className={styles.tableRow}
                >
                  <td className={styles.tdFirst}>
                    <div className={styles.cellFlexCol}>
                      <Copy value={d.txhash}>
                        <Link
                          href={`/tx/${d.txhash}`}
                          target="_blank"
                          className={styles.txHashLink}
                        >
                          {ellipse(d.txhash, 6)}
                        </Link>
                      </Copy>
                    </div>
                  </td>
                  {!height && (
                    <td className={styles.tdDefault}>
                      {d.height && (
                        <Link
                          href={`/block/${d.height}`}
                          target="_blank"
                          className={styles.heightLink}
                        >
                          <Number value={d.height} />
                        </Link>
                      )}
                    </td>
                  )}
                  <td className={styles.tdDefault}>
                    {d.type && (
                      <Tag className={styles.typeTag}>
                        {d.type}
                      </Tag>
                    )}
                  </td>
                  <td className={styles.tdDefault}>
                    <Tag
                      className={clsx(
                        styles.statusTagBase,
                        d.code
                          ? styles.statusFailed
                          : styles.statusSuccess
                      )}
                    >
                      {d.code ? 'Failed' : 'Success'}
                    </Tag>
                  </td>
                  <td className={styles.tdDefault}>
                    <Profile i={i} address={d.sender} />
                  </td>
                  {!!address && (
                    <td className={styles.tdDefault}>
                      {!includesSomePatterns(d.type, [
                        'HeartBeat',
                        'SubmitSignature',
                        'SubmitPubKey',
                      ]) && (
                        <div className={styles.cellFlexCol}>
                          {toArray(d.recipient).map((a: any, j: number) => (
                            <Profile key={j} i={j} address={a} />
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                  {!(height || address) && (
                    <td className={styles.tdRight}>
                      {d.tx?.auth_info?.fee?.amount && (
                        <Number
                          value={formatUnits(
                            d.tx?.auth_info.fee.amount?.[0]?.amount,
                            6
                          )}
                          format="0,0.00000000"
                          suffix={` ${(getChainData('axelarnet', chains)?.native_token as any)?.symbol}`}
                          noTooltip={true}
                          className={styles.feeNumber}
                        />
                      )}
                    </td>
                  )}
                  <td className={styles.tdLast}>
                    <TimeAgo timestamp={d.timestamp} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(total ?? 0) > (height ? SIZE_PER_PAGE : PAGE_SIZE) && (
          <div className={styles.paginationWrapper}>
            {height ? (
              <TablePagination
                data={data}
                value={page}
                onChange={(page: any) => setPage(page)}
                sizePerPage={SIZE_PER_PAGE}
              />
            ) : (
              <Pagination sizePerPage={PAGE_SIZE} total={total ?? 0} />
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
