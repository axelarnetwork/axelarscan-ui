'use client';

import Link from 'next/link';
import moment from 'moment';
import { MdArrowForwardIos } from 'react-icons/md';

import { Copy } from '@/components/Copy';
import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { ChainProfile, Profile } from '@/components/Profile';
import { Tag } from '@/components/Tag';
import { getAssetData, getChainData } from '@/lib/config';
import { isNumber } from '@/lib/number';
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
import type { ActivityItemProps } from './Transaction.types';
import { renderEntries } from './Transaction.utils';
import * as styles from './Transaction.styles';

export function ActivityItem({
  activity: d,
  index: i,
  data,
  activitiesCount,
  chains,
  assets,
  validators,
}: ActivityItemProps) {
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
  const tokenData: any = chainData
    ? addresses?.[chainData.id]
    : undefined;

  symbol = tokenData?.symbol || d.asset_data?.symbol || symbol;
  image = tokenData?.image || image;

  if (toJson(symbol)) {
    const { denom } = {
      ...(toJson(symbol) as Record<string, string>),
    };
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
    <span className={styles.txElement}>{ellipse(tx_id, 8)}</span>
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
              activitiesCount > 1 ? d.type : data.type,
              ' '
            )}
          </Tag>
          {d.status && (
            <Tag
              className={
                d.status === 'STATUS_COMPLETED'
                  ? styles.activityStatusCompleted
                  : styles.activityStatusDefault
              }
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
                <span className={styles.symbolText}>{symbol}</span>
              )}
            </div>
          )}
        </div>
        {d.recipient && (
          <div className={styles.activityFieldWrapper}>
            <div className={styles.activityFieldLabel}>
              {isValidator(d.recipient) ? 'Validator' : 'Recipient'}
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
            <div className={styles.activityFieldLabel}>Chain</div>
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
            <div className={styles.activityFieldLabel}>Transaction</div>
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
            <div className={styles.activityFieldLabel}>Poll ID</div>
            <Copy size={16} value={d.poll_id}>
              <span className={styles.pollIdText}>{d.poll_id}</span>
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
            <div className={styles.activityFieldLabel}>Timeout</div>
            <span className={styles.timeoutText}>
              {moment(d.timeout_timestamp).format(TIME_FORMAT)}
            </span>
          </div>
        )}
      </div>
      {toArray(d.events).length > 0 && (
        <div className={styles.eventsWrapper}>
          <span className={styles.eventsTitle}>Vote Events</span>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {d.events.map((e: Record<string, any>, j: number) => (
            <div key={j} className={styles.eventCard}>
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
          {renderEntries(
            Object.entries(d.packet as Record<string, unknown>) as [
              string,
              unknown,
            ][]
          )}
        </div>
      )}
    </div>
  );
}
