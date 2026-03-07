import type { Validator } from '@/types';
import { getValidators, getVerifiers } from '@/lib/api/validator';

interface ValidatorsResponse {
  data?: Validator[];
}

interface VerifiersResponse {
  data?: unknown[];
  verifiersByChain?: Record<string, unknown[]>;
}

export const fetchValidators = async (): Promise<Validator[] | null> => {
  const result = await getValidators() as ValidatorsResponse | null;
  return result?.data ?? null;
};

export const fetchVerifiers = async () => {
  const result = await getVerifiers() as VerifiersResponse | null;
  return {
    verifiers: result?.data ?? null,
    verifiersByChain: result?.verifiersByChain ?? null,
  };
};
