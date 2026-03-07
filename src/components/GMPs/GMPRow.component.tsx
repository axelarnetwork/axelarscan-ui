import Link from 'next/link';
import clsx from 'clsx';
import {
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineArrowRightEndOnRectangle,
} from 'react-icons/hi2';
import {
  MdOutlineTimer,
} from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';
import { RiTimerFlashLine } from 'react-icons/ri';

import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { Profile, ChainProfile, AssetProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo, TimeSpent } from '@/components/Time';
import { isAxelar } from '@/lib/chain';
import { toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import type { GMPRowProps, InterchainTransferData } from './GMPs.types';
import * as styles from './GMPs.styles';
import { buildGmpHref, getStatusLabel, getEvent } from './GMPs.utils';

export function GMPRow({ data: d, useAnotherHopChain }: GMPRowProps) {
  const key = d.message_id || d.call.transactionHash;

  return (
    <tr key={key} className={styles.tableRow}>
      <TxHashCell data={d} />
      <MethodCell data={d} />
      <SenderCell data={d} useAnotherHopChain={useAnotherHopChain} />
      <DestinationCell data={d} useAnotherHopChain={useAnotherHopChain} />
      <StatusCell data={d} />
      <td className={styles.tdLast}>
        <TimeAgo timestamp={d.call.block_timestamp * 1000} />
      </td>
    </tr>
  );
}

// ─── Internal cell components ───────────────────────────────────────────────

function TxHashCell({ data: d }: { data: GMPRowProps['data'] }) {
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

function MethodCell({ data: d }: { data: GMPRowProps['data'] }) {
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
            {d.interchain_transfers!.map((_d: InterchainTransferData, i: number) => (
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

function SenderCell({ data: d, useAnotherHopChain }: { data: GMPRowProps['data']; useAnotherHopChain: boolean }) {
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
              value={d.call.returnValues?.sender}
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

function DestinationCell({ data: d, useAnotherHopChain }: { data: GMPRowProps['data']; useAnotherHopChain: boolean }) {
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
            {hopAndRecipient(d, useAnotherHopChain, destChain, isDestAxelar)}
          </>
        )}
      </div>
    </td>
  );
}

// ─── Helper (not a component — returns a fragment) ──────────────────────────

function hopAndRecipient(
  d: GMPRowProps['data'],
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
              useAnotherHopChain
                ? (d.callback_chain || d.customValues?.destinationChain)
                : undefined
            }
            className={styles.chainProfileHeight}
            titleClassName={styles.chainProfileTitleBold}
          />
          {useAnotherHopChain && (
            <ExplorerLink
              value={d.call.returnValues?.destinationContractAddress}
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

function StatusCell({ data: d }: { data: GMPRowProps['data'] }) {
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
                styles.getStatusTagClass(d.simplified_status)
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
        {(d.time_spent?.call_express_executed ?? 0) > 0 &&
          ['express_executed', 'executed'].includes(d.status ?? '') && (
            <div className={styles.expressExecutedWrapper}>
              <RiTimerFlashLine size={16} />
              <TimeSpent
                fromTimestamp={0}
                toTimestamp={(d.time_spent?.call_express_executed ?? 0) * 1000}
                className={styles.statusSmallText}
              />
            </div>
          )}
        {(d.time_spent?.total ?? 0) > 0 && d.status === 'executed' && (
          <div className={styles.totalTimeWrapper}>
            <MdOutlineTimer size={16} />
            <TimeSpent
              fromTimestamp={0}
              toTimestamp={(d.time_spent?.total ?? 0) * 1000}
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
