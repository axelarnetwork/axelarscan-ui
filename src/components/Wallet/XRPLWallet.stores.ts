import { create } from 'zustand';

interface XRPLWalletState {
  address: string | null;
  setAddress: (address: string | null) => void;
}

export const useXRPLWalletStore = create<XRPLWalletState>()(set => ({
  address: null,
  setAddress: data => set(state => ({ ...state, address: data })),
}));
