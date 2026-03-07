import { objToQS } from '@/lib/parser';

export type ApiParams = Record<string, unknown>;

const hasObjectValues = (params?: ApiParams): boolean =>
  Object.values({ ...params }).some((v) => v && typeof v === 'object');

export async function apiRequest<T = unknown>(
  baseUrl: string,
  method: string,
  params?: ApiParams,
  httpMethod: 'GET' | 'POST' = 'POST'
): Promise<T | null> {
  const resolvedMethod = hasObjectValues(params) ? 'POST' : httpMethod;

  const url = `${baseUrl}/${method}${resolvedMethod === 'GET' ? objToQS(params ?? {}) : ''}`;

  const response = await fetch(url, {
    method: resolvedMethod,
    body: resolvedMethod === 'GET' ? undefined : JSON.stringify(params),
  }).catch(() => null);

  return response ? ((await response.json()) as T) : null;
}

export function createApiClient(baseUrl: string) {
  return <T = unknown>(
    method: string,
    params?: ApiParams,
    httpMethod: 'GET' | 'POST' = 'POST'
  ) => apiRequest<T>(baseUrl, method, params, httpMethod);
}
