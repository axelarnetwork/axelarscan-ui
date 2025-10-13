import { utils } from 'ethers';
import _ from 'lodash';
const { base64, getAddress, toUtf8String } = { ...utils };
const decodeBase64 = base64.decode;

/**
 * Converts an object to a URL query string
 *
 * @param obj - The object to convert to query string
 * @returns Query string with leading '?' or empty string if no valid entries
 *
 * @example
 * ```ts
 * objToQS({ name: 'John', age: 30 }) // '?name=John&age=30'
 * objToQS({ foo: null }) // ''
 * objToQS({}) // ''
 * ```
 */
export const objToQS = (obj: Record<string, unknown>): string => {
  const qs = Object.entries({ ...obj })
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string | number | boolean)}`
    )
    .join('&');
  if (!qs) return '';
  return `?${qs}`;
};

/**
 * Gets the ICAP (checksummed) address format for Ethereum addresses
 *
 * @param string - The address string to convert
 * @returns ICAP formatted address or original string if conversion fails
 *
 * @example
 * ```ts
 * getIcapAddress('0xabc...') // '0xAbC...' (checksummed)
 * getIcapAddress('axelar123') // 'axelar123'
 * ```
 */
export const getIcapAddress = <T>(string: T): T | string => {
  try {
    if (typeof string === 'string' && string.startsWith('0x')) {
      return getAddress(string);
    }
    return string;
  } catch (error) {
    return string;
  }
};

/**
 * Decodes a base64 encoded string to UTF-8
 *
 * @param string - The base64 encoded string
 * @returns Decoded UTF-8 string or original string if decoding fails
 *
 * @example
 * ```ts
 * base64ToString('SGVsbG8=') // 'Hello'
 * base64ToString('invalid') // 'invalid'
 * ```
 */
export const base64ToString = (string: string): string => {
  try {
    return toUtf8String(decodeBase64(string));
  } catch (error) {
    return string;
  }
};

/**
 * Extracts and encodes the last part of an IBC denom path to base64
 *
 * @param ibcDenom - The IBC denomination path
 * @returns Base64 encoded last part of the path or original denom if conversion fails
 *
 * @example
 * ```ts
 * getIBCDenomBase64('transfer/channel-0/uaxl') // base64 of 'uaxl'
 * ```
 */
export const getIBCDenomBase64 = <T>(ibcDenom: T): string | T => {
  try {
    const parts = toArray(ibcDenom, { delimiter: '/' });
    const lastPart = _.last(parts);

    if (lastPart) {
      return Buffer.from(lastPart as string).toString('base64');
    }

    return ibcDenom;
  } catch (error) {
    return ibcDenom;
  }
};

interface ChainData {
  id: string;
  prefix_address?: string;
}

/**
 * Determines the type of input based on pattern matching
 *
 * @param string - The input string to analyze
 * @param chainsData - Array of chain data for cosmos address matching
 * @returns The detected input type: 'txhash', 'evmAddress', 'domainName', 'validator', 'axelarAddress', 'cosmosAddress', 'block', or 'tx'
 *
 * @example
 * ```ts
 * getInputType('0x1234...', chains) // 'evmAddress'
 * getInputType('axelarvaloper1...', chains) // 'validator'
 * getInputType('123456', chains) // 'block'
 * getInputType('abc123', chains) // 'tx'
 * ```
 */
export const getInputType = (
  string: string | number,
  chainsData: ChainData[]
): string | undefined => {
  if (!string) return;

  // Convert number to string for pattern matching
  const inputString = typeof string === 'number' ? String(string) : string;

  const regexMap = {
    txhash: new RegExp(/^0x([A-Fa-f0-9]{64})$/, 'igm'),
    evmAddress: new RegExp(/^0x[a-fA-F0-9]{40}$/, 'igm'),
    domainName: new RegExp(
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/,
      'igm'
    ),
    validator: new RegExp('axelarvaloper.*$', 'igm'),
    axelarAddress: new RegExp('axelar.*$', 'igm'),
    cosmosAddress: Object.fromEntries(
      toArray(chainsData)
        .filter((data: unknown): data is ChainData => {
          const chain = data as ChainData;
          return !!(chain.prefix_address && chain.prefix_address !== 'axelar');
        })
        .map((chainData: ChainData) => [
          chainData.id,
          new RegExp(`${chainData.prefix_address}.*$`, 'igm'),
        ])
    ),
  };

  return (
    _.head(
      Object.entries(regexMap)
        .filter(([regexKey, regexValue]) =>
          regexKey === 'cosmosAddress'
            ? Object.entries(regexValue).findIndex(
                ([chainId, chainRegex]) =>
                  inputString.match(chainRegex as RegExp) &&
                  inputString.startsWith(
                    chainsData.find(
                      (chainData: ChainData) => chainData.id === chainId
                    )?.prefix_address || ''
                  )
              ) > -1
            : inputString.match(regexValue as RegExp)
        )
        .map(([matchedType, _regex]) => matchedType)
    ) || (!isNaN(Number(inputString)) ? 'block' : 'tx')
  );
};

/**
 * Parses a string or object to JSON with automatic quote handling
 * Uses generics to allow type inference for known return types
 *
 * @template T - The expected return type
 * @param string - The string or object to parse
 * @returns Parsed JSON object, the original object, or null if parsing fails
 *
 * @example
 * ```ts
 * toJson<{ name: string }>('{"name":"John"}') // { name: 'John' }
 * toJson('{key:value}') // { key: 'value' } (adds quotes automatically)
 * toJson({ foo: 'bar' }) // { foo: 'bar' }
 * toJson('invalid') // null
 * ```
 */
export const toJson = <T = unknown>(string: unknown): T | null => {
  if (!string) {
    return null;
  }

  if (typeof string === 'object') {
    return string as T;
  }

  try {
    let stringToParse = string;

    if (
      typeof string === 'string' &&
      string.startsWith('{') &&
      string.endsWith('}') &&
      !string.includes('"')
    ) {
      try {
        stringToParse = `{${split(string.substring(1, string.length - 1), {
          delimiter: ',',
        })
          .map(s =>
            split(s, { delimiter: ':' })
              .map(s => (typeof s === 'string' ? `"${s}"` : s))
              .join(':')
          )
          .join(',')}}`;
      } catch (error) {
        // Keep original string if transformation fails
      }
    }

    return JSON.parse(stringToParse as string) as T;
  } catch (error) {
    return null;
  }
};

/**
 * Converts a byte array to hexadecimal string
 *
 * @param byteArray - The byte array, JSON string of array, or hex string
 * @returns Hexadecimal string with '0x' prefix
 *
 * @example
 * ```ts
 * toHex([255, 16, 32]) // '0xff1020'
 * toHex('[255,16,32]') // '0xff1020'
 * toHex('0x123') // '0x123'
 * ```
 */
export const toHex = (byteArray: unknown): string => {
  let result: string = '0x';
  let processedArray: unknown = byteArray;

  // Convert JSON string to array
  if (
    typeof byteArray === 'string' &&
    byteArray.startsWith('[') &&
    byteArray.endsWith(']')
  ) {
    processedArray = toJson(byteArray);
  }

  // Process array of bytes
  if (Array.isArray(processedArray)) {
    processedArray.forEach((byte: number) => {
      result += ('0' + (byte & 0xff).toString(16)).slice(-2);
    });

    return result;
  }

  // Return as hex string
  if (typeof processedArray === 'string') {
    return processedArray;
  }

  return result;
};

/**
 * Converts a string to a specific case format with generic type preservation
 * If input is not a string, it returns the input unchanged
 *
 * @template T - The input type
 * @param string - The string to convert
 * @param _case - The case format: 'upper', 'lower', or 'normal' (default: 'normal')
 * @returns Converted string or original value if not a string
 *
 * @example
 * ```ts
 * toCase('Hello', 'upper') // 'HELLO'
 * toCase('WORLD', 'lower') // 'world'
 * toCase('Test', 'normal') // 'Test'
 * toCase(123, 'upper') // 123
 * ```
 */
export const toCase = <T>(string: T, _case = 'normal'): T | string => {
  if (typeof string !== 'string') {
    return string;
  }

  let result = string.trim();

  switch (_case) {
    case 'upper':
      result = result.toUpperCase();
      break;
    case 'lower':
      result = result.toLowerCase();
      break;
    default:
      break;
  }

  return result;
};

interface ParserOptions {
  delimiter?: string;
  toCase?: string;
  filterBlank?: boolean;
}

/**
 * Internal helper that normalizes parsing options
 *
 * @param options - The options to normalize
 * @returns Normalized options with defaults applied
 */
const getOptions = (options: ParserOptions | undefined): ParserOptions => {
  let { delimiter, toCase: _toCase, filterBlank } = { ...options };
  delimiter = typeof delimiter === 'string' ? delimiter : ',';
  _toCase = _toCase || 'normal';
  filterBlank = typeof filterBlank === 'boolean' ? filterBlank : true;
  return { ...options, delimiter, toCase: _toCase, filterBlank };
};

/**
 * Splits a string by delimiter with optional filtering and case conversion
 *
 * @param string - The string to split
 * @param options - Options for delimiter, case conversion, and blank filtering
 * @returns Array of split parts
 *
 * @example
 * ```ts
 * split('a,b,c') // ['a', 'b', 'c']
 * split('hello-world', { delimiter: '-' }) // ['hello', 'world']
 * split('A,B,C', { toCase: 'lower' }) // ['a', 'b', 'c']
 * split('a,,c', { filterBlank: true }) // ['a', 'c']
 * ```
 */
export const split = (string: unknown, options?: ParserOptions): string[] => {
  const {
    delimiter,
    toCase: _toCase,
    filterBlank,
  } = { ...getOptions(options) };

  let parts: string[];

  // Handle non-string, non-null/undefined values
  if (typeof string !== 'string' && string !== undefined && string !== null) {
    parts = [String(string)];
  } else {
    // Handle string or null/undefined
    const stringToSplit = typeof string === 'string' ? string : '';
    parts = stringToSplit
      .split(delimiter!)
      .map(s => toCase(s, _toCase) as string);
  }

  // Filter blank entries if requested
  return parts.filter(s => !filterBlank || s);
};

/**
 * Converts any value to an array with optional filtering and case conversion
 * Uses generics to preserve type information where possible
 *
 * @template T - The type of elements in the array
 * @param x - The value to convert to array
 * @param options - Options for delimiter, case conversion, and blank filtering
 * @returns Array representation of the value
 *
 * @example
 * ```ts
 * toArray('a,b,c') // ['a', 'b', 'c']
 * toArray(['a', 'b']) // ['a', 'b']
 * toArray('single') // ['single']
 * toArray(null) // []
 * ```
 */
export const toArray = <T = unknown>(
  x: T | T[],
  options?: ParserOptions
): (T | string)[] => {
  const normalizedOptions = getOptions(options);
  const { toCase: _toCase, filterBlank } = { ...normalizedOptions };

  if (Array.isArray(x)) {
    return x
      .map(_x => toCase(_x, _toCase))
      .filter(_x => !filterBlank || _x) as (T | string)[];
  }

  return split(x, options);
};

interface ErrorData {
  message?: string;
  text?: string;
}

interface ErrorLike {
  reason?: string;
  data?: ErrorData;
  message?: string;
}

interface ParsedError {
  code: string;
  message: string | undefined;
}

/**
 * Parses error objects from various sources into a standardized format
 *
 * @param error - The error object, message, or unknown error
 * @returns Object with error code and message
 *
 * @example
 * ```ts
 * parseError({ message: 'Network error' }) // { code: 'network_error', message: 'Network error' }
 * parseError({ reason: 'User rejected' }) // { code: 'user_rejected', message: 'User Rejected' }
 * parseError('Something failed') // { code: 'something_failed', message: 'Something failed' }
 * ```
 */
export const parseError = (error: unknown): ParsedError => {
  const err = error as ErrorLike;
  let message =
    err?.reason ||
    err?.data?.message ||
    err?.data?.text ||
    err?.message ||
    (typeof error === 'string' ? error : undefined);
  const code = _.slice(
    split(message, { delimiter: ' ', toCase: 'lower' }),
    0,
    2
  ).join('_');

  if (message?.includes('ACTION_REJECTED') || code === 'user_rejected') {
    message = 'User Rejected';
  }

  return { code, message };
};

/**
 * Extracts all values from an object where keys start with 'axelar'
 *
 * @param data - The object to extract values from
 * @returns Array of values whose keys start with 'axelar'
 *
 * @example
 * ```ts
 * getValuesOfAxelarAddressKey({ axelar1: 'addr1', axelar2: 'addr2', other: 'x' })
 * // ['addr1', 'addr2']
 * ```
 */
export const getValuesOfAxelarAddressKey = (
  data: Record<string, unknown>
): unknown[] =>
  Object.entries({ ...data })
    .filter(([k, v]) => k.startsWith('axelar') && v)
    .map(([_k, v]) => v);
