import clsx from 'clsx';
import { MdKeyboardArrowRight, MdOutlineTimer } from 'react-icons/md';
import { RiTimerFlashLine } from 'react-icons/ri';

import { Copy } from '@/components/Copy';
import { useGlobalStore } from '@/components/Global';
import { getEvent } from '@/components/GMPs';
import { ChainProfile } from '@/components/Profile';
import { Tag } from '@/components/Tag';
import { TimeSpent } from '@/components/Time';
import { isAxelar } from '@/lib/chain';
import { getAssetData, getChainData } from '@/lib/config';
import { toCase } from '@/lib/parser';

import { AssetAddressEntry, AssetDataEntry } from '../GMP.types';
import { contractCallDataStyles } from './ContractCallData.styles';
import { ContractCallDataProps } from './ContractCallData.types';

const statusColorByState: Record<string, string> = {
  received: 'bg-green-600 dark:bg-green-500',
  approved: 'bg-orange-500 dark:bg-orange-600',
  failed: 'bg-red-600 dark:bg-red-500',
};

const DEFAULT_STATUS_COLOR = 'bg-yellow-400 dark:bg-yellow-500';

function getStatusTagClass(status?: string): string {
  if (!status) {
    return DEFAULT_STATUS_COLOR;
  }

  return statusColorByState[status] ?? DEFAULT_STATUS_COLOR;
}

export function ContractCallData({
  data,
  executeData,
  isMultihop,
}: ContractCallDataProps) {
  const { chains, assets } = useGlobalStore();

  if (!data) {
    return null;
  }

  const { call, approved, time_spent, status } = { ...data };

  const sourceChain =
    approved?.returnValues?.sourceChain ||
    (isAxelar(call?.chain)
      ? call?.chain
      : getChainData(call?.chain, chains)?.chain_name || call?.chain);
  const destinationChain =
    call?.returnValues?.destinationChain ||
    getChainData(approved?.chain, chains)?.chain_name ||
    approved?.chain;
  const symbol =
    call?.returnValues?.symbol ||
    data.interchain_transfer?.symbol ||
    data.token_manager_deployment_started?.symbol ||
    data.interchain_token_deployment_started?.tokenSymbol ||
    data.link_token_started?.symbol ||
    data.token_metadata_registered?.symbol;
  const assetEntry = getAssetData(symbol, assets) as AssetDataEntry | undefined;
  const assetAddresses = assetEntry?.addresses;
  const destinationKeyCandidate = toCase(destinationChain ?? '', 'lower');
  let destinationAssetConfig: AssetAddressEntry | undefined;
  if (assetAddresses) {
    let lookupKey: string | undefined;

    if (typeof destinationKeyCandidate === 'string') {
      lookupKey = destinationKeyCandidate;
    } else if (typeof destinationKeyCandidate === 'number') {
      lookupKey = destinationKeyCandidate.toString();
    }

    if (lookupKey) {
      destinationAssetConfig = assetAddresses[lookupKey];
    }
  }

  const messageId = data.message_id;
  const commandId = approved?.returnValues?.commandId || data.command_id;
  const sourceAddress = call?.returnValues?.sender;
  const destinationContractAddress =
    approved?.returnValues?.contractAddress ||
    call?.returnValues?.destinationContractAddress;
  const payloadHash = call?.returnValues?.payloadHash;
  const payload = call?.returnValues?.payload;
  const sourceSymbol = call?.returnValues?.symbol;
  const destinationSymbol =
    approved?.returnValues?.symbol ||
    destinationAssetConfig?.symbol ||
    sourceSymbol;
  const amountInUnits =
    approved?.returnValues?.amount || call?.returnValues?.amount;

  return (
    <div className={contractCallDataStyles.container}>
      <dl className={contractCallDataStyles.list}>
        <div className={contractCallDataStyles.section}>
          <dd className={contractCallDataStyles.value}>
            <div className={contractCallDataStyles.chainRow}>
              <ChainProfile
                value={sourceChain}
                width={20}
                height={20}
                className={contractCallDataStyles.chainProfileIcon}
                titleClassName={contractCallDataStyles.chainTitle}
              />
              <MdKeyboardArrowRight size={20} />
              <ChainProfile
                value={destinationChain}
                width={20}
                height={20}
                className={contractCallDataStyles.chainProfileIcon}
                titleClassName={contractCallDataStyles.chainTitle}
              />
            </div>
          </dd>
        </div>
        {isMultihop && (
          <>
            <div className={contractCallDataStyles.section}>
              <dt className={contractCallDataStyles.label}>Status</dt>
              <dd className={contractCallDataStyles.value}>
                <Tag
                  className={clsx(
                    contractCallDataStyles.statusTag,
                    getStatusTagClass(data.simplified_status)
                  )}
                >
                  {data.simplified_status === 'received' &&
                  (getEvent(data) === 'ContractCall' ||
                    (getEvent(data) === 'InterchainTransfer' &&
                      isAxelar(call?.returnValues?.destinationChain)))
                    ? 'Executed'
                    : data.simplified_status}
                </Tag>
              </dd>
            </div>
            {(time_spent?.call_express_executed || time_spent?.total) && (
              <div className={contractCallDataStyles.section}>
                <dt className={contractCallDataStyles.label}>Time Spent</dt>
                <dd className={contractCallDataStyles.value}>
                  <div className={contractCallDataStyles.timeSpentList}>
                    {time_spent?.call_express_executed &&
                      ['express_executed', 'executed'].includes(
                        status ?? ''
                      ) && (
                        <div
                          className={contractCallDataStyles.timeSpentExpress}
                        >
                          <RiTimerFlashLine size={20} />
                          <TimeSpent
                            fromTimestamp={0}
                            toTimestamp={
                              (time_spent.call_express_executed ?? 0) * 1000
                            }
                          />
                        </div>
                      )}
                    {time_spent?.total && status === 'executed' && (
                      <div className={contractCallDataStyles.timeSpentTotal}>
                        <MdOutlineTimer size={20} />
                        <TimeSpent
                          fromTimestamp={0}
                          toTimestamp={(time_spent.total ?? 0) * 1000}
                        />
                      </div>
                    )}
                  </div>
                </dd>
              </div>
            )}
          </>
        )}
        {messageId && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>messageId</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={messageId}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.copyText}>
                  {messageId}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {commandId && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>commandId</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={commandId}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.copyText}>
                  {commandId}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {sourceChain && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>sourceChain</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={sourceChain}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.chainLabel}>
                  {sourceChain}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {destinationChain && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>destinationChain</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={destinationChain}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.chainLabel}>
                  {destinationChain}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {sourceAddress && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>sourceAddress</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={sourceAddress}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.copyText}>
                  {sourceAddress}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {destinationContractAddress && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>
              destinationContractAddress
            </dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={destinationContractAddress}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.copyText}>
                  {destinationContractAddress}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {payloadHash && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>payloadHash</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={payloadHash}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.copyText}>
                  {payloadHash}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {payload && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>payload</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={payload}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.copyText}>
                  {payload}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {sourceSymbol && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>sourceSymbol</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={sourceSymbol}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.chainLabel}>
                  {sourceSymbol}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {destinationSymbol && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>destinationSymbol</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={destinationSymbol}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.chainLabel}>
                  {destinationSymbol}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {amountInUnits && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>amount</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={amountInUnits}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.chainLabel}>
                  {amountInUnits}
                </span>
              </Copy>
            </dd>
          </div>
        )}
        {executeData && (
          <div className={contractCallDataStyles.section}>
            <dt className={contractCallDataStyles.label}>executeData</dt>
            <dd className={contractCallDataStyles.value}>
              <Copy
                size={16}
                value={executeData}
                childrenClassName={contractCallDataStyles.copyWrapper}
                className={contractCallDataStyles.copyButton}
              >
                <span className={contractCallDataStyles.copyText}>
                  {executeData}
                </span>
              </Copy>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
