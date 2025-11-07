/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import _ from 'lodash';
import { FiPlus } from 'react-icons/fi';
import { PiInfo } from 'react-icons/pi';

import { Number } from '@/components/Number';
import { Tooltip } from '@/components/Tooltip';
import { GMPMessage } from '../GMP.types';
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
  refundedMoreData: GMPMessage['refunded_more_transactions'];
  showDetails: boolean;
  fees: GMPMessage['fees'];
  gas: GMPMessage['gas'];
  gasPaid: GMPMessage['gas_paid'];
  gasPaidToCallback: GMPMessage['gas_paid_to_callback'];
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
  const refundedTotal =
    _.sumBy(toArray(refundedMoreData), d => toNumber(d.amount)) || 0;

  const gasPaidAmount = gasData?.gas_paid_amount ?? 0;
  const refundedAmount = isNumber(refundedData?.amount)
    ? Number(refundedData.amount)
    : gasData?.gas_remain_amount ?? 0;

  const gasChargedAmount =
    gasPaidAmount - (refundedData?.receipt?.status ? refundedAmount : 0) - refundedTotal;

  const shouldShowGasCharged =
    (!data.originData || data.originData.executed) &&
    data.executed &&
    isNumber(gasData?.gas_paid_amount) &&
    isNumber(gasData?.gas_remain_amount) &&
    (refundedData?.receipt?.status ||
      (executedEntry?.block_timestamp
        ? timeDiff(executedEntry.block_timestamp * 1000) >= 300
        : false));

  const sourceToken = combinedFees?.source_token;

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
              suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
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
          {((gasPaid && gas?.gas_paid_amount > 0) || gasPaidToCallback) && (
            <InfoSection label="Gas Paid">
              <div className={gasStyles.valueRow}>
                <Number
                  value={
                    data.originData
                      ? data.originData.gas?.gas_paid_amount
                      : gasPaid
                        ? gas?.gas_paid_amount
                        : (gasPaidToCallback || 0) *
                          (combinedFees?.source_token?.gas_price ?? 0)
                  }
                  format="0,0.000000"
                  suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
                  noTooltip
                  className={infoStyles.inlineNumber}
                />
                {renderUsdValue(
                  ((data.originData
                    ? data.originData.gas?.gas_paid_amount
                    : gasPaid
                        ? gas?.gas_paid_amount
                        : (gasPaidToCallback || 0) *
                          (combinedFees?.source_token?.gas_price ?? 0)) ?? 0) *
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
                    suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
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
              {toArray([data.originData, data, data.callbackData]).findIndex(
                entry => entry?.fees?.base_fee > 0
              ) > -1 && (
                <InfoSection label="Base Fee" valueClassName={infoStyles.borderedCard}>
                  {toArray([data.originData, data, data.callbackData])
                    .filter(entry => entry?.fees)
                    .map((entry, index) => (
                      <div key={index} className={gasStyles.valueRow}>
                        {renderFiPlus(index)}
                        <div className={gasStyles.valueColumn}>
                          <div className={gasStyles.valueRow}>
                            <Number
                              value={entry.fees.base_fee}
                              format="0,0.000000"
                              suffix={` ${entry.fees.source_token?.symbol ?? ''}`.trim()}
                              noTooltip
                              className={infoStyles.inlineNumber}
                            />
                            {renderUsdValue(entry.fees.base_fee_usd)}
                          </div>
                          {entry.fees.source_confirm_fee > 0 && (
                            <>
                              <div className={gasStyles.nestedRow}>
                                <span className={infoStyles.inlineLabel}>
                                  - Confirm Fee:
                                </span>
                                <Number
                                  value={entry.fees.source_confirm_fee}
                                  format="0,0.000000"
                                  suffix={` ${entry.fees.source_token?.symbol ?? ''}`.trim()}
                                  noTooltip
                                  className={gasStyles.nestedNumber}
                                />
                                {renderUsdValue(
                                  entry.fees.source_confirm_fee *
                                    (entry.fees.source_token?.token_price?.usd ?? 0),
                                  gasStyles.nestedNumberMuted
                                )}
                              </div>
                              <div className={gasStyles.nestedRow}>
                                <span className={infoStyles.inlineLabel}>
                                  - Approve Fee:
                                </span>
                                <Number
                                  value={
                                    entry.fees.base_fee - entry.fees.source_confirm_fee > 0
                                      ? entry.fees.base_fee - entry.fees.source_confirm_fee
                                      : 0
                                  }
                                  format="0,0.000000"
                                  suffix={` ${entry.fees.source_token?.symbol ?? ''}`.trim()}
                                  noTooltip
                                  className={gasStyles.nestedNumber}
                                />
                                {renderUsdValue(
                                  (entry.fees.base_fee - entry.fees.source_confirm_fee > 0
                                    ? entry.fees.base_fee - entry.fees.source_confirm_fee
                                    : 0) *
                                    (entry.fees.source_token?.token_price?.usd ?? 0),
                                  gasStyles.nestedNumberMuted
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </InfoSection>
              )}

              {toArray([data.originData, data, data.callbackData]).findIndex(
                entry =>
                  entry?.express_executed &&
                  entry?.fees?.express_supported &&
                  entry.fees.express_fee > 0
              ) > -1 && (
                <InfoSection label="Express Fee" valueClassName={infoStyles.borderedCard}>
                  {toArray([data.originData, data, data.callbackData])
                    .filter(entry => entry?.fees?.express_supported)
                    .map((entry, index) => (
                      <div key={index} className={gasStyles.valueRow}>
                        {renderFiPlus(index)}
                        <div className={gasStyles.valueColumn}>
                          <div className={gasStyles.valueRow}>
                            <Number
                              value={entry.fees.express_fee}
                              format="0,0.000000"
                              suffix={` ${entry.fees.source_token?.symbol ?? ''}`.trim()}
                              noTooltip
                              className={infoStyles.inlineNumber}
                            />
                            {renderUsdValue(entry.fees.express_fee_usd)}
                          </div>
                          {entry.fees.source_express_fee && (
                            <>
                              {isNumber(entry.fees.source_express_fee.relayer_fee) && (
                                <div className={gasStyles.nestedRow}>
                                  <span className={infoStyles.inlineLabel}>
                                    - Relayer Fee:
                                  </span>
                                  <Number
                                    value={entry.fees.source_express_fee.relayer_fee}
                                    format="0,0.000000"
                                    suffix={` ${entry.fees.source_token?.symbol ?? ''}`.trim()}
                                    noTooltip
                                    className={gasStyles.nestedNumber}
                                  />
                                  {renderUsdValue(
                                    entry.fees.source_express_fee.relayer_fee_usd,
                                    gasStyles.nestedNumberMuted
                                  )}
                                </div>
                              )}
                              {isNumber(
                                entry.fees.source_express_fee.express_gas_overhead_fee
                              ) && (
                                <div className={gasStyles.nestedRow}>
                                  <span className={infoStyles.inlineLabel}>
                                    - Overhead Fee:
                                  </span>
                                  <Number
                                    value={entry.fees.source_express_fee.express_gas_overhead_fee}
                                    format="0,0.000000"
                                    suffix={` ${entry.fees.source_token?.symbol ?? ''}`.trim()}
                                    noTooltip
                                    className={gasStyles.nestedNumber}
                                  />
                                  {renderUsdValue(
                                    entry.fees.source_express_fee
                                      .express_gas_overhead_fee_usd,
                                    gasStyles.nestedNumberMuted
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </InfoSection>
              )}
            </>
          ) : (
            <>
              {combinedFees?.base_fee > 0 && (
                <InfoSection label="Base Fee">
                  <div className={gasStyles.valueColumn}>
                    <div className={gasStyles.valueRow}>
                      <Number
                        value={combinedFees.base_fee}
                        format="0,0.000000"
                        suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
                        noTooltip
                        className={infoStyles.inlineNumber}
                      />
                      {renderUsdValue(combinedFees.base_fee_usd)}
                    </div>
                    {combinedFees.source_confirm_fee > 0 && (
                      <>
                        <div className={gasStyles.nestedRow}>
                          <span className={infoStyles.inlineLabel}>- Confirm Fee:</span>
                          <Number
                            value={combinedFees.source_confirm_fee}
                            format="0,0.000000"
                            suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
                            noTooltip
                            className={gasStyles.nestedNumber}
                          />
                          {renderUsdValue(
                            combinedFees.source_confirm_fee *
                              (sourceToken?.token_price?.usd ?? 0),
                            gasStyles.nestedNumberMuted
                          )}
                        </div>
                        <div className={gasStyles.nestedRow}>
                          <span className={infoStyles.inlineLabel}>- Approve Fee:</span>
                          <Number
                            value={
                              combinedFees.base_fee - combinedFees.source_confirm_fee > 0
                                ? combinedFees.base_fee - combinedFees.source_confirm_fee
                                : 0
                            }
                            format="0,0.000000"
                            suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
                            noTooltip
                            className={gasStyles.nestedNumber}
                          />
                          {renderUsdValue(
                            (combinedFees.base_fee - combinedFees.source_confirm_fee > 0
                              ? combinedFees.base_fee - combinedFees.source_confirm_fee
                              : 0) * (sourceToken?.token_price?.usd ?? 0),
                            gasStyles.nestedNumberMuted
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </InfoSection>
              )}

              {combinedFees?.express_supported && combinedFees.express_fee > 0 && (
                <InfoSection label="Express Fee">
                  <div className={gasStyles.valueColumn}>
                    <div className={gasStyles.valueRow}>
                      <Number
                        value={combinedFees.express_fee}
                        format="0,0.000000"
                        suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
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
                              suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
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
                              suffix={` ${sourceToken?.symbol ?? ''}`.trim()}
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


