'use client';

import Link from 'next/link';
import clsx from 'clsx';
import moment from 'moment';
import { MdClose, MdCheck } from 'react-icons/md';
import { PiClock, PiWarningCircle } from 'react-icons/pi';

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
import { isString, ellipse, toTitle } from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import { getStep, getDepositAddressLabel, resolveSymbolAndImage, resolveStepURL } from './Transfer.utils';
import type { InfoProps, TransferStep, CompletedStepProps, StepElementProps, PendingStepProps } from './Transfer.types';
import * as styles from './Transfer.styles';

function StepElement({ step }: StepElementProps) {
  return (
    <>
      <div
        className={clsx(
          styles.stepCircleBase,
          step.status === 'failed'
            ? styles.stepCircleFailed
            : styles.stepCircleSuccess
        )}
      >
        {step.status === 'failed' ? (
          <MdClose className={styles.stepIcon} />
        ) : (
          <MdCheck className={styles.stepIcon} />
        )}
      </div>
      <span
        className={clsx(
          styles.stepLabelBase,
          step.status === 'failed'
            ? styles.stepLabelFailed
            : styles.stepLabelSuccess,
          step.title?.length <= 5 ? styles.shortLabelOffset : ''
        )}
      >
        {step.title}
      </span>
    </>
  );
}

function PendingStep({ step, prevStatus }: PendingStepProps) {
  const isPrevPending = prevStatus === 'pending';

  return (
    <>
      <div className={styles.stepPendingInset} aria-hidden="true">
        <div className={styles.stepPendingBar} />
      </div>
      <div
        className={clsx(
          styles.stepPendingCircleBase,
          isPrevPending
            ? styles.stepPendingBorderInactive
            : styles.stepPendingBorderActive
        )}
        aria-current="step"
      >
        {!isPrevPending && (
          <PiClock
            className={clsx(
              'h-5 w-5',
              isPrevPending
                ? styles.stepPendingClockInactive
                : styles.stepPendingClockActive
            )}
          />
        )}
        <span
          className={clsx(
            styles.stepPendingLabelBase,
            !isPrevPending
              ? styles.stepPendingLabelActive
              : styles.stepPendingLabelInactive,
            step.title?.length <= 5 ? styles.shortLabelOffset : ''
          )}
        >
          {step.title}
        </span>
      </div>
    </>
  );
}

function CompletedStep({
  step,
  stepURL,
}: CompletedStepProps) {
  const element = <StepElement step={step} />;

  return (
    <>
      <div className={styles.stepPendingInset} aria-hidden="true">
        <div
          className={clsx(
            styles.stepCompletedBarBase,
            step.status === 'failed'
              ? styles.stepCompletedBarFailed
              : styles.stepCompletedBarSuccess
          )}
        />
      </div>
      {stepURL ? (
        <Link href={stepURL} target="_blank">
          {element}
        </Link>
      ) : (
        element
      )}
    </>
  );
}

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
  const txhash = send?.txhash || tx;

  const sourceChain = send?.source_chain || link?.source_chain;
  const destinationChain =
    send?.destination_chain ||
    unwrap?.destination_chain ||
    link?.destination_chain;

  const senderAddress =
    wrap?.sender_address ||
    erc20_transfer?.sender_address ||
    send?.sender_address;
  const recipientAddress = unwrap?.recipient_address || link?.recipient_address;
  const depositAddress =
    wrap?.deposit_address ||
    unwrap?.deposit_address_link ||
    erc20_transfer?.deposit_address ||
    send?.recipient_address ||
    link?.deposit_address;

  const commandID = command?.command_id;
  const transferID =
    command?.transfer_id ||
    vote?.transfer_id ||
    confirm?.transfer_id ||
    data.transfer_id;

  const sourceChainData = getChainData(sourceChain, chains);
  const destinationChainData = getChainData(destinationChain, chains);
  const axelarChainData = getChainData('axelarnet', chains);
  const depositChainData = getChainData(
    depositAddress?.startsWith('axelar') ? 'axelarnet' : sourceChain,
    chains
  );

  const { url, transaction_path } = { ...sourceChainData?.explorer };

  // asset data
  const assetData = getAssetData(send?.denom, assets);

  const { addresses } = { ...assetData };
  const rawSymbol = (sourceChainData ? addresses?.[sourceChainData.id] : undefined)?.symbol
    ?? assetData?.symbol
    ?? (send?.denom as string | undefined);
  const rawImage = (sourceChainData ? addresses?.[sourceChainData.id] : undefined)?.image
    ?? assetData?.image;

  const { symbol, image } = resolveSymbolAndImage(rawSymbol, rawImage, type);

  const steps = getStep(data, chains);

  return (
    <div className={styles.infoWrapper}>
      <div className={styles.infoHeaderPadding}>
        <h3 className={styles.infoTitle}>
          Transfer
        </h3>
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
            <dt className={styles.infoDt}>
              Type
            </dt>
            <dd className={styles.infoDd}>
              <Tag className={clsx(styles.tagFitCapitalize)}>
                {toTitle(normalizeType(type))}
              </Tag>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Status
            </dt>
            <dd className={styles.infoDd}>
              <div className={styles.statusFlexCol}>
                <nav
                  aria-label="Progress"
                  className={styles.statusNav}
                >
                  <ol role="list" className={styles.statusOl}>
                    {steps.map((d: TransferStep, i: number) => {
                      const stepURL = resolveStepURL(d, axelarChainData, destinationChainData);

                      return (
                        <li
                          key={d.id}
                          className={clsx(
                            styles.stepLiBase,
                            i !== steps.length - 1 ? styles.stepLiNotLast : ''
                          )}
                        >
                          {d.status === 'pending' ? (
                            <PendingStep step={d} prevStatus={steps[i - 1]?.status} />
                          ) : (
                            <CompletedStep step={d} stepURL={stepURL} />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </nav>
                {send?.insufficient_fee && (
                  <div className={styles.insufficientFeeRow}>
                    <PiWarningCircle size={16} />
                    <span className={styles.insufficientFeeText}>Insufficient Fee</span>
                  </div>
                )}
              </div>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Source Chain
            </dt>
            <dd className={styles.infoDd}>
              <ChainProfile value={sourceChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Destination Chain
            </dt>
            <dd className={styles.infoDd}>
              <ChainProfile value={destinationChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Asset
            </dt>
            <dd className={styles.infoDd}>
              <div className={styles.assetRow}>
                <Image src={image} alt="" width={24} height={24} />
                {isNumber(send?.amount) && assets ? (
                  <Number
                    value={
                      isString(send.amount)
                        ? formatUnits(send.amount as string, assetData?.decimals)
                        : send.amount as string | number
                    }
                    format="0,0.000000"
                    suffix={` ${symbol}`}
                    className={styles.assetValue}
                  />
                ) : (
                  <span className={styles.assetValue}>
                    {symbol}
                  </span>
                )}
              </div>
            </dd>
          </div>
          {isNumber(send?.fee) && assets && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>
                Transfer Fee
              </dt>
              <dd className={styles.infoDd}>
                <div className={styles.assetRow}>
                  <Image src={image} alt="" width={24} height={24} />
                  <Number
                    value={
                      isString(send.fee)
                        ? formatUnits(send.fee as string, assetData?.decimals)
                        : send.fee as string | number
                    }
                    format="0,0.000000"
                    suffix={` ${symbol}`}
                    className={styles.assetValue}
                  />
                </div>
              </dd>
            </div>
          )}
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Sender
            </dt>
            <dd className={styles.infoDd}>
              <Profile address={senderAddress} chain={sourceChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Recipient
            </dt>
            <dd className={styles.infoDd}>
              <Profile address={recipientAddress} chain={destinationChain} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              {getDepositAddressLabel(type)}
            </dt>
            <dd className={styles.infoDd}>
              <Profile
                address={depositAddress}
                chain={depositChainData?.id || sourceChain}
              />
            </dd>
          </div>
          {commandID && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>
                Command ID
              </dt>
              <dd className={styles.infoDd}>
                <Copy value={commandID}>
                  <span>{ellipse(commandID)}</span>
                </Copy>
              </dd>
            </div>
          )}
          {transferID && (
            <div className={styles.infoRow}>
              <dt className={styles.infoDt}>
                Transfer ID
              </dt>
              <dd className={styles.infoDd}>
                <Copy value={transferID}>
                  <span>{transferID}</span>
                </Copy>
              </dd>
            </div>
          )}
          <div className={styles.infoRow}>
            <dt className={styles.infoDt}>
              Created
            </dt>
            <dd className={styles.infoDd}>
              {moment(send?.created_at?.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {(time_spent?.total ?? 0) > 0 &&
            ['received'].includes(simplified_status ?? '') && (
              <div className={styles.infoRow}>
                <dt className={styles.infoDt}>
                  Time Spent
                </dt>
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
