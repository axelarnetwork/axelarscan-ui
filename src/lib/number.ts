import { BigNumber, FixedNumber, utils } from 'ethers';
import _ from 'lodash';
import numeral from 'numeral';
const { formatUnits: _formatUnits, parseUnits: _parseUnits } = { ...utils };

import { split, toCase } from '@/lib/parser';
import { headString, isString } from '@/lib/string';

/**
 * Checks if a value is a valid number
 *
 * @param number - The value to check
 * @returns True if the value is a number or a numeric string
 *
 * @example
 * ```ts
 * isNumber(123) // true
 * isNumber('456') // true
 * isNumber('12.34') // true
 * isNumber('abc') // false
 * isNumber(null) // false
 * ```
 */
export const isNumber = (number: unknown): number is number | string =>
  typeof number === 'number' ||
  (isString(number) && !!number && !isNaN(Number(split(number).join(''))));

/**
 * Converts a value to a number, returning 0 if conversion fails
 *
 * @param number - The value to convert to a number
 * @returns The numeric value, or 0 if not a valid number
 *
 * @example
 * ```ts
 * toNumber('123') // 123
 * toNumber('45.67') // 45.67
 * toNumber('abc') // 0
 * toNumber(null) // 0
 * ```
 */
export const toNumber = (number: unknown): number =>
  isNumber(number) ? Number(number) : 0;

/**
 * Converts a value to a BigNumber string representation
 *
 * @param number - The value to convert (can be number, string, BigNumber, or FixedNumber)
 * @returns String representation of the BigNumber, or '0' if conversion fails
 *
 * @example
 * ```ts
 * toBigNumber(123) // '123'
 * toBigNumber('1000000000000000000') // '1000000000000000000'
 * toBigNumber(FixedNumber.from('123.456')) // '123'
 * ```
 */
export const toBigNumber = (number: unknown): string => {
  try {
    if (FixedNumber.isFixedNumber(number))
      return number.round(0).toString().replace('.0', '');
    return BigNumber.from(number).toString();
  } catch (error) {
    return headString(number?.toString(), '.') || '0';
  }
};

/**
 * Converts a value to an ethers FixedNumber
 *
 * @param number - The value to convert
 * @returns FixedNumber representation of the value
 *
 * @example
 * ```ts
 * toFixedNumber(123.456) // FixedNumber
 * toFixedNumber('789.012') // FixedNumber
 * ```
 */
export const toFixedNumber = (number: unknown): FixedNumber =>
  FixedNumber.fromString(
    number?.toString().includes('.') ? number.toString() : toBigNumber(number)
  );

/**
 * Formats a number by dividing it by 10^decimals (useful for converting wei to ether)
 *
 * @param number - The number to format (default: '0')
 * @param decimals - Number of decimals to divide by (default: 18)
 * @param parseNumber - Whether to parse the result as a number (default: true)
 * @returns Formatted number as a number or string
 *
 * @example
 * ```ts
 * formatUnits('1000000000000000000', 18) // 1
 * formatUnits('1000000000000000000', 18, false) // '1.0'
 * formatUnits('500000000', 9) // 0.5
 * ```
 */
export const formatUnits = (
  number = '0',
  decimals = 18,
  parseNumber = true
): number | string => {
  const formattedNumber = _formatUnits(toBigNumber(number), decimals);
  return parseNumber ? toNumber(formattedNumber) : formattedNumber;
};

/**
 * Parses a number by multiplying it by 10^decimals (useful for converting ether to wei)
 *
 * @param number - The number to parse (default: 0)
 * @param decimals - Number of decimals to multiply by (default: 18)
 * @returns String representation of the parsed number
 *
 * @example
 * ```ts
 * parseUnits(1, 18) // '1000000000000000000'
 * parseUnits(0.5, 9) // '500000000'
 * parseUnits('1.23', 18) // '1230000000000000000'
 * ```
 */
export const parseUnits = (number = 0, decimals = 18): string => {
  try {
    const numberStr = number.toString();

    if (numberStr.includes('.')) {
      const [_number, _decimals] = split(numberStr, { delimiter: '.' });

      if (isString(_decimals) && _decimals.length > decimals) {
        // decimals fixed
        let output = `${_number}${_decimals.substring(0, decimals)}`;
        // remove prefix 0
        while (output.length > 1 && output.startsWith('0'))
          output = output.substring(1);
        return output;
      }
    }

    return toBigNumber(_parseUnits(numberStr, decimals));
  } catch (error) {
    return '0';
  }
};

/**
 * Converts a number to a fixed-point notation string
 *
 * @param number - The number to convert (default: 0)
 * @param decimals - Number of decimal places (default: 18)
 * @returns String representation with fixed decimal places
 *
 * @example
 * ```ts
 * toFixed(1.23456, 2) // '1.23'
 * toFixed(10, 4) // '10.0000'
 * ```
 */
export const toFixed = (number = 0, decimals = 18): string =>
  toNumber(number).toFixed(decimals);

/**
 * Removes trailing zeros from decimal numbers and formats the result
 *
 * @param number - The number to process
 * @returns Formatted string with trailing zeros removed
 *
 * @example
 * ```ts
 * removeDecimals('123.4500') // '123.45'
 * removeDecimals('100.000') // '100'
 * removeDecimals('0.00000001') // '0.00000001'
 * ```
 */
export const removeDecimals = (number: unknown): string => {
  let numberStr: string | undefined;

  if (isNumber(number)) {
    numberStr = number.toString();
  }

  if (!numberStr) return '';
  if (numberStr.includes('NaN'))
    return numberStr.replace('NaN', '< 0.00000001');
  if (!(numberStr.indexOf('.') > -1)) return numberStr;

  let decimals = numberStr.substring(numberStr.indexOf('.') + 1);

  while (decimals.endsWith('0')) {
    decimals = decimals.substring(0, decimals.length - 1);
  }

  if (
    numberStr.substring(0, numberStr.indexOf('.')).length >= 7 &&
    decimals.length > 2 &&
    isNumber(`0.${decimals}`)
  ) {
    decimals = toFixed(Number(`0.${decimals}`), 2);

    if (decimals.indexOf('.') > -1) {
      decimals = decimals.substring(decimals.indexOf('.') + 1);

      while (decimals.endsWith('0')) {
        decimals = decimals.substring(0, decimals.length - 1);
      }
    }
  }

  return `${numberStr.substring(0, numberStr.indexOf('.'))}${decimals ? '.' : ''}${decimals}`;
};

/**
 * Converts scientific notation to decimal notation
 * Internal helper function for handling exponential format
 *
 * @param n - The number in scientific notation
 * @returns Decimal representation of the number
 *
 * @example
 * ```ts
 * toDecimals(1.23e-7) // '0.000000123'
 * toDecimals(1.5e+10) // '15000000000'
 * ```
 */
const toDecimals = (n: unknown): string | number => {
  const sign = Math.sign(Number(n));
  let result: string | number = n as string | number;

  if (/\d+\.?\d*e[\+\-]*\d+/i.test(String(n))) {
    const zero = '0';
    const parts = String(n).toLowerCase().split('e');

    const e = parts.pop();
    let l = Math.abs(Number(e));

    const direction = Number(e) / l;
    const coeff_array = parts[0].split('.');

    if (direction === -1) {
      coeff_array[0] = String(Math.abs(Number(coeff_array[0])));
      result = `${zero}.${new Array(l).join(zero)}${coeff_array.join('')}`;
    } else {
      const dec = coeff_array[1];

      if (dec) {
        l = l - dec.length;
      }

      result = `${coeff_array.join('')}${new Array(l + 1).join(zero)}`;
    }
  }

  return sign < 0 && isString(result) && !result.startsWith('-')
    ? Number(`-${result}`)
    : result;
};

/**
 * Formats a number using numeral.js with additional handling for edge cases
 *
 * @param number - The number to format
 * @param format - The numeral.js format string (e.g., '0,0.00', '0.00a')
 * @param exact - Whether to use exact precision for decimals
 * @returns Formatted number string with proper handling of scientific notation and special cases
 *
 * @example
 * ```ts
 * numberFormat(1234567, '0,0') // '1,234,567'
 * numberFormat(0.00123, '0.00') // '0.00'
 * numberFormat(1500000, '0.0a') // '1.5M'
 * numberFormat(1e-10, '0.00', true) // '0.0000000001'
 * ```
 */
export const numberFormat = (
  number: unknown,
  format: string,
  exact?: boolean
): string => {
  if (number === Infinity) return 'Infinity';

  let formattedNumber: string | number = numeral(number).format(
    format.includes('.000') && Math.abs(Number(number)) >= 1.01
      ? format.substring(0, format.indexOf('.') + (exact ? 7 : 3))
      : format === '0,0' && toNumber(number) < 1
        ? '0,0.00'
        : format
  );

  if (
    ['NaN', 'e+', 'e-', 't'].findIndex(s =>
      String(formattedNumber).includes(s)
    ) > -1
  ) {
    formattedNumber = String(number);

    if (formattedNumber.includes('e-')) {
      formattedNumber = String(toDecimals(number));
    } else if (formattedNumber.includes('e+')) {
      const [n, e] = formattedNumber.split('e+');

      if (toNumber(e) <= 72) {
        const fixedDecimals = 2;

        let _numberStr = `${parseInt(String(toNumber(toFixed(Number(n), fixedDecimals)) * Math.pow(10, fixedDecimals)))}${_.range(
          Number(e)
        )
          .map(_i => '0')
          .join('')}`;
        const _number = String(
          formatUnits(String(BigInt(_numberStr)), 16 + fixedDecimals)
        );

        const _format = `0,0${Number(_number) >= 100000 ? '.00a' : Number(_number) >= 100 ? '' : Number(_number) >= 1 ? '.00' : '.000000'}`;
        return toCase(`${numberFormat(_number, _format)}t`, 'upper');
      } else {
        return numeral(number).format('0,0e+0');
      }
    } else {
      return toCase(
        numeral(number).format(`0,0${Number(number) < 1 ? '.00' : '.0'}a`),
        'upper'
      );
    }
  } else if (
    isNumber(number) &&
    ['a', '+'].findIndex(c => format.includes(c)) < 0 &&
    toNumber(split(String(formattedNumber)).join('')).toString() !==
      removeDecimals(split(String(formattedNumber)).join(''))
  ) {
    formattedNumber = String(number);
  }

  let string = removeDecimals(formattedNumber);

  if (string.toLowerCase().endsWith('t') && split(string).length > 1) {
    string = numeral(number).format('0,0e+0');
  }

  if (['0.0', ''].includes(string)) {
    string = '0';
  }

  return toCase(string, 'upper');
};
