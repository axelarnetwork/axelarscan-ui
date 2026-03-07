import { create } from 'zustand';
import type { NameServicesState, ValidatorImagesState } from './Profile.types';

export const useNameServicesStore = create<NameServicesState>()(set => ({
  ens: null,
  spaceID: null,
  setENS: data => set(state => ({ ...state, ens: { ...state.ens, ...data } })),
  setSpaceID: data => set(state => ({ ...state, spaceID: { ...state.spaceID, ...data } })),
}));

export const useValidatorImagesStore = create<ValidatorImagesState>()(set => ({
  validatorImages: {},
  setValidatorImages: data =>
    set(state => ({
      ...state,
      validatorImages: { ...state.validatorImages, ...data },
    })),
}));
