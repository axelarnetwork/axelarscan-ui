import _ from 'lodash';

import { split, toArray, toCase } from '@/lib/parser';

/**
 * Type guard that checks if a value is a string
 *
 * @param string - The value to check
 * @returns True if the value is a string, false otherwise
 *
 * @example
 * ```ts
 * isString('hello') // true
 * isString(123) // false
 * isString(null) // false
 * ```
 */
export const isString = (string: unknown): string is string => {
  return typeof string === 'string';
};

/**
 * Compares two strings for equality, ignoring case sensitivity
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal (case-insensitive) or both are falsy
 *
 * @example
 * ```ts
 * equalsIgnoreCase('Hello', 'hello') // true
 * equalsIgnoreCase('ABC', 'abc') // true
 * equalsIgnoreCase(null, null) // true
 * equalsIgnoreCase('hello', 'world') // false
 * ```
 */
export const equalsIgnoreCase = (
  a: string | null | undefined,
  b: string | null | undefined
): boolean => {
  if (!a && !b) {
    return true;
  }

  return toCase(a, 'lower') === toCase(b, 'lower');
};

/**
 * Capitalizes the first character of a string
 *
 * @param string - The string to capitalize
 * @returns The string with the first character uppercased, or empty string if not a string
 *
 * @example
 * ```ts
 * capitalize('hello') // 'Hello'
 * capitalize('world') // 'World'
 * capitalize('') // ''
 * capitalize(123) // ''
 * ```
 */
export const capitalize = (string: unknown): string => {
  if (!isString(string)) {
    return '';
  }

  if (string.length === 0) {
    return '';
  }

  return `${string[0].toUpperCase()}${string.slice(1)}`;
};

/**
 * Converts a delimited string to camelCase
 *
 * @param string - The string to convert
 * @param delimiter - The delimiter to split on (default: '_')
 * @returns The camelCased string
 *
 * @example
 * ```ts
 * camel('hello_world') // 'helloWorld'
 * camel('foo_bar_baz') // 'fooBarBaz'
 * camel('hello-world', '-') // 'helloWorld'
 * ```
 */
export const camel = (string: unknown, delimiter = '_'): string => {
  const parts = toArray(string, { delimiter });

  const camelCased = parts.map((part, index) => {
    if (index > 0) {
      return capitalize(part);
    }
    return String(part);
  });

  return camelCased.join('');
};

/**
 * Removes all double quotes from a string
 *
 * @param string - The string to process
 * @returns The string without double quotes, or the original value if not a string
 *
 * @example
 * ```ts
 * removeDoubleQuote('"hello"') // 'hello'
 * removeDoubleQuote('say "hi"') // 'say hi'
 * removeDoubleQuote(123) // 123
 * ```
 */
export const removeDoubleQuote = <T>(string: T): T | string => {
  if (!isString(string)) {
    return string;
  }

  return split(string, { delimiter: '"' }).join('');
};

/**
 * Removes the '0x' prefix from a hexadecimal string
 *
 * @param string - The string to process
 * @returns The string without '0x' prefix if present, or the original value if not a string
 *
 * @example
 * ```ts
 * removeHexPrefix('0x1234abcd') // '1234abcd'
 * removeHexPrefix('1234abcd') // '1234abcd'
 * removeHexPrefix(123) // 123
 * ```
 */
export const removeHexPrefix = <T>(string: T): T | string => {
  if (!isString(string)) {
    return string;
  }

  if (string.startsWith('0x')) {
    return string.slice(2);
  }

  return string;
};

/**
 * Converts a value to a boolean
 *
 * @param string - The value to convert (string, boolean, or unknown)
 * @param defaultValue - The default value to return if conversion is not possible (default: true)
 * @returns The boolean representation of the value
 *
 * @example
 * ```ts
 * toBoolean('true') // true
 * toBoolean('false') // false
 * toBoolean('TRUE') // true (case-insensitive)
 * toBoolean(true) // true
 * toBoolean(123) // true (default)
 * toBoolean(null, false) // false (uses defaultValue)
 * ```
 */
export const toBoolean = (
  string: string | boolean | unknown,
  defaultValue = true
): boolean => {
  if (typeof string === 'boolean') {
    return string;
  }

  if (!isString(string)) {
    return defaultValue;
  }

  return equalsIgnoreCase(string, 'true');
};

/**
 * Gets the first part of a delimited string
 *
 * @param string - The string to split
 * @param delimiter - The delimiter to split on (default: '-')
 * @returns The first part of the split string, or undefined if empty
 *
 * @example
 * ```ts
 * headString('hello-world-foo') // 'hello'
 * headString('a-b-c', '-') // 'a'
 * headString('one_two', '_') // 'one'
 * ```
 */
export const headString = (
  string: unknown,
  delimiter = '-'
): string | undefined => {
  const parts = split(string, { delimiter });
  return _.head(parts);
};

/**
 * Gets the last part of a delimited string
 *
 * @param string - The string to split
 * @param delimiter - The delimiter to split on (default: '-')
 * @returns The last part of the split string, or undefined if empty
 *
 * @example
 * ```ts
 * lastString('hello-world-foo') // 'foo'
 * lastString('a-b-c', '-') // 'c'
 * lastString('one_two', '_') // 'two'
 * lastString('') // ''
 * lastString(123) // '123'
 * ```
 */
export const lastString = (
  string: unknown,
  delimiter = '-'
): string | undefined => {
  const parts = split(string, { delimiter });
  return _.last(parts);
};

/**
 * Finds an element in an array that matches the given value (case-insensitive)
 *
 * @param searchValue - The value to search for
 * @param elements - The array of elements to search in
 * @returns The first matching element, or undefined if not found
 *
 * @example
 * ```ts
 * find('hello', ['Hello', 'World']) // 'Hello'
 * find('WORLD', ['hello', 'world']) // 'world'
 * find('foo', ['bar', 'baz']) // undefined
 * ```
 */
export const find = (
  searchValue: string,
  elements: string[]
): string | undefined => {
  const array = toArray(elements);

  return array.find(element => {
    return equalsIgnoreCase(String(element), searchValue);
  });
};

/**
 * Checks if any of the given patterns are included in any of the strings
 *
 * @param searchInput - The string or array of strings to search in
 * @param patterns - The pattern or array of patterns to search for
 * @returns True if any pattern is found in any string
 *
 * @example
 * ```ts
 * includesSomePatterns('hello world', ['world']) // true
 * includesSomePatterns(['foo', 'bar'], ['ar']) // true
 * includesSomePatterns('hello', ['world', 'foo']) // false
 * ```
 */
export const includesSomePatterns = (
  searchInput: string | string[],
  patterns: string | string[]
): boolean => {
  const patternArray = toArray(patterns);
  const stringArray = toArray(searchInput);

  for (const pattern of patternArray) {
    for (const inputString of stringArray) {
      const patternStr = String(pattern);
      const inputStr = String(inputString);

      if (inputStr.includes(patternStr)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Truncates a long string with ellipsis in the middle
 *
 * @param string - The string to truncate
 * @param length - The number of characters to keep at each end (default: 10)
 * @param prefix - Optional prefix to preserve at the start (default: '')
 * @returns The truncated string with '...' in the middle, or the original if short enough
 *
 * @example
 * ```ts
 * ellipse('0x1234567890abcdef', 4) // '0x1234...cdef'
 * ellipse('verylongaddress123456789', 5) // 'veryl...56789'
 * ellipse('short') // 'short'
 * ellipse('0x123456789', 3, '0x') // '0x123...789'
 * ```
 */
export const ellipse = (string: unknown, length = 10, prefix = ''): string => {
  if (!isString(string) || !string) {
    return '';
  }

  if (string.length < length * 2 + 3) {
    return string;
  }

  const prefixToAdd = string.startsWith(prefix) ? prefix : '';
  const stringWithoutPrefix = string.replace(prefix, '');
  const start = stringWithoutPrefix.slice(0, length);
  const end = stringWithoutPrefix.slice(-length);

  return `${prefixToAdd}${start}...${end}`;
};

/**
 * Converts a delimited string to a title format
 *
 * @param string - The string to convert
 * @param delimiter - The delimiter to split on (default: '_')
 * @param isCapitalize - Whether to capitalize each word (default: false)
 * @param noSpace - Whether to join without spaces (default: false)
 * @returns The formatted title string
 *
 * @example
 * ```ts
 * toTitle('hello_world') // 'hello world'
 * toTitle('hello_world', '_', true) // 'Hello World'
 * toTitle('foo-bar', '-') // 'foo bar'
 * toTitle('snake_case', '_', true, true) // 'SnakeCase'
 * ```
 */
export const toTitle = (
  string: unknown,
  delimiter = '_',
  isCapitalize = false,
  noSpace = false
): string => {
  const parts = split(string, { delimiter });

  const transformed = parts.map((word: string) => {
    if (isCapitalize) {
      return capitalize(word);
    }
    return word;
  });

  const separator = noSpace ? '' : ' ';
  return transformed.join(separator);
};

/**
 * Filters search input by checking if a pattern matches any string in an array
 *
 * @param searchInput - The string or array of strings to search in
 * @param pattern - The search pattern to match
 * @returns True if pattern is empty, or if pattern matches (uses includes for length > 2, startsWith otherwise)
 *
 * @example
 * ```ts
 * filterSearchInput(['apple', 'banana'], 'ban') // true (length > 2, uses includes)
 * filterSearchInput(['apple', 'banana'], 'ap') // true (length <= 2, uses startsWith)
 * filterSearchInput(['apple', 'banana'], 'cherry') // false
 * filterSearchInput('hello', '') // true (empty pattern)
 * ```
 */
export const filterSearchInput = (
  searchInput: string | string[],
  pattern: string | unknown
): boolean => {
  if (!pattern) {
    return true;
  }

  if (!isString(pattern)) {
    return false;
  }

  // For longer patterns, use substring matching
  if (pattern.length > 2) {
    return includesSomePatterns(searchInput, pattern);
  }

  // For short patterns, use startsWith (prefix matching)
  const stringArray = toArray(searchInput);
  const lowerPattern = toCase(pattern, 'lower') as string;

  for (const inputString of stringArray) {
    const inputStr = String(inputString);
    const lowerInputStr = toCase(inputStr, 'lower') as string;

    if (lowerInputStr.startsWith(lowerPattern)) {
      return true;
    }
  }

  return false;
};
