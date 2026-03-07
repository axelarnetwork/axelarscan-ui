import { create } from 'zustand';

import type { ValidatorStoreState } from './Validators.types';

export const useValidatorStore = create<ValidatorStoreState>()(set => ({
  maintainers: null,
  setMaintainers: (data: Record<string, string[]>) =>
    set(state => ({
      ...state,
      maintainers: { ...state.maintainers, ...data },
    })),
}));
