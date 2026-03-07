import type { HopLinksProps } from '../GMP.types';
import { PrevHopLink } from './PrevHopLink.component';
import { NextHopLinks } from './NextHopLinks.component';

export function HopLinks({
  sourceChain,
  destinationChain,
  parentMessageID,
  childMessageIDs,
}: HopLinksProps) {
  return (
    <>
      <PrevHopLink
        sourceChain={sourceChain}
        parentMessageID={parentMessageID}
      />
      <NextHopLinks
        destinationChain={destinationChain}
        childMessageIDs={childMessageIDs}
      />
    </>
  );
}
