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
export const isNumber = (number: unknown): number is number | string => {
  if (typeof number === 'number') {
    return true;
  }

  if (!isString(number) || !number) {
    return false;
  }

  const cleaned = split(number).join('');

  return !isNaN(Number(cleaned));
};

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
export const toNumber = (number: unknown): number => {
  if (!isNumber(number)) {
    return 0;
  }

  return Number(number);
};

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
    if (FixedNumber.isFixedNumber(number)) {
      const rounded = number.round(0).toString();
      return rounded.replace('.0', '');
    }

    return BigNumber.from(number).toString();
  } catch (error) {
    const fallback = headString(number?.toString(), '.');
    return fallback || '0';
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
export const toFixedNumber = (number: unknown): FixedNumber => {
  const numberStr = number?.toString();

  if (numberStr?.includes('.')) {
    return FixedNumber.fromString(numberStr);
  }

  return FixedNumber.fromString(toBigNumber(number));
};

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

  if (parseNumber) {
    return toNumber(formattedNumber);
  }

  return formattedNumber;
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

  if (!numberStr) {
    return '';
  }

  if (numberStr.includes('NaN')) {
    return numberStr.replace('NaN', '< 0.00000001');
  }

  const decimalIndex = numberStr.indexOf('.');
  if (decimalIndex === -1) {
    return numberStr;
  }

  let decimals = numberStr.substring(decimalIndex + 1);

  // Remove trailing zeros
  while (decimals.endsWith('0')) {
    decimals = decimals.substring(0, decimals.length - 1);
  }

  // For large numbers, limit decimal places to 2
  const integerPart = numberStr.substring(0, decimalIndex);
  if (
    integerPart.length >= 7 &&
    decimals.length > 2 &&
    isNumber(`0.${decimals}`)
  ) {
    decimals = toFixed(Number(`0.${decimals}`), 2);

    const newDecimalIndex = decimals.indexOf('.');
    if (newDecimalIndex > -1) {
      decimals = decimals.substring(newDecimalIndex + 1);

      // Remove trailing zeros again
      while (decimals.endsWith('0')) {
        decimals = decimals.substring(0, decimals.length - 1);
      }
    }
  }

  // Build the result
  if (decimals) {
    return `${integerPart}.${decimals}`;
  }

  return integerPart;
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

  const nStr = String(n);
  const isScientific = /\d+\.?\d*e[\+\-]*\d+/i.test(nStr);

  if (isScientific) {
    const zero = '0';
    const parts = nStr.toLowerCase().split('e');

    const e = parts.pop();
    let l = Math.abs(Number(e));

    const direction = Number(e) / l;
    const coeff_array = parts[0].split('.');

    if (direction === -1) {
      // Negative exponent: move decimal left
      coeff_array[0] = String(Math.abs(Number(coeff_array[0])));
      const zeros = new Array(l).join(zero);
      result = `${zero}.${zeros}${coeff_array.join('')}`;
    } else {
      // Positive exponent: move decimal right
      const dec = coeff_array[1];

      if (dec) {
        l = l - dec.length;
      }

      const zeros = new Array(l + 1).join(zero);
      result = `${coeff_array.join('')}${zeros}`;
    }
  }

  // Handle negative sign
  if (sign < 0 && isString(result) && !result.startsWith('-')) {
    return Number(`-${result}`);
  }

  return result;
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
  if (number === Infinity) {
    return 'Infinity';
  }

  // Determine the format to use
  let actualFormat = format;

  if (format.includes('.000') && Math.abs(Number(number)) >= 1.01) {
    const decimalsToKeep = exact ? 7 : 3;
    actualFormat = format.substring(0, format.indexOf('.') + decimalsToKeep);
  } else if (format === '0,0' && toNumber(number) < 1) {
    actualFormat = '0,0.00';
  }

  let formattedNumber: string | number = numeral(number).format(actualFormat);

  // Check if formatted number has special characters that need handling
  const hasSpecialChars = ['NaN', 'e+', 'e-', 't'].some(s =>
    String(formattedNumber).includes(s)
  );

  if (hasSpecialChars) {
    formattedNumber = String(number);

    if (formattedNumber.includes('e-')) {
      // Handle negative exponent (very small numbers)
      formattedNumber = String(toDecimals(number));
    } else if (formattedNumber.includes('e+')) {
      // Handle positive exponent (very large numbers)
      const [n, e] = formattedNumber.split('e+');
      const exponent = toNumber(e);

      if (exponent <= 72) {
        const fixedDecimals = 2;
        const multiplier = Math.pow(10, fixedDecimals);
        const fixedValue = toNumber(toFixed(Number(n), fixedDecimals));
        const integerValue = parseInt(String(fixedValue * multiplier));

        // Create string with trailing zeros
        const zeros = _.range(Number(e))
          .map(_i => '0')
          .join('');
        const _numberStr = `${integerValue}${zeros}`;

        const _number = String(
          formatUnits(String(BigInt(_numberStr)), 16 + fixedDecimals)
        );

        // Determine format based on magnitude
        let _format = '0,0.000000'; // Default for small numbers
        const numValue = Number(_number);

        if (numValue >= 100000) {
          _format = '0,0.00a';
        } else if (numValue >= 100) {
          _format = '0,0';
        } else if (numValue >= 1) {
          _format = '0,0.00';
        }

        return toCase(`${numberFormat(_number, _format)}t`, 'upper');
      } else {
        return numeral(number).format('0,0e+0');
      }
    } else {
      // Handle other special cases
      const abbreviatedFormat = Number(number) < 1 ? '0,0.00a' : '0,0.0a';
      return toCase(numeral(number).format(abbreviatedFormat), 'upper');
    }
  }

  // Check if we need to reformat due to precision issues
  const hasAbbreviation = ['a', '+'].some(c => format.includes(c));
  if (!hasAbbreviation && isNumber(number)) {
    const cleanedFormatted = split(String(formattedNumber)).join('');
    const formattedAsNumber = toNumber(cleanedFormatted).toString();
    const withoutDecimals = removeDecimals(cleanedFormatted);

    if (formattedAsNumber !== withoutDecimals) {
      formattedNumber = String(number);
    }
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
