import { find } from '@/lib/string';
import { toNumber } from '@/lib/number';

export const sleep = (ms = 0) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

export const getParams = (
  searchParams: URLSearchParams,
  size = 25
): Record<string, unknown> => {
  const params: Record<string, unknown> = {};

  for (const [k, v] of searchParams.entries()) {
    switch (k) {
      case 'page':
        params.from = (toNumber(v) - 1) * size;
        break;
      default:
        params[k] = v;
        break;
    }
  }

  return params;
};

export const getQueryString = (params: Record<string, unknown>) => {
  if (!(Object.keys({ ...params }).length > 0)) {
    return '';
  }

  const qs = new URLSearchParams();

  Object.entries(params)
    .filter(([k, v]) => v && !find(k, ['from']))
    .forEach(([k, v]) => {
      qs.append(k, String(v));
    });

  return `?${qs.toString()}`;
};

export const generateKeyByParams = (params: Record<string, unknown>) =>
  JSON.stringify(params);

export const isFiltered = (params: Record<string, unknown>) =>
  Object.keys({ ...params }).filter(k => !find(k, ['from'])).length > 0;
