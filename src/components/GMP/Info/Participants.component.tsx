import { PiWarningCircle } from 'react-icons/pi';

import { Profile } from '@/components/Profile';
import { isAxelar } from '@/lib/chain';
import { ParticipantsProps } from './Participants.types';
import { Section } from './Section.component';
import { participantsStyles } from './Participants.styles';
import { infoStyles } from './Info.styles';

export function Participants({
  data,
  sourceChain,
  destinationChain,
  senderAddress,
  sourceAddress,
  contractAddress,
  lite,
  showAdditionalDetails,
  call,
}: ParticipantsProps) {
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
      <Section label="Sender">
        {senderProfileAddress ? (
          <Profile address={senderProfileAddress} chain={senderProfileChain} />
        ) : (
          <span className={infoStyles.inlineNumberMuted}>Not available</span>
        )}
      </Section>
      {!lite && showAdditionalDetails && (
        <Section label="Source Address">
          <div className={participantsStyles.profileColumn}>
            {sourceAddressValue ? (
              <Profile
                address={sourceAddressValue}
                chain={sourceAddressChain}
              />
            ) : (
              <span className={infoStyles.inlineNumberMuted}>
                Not available
              </span>
            )}
            {(data.originData?.is_invalid_source_address ||
              data.is_invalid_source_address) && (
              <div className={participantsStyles.warningRowTall}>
                <PiWarningCircle size={20} />
                <span>Invalid Address</span>
              </div>
            )}
          </div>
        </Section>
      )}
      <Section label="Destination Contract">
        <div className={participantsStyles.profileColumn}>
          {destinationContract ? (
            <Profile
              address={destinationContract}
              chain={destinationContractChain}
              useContractLink
            />
          ) : (
            <span className={infoStyles.inlineNumberMuted}>Not available</span>
          )}
          {(data.callbackData?.is_invalid_contract_address ||
            data.is_invalid_contract_address) && (
            <div className={participantsStyles.warningRowTall}>
              <PiWarningCircle size={20} />
              <span>Invalid Contract</span>
            </div>
          )}
        </div>
      </Section>
      {effectiveRecipientAddress && (
        <Section label={recipientLabel}>
          <Profile address={effectiveRecipientAddress} chain={recipientChain} />
        </Section>
      )}
    </>
  );
}
