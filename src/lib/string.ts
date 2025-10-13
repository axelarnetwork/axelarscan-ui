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
export const isString = (string: unknown): string is string =>
  typeof string === 'string';

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
): boolean => (!a && !b) || toCase(a, 'lower') === toCase(b, 'lower');

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
export const capitalize = (string: unknown): string =>
  !isString(string)
    ? ''
    : `${string.substr(0, 1).toUpperCase()}${string.substr(1)}`;

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
export const camel = (string: unknown, delimiter = '_'): string =>
  toArray(string, { delimiter })
    .map((s: string, i: number) => (i > 0 ? capitalize(s) : s))
    .join('');

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
export const removeDoubleQuote = <T>(string: T): T | string =>
  !isString(string) ? string : split(string, { delimiter: '"' }).join('');

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
export const removeHexPrefix = <T>(string: T): T | string =>
  !isString(string)
    ? string
    : string.startsWith('0x')
      ? string.slice(2)
      : string;

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
): boolean =>
  typeof string === 'boolean'
    ? string
    : !isString(string)
      ? defaultValue
      : equalsIgnoreCase(string, 'true');

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
): string | undefined => _.head(split(string, { delimiter }));

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
 * ```
 */
export const lastString = (
  string: unknown,
  delimiter = '-'
): string | undefined => _.last(split(string, { delimiter }));

/**
 * Finds an element in an array that matches the given value (case-insensitive)
 *
 * @param x - The value to search for
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
  x: string | unknown,
  elements: unknown
): string | undefined =>
  toArray(elements).find((e: string) => equalsIgnoreCase(e, x as string));

/**
 * Checks if any of the given patterns are included in any of the strings
 *
 * @param string - The string or array of strings to search in
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
  string: unknown,
  patterns: unknown
): boolean =>
  toArray(patterns).findIndex(
    (p: string) => toArray(string).findIndex((s: string) => s.includes(p)) > -1
  ) > -1;

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
export const ellipse = (string: unknown, length = 10, prefix = ''): string =>
  !isString(string) || !string
    ? ''
    : string.length < length * 2 + 3
      ? string
      : `${string.startsWith(prefix) ? prefix : ''}${string.replace(prefix, '').slice(0, length)}...${string.replace(prefix, '').slice(-length)}`;

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
): string =>
  split(string, { delimiter })
    .map((s: string) => (isCapitalize ? capitalize(s) : s))
    .join(noSpace ? '' : ' ');

/**
 * Filters search input by checking if a pattern matches any string in an array
 *
 * @param string - The string or array of strings to search in
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
  string: unknown,
  pattern: string | unknown
): boolean =>
  !pattern ||
  (isString(pattern) && pattern.length > 2
    ? includesSomePatterns(string, pattern)
    : toArray(string).findIndex((s: string) =>
        toCase(s, 'lower').startsWith(toCase(pattern, 'lower'))
      ) > -1);
