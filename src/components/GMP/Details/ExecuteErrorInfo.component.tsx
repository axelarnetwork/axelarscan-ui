import type { GMPEventLog, ExecuteErrorInfoProps } from '../GMP.types';
import { detailsStyles } from './Details.styles';
import { ErrorCodeDisplay } from './ErrorCodeDisplay.component';
import { ellipse } from '@/lib/string';

export function ExecuteErrorInfo({
  data,
  axelarTransactionHash,
}: ExecuteErrorInfoProps) {
  const errorData = data.error as GMPEventLog & {
    error?: {
      data?: { message?: string };
      message?: string;
      reason?: string;
      code?: string | number;
      body?: string;
    };
  };
  const error = errorData.error;
  const message = error?.data?.message || error?.message;
  const reason = error?.reason;
  const code = error?.code;
  const body = error?.body?.replaceAll('"""', '');

  return (
    <div className={detailsStyles.metaColumn}>
      {message && (!reason || !axelarTransactionHash) && (
        <div className={detailsStyles.errorText}>{ellipse(message, 256)}</div>
      )}
      {reason && (
        <div className={detailsStyles.errorEmphasis}>
          Reason: {ellipse(reason, 256)}
        </div>
      )}
      <div className={detailsStyles.columnStackLarge}>
        {code && (
          <ErrorCodeDisplay
            code={code}
            destinationChainType={data.call?.destination_chain_type}
          />
        )}
        {body && (
          <div className={detailsStyles.codeBlock}>{ellipse(body, 256)}</div>
        )}
      </div>
    </div>
  );
}
