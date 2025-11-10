import _ from 'lodash';
import { FiPlus } from 'react-icons/fi';
import { PiInfo } from 'react-icons/pi';

import { Number } from '@/components/Number';
import { Tooltip } from '@/components/Tooltip';
import { GMPMessage, GMPEventLog } from '../GMP.types';
import { gasStyles } from './InfoGasMetrics.styles';
import { InfoSection } from './InfoSection';
import { infoStyles } from './Info.styles';
import { isNumber, toNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { timeDiff } from '@/lib/time';

interface InfoGasMetricsProps {
  data: GMPMessage;
  gasData: GMPMessage['gas'];
  refundedData: GMPMessage['refunded'];
  refundedMoreData: GMPEventLog[];
  showDetails: boolean;
  fees: GMPMessage['fees'];
  gas: GMPMessage['gas'];
  gasPaid: GMPEventLog | undefined;
  gasPaidToCallback: number | undefined;
  isMultihop: boolean;
}

export function InfoGasMetrics({
  data,
  gasData,
  refundedData,
  refundedMoreData,
  showDetails,
  fees,
  gas,
  gasPaid,
  gasPaidToCallback,
  isMultihop,
}: InfoGasMetricsProps) {
  const executedEntry = data.originData?.executed || data.executed;
  const combinedFees = data.originData?.fees || fees;
  const refundedTotal = _.sumBy(refundedMoreData, entry => toNumber(entry.amount));

  const gasPaidAmount = toNumber(gasData?.gas_paid_amount);
  const gasRemainAmount = toNumber(gasData?.gas_remain_amount);
  const refundedAmount = refundedData?.receipt?.status
    ? isNumber(refundedData?.amount)
      ? toNumber(refundedData?.amount)
      : gasRemainAmount
    : 0;

  const gasChargedAmount = gasPaidAmount - refundedAmount - refundedTotal;

  const executionBlockTimestamp = executedEntry?.block_timestamp;
  const hasElapsedSinceExecution =
    refundedData?.receipt?.status ||
    (isNumber(executionBlockTimestamp) &&
      timeDiff((executionBlockTimestamp ?? 0) * 1000) >= 300);

  const shouldShowGasCharged =
    (!data.originData || data.originData.executed) &&
    Boolean(data.executed) &&
    isNumber(gasData?.gas_paid_amount) &&
    isNumber(gasData?.gas_remain_amount) &&
    hasElapsedSinceExecution;

  const sourceToken = combinedFees?.source_token;

  const formatTokenSuffix = (symbol?: string) =>
    symbol ? ` ${symbol}` : '';

  const renderFiPlus = (index: number) =>
    index > 0 ? <FiPlus size={18} className={infoStyles.plusIcon} /> : null;

  const renderUsdValue = (value?: number, className?: string) =>
    value && value > 0 ? (
      <Number
        value={value}
        prefix="($"
        suffix=")"
        noTooltip
        className={className ?? infoStyles.inlineNumberMuted}
      />
    ) : null;

  const gasChargedLabel = (
    <span className={infoStyles.labelInline}>
      <span className="whitespace-nowrap">Gas Charged</span>
      <Tooltip
        content="The total gas charged to users. This amount may be less than the gas used (Gas Used) due to Axelar's gas subsidy policy."
        className={infoStyles.inlineInfoTooltip}
      >
        <PiInfo className={infoStyles.infoIcon} />
      </Tooltip>
    </span>
  );

  return (
    <>
      {shouldShowGasCharged && (
        <InfoSection label={gasChargedLabel}>
          <div className={gasStyles.valueRow}>
            <Number
              value={gasChargedAmount}
              format="0,0.000000"
              suffix={formatTokenSuffix(sourceToken?.symbol)}
              noTooltip
              className={infoStyles.inlineNumber}
            />
            {renderUsdValue(
              gasChargedAmount * (sourceToken?.token_price?.usd ?? 0)
            )}
          </div>
        </InfoSection>
      )}

      {showDetails && (
        <>
          {((gasPaid && (gas?.gas_paid_amount ?? 0) > 0) || gasPaidToCallback) && (
            <InfoSection label="Gas Paid">
              <div className={gasStyles.valueRow}>
                <Number
                  value={
                    data.originData
                      ? data.originData.gas?.gas_paid_amount ?? 0
                      : gasPaid
                        ? gas?.gas_paid_amount ?? 0
                        : (gasPaidToCallback ?? 0) *
                          (combinedFees?.source_token?.gas_price ?? 0)
                  }
                  format="0,0.000000"
                  suffix={formatTokenSuffix(sourceToken?.symbol)}
                  noTooltip
                  className={infoStyles.inlineNumber}
                />
                {renderUsdValue(
                  ((data.originData
                    ? data.originData.gas?.gas_paid_amount ?? 0
                    : gasPaid
                        ? gas?.gas_paid_amount ?? 0
                        : (gasPaidToCallback ?? 0) *
                          (combinedFees?.source_token?.gas_price ?? 0))) *
                    (sourceToken?.token_price?.usd ?? 0)
                )}
              </div>
            </InfoSection>
          )}

          {(!data.originData || data.originData.executed) &&
            data.executed &&
            isNumber(gasData?.gas_used_amount) && (
              <InfoSection
                label={
                  <span className={infoStyles.labelInline}>
                    <span>Gas Used</span>
                    <Tooltip
                      content="The total gas used to accommodate the cross-chain transaction."
                      className={infoStyles.inlineInfoTooltip}
                    >
                      <PiInfo className={infoStyles.infoIcon} />
                    </Tooltip>
                  </span>
                }
              >
                <div className={gasStyles.valueRow}>
                  <Number
                    value={gasData.gas_used_amount}
                    format="0,0.000000"
                    suffix={formatTokenSuffix(sourceToken?.symbol)}
                    noTooltip
                    className={infoStyles.inlineNumber}
                  />
                  {renderUsdValue(
                    (gasData.gas_used_amount ?? 0) *
                      (sourceToken?.token_price?.usd ?? 0)
                  )}
                </div>
              </InfoSection>
            )}

          {isMultihop ? (
            <>
              {toArray([data.originData, data, data.callbackData])
                .filter((entry): entry is GMPMessage => typeof entry === 'object' && entry !== null)
                .findIndex(entry => (entry.fees?.base_fee ?? 0) > 0) > -1 && (
                <InfoSection label="Base Fee" valueClassName={infoStyles.borderedCard}>
                  {toArray([data.originData, data, data.callbackData])
                    .filter((entry): entry is GMPMessage => typeof entry === 'object' && entry !== null && entry.fees !== undefined)
                    .map((entry, index) => {
                      const entryFees = entry.fees!;
                      return (
                      <div key={index} className={gasStyles.valueRow}>
                        {renderFiPlus(index)}
                        <div className={gasStyles.valueColumn}>
                          <div className={gasStyles.valueRow}>
                            <Number
                              value={entryFees.base_fee}
                              format="0,0.000000"
                            suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
                              noTooltip
                              className={infoStyles.inlineNumber}
                            />
                            {renderUsdValue(entryFees.base_fee_usd)}
                          </div>
                          {(entryFees.source_confirm_fee ?? 0) > 0 && (
                            <>
                              <div className={gasStyles.nestedRow}>
                                <span className={infoStyles.inlineLabel}>
                                  - Confirm Fee:
                                </span>
                                <Number
                                  value={entryFees.source_confirm_fee}
                                  format="0,0.000000"
                                suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
                                  noTooltip
                                  className={gasStyles.nestedNumber}
                                />
                                {renderUsdValue(
                                  (entryFees.source_confirm_fee ?? 0) *
                                    (entryFees.source_token?.token_price?.usd ?? 0),
                                  gasStyles.nestedNumberMuted
                                )}
                              </div>
                              <div className={gasStyles.nestedRow}>
                                <span className={infoStyles.inlineLabel}>
                                  - Approve Fee:
                                </span>
                                <Number
                                  value={
                                    (entryFees.base_fee ?? 0) - (entryFees.source_confirm_fee ?? 0) > 0
                                      ? (entryFees.base_fee ?? 0) - (entryFees.source_confirm_fee ?? 0)
                                      : 0
                                  }
                                  format="0,0.000000"
                                suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
                                  noTooltip
                                  className={gasStyles.nestedNumber}
                                />
                                {renderUsdValue(
                                  ((entryFees.base_fee ?? 0) - (entryFees.source_confirm_fee ?? 0) > 0
                                    ? (entryFees.base_fee ?? 0) - (entryFees.source_confirm_fee ?? 0)
                                    : 0) *
                                    (entryFees.source_token?.token_price?.usd ?? 0),
                                  gasStyles.nestedNumberMuted
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );})}
                </InfoSection>
              )}

              {toArray([data.originData, data, data.callbackData])
                .filter((entry): entry is GMPMessage => typeof entry === 'object' && entry !== null)
                .findIndex(entry =>
                  entry.express_executed &&
                  entry.fees?.express_supported &&
                  (entry.fees.express_fee ?? 0) > 0
                ) > -1 && (
                <InfoSection label="Express Fee" valueClassName={infoStyles.borderedCard}>
                  {toArray([data.originData, data, data.callbackData])
                    .filter((entry): entry is GMPMessage => typeof entry === 'object' && entry !== null && entry.fees?.express_supported === true)
                    .map((entry, index) => {
                      const entryFees = entry.fees!;
                      return (
                      <div key={index} className={gasStyles.valueRow}>
                        {renderFiPlus(index)}
                        <div className={gasStyles.valueColumn}>
                          <div className={gasStyles.valueRow}>
                            <Number
                              value={entryFees.express_fee}
                              format="0,0.000000"
                            suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
                              noTooltip
                              className={infoStyles.inlineNumber}
                            />
                            {renderUsdValue(entryFees.express_fee_usd)}
                          </div>
                          {entryFees.source_express_fee && (
                            <>
                              {isNumber(entryFees.source_express_fee.relayer_fee) && (
                                <div className={gasStyles.nestedRow}>
                                  <span className={infoStyles.inlineLabel}>
                                    - Relayer Fee:
                                  </span>
                                  <Number
                                    value={entryFees.source_express_fee.relayer_fee}
                                    format="0,0.000000"
                                suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
                                    noTooltip
                                    className={gasStyles.nestedNumber}
                                  />
                                  {renderUsdValue(
                                    entryFees.source_express_fee.relayer_fee_usd,
                                    gasStyles.nestedNumberMuted
                                  )}
                                </div>
                              )}
                              {isNumber(
                                entryFees.source_express_fee.express_gas_overhead_fee
                              ) && (
                                <div className={gasStyles.nestedRow}>
                                  <span className={infoStyles.inlineLabel}>
                                    - Overhead Fee:
                                  </span>
                                  <Number
                                    value={entryFees.source_express_fee.express_gas_overhead_fee}
                                    format="0,0.000000"
                                suffix={formatTokenSuffix(entryFees.source_token?.symbol)}
                                    noTooltip
                                    className={gasStyles.nestedNumber}
                                  />
                                  {renderUsdValue(
                                    entryFees.source_express_fee
                                      .express_gas_overhead_fee_usd,
                                    gasStyles.nestedNumberMuted
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );})}
                </InfoSection>
              )}
            </>
          ) : (
            <>
              {(combinedFees?.base_fee ?? 0) > 0 && (
                <InfoSection label="Base Fee">
                  <div className={gasStyles.valueColumn}>
                    <div className={gasStyles.valueRow}>
                      <Number
                        value={combinedFees?.base_fee ?? 0}
                        format="0,0.000000"
                        suffix={formatTokenSuffix(sourceToken?.symbol)}
                        noTooltip
                        className={infoStyles.inlineNumber}
                      />
                      {renderUsdValue(combinedFees?.base_fee_usd)}
                    </div>
                    {(combinedFees?.source_confirm_fee ?? 0) > 0 && (
                      <>
                        <div className={gasStyles.nestedRow}>
                          <span className={infoStyles.inlineLabel}>- Confirm Fee:</span>
                          <Number
                            value={combinedFees?.source_confirm_fee ?? 0}
                            format="0,0.000000"
                        suffix={formatTokenSuffix(sourceToken?.symbol)}
                            noTooltip
                            className={gasStyles.nestedNumber}
                          />
                          {renderUsdValue(
                            (combinedFees?.source_confirm_fee ?? 0) *
                              (sourceToken?.token_price?.usd ?? 0),
                            gasStyles.nestedNumberMuted
                          )}
                        </div>
                        <div className={gasStyles.nestedRow}>
                          <span className={infoStyles.inlineLabel}>- Approve Fee:</span>
                          <Number
                            value={
                              (combinedFees?.base_fee ?? 0) - (combinedFees?.source_confirm_fee ?? 0) > 0
                                ? (combinedFees?.base_fee ?? 0) - (combinedFees?.source_confirm_fee ?? 0)
                                : 0
                            }
                            format="0,0.000000"
                        suffix={formatTokenSuffix(sourceToken?.symbol)}
                            noTooltip
                            className={gasStyles.nestedNumber}
                          />
                          {renderUsdValue(
                            ((combinedFees?.base_fee ?? 0) - (combinedFees?.source_confirm_fee ?? 0) > 0
                              ? (combinedFees?.base_fee ?? 0) - (combinedFees?.source_confirm_fee ?? 0)
                              : 0) * (sourceToken?.token_price?.usd ?? 0),
                            gasStyles.nestedNumberMuted
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </InfoSection>
              )}

              {combinedFees?.express_supported && (combinedFees.express_fee ?? 0) > 0 && (
                <InfoSection label="Express Fee">
                  <div className={gasStyles.valueColumn}>
                    <div className={gasStyles.valueRow}>
                      <Number
                        value={combinedFees.express_fee}
                        format="0,0.000000"
                        suffix={formatTokenSuffix(sourceToken?.symbol)}
                        noTooltip
                        className={infoStyles.inlineNumber}
                      />
                      {renderUsdValue(combinedFees.express_fee_usd)}
                    </div>
                    {combinedFees.source_express_fee && (
                      <>
                        {isNumber(combinedFees.source_express_fee.relayer_fee) && (
                          <div className={gasStyles.nestedRow}>
                            <span className={infoStyles.inlineLabel}>- Relayer Fee:</span>
                            <Number
                              value={combinedFees.source_express_fee.relayer_fee}
                              format="0,0.000000"
                              suffix={formatTokenSuffix(sourceToken?.symbol)}
                              noTooltip
                              className={gasStyles.nestedNumber}
                            />
                            {renderUsdValue(
                              combinedFees.source_express_fee.relayer_fee_usd,
                              gasStyles.nestedNumberMuted
                            )}
                          </div>
                        )}
                        {isNumber(
                          combinedFees.source_express_fee.express_gas_overhead_fee
                        ) && (
                          <div className={gasStyles.nestedRow}>
                            <span className={infoStyles.inlineLabel}>- Overhead Fee:</span>
                            <Number
                              value={combinedFees.source_express_fee.express_gas_overhead_fee}
                              format="0,0.000000"
                              suffix={formatTokenSuffix(sourceToken?.symbol)}
                              noTooltip
                              className={gasStyles.nestedNumber}
                            />
                            {renderUsdValue(
                              combinedFees.source_express_fee
                                .express_gas_overhead_fee_usd,
                              gasStyles.nestedNumberMuted
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </InfoSection>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}


