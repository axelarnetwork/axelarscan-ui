import { objToQS } from '@/lib/parser';

export type ApiParams = Record<string, unknown>;

const hasObjectValues = (params?: ApiParams): boolean =>
  Object.values({ ...params }).some(v => v && typeof v === 'object');

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
    headers:
      resolvedMethod === 'POST'
        ? { 'Content-Type': 'application/json' }
        : undefined,
    body: resolvedMethod === 'GET' ? undefined : JSON.stringify(params),
  }).catch((error: unknown) => {
    console.error(`[apiRequest] Network error: ${method}`, error);
    return null;
  });

  if (!response) return null;

  if (!response.ok) {
    console.error(
      `[apiRequest] ${method} responded ${response.status} ${response.statusText}`
    );
    return null;
  }

  return (await response.json()) as T;
}

export function createApiClient(baseUrl: string) {
  return <T = unknown>(
    method: string,
    params?: ApiParams,
    httpMethod: 'GET' | 'POST' = 'POST'
  ) => apiRequest<T>(baseUrl, method, params, httpMethod);
}
