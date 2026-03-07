import { create } from 'zustand';

import type { ChainIdState } from './Metamask.types';

export const useChainIdStore = create<ChainIdState>()(set => ({
  chainId: null,
  setChainId: data => set(state => ({ ...state, chainId: data })),
}));
