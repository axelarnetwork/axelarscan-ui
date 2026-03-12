import { getContracts, getConfigurations } from '@/lib/api/gmp';

export const fetchContracts = async () => {
  return (await getContracts()) ?? null;
};

export const fetchConfigurations = async () => {
  return (await getConfigurations()) ?? null;
};
