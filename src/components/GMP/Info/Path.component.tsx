import { MdKeyboardArrowRight } from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';

import { ChainProfile } from '@/components/Profile';
import { PathProps } from './Path.types';
import { pathStyles } from './Path.styles';
import { Section } from './Section.component';

export function Path({
  data,
  isMultihop,
  sourceChain,
  destinationChain,
}: PathProps) {
  return (
    <Section label="Path">
      <div className={pathStyles.row}>
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
            <div className={pathStyles.column}>
              <ChainProfile value={destinationChain} />
              {data.is_invalid_destination_chain && (
                <div className={pathStyles.warning}>
                  <PiWarningCircle size={20} />
                  <span>Invalid Chain</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
