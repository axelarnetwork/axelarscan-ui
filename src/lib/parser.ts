import { utils } from 'ethers';
import _ from 'lodash';
const { base64, getAddress, toUtf8String } = { ...utils };
const decodeBase64 = base64.decode;
const encodeBase64 = base64.encode;

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
  const entries = Object.entries({ ...obj });

  const validEntries = entries.filter(([_, value]) => {
    return value !== undefined && value !== null;
  });

  const encodedPairs = validEntries.map(([key, value]) => {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(value as string | number | boolean);
    return `${encodedKey}=${encodedValue}`;
  });

  const queryString = encodedPairs.join('&');

  if (!queryString) {
    return '';
  }

  return `?${queryString}`;
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

const looksLikeBase64 = (value: string): boolean => {
  const normalized = value?.trim();

  if (!normalized) {
    return false;
  }

  // Must contain only valid base64 characters and optional padding
  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
  if (!base64Pattern.test(normalized)) {
    return false;
  }

  // Canonical base64 length is always a multiple of 4
  if (normalized.length % 4 !== 0) {
    return false;
  }

  return true;
};

const normalizeBase64 = (value: string): string =>
  value.replace(/=+$/, '');

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
    if (!looksLikeBase64(string)) {
      return string;
    }

    const decodedBytes = decodeBase64(string.trim());
    const decodedString = toUtf8String(decodedBytes);

    // Round-trip check to avoid false positives like plain numbers/words
    const reEncoded = encodeBase64(decodedBytes);
    if (normalizeBase64(reEncoded) !== normalizeBase64(string.trim())) {
      return string;
    }

    return decodedString;
  } catch (error) {
    return string;
  }
};

/**
 * Safely decodes a base64 encoded string to UTF-8
 * Returns the original value if it's not a string or if decoding fails
 *
 * @param value - The value to decode (may be base64 encoded string or any other type)
 * @returns Decoded UTF-8 string or original value if decoding fails
 *
 * @example
 * ```ts
 * safeBase64ToString('SGVsbG8=') // 'Hello'
 * safeBase64ToString('invalid') // 'invalid'
 * safeBase64ToString(null) // null
 * ```
 */
export const safeBase64ToString = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  return base64ToString(value);
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
  if (!string) {
    return undefined;
  }

  // Convert number to string for pattern matching
  const inputString = typeof string === 'number' ? String(string) : string;

  // Build regex patterns for different input types
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

  // Filter regexMap entries that match the input
  const matchingEntries = Object.entries(regexMap).filter(
    ([regexKey, regexValue]) => {
      if (regexKey === 'cosmosAddress') {
        // Special handling for cosmos addresses
        const cosmosEntries = Object.entries(regexValue);

        for (const [chainId, chainRegex] of cosmosEntries) {
          const matchesRegex = inputString.match(chainRegex as RegExp);

          if (matchesRegex) {
            const chain = chainsData.find(
              (chainData: ChainData) => chainData.id === chainId
            );
            const startsWithPrefix = inputString.startsWith(
              chain?.prefix_address || ''
            );

            if (startsWithPrefix) {
              return true;
            }
          }
        }

        return false;
      }

      // For other types, just check regex match
      return !!inputString.match(regexValue as RegExp);
    }
  );

  // Extract the matched type name
  const matchedTypes = matchingEntries.map(
    ([matchedType, _regex]) => matchedType
  );
  const detectedType = _.head(matchedTypes);

  // If a type was detected, return it
  if (detectedType) {
    return detectedType;
  }

  // Fallback: check if it's a block number or transaction
  const isNumeric = !isNaN(Number(inputString));
  return isNumeric ? 'block' : 'tx';
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

    // Handle unquoted JSON-like objects: {key:value} -> {"key":"value"}
    const isUnquotedObject =
      typeof string === 'string' &&
      string.startsWith('{') &&
      string.endsWith('}') &&
      !string.includes('"');

    if (isUnquotedObject) {
      try {
        // Remove outer braces
        const content = string.substring(1, string.length - 1);

        // Split by commas to get key-value pairs
        const pairs = split(content, { delimiter: ',' });

        const quotedPairs = pairs.map(pair => {
          // Split each pair by colon
          const parts = split(pair, { delimiter: ':' });

          // Add quotes to strings
          const quotedParts = parts.map(part => {
            if (typeof part === 'string') {
              return `"${part}"`;
            }
            return part;
          });

          return quotedParts.join(':');
        });

        stringToParse = `{${quotedPairs.join(',')}}`;
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
  const { delimiter, toCase: caseFormat, filterBlank } = { ...options };

  // Set default delimiter
  const normalizedDelimiter = typeof delimiter === 'string' ? delimiter : ',';

  // Set default case format
  const normalizedCase = caseFormat || 'normal';

  // Set default filterBlank
  const normalizedFilterBlank =
    typeof filterBlank === 'boolean' ? filterBlank : true;

  return {
    ...options,
    delimiter: normalizedDelimiter,
    toCase: normalizedCase,
    filterBlank: normalizedFilterBlank,
  };
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
  const normalizedOptions = getOptions(options);
  const { delimiter, toCase: caseFormat, filterBlank } = normalizedOptions;

  let parts: string[];

  // Handle non-string, non-null/undefined values (convert to string array)
  if (typeof string !== 'string' && string !== undefined && string !== null) {
    parts = [String(string)];
  } else {
    // Handle string or null/undefined
    const stringToSplit = typeof string === 'string' ? string : '';
    const splitParts = stringToSplit.split(delimiter!);

    // Apply case conversion to each part
    parts = splitParts.map(part => {
      return toCase(part, caseFormat) as string;
    });
  }

  // Filter blank entries if requested
  if (filterBlank) {
    return parts.filter(part => !!part);
  }

  return parts;
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
  const { toCase: caseFormat, filterBlank } = normalizedOptions;

  if (Array.isArray(x)) {
    // Apply case conversion to array elements
    const transformed = x.map(element => {
      return toCase(element, caseFormat);
    });

    // Filter blank entries if requested
    if (filterBlank) {
      return transformed.filter(element => !!element) as (T | string)[];
    }

    return transformed as (T | string)[];
  }

  // For non-array values, use split
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

  // Extract error message from various possible sources
  let message: string | undefined;

  if (err?.reason) {
    message = err.reason;
  } else if (err?.data?.message) {
    message = err.data.message;
  } else if (err?.data?.text) {
    message = err.data.text;
  } else if (err?.message) {
    message = err.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Generate error code from first two words
  const messageParts = split(message, { delimiter: ' ', toCase: 'lower' });
  const firstTwoWords = _.slice(messageParts, 0, 2);
  const code = firstTwoWords.join('_');

  // Handle special cases
  const isActionRejected = message?.includes('ACTION_REJECTED');
  const isUserRejected = code === 'user_rejected';

  if (isActionRejected || isUserRejected) {
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
): unknown[] => {
  const entries = Object.entries({ ...data });

  // Filter for keys starting with 'axelar' that have truthy values
  const axelarEntries = entries.filter(([key, value]) => {
    const isAxelarKey = key.startsWith('axelar');
    const hasValue = !!value;
    return isAxelarKey && hasValue;
  });

  // Extract just the values
  const values = axelarEntries.map(([_key, value]) => value);

  return values;
};
