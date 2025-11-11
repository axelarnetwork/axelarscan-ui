import { MdKeyboardArrowRight } from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';

import { ChainProfile } from '@/components/Profile';
import { infoStyles } from './Info.styles';
import { InfoPathProps } from './Info.types';
import { InfoSection } from './InfoSection';

export function InfoPath({
  data,
  isMultihop,
  sourceChain,
  destinationChain,
}: InfoPathProps) {
  return (
    <InfoSection label="Path">
      <div className={infoStyles.pathRow}>
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
            <div className={infoStyles.pathColumn}>
              <ChainProfile value={destinationChain} />
              {data.is_invalid_destination_chain && (
                <div className={infoStyles.warningRow}>
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
