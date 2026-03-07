import _ from 'lodash';
import { FiPlus } from 'react-icons/fi';

import { Number } from '@/components/Number';
import { isNumber, toNumber } from '@/lib/number';
import { timeDiff } from '@/lib/time';

import type { InfoGasMetricsProps } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { gasStyles } from './InfoGasMetrics.styles';
import { GasChargedSection } from './GasChargedSection.component';
import { GasPaidSection } from './GasPaidSection.component';
import { GasUsedSection } from './GasUsedSection.component';
import { BaseFeeSection } from './BaseFeeSection.component';
import { ExpressFeeSection } from './ExpressFeeSection.component';

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
  const refundedTotal = _.sumBy(refundedMoreData, entry =>
    toNumber(entry.amount)
  );

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
    index > 0 ? <FiPlus size={18} className={gasStyles.plusIcon} /> : null;

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

  return (
    <>
      {shouldShowGasCharged && (
        <GasChargedSection
          gasChargedAmount={gasChargedAmount}
          sourceToken={sourceToken}
          formatTokenSuffix={formatTokenSuffix}
          renderUsdValue={renderUsdValue}
        />
      )}

      {showDetails && (
        <>
          <GasPaidSection
            data={data}
            gas={gas}
            gasPaid={gasPaid}
            gasPaidToCallback={gasPaidToCallback}
            combinedFees={combinedFees}
            sourceToken={sourceToken}
            formatTokenSuffix={formatTokenSuffix}
            renderUsdValue={renderUsdValue}
          />

          <GasUsedSection
            data={data}
            gasData={gasData}
            sourceToken={sourceToken}
            formatTokenSuffix={formatTokenSuffix}
            renderUsdValue={renderUsdValue}
          />

          <BaseFeeSection
            data={data}
            isMultihop={isMultihop}
            combinedFees={combinedFees}
            sourceTokenSymbol={sourceToken?.symbol}
            formatTokenSuffix={formatTokenSuffix}
            renderUsdValue={renderUsdValue}
            renderFiPlus={renderFiPlus}
          />

          <ExpressFeeSection
            data={data}
            isMultihop={isMultihop}
            combinedFees={combinedFees}
            sourceTokenSymbol={sourceToken?.symbol}
            formatTokenSuffix={formatTokenSuffix}
            renderUsdValue={renderUsdValue}
            renderFiPlus={renderFiPlus}
          />
        </>
      )}
    </>
  );
}
