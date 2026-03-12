import { create } from 'zustand';

interface SuiWalletState {
  address: string | null;
  setAddress: (address: string | null) => void;
}

export const useSuiWalletStore = create<SuiWalletState>()(set => ({
  address: null,
  setAddress: data => set(state => ({ ...state, address: data })),
}));
