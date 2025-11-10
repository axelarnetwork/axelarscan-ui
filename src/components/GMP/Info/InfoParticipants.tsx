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
  const originCall = data.originData?.call;
  const destinationCall = data.callbackData?.call;
  const customValues = data.customValues;
  const callbackCustomValues = data.callbackData?.customValues;

  const senderProfileAddress =
    originCall?.transaction?.from ?? senderAddress ?? '';
  const senderProfileChain = originCall?.chain ?? sourceChain;

  const sourceAddressValue =
    originCall?.returnValues?.sender ?? sourceAddress ?? '';
  const sourceAddressChain = originCall?.chain ?? sourceChain;

  const destinationContract =
    destinationCall?.returnValues?.destinationContractAddress ??
    contractAddress ??
    '';
  const destinationContractChain =
    destinationCall?.returnValues?.destinationChain ?? destinationChain;

  const effectiveRecipientAddress =
    callbackCustomValues?.recipientAddress ??
    customValues?.recipientAddress ??
    '';
  const recipientChain =
    destinationCall?.returnValues?.destinationChain ??
    customValues?.destinationChain ??
    destinationChain;

  const recipientLabel =
    isAxelar(call?.returnValues?.destinationChain) &&
    customValues?.projectName === 'ITS'
      ? 'Destination Address'
      : 'Recipient';

  return (
    <>
      <InfoSection label="Sender">
        {senderProfileAddress ? (
          <Profile
            address={senderProfileAddress}
            chain={senderProfileChain}
          />
        ) : (
          <span className={infoStyles.inlineNumberMuted}>Not available</span>
        )}
      </InfoSection>
      {!lite && showAdditionalDetails && (
        <InfoSection label="Source Address">
          <div className={infoStyles.profileColumn}>
            {sourceAddressValue ? (
              <Profile
                address={sourceAddressValue}
                chain={sourceAddressChain}
              />
            ) : (
              <span className={infoStyles.inlineNumberMuted}>Not available</span>
            )}
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
          {destinationContract ? (
            <Profile
              address={destinationContract}
              chain={destinationContractChain}
              useContractLink
            />
          ) : (
            <span className={infoStyles.inlineNumberMuted}>Not available</span>
          )}
          {(data.callbackData?.is_invalid_contract_address || data.is_invalid_contract_address) && (
            <div className={infoStyles.warningRowTall}>
              <PiWarningCircle size={20} />
              <span>Invalid Contract</span>
            </div>
          )}
        </div>
      </InfoSection>
      {effectiveRecipientAddress && (
        <InfoSection label={recipientLabel}>
          <Profile
            address={effectiveRecipientAddress}
            chain={recipientChain}
          />
        </InfoSection>
      )}
    </>
  );
}


