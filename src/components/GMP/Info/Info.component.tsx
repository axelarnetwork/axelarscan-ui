import moment from 'moment';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { useChains } from '@/hooks/useGlobalData';
import { getEvent } from '@/components/GMPs';
import { Tag } from '@/components/Tag';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { GMPEventLog, GMPMessage } from '../GMP.types';
import { StatusTimeline } from '../StatusTimeline';
import { infoStyles } from './Info.styles';
import { Asset } from './Asset.component';
import { ContractCallDetails } from './ContractCallDetails.component';
import { GasMetrics } from './GasMetrics.component';
import { Header } from './Header.component';
import { Participants } from './Participants.component';
import { Path } from './Path.component';
import { Section } from './Section.component';
import { Settlement } from './Settlement.component';
import { Time } from './Time.component';
import { Transfers } from './Transfers.component';
import { RecoveryButtons } from './RecoveryButtons.component';

import { InfoProps } from './Info.types';
import { useInfoState } from './Info.hooks';

export function Info({
  data,
  estimatedTimeSpent,
  executeData,
  refreshData,
  tx,
  lite,
}: InfoProps) {
  const { seeMore, toggleSeeMore } = useInfoState();
  const chains = useChains();

  const {
    call,
    gas_paid,
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
  const contractAddress =
    typeof contractAddressValue === 'string' ? contractAddressValue : undefined;

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
  ]).filter(
    (d): d is GMPMessage =>
      d !== undefined &&
      typeof d === 'object' &&
      (((d.time_spent?.call_express_executed ?? 0) > 0 &&
        ['express_executed', 'executed'].includes(d.status ?? '')) ||
        ((d.time_spent?.total ?? 0) > 0 && d.status === 'executed'))
  );
  const showDetails = !lite && seeMore;

  const event = getEvent(data);
  const assetSourceChain = data.originData?.call?.chain ?? sourceChain;
  const assetAmount = (data.originData?.amount ?? data.amount) as
    | number
    | undefined;
  const tokenContractAddress = (data.originData?.interchain_transfer
    ?.contract_address || interchain_transfer?.contract_address) as
    | string
    | undefined;

  const timelineItems = toArray([
    data.originData,
    data,
    data.callbackData,
  ]).filter((d): d is GMPMessage => d !== undefined && typeof d === 'object');

  return (
    <div className={infoStyles.container}>
      <div className={infoStyles.header}>
        <h3 className={infoStyles.headerTitle}>General Message Passing</h3>
        <Header
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
          <Section label="Method">
            <Tag className={infoStyles.tagBase}>{event}</Tag>
          </Section>
          <Section label="Status">
            <StatusTimeline
              timeline={timelineItems}
              chains={chains}
              estimatedTimeSpent={estimatedTimeSpent}
              isMultihop={isMultihop}
              rootCall={call}
              expressExecuted={express_executed}
            />
          </Section>
          <RecoveryButtons
            data={data}
            chains={chains}
            estimatedTimeSpent={estimatedTimeSpent}
            refreshData={refreshData}
          />
          <Path
            data={data}
            isMultihop={isMultihop}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
          />
          <Settlement
            data={data}
            settlementForwardedEvents={settlement_forwarded_events}
            settlementFilledEvents={settlement_filled_events}
            txhash={txhash}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            executed={executed}
          />
          <Transfers data={data} chains={chains} />
          {symbol && (
            <Asset
              symbol={symbol}
              sourceChain={assetSourceChain}
              amount={assetAmount}
              event={event}
              contractAddress={tokenContractAddress}
            />
          )}
          <Section label="Created">
            {moment(
              ((data.originData?.call || call)?.block_timestamp ?? 0) * 1000
            ).format('MMM D, YYYY h:mm:ss A z')}
          </Section>
          <Time
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
          <Participants
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
          <GasMetrics
            data={data}
            gasData={gasData}
            refundedData={refundedData}
            refundedMoreData={toArray(refundedMoreData).filter(
              (entry): entry is GMPEventLog =>
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
            <ContractCallDetails
              data={data}
              executeData={executeData}
              isMultihop={isMultihop}
            />
          )}
        </dl>
      </div>
      {!lite && (
        <div className={infoStyles.toggleContainer}>
          <button onClick={toggleSeeMore} className={infoStyles.toggleButton}>
            <span>See {seeMore ? 'Less' : 'More'}</span>
            {seeMore ? <RxCaretUp size={14} /> : <RxCaretDown size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
