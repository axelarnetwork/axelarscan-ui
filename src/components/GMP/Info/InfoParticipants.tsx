import { PiWarningCircle } from 'react-icons/pi';

import { Profile } from '@/components/Profile';
import { infoStyles } from './Info.styles';
import { InfoSection } from './InfoSection';
import { InfoParticipantsProps } from './Info.types';
import { isAxelar } from '@/lib/chain';

export function InfoParticipants({
  data,
  sourceChain,
  destinationChain,
  senderAddress,
  sourceAddress,
  contractAddress,
  lite,
  showAdditionalDetails,
  call,
}: InfoParticipantsProps) {
  return (
    <>
      <InfoSection label="Sender">
        <Profile
          address={data.originData?.call?.transaction?.from || senderAddress}
          chain={data.originData?.call?.chain || sourceChain}
        />
      </InfoSection>
      {!lite && showAdditionalDetails && (
        <InfoSection label="Source Address">
          <div className={infoStyles.profileColumn}>
            <Profile
              address={data.originData?.call?.returnValues?.sender || sourceAddress}
              chain={data.originData?.call?.chain || sourceChain}
            />
            {(data.originData?.is_invalid_source_address || data.is_invalid_source_address) && (
              <div className={infoStyles.warningRowTall}>
                <PiWarningCircle size={20} />
                <span>Invalid Address</span>
              </div>
            )}
          </div>
        </InfoSection>
      )}
      <InfoSection label="Destination Contract">
        <div className={infoStyles.profileColumn}>
          <Profile
            address={
              data.callbackData?.call?.returnValues?.destinationContractAddress ||
              contractAddress
            }
            chain={
              data.callbackData?.call?.returnValues?.destinationChain ||
              destinationChain
            }
            useContractLink
          />
          {(data.callbackData?.is_invalid_contract_address || data.is_invalid_contract_address) && (
            <div className={infoStyles.warningRowTall}>
              <PiWarningCircle size={20} />
              <span>Invalid Contract</span>
            </div>
          )}
        </div>
      </InfoSection>
      {data.customValues?.recipientAddress && (
        <InfoSection
          label={
            isAxelar(call?.returnValues?.destinationChain) &&
            data.customValues.projectName === 'ITS'
              ? 'Destination Address'
              : 'Recipient'
          }
        >
          <Profile
            address={
              data.callbackData?.customValues?.recipientAddress ||
              data.customValues.recipientAddress
            }
            chain={
              data.callbackData?.call?.returnValues?.destinationChain ||
              data.customValues.destinationChain ||
              destinationChain
            }
          />
        </InfoSection>
      )}
    </>
  );
}


