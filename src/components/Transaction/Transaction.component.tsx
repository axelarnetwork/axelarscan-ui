'use client';

import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MdArrowForwardIos } from 'react-icons/md';
// @ts-expect-error — no type declarations available
import Linkify from 'react-linkify';

import { Container } from '@/components/Container';
import { Copy } from '@/components/Copy';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { Image } from '@/components/Image';
import { JSONView } from '@/components/JSONView';
import { Number } from '@/components/Number';
import { ChainProfile, Profile } from '@/components/Profile';
import { Response } from '@/components/Response';
import { Spinner } from '@/components/Spinner';
import { Switch } from '@/components/Switch';
import { Tag } from '@/components/Tag';
import { getActivities, getSender, getType } from '@/components/Transactions';
import { getTransaction } from '@/lib/api/validator';
import { getAssetData, getChainData } from '@/lib/config';
import { formatUnits, isNumber } from '@/lib/number';
import { safeBase64ToString, toArray, toHex, toJson } from '@/lib/parser';
import {
  ellipse,
  find,
  includesSomePatterns,
  isString,
  toTitle,
} from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';
import type { Chain } from '@/types';
import * as styles from './Transaction.styles';

interface TransactionData extends Record<string, unknown> {
  height?: number;
  type?: string;
  code?: number;
  sender?: string;
  timestamp?: string | number;
  gas_used?: number;
  gas_wanted?: number;
  raw_log?: string;
  tx?: {
    auth_info?: { fee?: { amount?: { amount?: string; denom?: string }[] } };
    body?: { messages?: Record<string, unknown>[]; memo?: string };
  };
  status?: string;
  message?: string;
}

interface InfoProps {
  data: TransactionData;
  tx: string;
}

function Info({ data, tx }: InfoProps) {
  const chains = useChains();

  const { height, type, code, sender, timestamp, gas_used, gas_wanted } = {
    ...data,
  };
  const { fee } = { ...data.tx?.auth_info } as { fee?: { amount?: { amount?: string; denom?: string }[] } };
  const { memo } = { ...data.tx?.body } as { memo?: string };

  return (
    <div className={styles.infoCard}>
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>
          <Copy value={tx}>{ellipse(tx, 16)}</Copy>
        </h3>
      </div>
      <div className={styles.infoBorder}>
        <dl className={styles.infoDivider}>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>
              Height
            </dt>
            <dd className={styles.infoValue}>
              <Link
                href={`/block/${height}`}
                target="_blank"
                className={styles.blockLink}
              >
                <Number value={height} />
              </Link>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>
              Type
            </dt>
            <dd className={styles.infoValue}>
              {type && (
                <Tag className={styles.typeTag}>
                  {type}
                </Tag>
              )}
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>
              Status
            </dt>
            <dd className={styles.infoValue}>
              <Tag
                className={clsx(
                  code ? styles.statusTagFailed : styles.statusTagSuccess
                )}
              >
                {code ? 'Failed' : 'Success'}
              </Tag>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>
              Sender
            </dt>
            <dd className={styles.infoValue}>
              <Profile address={sender} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>
              Created
            </dt>
            <dd className={styles.infoValue}>
              {moment(timestamp).format(TIME_FORMAT)}
            </dd>
          </div>
          {fee && (
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>
                Fee
              </dt>
              <dd className={styles.infoValue}>
                <Number
                  value={formatUnits(fee.amount?.[0]?.amount, 6)}
                  format="0,0.00000000"
                  suffix={` ${(getChainData('axelarnet', chains)?.native_token as Record<string, unknown> | undefined)?.symbol}`}
                  noTooltip={true}
                  className={styles.feeNumber}
                />
              </dd>
            </div>
          )}
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>
              Gas Used
            </dt>
            <dd className={styles.infoValue}>
              <Number
                value={gas_used}
                format="0,0"
                className={styles.gasNumber}
              />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>
              Gas Limit
            </dt>
            <dd className={styles.infoValue}>
              <Number
                value={gas_wanted}
                format="0,0"
                className={styles.gasNumber}
              />
            </dd>
          </div>
          {memo && (
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>
                Memo
              </dt>
              <dd className={styles.infoValue}>
                <div className={styles.memoWrapper}>
                  <Linkify>{memo}</Linkify>
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

const FORMATTABLE_TYPES = [
  'MsgSend',
  'ConfirmDeposit',
  'ConfirmERC20Deposit',
  'ConfirmERC20TokenDeployment',
  'ConfirmGatewayTx',
  'ConfirmTransferKey',
  'Vote',
  'MsgTransfer',
  'RetryIBCTransfer',
  'RouteIBCTransfers',
  'MsgUpdateClient',
  'MsgAcknowledgement',
  'MsgDelegate',
  'MsgUndelegate',
  'CreatePendingTransfers',
  'ExecutePendingTransfers',
  'SignCommands',
];

const renderEntries = (entries: [string, unknown][]) =>
  (toArray(entries) as [string, unknown][]).map(([k, v]: [string, unknown], i: number) => (
    <div key={i} className={styles.entryRow}>
      <span className={styles.entryKey}>{k}</span>
      <div className={styles.entryValueWrapper}>
        <Tag className={styles.entryValueTag}>
          {isString(v) ? (
            ellipse(v, 256)
          ) : v && typeof v === 'object' ? (
            <JSONView value={v} />
          ) : (
            v?.toString()
          )}
        </Tag>
        <Copy
          size={16}
          value={typeof v === 'object' ? JSON.stringify(v) : v}
          className="mt-2"
        />
      </div>
    </div>
  ));

interface DataProps {
  data: TransactionData;
}

function Data({ data }: DataProps) {
  const [formattable, setFormattable] = useState<boolean | null>(null);
  const [formatted, setFormatted] = useState(true);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  useEffect(() => {
    if (data) {
      setFormattable(
        FORMATTABLE_TYPES.includes(getType(data) ?? '') &&
          (getActivities(data, null)?.length ?? 0) > 0 &&
          !!toJson(data.raw_log)
      );
    }
  }, [data]);

  useEffect(() => {
    if (!formattable && typeof formattable === 'boolean') {
      setFormatted(false);
    }
  }, [formattable]);

  const activities = getActivities(data, assets) ?? [];

  return (
    <div className={styles.dataWrapper}>
      {formattable && (
        <div className={styles.switchRow}>
          <Switch
            value={formatted}
            onChange={(v: boolean) => setFormatted(v)}
            title="Formatted"
          />
        </div>
      )}
      {!formatted ? (
        <JSONView
          value={data}
          className={styles.jsonViewPanel}
        />
      ) : (
        <div className={styles.formattedWrapper}>
          <div className={styles.sectionWrapper}>
            <span className={styles.sectionTitle}>Activities</span>
            <div className={styles.sectionPanel}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {activities.map((d: Record<string, any>, i: number) => {
                const { addresses } = { ...d.asset_data };
                let { image } = { ...d.asset_data };

                let {
                  deposit_address,
                  burner_address,
                  tx_id,
                  deposit_address_chain,
                  symbol,
                } = { ...d };

                deposit_address = toHex(deposit_address);
                burner_address = toHex(burner_address);
                tx_id = toHex(tx_id);

                if (!deposit_address_chain && chains) {
                  deposit_address_chain =
                    isString(deposit_address) &&
                    chains.find((c: Chain) =>
                      deposit_address.startsWith(c.prefix_address ?? '')
                    )?.id;
                }

                // chain data
                const chainData = getChainData(d.chain, chains);
                const { url, transaction_path } = { ...chainData?.explorer };

                // asset data
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const tokenData: any = chainData ? addresses?.[chainData.id] : undefined;

                symbol = tokenData?.symbol || d.asset_data?.symbol || symbol;
                image = tokenData?.image || image;

                if (toJson(symbol)) {
                  const { denom } = { ...(toJson(symbol) as Record<string, string>) };
                  const assetData = getAssetData(denom, assets);

                  if (assetData) {
                    symbol = assetData.symbol;
                    image = assetData.image;
                  }
                }

                const isValidator = (address: string) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  toArray(validators).findIndex((v: any) =>
                    includesSomePatterns(address, [
                      v.operator_address,
                      v.broadcaster_address,
                    ])
                  ) > -1;

                const txElement = (
                  <span className={styles.txElement}>
                    {ellipse(tx_id, 8)}
                  </span>
                );

                return (
                  <div key={i} className={styles.activityItem}>
                    <div className={styles.activityRow}>
                      {d.sender && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            {isValidator(d.sender) ? 'Validator' : 'Sender'}
                          </div>
                          <Profile
                            address={d.sender}
                            width={20}
                            height={20}
                            className={styles.profileText}
                          />
                        </div>
                      )}
                      <div className={styles.channelRow}>
                        {d.source_channel && d.destination_channel && (
                          <div className={styles.channelLabels}>
                            <span>{d.source_channel}</span>
                            <MdArrowForwardIos size={12} />
                            <span>{d.destination_channel}</span>
                          </div>
                        )}
                        <Tag className={styles.activityTypeTag}>
                          {toTitle(
                            activities.length > 1 ? d.type : data.type,
                            ' '
                          )}
                        </Tag>
                        {d.status && (
                          <Tag
                            className={clsx(
                              d.status === 'STATUS_COMPLETED'
                                ? styles.activityStatusCompleted
                                : styles.activityStatusDefault
                            )}
                          >
                            {d.status.replace('STATUS_', '')}
                          </Tag>
                        )}
                        {(isNumber(d.amount) || symbol) && (
                          <div className={styles.assetRow}>
                            <Image src={image} alt="" width={20} height={20} />
                            {d.amount > 0 && (
                              <Number
                                value={d.amount}
                                format="0,0.000000"
                                className={styles.amountText}
                              />
                            )}
                            {symbol && (
                              <span className={styles.symbolText}>
                                {symbol}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {d.recipient && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            {isValidator(d.recipient)
                              ? 'Validator'
                              : 'Recipient'}
                          </div>
                          <Profile
                            address={d.recipient}
                            width={20}
                            height={20}
                            className={styles.profileText}
                          />
                        </div>
                      )}
                      {d.chain && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            Chain
                          </div>
                          <ChainProfile
                            value={d.chain}
                            width={20}
                            height={20}
                            className={styles.chainProfileWrapper}
                          />
                        </div>
                      )}
                      {deposit_address && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            Deposit address
                          </div>
                          <Profile
                            address={deposit_address}
                            chain={deposit_address_chain}
                            prefix={
                              getChainData(deposit_address_chain, chains)
                                ?.prefix_address
                            }
                            width={20}
                            height={20}
                            className={styles.profileText}
                          />
                        </div>
                      )}
                      {burner_address && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            Burner address
                          </div>
                          <Profile
                            address={burner_address}
                            chain={d.chain}
                            prefix={chainData?.prefix_address}
                            width={20}
                            height={20}
                            className={styles.profileText}
                          />
                        </div>
                      )}
                      {tx_id && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            Transaction
                          </div>
                          <Copy size={16} value={tx_id}>
                            {url ? (
                              <Link
                                href={`${url}${transaction_path?.replace('{tx}', tx_id)}`}
                                target="_blank"
                                className={styles.txLinkText}
                              >
                                {txElement}
                              </Link>
                            ) : (
                              txElement
                            )}
                          </Copy>
                        </div>
                      )}
                      {d.poll_id && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            Poll ID
                          </div>
                          <Copy size={16} value={d.poll_id}>
                            <span className={styles.pollIdText}>
                              {d.poll_id}
                            </span>
                          </Copy>
                        </div>
                      )}
                      {d.acknowledgement && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            Acknowledgement
                          </div>
                          <span className={styles.acknowledgementText}>
                            {safeBase64ToString(d.acknowledgement) as string}
                          </span>
                        </div>
                      )}
                      {d.timeout_timestamp > 0 && (
                        <div className={styles.activityFieldWrapper}>
                          <div className={styles.activityFieldLabel}>
                            Timeout
                          </div>
                          <span className={styles.timeoutText}>
                            {moment(d.timeout_timestamp).format(TIME_FORMAT)}
                          </span>
                        </div>
                      )}
                    </div>
                    {toArray(d.events).length > 0 && (
                      <div className={styles.eventsWrapper}>
                        <span className={styles.eventsTitle}>
                          Vote Events
                        </span>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {d.events.map((e: Record<string, any>, j: number) => (
                          <div
                            key={j}
                            className={styles.eventCard}
                          >
                            {e.event && (
                              <Tag className={styles.eventTag}>
                                {toTitle(e.event, '_', true, true)}
                              </Tag>
                            )}
                            {renderEntries(
                              Object.entries(e).filter(
                                ([k, _v]: [string, unknown]) => !find(k, ['event'])
                              ) as [string, unknown][]
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {d.packet && (
                      <div className={styles.eventCard}>
                        <Tag className={styles.eventTag}>Packet</Tag>
                        {renderEntries(Object.entries(d.packet as Record<string, unknown>) as [string, unknown][])}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.sectionWrapper}>
            <span className={styles.sectionTitle}>Events</span>
            <div className={styles.sectionPanel}>
              {!Array.isArray(toJson(data.raw_log))
                ? data.raw_log
                : /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  (toJson(data.raw_log) as Record<string, any>[]).map((d: Record<string, any>, i: number) => (
                    <div key={i} className={styles.activityItem}>
                      {d.log && (
                        <span className={styles.eventLogText}>
                          {d.log}
                        </span>
                      )}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {_.reverse(_.cloneDeep(toArray(d.events) as any[]))
                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                        .map((e: Record<string, any>) => ({
                          ...e,
                          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                          attributes: toArray(e.attributes).map((a: any) => [
                            a.key,
                            a.value,
                          ]),
                        }))
                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                        .map((e: any, j: number) => (
                          <div
                            key={j}
                            className={styles.eventCard}
                          >
                            {e.type && (
                              <Tag className={styles.eventTag}>
                                {toTitle(e.type, '_', true, true)}
                              </Tag>
                            )}
                            {renderEntries(
                              e.attributes
                                .filter(([_k, v]: [string, unknown]) => typeof v !== 'undefined')
                                .map(([k, v]: [string, unknown]) => {
                                  let processed = v;
                                  // byteArray to hex
                                  if (
                                    (Array.isArray(processed) ||
                                      (isString(processed) &&
                                        (processed as string).startsWith('[') &&
                                        (processed as string).endsWith(']'))) &&
                                    [
                                      'gateway_address',
                                      'deposit_address',
                                      'token_address',
                                      'tx_id',
                                    ].includes(k)
                                  ) {
                                    processed = toHex(JSON.parse(processed as string));
                                  }

                                  return [k, processed] as [string, unknown];
                                })
                            )}
                          </div>
                        ))}
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TransactionProps {
  tx: string;
}

export function Transaction({ tx }: TransactionProps) {
  const [data, setData] = useState<TransactionData | null>(null);
  const assets = useAssets();

  useEffect(() => {
    const getData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { tx_response } = { ...(await getTransaction(tx)) as any };

      let responseData = tx_response;

      if (responseData) {
        responseData = {
          ...responseData,
          type: getType(responseData),
          sender: getSender(responseData, assets),
        };

        console.log('[data]', responseData);
        setData(responseData);
      } else {
        setData({
          status: 'errorOnGetData',
          code: 404,
          message: `Transaction: ${tx} not found`,
        });
      }
    };

    getData();
  }, [tx, assets]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : data.status === 'errorOnGetData' ? (
        <Response data={data} />
      ) : (
        <div className={styles.transactionContent}>
          <Info data={data} tx={tx} />
          <Data data={data} />
        </div>
      )}
    </Container>
  );
}
