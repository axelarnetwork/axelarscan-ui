import clsx from 'clsx';
import moment from 'moment';
import Link from 'next/link';
import { MdCheck, MdClose, MdKeyboardArrowRight } from 'react-icons/md';
import { PiClock, PiWarningCircle } from 'react-icons/pi';

import { ChainProfile } from '@/components/Profile';
import { TimeUntil } from '@/components/Time';
import { isAxelar } from '@/lib/chain';
import { toArray } from '@/lib/parser';
import { isString } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import { GMPEventLog, GMPMessage, GMPStep } from '../GMP.types';
import { getStep } from '../GMP.utils';
import { statusTimelineStyles } from './StatusTimeline.styles';
import { StatusTimelineProps } from './StatusTimeline.types';

export function StatusTimeline({
  timeline,
  chains,
  estimatedTimeSpent,
  isMultihop,
  rootCall,
  expressExecuted,
}: StatusTimelineProps) {
  const entries = toArray(timeline).filter(
    (entry): entry is GMPMessage => typeof entry === 'object' && entry !== null
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={statusTimelineStyles.list}>
      {entries.map((entry: GMPMessage, index: number) => {
        const { call } = { ...entry };

        const sourceChain = call?.chain;
        const destinationChain =
          call?.returnValues?.destinationChain || entry?.approved?.chain;

        const steps = getStep(entry, chains);

        if (steps.length === 0) {
          return null;
        }

        const parentMessageID = call?.parentMessageID;
        const childMessageIDs = entry?.executed?.childMessageIDs;
        const createdAtMs = call?.created_at?.ms;

        const hasHopNavigation =
          (isAxelar(sourceChain) && toArray(childMessageIDs).length > 0) ||
          (isAxelar(destinationChain) && Boolean(parentMessageID));

        const navHeightClass = hasHopNavigation
          ? statusTimelineStyles.navTallHeight
          : statusTimelineStyles.navDefaultHeight;

        return (
          <div key={index} className={statusTimelineStyles.item}>
            {isMultihop && (
              <div className={statusTimelineStyles.chainPath}>
                <ChainProfile
                  value={sourceChain}
                  width={20}
                  height={20}
                  className={statusTimelineStyles.chainProfileIcon}
                  titleClassName={statusTimelineStyles.chainProfileTitle}
                />
                <MdKeyboardArrowRight size={20} />
                <ChainProfile
                  value={destinationChain}
                  width={20}
                  height={20}
                  className={statusTimelineStyles.chainProfileIcon}
                  titleClassName={statusTimelineStyles.chainProfileTitle}
                />
              </div>
            )}

            <nav
              aria-label="Progress"
              className={clsx(statusTimelineStyles.nav, navHeightClass)}
            >
              <ol className={statusTimelineStyles.navList}>
                {steps.map((step: GMPStep, stepIndex: number) => {
                  const { id, title, status, data, chainData } = step;

                  const rawStepData =
                    id === 'pay_gas' && isString(data)
                      ? entry.originData?.gas_paid
                      : data;

                  const stepEventLog =
                    typeof rawStepData === 'object' && rawStepData !== null
                      ? (rawStepData as GMPEventLog)
                      : undefined;

                  const {
                    transactionHash,
                    chain_type,
                    confirmation_txhash,
                    poll_id,
                    axelarTransactionHash,
                    blockNumber,
                    contract_address,
                  } = stepEventLog ?? {};

                  const { url, block_path, transaction_path } = {
                    ...chainData?.explorer,
                  };

                  let stepURL: string | undefined;

                  switch (id) {
                    case 'confirm':
                      if (confirmation_txhash) {
                        stepURL = `/tx/${confirmation_txhash}`;
                      } else if (contract_address && poll_id) {
                        stepURL = `/amplifier-poll/${contract_address}_${poll_id}`;
                      } else if (poll_id) {
                        stepURL = `/evm-poll/${poll_id}`;
                      }
                      break;
                    case 'approve':
                      if (transactionHash && url) {
                        stepURL = `${url}${transaction_path?.replace('{tx}', transactionHash)}`;
                      }
                      break;
                    case 'execute':
                    case 'executed':
                      if (transactionHash || axelarTransactionHash) {
                        const hashToUse =
                          transactionHash || axelarTransactionHash;
                        if (
                          block_path &&
                          typeof transactionHash === 'number' &&
                          typeof blockNumber === 'number' &&
                          transactionHash === blockNumber
                        ) {
                          stepURL = `${url}${block_path.replace('{block}', String(transactionHash))}`;
                        } else if (transaction_path) {
                          stepURL = `${url}${transaction_path.replace('{tx}', String(hashToUse))}`;
                        }
                      }
                      break;
                    default:
                      if (stepEventLog?.proposal_id) {
                        stepURL = `/proposal/${stepEventLog.proposal_id}`;
                      } else if (transactionHash && url) {
                        if (id === 'send' && chain_type === 'cosmos') {
                          stepURL = `${url}${transaction_path?.replace('{tx}', transactionHash)}`;
                        } else if (
                          block_path &&
                          typeof transactionHash === 'number' &&
                          typeof blockNumber === 'number' &&
                          transactionHash === blockNumber
                        ) {
                          stepURL = `${url}${block_path.replace('{block}', String(transactionHash))}`;
                        } else if (
                          block_path &&
                          typeof blockNumber !== 'undefined'
                        ) {
                          stepURL = `${url}${block_path.replace('{block}', String(blockNumber))}`;
                        } else {
                          stepURL = `${url}${transaction_path?.replace('{tx}', transactionHash)}`;
                        }
                      }
                      break;
                  }

                  const hasPreviousStep =
                    steps[stepIndex - 1]?.status !== 'pending';

                  const stepContent = (
                    <>
                      <div
                        className={clsx(
                          statusTimelineStyles.stepCircleBase,
                          status === 'failed'
                            ? statusTimelineStyles.stepCircleFailed
                            : statusTimelineStyles.stepCircleSuccess
                        )}
                      >
                        {status === 'failed' ? (
                          <MdClose className={statusTimelineStyles.stepIcon} />
                        ) : (
                          <MdCheck className={statusTimelineStyles.stepIcon} />
                        )}
                      </div>
                      <span
                        className={clsx(
                          statusTimelineStyles.stepLabel,
                          status === 'failed'
                            ? statusTimelineStyles.stepLabelFailed
                            : statusTimelineStyles.stepLabelSuccess,
                          (title ?? '').length <= 5 &&
                            statusTimelineStyles.shortTitleSpacing
                        )}
                      >
                        {title}
                      </span>
                      {id === 'express' && (
                        <div
                          className={statusTimelineStyles.expressLabelWrapper}
                        >
                          <span className={statusTimelineStyles.expressLabel}>
                            Received
                          </span>
                        </div>
                      )}
                      {!isAxelar(sourceChain) && parentMessageID && (
                        <div className={statusTimelineStyles.hopLinkWrapper}>
                          <Link
                            href={`/gmp/${parentMessageID}`}
                            target="_blank"
                            className={statusTimelineStyles.hopLink}
                          >
                            ← prev Hop
                          </Link>
                        </div>
                      )}
                      {!isAxelar(destinationChain) &&
                        toArray(childMessageIDs)
                          .map(idValue => {
                            if (typeof idValue === 'string') return idValue;
                            if (typeof idValue === 'number')
                              return idValue.toString();
                            return undefined;
                          })
                          .filter((idValue): idValue is string =>
                            Boolean(idValue)
                          )
                          .map(childId => (
                            <div
                              key={childId}
                              className={statusTimelineStyles.hopLinkWrapper}
                            >
                              <Link
                                href={`/gmp/${childId}`}
                                target="_blank"
                                className={statusTimelineStyles.hopLink}
                              >
                                next Hop →
                              </Link>
                            </div>
                          ))}
                    </>
                  );

                  return (
                    <li
                      key={id}
                      className={clsx(
                        statusTimelineStyles.stepWrapper,
                        stepIndex !== steps.length - 1 &&
                          statusTimelineStyles.stepSpacing
                      )}
                    >
                      {status === 'pending' ? (
                        <>
                          <div
                            className={statusTimelineStyles.connectorWrapper}
                            aria-hidden="true"
                          >
                            <div
                              className={clsx(
                                statusTimelineStyles.connectorLineBase,
                                statusTimelineStyles.pendingConnectorLine
                              )}
                            />
                          </div>
                          <div
                            className={clsx(
                              statusTimelineStyles.pendingCircle,
                              hasPreviousStep
                                ? statusTimelineStyles.pendingBorderActive
                                : statusTimelineStyles.pendingBorderDefault
                            )}
                            aria-current="step"
                          >
                            {hasPreviousStep && (
                              <PiClock
                                className={clsx(
                                  statusTimelineStyles.pendingClock,
                                  statusTimelineStyles.pendingLabelActive
                                )}
                              />
                            )}
                            <span
                              className={clsx(
                                statusTimelineStyles.pendingLabel,
                                hasPreviousStep
                                  ? statusTimelineStyles.pendingLabelActive
                                  : statusTimelineStyles.pendingLabelInactive,
                                (title ?? '').length <= 5 &&
                                  statusTimelineStyles.shortTitleSpacing
                              )}
                            >
                              {title}
                            </span>
                            {id === 'confirm' &&
                              !expressExecuted &&
                              estimatedTimeSpent?.confirm &&
                              rootCall?.block_timestamp &&
                              timeDiff(
                                moment(),
                                'seconds',
                                (rootCall.block_timestamp +
                                  estimatedTimeSpent.confirm) *
                                  1000
                              ) > 0 && (
                                <div
                                  className={
                                    statusTimelineStyles.pendingTimeWrapper
                                  }
                                >
                                  <TimeUntil
                                    timestamp={
                                      (rootCall.block_timestamp +
                                        estimatedTimeSpent.confirm) *
                                      1000
                                    }
                                    prefix="("
                                    suffix=")"
                                    noTooltip
                                    className={
                                      statusTimelineStyles.pendingTimeText
                                    }
                                  />
                                </div>
                              )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className={statusTimelineStyles.connectorWrapper}
                            aria-hidden="true"
                          >
                            <div
                              className={clsx(
                                statusTimelineStyles.connectorLineBase,
                                status === 'failed'
                                  ? statusTimelineStyles.connectorLineFailed
                                  : statusTimelineStyles.connectorLineSuccess
                              )}
                            />
                          </div>
                          {stepURL ? (
                            <Link href={stepURL} target="_blank">
                              {stepContent}
                            </Link>
                          ) : (
                            stepContent
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            {entry?.is_insufficient_fee &&
              !(entry.confirm || entry.approved) &&
              ((!isAxelar(entry.call?.chain) &&
                !isAxelar(entry.call?.returnValues?.destinationChain)) ||
                (createdAtMs ? timeDiff(createdAtMs) > 120 : false)) && (
                <div className={statusTimelineStyles.warningRow}>
                  <PiWarningCircle size={16} />
                  <span className={statusTimelineStyles.warningText}>
                    Insufficient Fee
                  </span>
                </div>
              )}
            {entry?.is_invalid_gas_paid &&
              !(entry.confirm || entry.approved) && (
                <div className={statusTimelineStyles.warningRow}>
                  <PiWarningCircle size={16} />
                  <span className={statusTimelineStyles.warningText}>
                    Invalid Gas Paid (source address mismatch)
                  </span>
                </div>
              )}
            {entry?.not_enough_gas_to_execute &&
              !entry.executed &&
              !entry.is_executed && (
                <div className={statusTimelineStyles.warningRow}>
                  <PiWarningCircle size={16} />
                  <span className={statusTimelineStyles.warningText}>
                    Insufficient Gas
                  </span>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
}
