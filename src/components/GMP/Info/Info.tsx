import clsx from 'clsx';
import moment from 'moment';
import { useState } from 'react';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { useGlobalStore } from '@/components/Global';
import { ContractCallData } from '@/components/GMP/ContractCallData/ContractCallData';
import { getEvent } from '@/components/GMPs';
import { AssetProfile, Profile } from '@/components/Profile';
import { Tag } from '@/components/Tag';
import { Tooltip } from '@/components/Tooltip';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import { StatusTimeline } from '../StatusTimeline/StatusTimeline';
import { GMPMessage, GMPEventLog } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { InfoGasMetrics } from './InfoGasMetrics';
import { InfoHeader } from './InfoHeader';
import { InfoParticipants } from './InfoParticipants';
import { InfoPath } from './InfoPath';
import { InfoSection } from './InfoSection';
import { InfoSettlement } from './InfoSettlement';
import { InfoTime } from './InfoTime';
import { InfoTransfers } from './InfoTransfers';

import { InfoProps } from './Info.types';

export function Info({
  data,
  estimatedTimeSpent,
  executeData,
  buttons,
  tx,
  lite,
}: InfoProps) {
  const [seeMore, setSeeMore] = useState(false);
  const { chains } = useGlobalStore();

  const {
    call,
    gas_paid,
    gas_paid_to_callback,
    express_executed,
    confirm,
    approved,
    executed,
    interchain_transfer,
    settlement_forwarded_events,
    settlement_filled_events,
    fees,
    gas,
    status,
    time_spent,
  } = { ...data };

  const messageId = data.message_id;
  const txhash = call?.transactionHash || tx;

  const sourceChain =
    approved?.returnValues?.sourceChain ||
    getChainData(call?.chain, chains)?.chain_name ||
    call?.chain;
  const destinationChain =
    call?.returnValues?.destinationChain ||
    getChainData(approved?.chain, chains)?.chain_name ||
    approved?.chain;

  const senderAddress = call?.transaction?.from;
  const sourceAddress = call?.returnValues?.sender;
  const contractAddressValue =
    approved?.returnValues?.contractAddress ||
    call?.returnValues?.destinationContractAddress;
  const contractAddress = typeof contractAddressValue === 'string' ? contractAddressValue : undefined;

  const sourceChainData = getChainData(sourceChain, chains);
  const { url, transaction_path } = { ...sourceChainData?.explorer };

  let symbol =
    call?.returnValues?.symbol ||
    interchain_transfer?.symbol ||
    data.token_manager_deployment_started?.symbol ||
    data.interchain_token_deployment_started?.tokenSymbol ||
    data.link_token_started?.symbol ||
    data.token_metadata_registered?.symbol;

  if (!symbol && data.originData) {
    symbol =
      data.originData.call?.returnValues?.symbol ||
      data.originData.interchain_transfer?.symbol ||
      data.originData.token_manager_deployment_started?.symbol ||
      data.originData.interchain_token_deployment_started?.tokenSymbol ||
      data.originData.link_token_started?.symbol ||
      data.originData.token_metadata_registered?.symbol;
  }

  const isMultihop = !!(data.originData || data.callbackData);

  const gasData = data.originData?.gas || gas;
  const refundedData = data.originData?.refunded || data.refunded;
  const refundedMoreData = toArray(
    data.originData?.refunded_more_transactions ||
      data.refunded_more_transactions
  );
  const executedGMPsData = toArray([
    data.originData,
    data,
    data.callbackData,
  ]).filter((d): d is GMPMessage => 
    d !== undefined && 
    typeof d === 'object' && 
    (
      ((d.time_spent?.call_express_executed ?? 0) > 0 &&
        ['express_executed', 'executed'].includes(d.status ?? '')) ||
      ((d.time_spent?.total ?? 0) > 0 && d.status === 'executed')
    )
  );
  const showDetails = !lite && seeMore;

  return (
    <div className={infoStyles.container}>
      <div className={infoStyles.header}>
        <h3 className={infoStyles.headerTitle}>General Message Passing</h3>
        <InfoHeader
          call={call}
          messageId={messageId}
          txhash={txhash}
          url={url}
          transactionPath={transaction_path}
          sourceChain={sourceChain}
        />
      </div>
      <div className={infoStyles.body}>
        <dl className={infoStyles.list}>
          <div className={infoStyles.section}>
            <dt className={infoStyles.label}>Method</dt>
            <dd className={infoStyles.value}>
              <Tag className={infoStyles.tagBase}>{getEvent(data)}</Tag>
            </dd>
          </div>
          <div className={infoStyles.section}>
            <dt className={infoStyles.label}>Status</dt>
            <dd className={infoStyles.value}>
              <StatusTimeline
                timeline={toArray([data.originData, data, data.callbackData]).filter((d): d is GMPMessage => d !== undefined && typeof d === 'object')}
                chains={chains}
                estimatedTimeSpent={estimatedTimeSpent}
                isMultihop={isMultihop}
                rootCall={call}
                expressExecuted={express_executed}
              />
            </dd>
          </div>
          {Object.keys({ ...buttons }).length > 0 && (
            <div className={infoStyles.section}>
              <dt className={infoStyles.label}>Recovery</dt>
              <dd className={infoStyles.value}>
                <div className={infoStyles.recoveryList}>
                  {Object.entries(buttons).map(([k, v]) => (
                    <div key={k} className={infoStyles.recoveryItem}>
                      <span className={infoStyles.recoveryItemLabel}>
                        {toTitle(k)}:
                      </span>
                      <div className={infoStyles.recoveryItemValue}>{v}</div>
                    </div>
                  ))}
                </div>
              </dd>
            </div>
          )}
          <InfoPath
            data={data}
            isMultihop={isMultihop}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
          />
          <InfoSettlement
            data={data}
            settlementForwardedEvents={settlement_forwarded_events}
            settlementFilledEvents={settlement_filled_events}
            txhash={txhash}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            executed={executed}
          />
          <InfoTransfers data={data} chains={chains} />
          {symbol && (
            <InfoSection label="Asset">
              <div className={infoStyles.tokenRow}>
                <AssetProfile
                  value={symbol}
                  chain={data.originData?.call?.chain ?? sourceChain}
                  amount={(data.originData?.amount ?? data.amount) as number | undefined}
                  ITSPossible={true}
                  onlyITS={!getEvent(data)?.includes('ContractCall')}
                  width={16}
                  height={16}
                  className={infoStyles.assetChip}
                  titleClassName="text-xs"
                />
                {!!(data.originData?.interchain_transfer?.contract_address ||
                  interchain_transfer?.contract_address) && (
                  <Tooltip
                    content="Token Address"
                    className={infoStyles.tooltip}
                  >
                    <Profile
                      address={
                        (data.originData?.interchain_transfer
                          ?.contract_address ||
                        interchain_transfer?.contract_address) as string
                      }
                      chain={data.originData?.call?.chain ?? sourceChain}
                      noResolveName={true}
                    />
                  </Tooltip>
                )}
              </div>
            </InfoSection>
          )}
          <InfoSection label="Created">
            {moment(
              ((data.originData?.call || call)?.block_timestamp ?? 0) * 1000
            ).format('MMM D, YYYY h:mm:ss A z')}
          </InfoSection>
          <InfoTime
            isMultihop={isMultihop}
            executedGMPsData={executedGMPsData}
            timeSpent={time_spent}
            status={status}
            estimatedTimeSpent={estimatedTimeSpent}
            fees={fees}
            confirm={confirm}
            approved={approved}
            call={call}
          />
          <InfoParticipants
            data={data}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            senderAddress={senderAddress}
            sourceAddress={sourceAddress}
            contractAddress={contractAddress}
            lite={lite}
            showAdditionalDetails={showDetails}
            call={call}
          />
        <InfoGasMetrics
          data={data}
          gasData={gasData}
          refundedData={refundedData}
          refundedMoreData={toArray(refundedMoreData).filter((entry): entry is GMPEventLog => 
            typeof entry === 'object' && entry !== null
          )}
          showDetails={showDetails}
          fees={fees}
          gas={gas}
          gasPaid={typeof gas_paid === 'object' ? gas_paid : undefined}
          gasPaidToCallback={data.gas_paid_to_callback_amount}
          isMultihop={isMultihop}
        />
          {showDetails && (
            <div
              className={clsx(
                infoStyles.detailsGrid,
                data.callbackData && infoStyles.detailsGridTwoCols
              )}
            >
              {[data, data.callbackData].filter((d): d is GMPMessage => d !== undefined && typeof d === 'object').map((d, i) => (
                <ContractCallData
                  key={i}
                  data={d}
                  executeData={i === 0 && executeData ? executeData : undefined}
                  isMultihop={isMultihop}
                />
              ))}
            </div>
          )}
        </dl>
      </div>
      {!lite && (
        <div className={infoStyles.toggleContainer}>
          <button
            onClick={() => setSeeMore(!seeMore)}
            className={infoStyles.toggleButton}
          >
            <span>See {seeMore ? 'Less' : 'More'}</span>
            {seeMore ? <RxCaretUp size={14} /> : <RxCaretDown size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
