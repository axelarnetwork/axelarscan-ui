'use client';

import Link from 'next/link';
import clsx from 'clsx';
import moment from 'moment';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { TimeSpent } from '@/components/Time';
import { ExplorerLink } from '@/components/ExplorerLink';
import { normalizeType } from '@/components/Transfers';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { getChainData, getAssetData } from '@/lib/config';
import { isString, ellipse, toTitle, spacedSuffix } from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import {
  getStep,
  getDepositAddressLabel,
  resolveSymbolAndImage,
} from './Transfer.utils';
import { StatusSteps } from './StatusSteps.component';
import type { InfoProps } from './Transfer.types';
import * as styles from './Transfer.styles';

export function Info({ data, tx }: InfoProps) {
  const chains = useChains();
  const assets = useAssets();

  const {
    link,
    send,
    wrap,
    unwrap,
    erc20_transfer,
    confirm,
    vote,
    command,
    type,
    simplified_status,
    time_spent,
  } = { ...data };
  const txhash = (send?.txhash as string | undefined) || tx;

  const sourceChain = (send?.source_chain || link?.source_chain) as
    | string
    | undefined;
  const destinationChain = (send?.destination_chain ||
    unwrap?.destination_chain ||
    link?.destination_chain) as string | undefined;

  const senderAddress = (wrap?.sender_address ||
    erc20_transfer?.sender_address ||
    send?.sender_address) as string | undefined;
  const recipientAddress = (unwrap?.recipient_address ||
    link?.recipient_address) as string | undefined;
  const depositAddress = (wrap?.deposit_address ||
    unwrap?.deposit_address_link ||
    erc20_transfer?.deposit_address ||
    send?.recipient_address ||
    link?.deposit_address) as string | undefined;

  const commandID = command?.command_id as string | undefined;
  const transferID = (command?.transfer_id ||
    vote?.transfer_id ||
    confirm?.transfer_id ||
    data.transfer_id) as string | undefined;

  const sourceChainData = getChainData(sourceChain, chains);
  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);
  const depositChainData = getChainData(
    depositAddress?.startsWith('axelar') ? 'axelarnet' : sourceChain,
    chains
  );

  const { url, transaction_path } = { ...sourceChainData?.explorer };

  // asset data
  const assetData = getAssetData(send?.denom as string | undefined, assets);

  const { addresses } = { ...assetData };
  const rawSymbol =
    (sourceChainData ? addresses?.[sourceChainData.id] : undefined)?.symbol ??
    assetData?.symbol ??
    (send?.denom as string | undefined);
  const rawImage =
    (sourceChainData ? addresses?.[sourceChainData.id] : undefined)?.image ??
    assetData?.image;

  const { symbol, image } = resolveSymbolAndImage(rawSymbol, rawImage, type);

  const steps = getStep(data, chains);

  return (
    <div className={styles.infoWrapper}>
      <div className={styles.infoHeaderPadding}>
        <h3 className={styles.infoTitle}>Transfer</h3>
        <div className={styles.infoSubtitle}>
          {txhash && (
            <div className={styles.infoTxHashRow}>
              <Copy value={txhash}>
                {url ? (
                  <Link
                    href={`${url}${transaction_path?.replace('{tx}', txhash)}`}
                    target="_blank"
                    className={styles.infoTxHashLink}
                  >
                    {ellipse(txhash)}
                  </Link>
                ) : (
                  ellipse(txhash)
                )}
              </Copy>
              <ExplorerLink value={txhash} chain={sourceChain} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.infoBorderTop}>
        <dl className={styles.infoDl}>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>Type</dt>
            <dd className={styles.infoDd}>
              <Tag className={clsx(styles.tagFitCapitalize)}>
                {toTitle(normalizeType(type))}
              </Tag>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>Status</dt>
            <dd className={styles.infoDd}>
              <StatusSteps
                steps={steps}
                axelarChainData={axelarChainData}
                destinationChainData={destinationChainData}
                insufficientFee={!!send?.insufficient_fee}
              />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>Source Chain</dt>
            <dd className={styles.infoDd}>
              <ChainProfile value={sourceChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>Destination Chain</dt>
            <dd className={styles.infoDd}>
              <ChainProfile value={destinationChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>Asset</dt>
            <dd className={styles.infoDd}>
              <div className={styles.assetRow}>
                <Image src={image} alt="" width={24} height={24} />
                {isNumber(send?.amount) && assets ? (
                  <Number
                    value={
                      isString(send!.amount)
                        ? formatUnits(
                            send!.amount as string,
                            assetData?.decimals
                          )
                        : (send!.amount as string | number)
                    }
                    format="0,0.000000"
                    suffix={spacedSuffix(symbol)}
                    className={styles.assetValue}
                  />
                ) : (
                  <span className={styles.assetValue}>{symbol}</span>
                )}
              </div>
            </dd>
          </div>
          {isNumber(send?.fee) && assets && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>Transfer Fee</dt>
              <dd className={styles.infoDd}>
                <div className={styles.assetRow}>
                  <Image src={image} alt="" width={24} height={24} />
                  <Number
                    value={
                      isString(send!.fee)
                        ? formatUnits(send!.fee as string, assetData?.decimals)
                        : (send!.fee as string | number)
                    }
                    format="0,0.000000"
                    suffix={spacedSuffix(symbol)}
                    className={styles.assetValue}
                  />
                </div>
              </dd>
            </div>
          )}
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>Sender</dt>
            <dd className={styles.infoDd}>
              <Profile address={senderAddress} chain={sourceChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>Recipient</dt>
            <dd className={styles.infoDd}>
              <Profile address={recipientAddress} chain={destinationChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>{getDepositAddressLabel(type)}</dt>
            <dd className={styles.infoDd}>
              <Profile
                address={depositAddress}
                chain={depositChainData?.id || sourceChain}
              />
            </dd>
          </div>
          {commandID && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>Command ID</dt>
              <dd className={styles.infoDd}>
                <Copy value={commandID}>
                  <span>{ellipse(commandID)}</span>
                </Copy>
              </dd>
            </div>
          )}
          {transferID && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>Transfer ID</dt>
              <dd className={styles.infoDd}>
                <Copy value={transferID}>
                  <span>{transferID}</span>
                </Copy>
              </dd>
            </div>
          )}
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>Created</dt>
            <dd className={styles.infoDd}>
              {moment(
                (send?.created_at as { ms?: number } | undefined)?.ms
              ).format(TIME_FORMAT)}
            </dd>
          </div>
          {(time_spent?.total ?? 0) > 0 &&
            ['received'].includes(simplified_status ?? '') && (
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>Time Spent</dt>
                <dd className={styles.infoDd}>
                  <TimeSpent
                    fromTimestamp={0}
                    toTimestamp={time_spent!.total! * 1000}
                  />
                </dd>
              </div>
            )}
        </dl>
      </div>
    </div>
  );
}
