import { MdKeyboardArrowRight } from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';

import { ChainProfile } from '@/components/Profile';
import { InfoPathProps } from './InfoPath.types';
import { infoPathStyles } from './InfoPath.styles';
import { InfoSection } from './InfoSection';

export function InfoPath({
  data,
  isMultihop,
  sourceChain,
  destinationChain,
}: InfoPathProps) {
  return (
    <InfoSection label="Path">
      <div className={infoPathStyles.row}>
        {isMultihop ? (
          <>
            <ChainProfile
              value={data.originData?.call?.chain || sourceChain}
              titleClassName="text-base font-semibold"
            />
            <MdKeyboardArrowRight size={24} />
            <ChainProfile
              value={
                data.originData?.call?.returnValues?.destinationChain ||
                destinationChain
              }
              titleClassName="text-base font-semibold"
            />
            <MdKeyboardArrowRight size={24} />
            {data.originData?.call && data.callbackData?.call && (
              <>
                <ChainProfile
                  value={data.callbackData.call.chain}
                  titleClassName="text-base font-semibold"
                />
                <MdKeyboardArrowRight size={24} />
              </>
            )}
            <ChainProfile
              value={
                data.callbackData?.call?.returnValues?.destinationChain ||
                destinationChain
              }
              titleClassName="text-base font-semibold"
            />
          </>
        ) : (
          <>
            <ChainProfile value={sourceChain} />
            <MdKeyboardArrowRight size={24} />
            <div className={infoPathStyles.column}>
              <ChainProfile value={destinationChain} />
              {data.is_invalid_destination_chain && (
                <div className={infoPathStyles.warning}>
                  <PiWarningCircle size={20} />
                  <span>Invalid Chain</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </InfoSection>
  );
}
