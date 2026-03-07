'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import {
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineArrowRightEndOnRectangle,
} from 'react-icons/hi2';
import {
  MdOutlineRefresh,
  MdOutlineTimer,
} from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';
import { RiTimerFlashLine } from 'react-icons/ri';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile, AssetProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo, TimeSpent } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { searchGMP } from '@/lib/api/gmp';
import { isAxelar } from '@/lib/chain';
import { ENVIRONMENT } from '@/lib/config';
import { toArray } from '@/lib/parser';
import {
  getParams,
  generateKeyByParams,
} from '@/lib/operator';
import {
  isString,
  equalsIgnoreCase,
  capitalize,
  toBoolean,
  includesSomePatterns,
  ellipse,
} from '@/lib/string';
import { isNumber } from '@/lib/number';
import { timeDiff } from '@/lib/time';
import customGMPs from '@/data/custom/gmp';

import { Filters } from './Filters.component';
import type { GMPsProps, GMPRowData } from './GMPs.types';
import * as styles from './GMPs.styles';

const size = 25;

// ─── Exported utilities (consumed outside this component) ───────────────────

export const getEvent = (data: Record<string, unknown>) => {
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

  const origin = originData as Record<string, unknown> | undefined;

  if (interchain_transfer || origin?.interchain_transfer)
    return 'InterchainTransfer';
  if (
    token_manager_deployment_started ||
    origin?.token_manager_deployment_started
  )
    return 'TokenManagerDeployment';
  if (
    interchain_token_deployment_started ||
    origin?.interchain_token_deployment_started
  )
    return 'InterchainTokenDeployment';
  if (link_token_started || origin?.link_token_started) return 'LinkToken';
  if (token_metadata_registered || origin?.token_metadata_registered)
    return 'TokenMetadataRegistered';
  if (settlement_forwarded_events) return 'SquidCoralSettlementForwarded';
  if (settlement_filled_events || interchain_transfers)
    return 'SquidCoralSettlementFilled';

  return (call as Record<string, unknown> | undefined)?.event as string | undefined;
};

export const customData = async (data: Record<string, unknown>) => {
  const { call, interchain_transfer, interchain_transfers } = { ...data } as Record<string, Record<string, unknown> | unknown>;
  const { destinationContractAddress, payload } = { ...((call as Record<string, unknown>)?.returnValues as Record<string, unknown>) };
  if (!(destinationContractAddress && isString(payload))) return data;

  try {
    const customGMP = toArray(customGMPs).find(
      (d: Record<string, unknown>) =>
        toArray(d.addresses as string[]).findIndex((a: string) =>
          equalsIgnoreCase(a, destinationContractAddress as string)
        ) > -1 &&
        (!d.environment || equalsIgnoreCase(d.environment as string, ENVIRONMENT))
    );
    const { id, name, customize } = { ...customGMP } as Record<string, unknown>;

    if (typeof customize === 'function') {
      const customValues = await customize((call as Record<string, unknown>).returnValues, ENVIRONMENT);

      if (
        typeof customValues === 'object' &&
        !Array.isArray(customValues) &&
        Object.keys(customValues as Record<string, unknown>).length > 0
      ) {
        (customValues as Record<string, unknown>).projectId = id;
        (customValues as Record<string, unknown>).projectName = name || capitalize(id as string);
        data.customValues = customValues;
      }
    }

    // interchain transfer
    const it = interchain_transfer as Record<string, unknown> | undefined;
    if (
      it?.destinationAddress &&
      !(data.customValues as Record<string, unknown> | undefined)?.recipientAddress
    ) {
      data.customValues = {
        ...(data.customValues as Record<string, unknown>),
        recipientAddress: it.destinationAddress,
        destinationChain: it.destinationChain,
        projectId: 'its',
        projectName: 'ITS',
      };
    }

    // interchain transfers
    if (
      toArray(interchain_transfers as unknown[]).length > 0 &&
      !(data.customValues as Record<string, unknown> | undefined)?.recipientAddresses
    ) {
      data.customValues = {
        ...(data.customValues as Record<string, unknown>),
        recipientAddresses: (interchain_transfers as Record<string, unknown>[]).map((d: Record<string, unknown>) => ({
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

export const checkNeedMoreGasFromError = (error: Record<string, unknown> | null | undefined) => {
  if (!error) return false;
  const inner = error.error as Record<string, unknown> | undefined;
  return includesSomePatterns(
    [inner?.reason as string, inner?.message as string],
    ['INSUFFICIENT_GAS']
  );
};

// ─── Href builder (replaces the nested ternary at line 994 of the original) ─

function buildGmpHref(d: GMPRowData): string {
  if (d.call.parentMessageID) {
    return `/gmp/${d.call.parentMessageID}`;
  }

  if (d.message_id) {
    return `/gmp/${d.message_id}`;
  }

  const isCosmos = d.call.chain_type === 'cosmos';
  const txHash = isCosmos && isNumber(d.call.messageIdIndex)
    ? d.call.axelarTransactionHash
    : d.call.transactionHash;

  let suffix = '';
  if (isNumber(d.call.logIndex)) {
    suffix = `:${d.call.logIndex}`;
  } else if (isCosmos && isNumber(d.call.messageIdIndex)) {
    suffix = `-${d.call.messageIdIndex}`;
  }

  return `/gmp/${txHash}${suffix}`;
}

// ─── Status tag color helper ────────────────────────────────────────────────

function getStatusTagClass(simplifiedStatus: string): string {
  switch (simplifiedStatus) {
    case 'received':
      return styles.statusReceived;
    case 'approved':
      return styles.statusApproved;
    case 'failed':
      return styles.statusFailed;
    default:
      return styles.statusPending;
  }
}

// ─── Status label helper ────────────────────────────────────────────────────

function getStatusLabel(d: GMPRowData): string {
  if (
    d.simplified_status === 'received' &&
    (getEvent(d) === 'ContractCall' ||
      (getEvent(d) === 'InterchainTransfer' &&
        isAxelar(d.call.returnValues?.destinationChain)))
  ) {
    return 'Executed';
  }
  return d.simplified_status;
}

// ─── Row sub-renderers ──────────────────────────────────────────────────────

function renderTxHashCell(d: GMPRowData) {
  const key = d.message_id || d.call.transactionHash;

  return (
    <td className={styles.tdFirst}>
      <div className={styles.txHashWrapper}>
        <Copy value={key}>
          <Link
            href={buildGmpHref(d)}
            target="_blank"
            className={styles.txHashLink}
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
  );
}

function renderMethodCell(d: GMPRowData) {
  const symbol =
    d.call.returnValues?.symbol ||
    d.interchain_transfer?.symbol ||
    d.token_manager_deployment_started?.symbol ||
    d.interchain_token_deployment_started?.tokenSymbol ||
    d.link_token_started?.symbol ||
    d.token_metadata_registered?.symbol;

  return (
    <td className={styles.tdDefault}>
      <div className={styles.methodCellWrapper}>
        <Tag className={clsx(styles.methodTag)}>
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
            className={styles.assetProfileContainer}
            titleClassName={styles.assetProfileTitle}
          />
        )}
        {d.interchain_transfer?.contract_address &&
          !isAxelar(d.call.chain) && (
            <Tooltip
              content="Token Address"
              className={styles.tokenAddressTooltip}
              parentClassName={styles.tokenAddressTooltipParent}
            >
              <Profile
                address={d.interchain_transfer.contract_address}
                chain={d.call.chain}
                width={16}
                height={16}
                noResolveName={true}
                className={styles.tokenAddressProfile}
              />
            </Tooltip>
          )}
        {toArray(d.interchain_transfers).length > 0 && (
          <div className={styles.interchainTransfersWrapper}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {d.interchain_transfers.map((_d: any, i: number) => (
              <AssetProfile
                key={i}
                value={_d.contract_address || _d.symbol}
                chain={_d.destinationChain}
                amount={_d.amount}
                customAssetData={_d}
                ITSPossible={true}
                width={16}
                height={16}
                className={styles.assetProfileContainer}
                titleClassName={styles.assetProfileTitle}
              />
            ))}
          </div>
        )}
      </div>
    </td>
  );
}

function renderSenderCell(d: GMPRowData, useAnotherHopChain: boolean) {
  const isHopOrigin = useAnotherHopChain && isAxelar(d.call.chain) && d.origin_chain;

  return (
    <td className={styles.tdDefault}>
      <div className={styles.senderCellWrapper}>
        {isHopOrigin ? (
          <div className={styles.senderChainProfileWrapper}>
            <ChainProfile
              value={d.origin_chain}
              className={styles.chainProfileHeight}
              titleClassName={styles.chainProfileTitleBold}
            />
            <ExplorerLink
              value={d.call.returnValues.sender}
              chain={d.call.chain}
              type="address"
              title="via"
              iconOnly={false}
              width={11}
              height={11}
              containerClassName={styles.explorerLinkContainerClassName}
              nonIconClassName={styles.explorerLinkNonIconClassName}
            />
          </div>
        ) : (
          <ChainProfile
            value={d.call.chain}
            titleClassName={styles.chainProfileTitleBold}
          />
        )}
        {!isHopOrigin && (
          <Profile
            address={d.call.transaction?.from}
            chain={d.call.chain}
          />
        )}
      </div>
    </td>
  );
}

function renderDestinationCell(d: GMPRowData, useAnotherHopChain: boolean) {
  const destChain = d.call.returnValues?.destinationChain;
  const isDestAxelar = isAxelar(destChain);
  const showMainChain = !isDestAxelar || !d.customValues?.recipientAddress || !useAnotherHopChain;

  return (
    <td className={styles.tdDefault}>
      <div className={styles.destinationCellWrapper}>
        {d.is_invalid_destination_chain ? (
          <div className={styles.invalidChainWrapper}>
            <Tooltip content={destChain}>
              <div className={styles.invalidChainContent}>
                <PiWarningCircle size={20} />
                <span>Invalid Chain</span>
              </div>
            </Tooltip>
          </div>
        ) : (
          showMainChain && (
            <ChainProfile
              value={destChain}
              titleClassName={styles.chainProfileTitleBold}
            />
          )
        )}
        {d.is_invalid_contract_address ? (
          <div className={styles.invalidChainWrapper}>
            <Tooltip
              content={d.call.returnValues?.destinationContractAddress}
            >
              <div className={styles.invalidChainContent}>
                <PiWarningCircle size={20} />
                <span>Invalid Contract</span>
              </div>
            </Tooltip>
          </div>
        ) : (
          <>
            {showMainChain && (
              <Tooltip
                content="Destination Contract"
                parentClassName={styles.destinationContractTooltipParent}
              >
                <Profile
                  address={d.call.returnValues?.destinationContractAddress}
                  chain={destChain}
                  useContractLink={true}
                />
              </Tooltip>
            )}
            {renderHopAndRecipient(d, useAnotherHopChain, destChain, isDestAxelar)}
          </>
        )}
      </div>
    </td>
  );
}

function renderHopAndRecipient(
  d: GMPRowData,
  useAnotherHopChain: boolean,
  destChain: string | undefined,
  isDestAxelar: boolean,
) {
  if (!d.callback_chain && !d.customValues?.recipientAddress) {
    return null;
  }

  const recipientAddress =
    d.customValues?.recipientAddress ||
    (useAnotherHopChain && d.callback_destination_address);

  const recipientTooltipContent =
    isDestAxelar &&
    (d.customValues?.projectName === 'ITS' ||
      (!d.customValues?.recipientAddress && d.callback_destination_address))
      ? 'Destination Address'
      : `${d.customValues?.projectName ? d.customValues.projectName : 'Final User'} Recipient`;

  return (
    <>
      {isDestAxelar && (
        <div className={styles.hopChainWrapper}>
          <ChainProfile
            value={
              useAnotherHopChain &&
              (d.callback_chain || d.customValues?.destinationChain)
            }
            className={styles.chainProfileHeight}
            titleClassName={styles.chainProfileTitleBold}
          />
          {useAnotherHopChain && (
            <ExplorerLink
              value={d.call.returnValues.destinationContractAddress}
              chain={destChain}
              type="address"
              title="via"
              iconOnly={false}
              width={11}
              height={11}
              containerClassName={styles.explorerLinkContainerClassName}
              nonIconClassName={styles.explorerLinkNonIconClassName}
            />
          )}
        </div>
      )}
      {recipientAddress && (
        <Tooltip
          content={recipientTooltipContent}
          parentClassName={styles.recipientTooltipParent}
        >
          <Profile
            address={recipientAddress}
            chain={
              (useAnotherHopChain && d.callback_chain) ||
              d.customValues?.destinationChain ||
              destChain
            }
          />
        </Tooltip>
      )}
    </>
  );
}

function renderStatusCell(d: GMPRowData) {
  const receivedTransactionHash =
    d.express_executed?.transactionHash ||
    d.executed?.transactionHash;
  const destChain = d.call.returnValues?.destinationChain;

  return (
    <td className={styles.tdDefault}>
      <div className={styles.statusCellWrapper}>
        {d.simplified_status && (
          <div className={styles.statusRow}>
            <Tag
              className={clsx(
                styles.statusTagBase,
                getStatusTagClass(d.simplified_status)
              )}
            >
              {getStatusLabel(d)}
            </Tag>
            {d.simplified_status === 'received' && (
              <ExplorerLink
                value={receivedTransactionHash}
                chain={destChain}
              />
            )}
          </div>
        )}
        {d.is_insufficient_fee &&
          ((!isAxelar(d.call.chain) && !isAxelar(destChain)) ||
            timeDiff(d.call.created_at?.ms) > 300) && (
            <div className={styles.insufficientFeeWrapper}>
              <PiWarningCircle size={16} />
              <span className={styles.statusSmallText}>
                Insufficient Fee
              </span>
            </div>
          )}
        {d.is_invalid_gas_paid && (
          <div className={styles.invalidGasPaidWrapper}>
            <PiWarningCircle size={16} />
            <span className={styles.statusSmallText}>Invalid Gas Paid</span>
          </div>
        )}
        {d.time_spent?.call_express_executed > 0 &&
          ['express_executed', 'executed'].includes(d.status) && (
            <div className={styles.expressExecutedWrapper}>
              <RiTimerFlashLine size={16} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={d.time_spent.call_express_executed * 1000}
                className={styles.statusSmallText}
              />
            </div>
          )}
        {d.time_spent?.total > 0 && d.status === 'executed' && (
          <div className={styles.totalTimeWrapper}>
            <MdOutlineTimer size={16} />
            <TimeSpent
              fromTimestamp={0}
              toTimestamp={d.time_spent.total * 1000}
              className={styles.statusSmallText}
            />
          </div>
        )}
        {isAxelar(destChain) && (
          <div className={styles.hopIndicator}>
            <HiOutlineArrowRightEndOnRectangle size={16} />
            <span className={styles.statusSmallText}>1st hop</span>
          </div>
        )}
        {isAxelar(d.call.chain) && (
          <div className={styles.hopIndicator}>
            <HiOutlineArrowRightStartOnRectangle size={16} />
            <span className={styles.statusSmallText}>2nd hop</span>
          </div>
        )}
      </div>
    </td>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function GMPs({ address = undefined, useAnotherHopChain = false }: GMPsProps) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<string, unknown> | null>(null);
  const [refresh, setRefresh] = useState<boolean | string | null>(null);

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

        const response = await searchGMP({ ..._params, size, sort }) as Record<string, unknown>;

        if (response?.data) {
          response.data = await Promise.all(
            toArray(response.data as unknown[]).map(
              (d: unknown) => new Promise(async resolve => resolve(await customData(d as Record<string, unknown>)))
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

  const { data, total } = { ...(searchResults?.[generateKeyByParams(params ?? {})] as Record<string, unknown> | undefined) } as { data?: GMPRowData[]; total?: number };

  if (!data) {
    return (
      <Container className={styles.containerDefault}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.containerDefault}>
      <div>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>
              General Message Passing
            </h1>
            <p className={styles.headerSubtitle}>
              <Number
                value={total}
                suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
              />
            </p>
          </div>
          <div className={styles.headerActions}>
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
        <div className={styles.tableScrollContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableHeadRow}>
                <th scope="col" className={styles.thFirst}>
                  Tx Hash
                </th>
                <th scope="col" className={styles.thDefault}>
                  Method
                </th>
                <th scope="col" className={styles.thDefault}>
                  Sender
                </th>
                <th scope="col" className={styles.thDefault}>
                  Destination
                </th>
                <th scope="col" className={styles.thDefault}>
                  Status
                </th>
                <th scope="col" className={styles.thLast}>
                  Created at
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {data.map((d: GMPRowData) => {
                const key = d.message_id || d.call.transactionHash;

                return (
                  <tr key={key} className={styles.tableRow}>
                    {renderTxHashCell(d)}
                    {renderMethodCell(d)}
                    {renderSenderCell(d, useAnotherHopChain)}
                    {renderDestinationCell(d, useAnotherHopChain)}
                    {renderStatusCell(d)}
                    <td className={styles.tdLast}>
                      <TimeAgo timestamp={d.call.block_timestamp * 1000} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(total ?? 0) > size && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={size} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}
