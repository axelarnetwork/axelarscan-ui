'use client';

import type { EVMProfileProps } from './Profile.types';
import { SpaceIDProfile } from './SpaceIDProfile.component';
import { ENSProfile } from './ENSProfile.component';

export function EVMProfile({ chain, ...props }: EVMProfileProps) {
  switch (chain) {
    case 'binance':
    case 'arbitrum':
      return <SpaceIDProfile {...props} />;
    default:
      return <ENSProfile {...props} />;
  }
}
