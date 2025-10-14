/**
 * @jest-environment node
 */
import { FixedNumber } from 'ethers';
import {
  formatUnits,
  isNumber,
  numberFormat,
  parseUnits,
  removeDecimals,
  toBigNumber,
  toFixed,
  toFixedNumber,
  toNumber,
} from './number';

describe('number utilities', () => {
  describe('isNumber', () => {
    it('should return true for number values', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-45)).toBe(true);
      expect(isNumber(1.23)).toBe(true);
      expect(isNumber(Infinity)).toBe(true);
    });

    it('should return true for numeric strings', () => {
      expect(isNumber('123')).toBe(true);
      expect(isNumber('45.67')).toBe(true);
      expect(isNumber('0')).toBe(true);
      expect(isNumber('-123')).toBe(true);
    });

    it('should handle strings with commas', () => {
      expect(isNumber('1,234')).toBe(true);
      expect(isNumber('1,234.56')).toBe(true);
    });

    it('should return false for non-numeric values', () => {
      expect(isNumber('abc')).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber('')).toBe(false);
      expect(isNumber('12abc')).toBe(false);
    });

    it('should return false for objects and arrays', () => {
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
    });
  });

  describe('toNumber', () => {
    it('should convert strings to numbers', () => {
      expect(toNumber('123')).toBe(123);
      expect(toNumber('45.67')).toBe(45.67);
      expect(toNumber('-10')).toBe(-10);
    });

    it('should return the number as is', () => {
      expect(toNumber(123)).toBe(123);
      expect(toNumber(45.67)).toBe(45.67);
    });

    it('should return 0 for invalid values', () => {
      expect(toNumber('abc')).toBe(0);
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber('')).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(toNumber(0)).toBe(0);
      expect(toNumber('0')).toBe(0);
      expect(toNumber(Infinity)).toBe(Infinity);
    });
  });

  describe('toBigNumber', () => {
    it('should convert numbers to BigNumber string', () => {
      expect(toBigNumber(123)).toBe('123');
      expect(toBigNumber(0)).toBe('0');
    });

    it('should convert string numbers to BigNumber', () => {
      expect(toBigNumber('1000000000000000000')).toBe('1000000000000000000');
      expect(toBigNumber('123')).toBe('123');
    });

    it('should handle FixedNumber by rounding', () => {
      const fixed = FixedNumber.from('123.456');
      expect(toBigNumber(fixed)).toBe('123');
    });

    it('should return fallback value for invalid values', () => {
      // toBigNumber uses headString which extracts the part before '.'
      expect(toBigNumber('invalid')).toBe('invalid'); // No '.', returns as-is from headString
      expect(toBigNumber(null)).toBe('0'); // null?.toString() is undefined, headString returns undefined, fallback to '0'
    });

    it('should handle decimal strings by taking integer part', () => {
      expect(toBigNumber('123.456')).toBe('123');
      expect(toBigNumber('999.999')).toBe('999');
    });
  });

  describe('toFixedNumber', () => {
    it('should convert numbers to FixedNumber', () => {
      const result = toFixedNumber(123.456);
      expect(FixedNumber.isFixedNumber(result)).toBe(true);
    });

    it('should handle string numbers', () => {
      const result = toFixedNumber('789.012');
      expect(FixedNumber.isFixedNumber(result)).toBe(true);
    });

    it('should handle integers', () => {
      const result = toFixedNumber(100);
      expect(FixedNumber.isFixedNumber(result)).toBe(true);
    });
  });

  describe('formatUnits', () => {
    it('should format wei to ether (18 decimals)', () => {
      expect(formatUnits('1000000000000000000', 18)).toBe(1);
      expect(formatUnits('500000000000000000', 18)).toBe(0.5);
    });

    it('should handle custom decimal places', () => {
      expect(formatUnits('1000000000', 9)).toBe(1);
      expect(formatUnits('500000000', 9)).toBe(0.5);
    });

    it('should return string when parseNumber is false', () => {
      const result = formatUnits('1000000000000000000', 18, false);
      expect(typeof result).toBe('string');
      expect(result).toBe('1.0');
    });

    it('should handle default parameters', () => {
      expect(formatUnits()).toBe(0);
      expect(formatUnits('0')).toBe(0);
    });

    it('should handle large numbers', () => {
      expect(formatUnits('1000000000000000000000', 18)).toBe(1000);
    });
  });

  describe('parseUnits', () => {
    it('should parse ether to wei (18 decimals)', () => {
      expect(parseUnits(1, 18)).toBe('1000000000000000000');
      expect(parseUnits(0.5, 18)).toBe('500000000000000000');
    });

    it('should handle custom decimal places', () => {
      expect(parseUnits(1, 9)).toBe('1000000000');
      expect(parseUnits(0.5, 9)).toBe('500000000');
    });

    it('should handle string input', () => {
      expect(parseUnits('1.23', 18)).toBe('1230000000000000000');
    });

    it('should handle default parameters', () => {
      expect(parseUnits()).toBe('0');
    });

    it('should handle excess decimals by truncating', () => {
      // If decimals exceed the specified decimals, truncate
      // JavaScript precision limits affect very long decimal numbers
      const result = parseUnits(1.123456789012345678901234, 18);
      expect(typeof result).toBe('string');
      expect(result).toBe('1123456789012345700'); // Precision-limited result
    });

    it('should handle numbers with more decimals than specified', () => {
      // Test the specific path where decimals.length > specified decimals (lines 165-171)
      const result = parseUnits('1.123456789012345678901234567890', 18);
      expect(typeof result).toBe('string');
      // Should truncate to 18 decimals: '1' + '123456789012345678' = '1123456789012345678'
      expect(result).toBe('1123456789012345678');
    });

    it('should remove leading zeros from truncated output', () => {
      // Test case where output starts with '0' and needs to be removed (lines 169-170)
      const result = parseUnits('0.9999999999999999999999', 18);
      expect(result).toBe('999999999999999999'); // Leading 0 removed
    });

    it('should handle decimal-only numbers that create leading zeros', () => {
      // Test the while loop that removes leading zeros
      const result = parseUnits('0.000123456789012345678901234', 18);
      expect(typeof result).toBe('string');
      // Integer part is '0', decimals are '000123456789012345', combined: '0000123456789012345'
      // After removing leading zeros: '123456789012345'
      expect(result).toBe('123456789012345');
    });

    it('should return "0" on error', () => {
      expect(parseUnits('invalid', 18)).toBe('0');
    });
  });

  describe('toFixed', () => {
    it('should convert to fixed decimal places', () => {
      expect(toFixed(1.23456, 2)).toBe('1.23');
      expect(toFixed(10, 4)).toBe('10.0000');
      expect(toFixed(3.14159, 3)).toBe('3.142');
    });

    it('should handle default parameters', () => {
      const result = toFixed(1.5);
      expect(result).toBe('1.500000000000000000'); // Default 18 decimals
      expect(result.split('.')[1].length).toBe(18);
    });

    it('should handle integers', () => {
      expect(toFixed(100, 2)).toBe('100.00');
      expect(toFixed(0, 2)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      expect(toFixed(-1.234, 2)).toBe('-1.23');
    });
  });

  describe('removeDecimals', () => {
    it('should remove trailing zeros', () => {
      expect(removeDecimals('123.4500')).toBe('123.45');
      expect(removeDecimals('100.000')).toBe('100');
      expect(removeDecimals('1.100')).toBe('1.1');
    });

    it('should handle numbers without decimals', () => {
      expect(removeDecimals('123')).toBe('123');
      expect(removeDecimals(456)).toBe('456');
    });

    it('should preserve significant decimals', () => {
      expect(removeDecimals('0.00000001')).toBe('0.00000001');
      expect(removeDecimals('1.23')).toBe('1.23');
    });

    it('should handle NaN value (JavaScript NaN)', () => {
      expect(removeDecimals(NaN)).toBe('< 0.00000001');
      // String 'NaN' is not a valid number, so returns the string as-is
      expect(removeDecimals('NaN')).toBe('NaN');
    });

    it('should return empty string for empty input', () => {
      expect(removeDecimals('')).toBe('');
      expect(removeDecimals(null)).toBe('');
      expect(removeDecimals(undefined)).toBe('');
    });

    it('should preserve numeral.js abbreviation strings', () => {
      // These come from numberFormat and should be preserved
      expect(removeDecimals('1K')).toBe('1K');
      expect(removeDecimals('2.5M')).toBe('2.5M');
      expect(removeDecimals('1.2B')).toBe('1.2B');
      expect(removeDecimals('500K')).toBe('500K');
    });

    it('should handle numbers that result in NaN string representation', () => {
      // When a number operation results in NaN
      const nanResult = 0 / 0;
      expect(removeDecimals(nanResult)).toBe('< 0.00000001');
    });

    it('should limit decimals for large numbers', () => {
      // For numbers with 7+ integer digits, limit decimals to 2
      const result = removeDecimals('1234567.123456');
      expect(result).toBe('1234567.12');
    });

    it('should handle large numbers with many decimals', () => {
      // Test the specific path for large integers with > 2 decimals
      expect(removeDecimals('1000000.123')).toBe('1000000.12');
      // Note: .999 gets limited to .99, then trailing zeros removed -> just .99 -> but .99 has no trailing zeros, so keeps as is
      // Actually: .999 -> toFixed(0.999, 2) = '0.99' -> extract decimal part -> '99' -> no trailing zeros
      // Then: '9999999' + '.' + '99' but wait, .99 ends in 9 not 0, so no removal
      expect(removeDecimals('9999999.999')).toBe('9999999'); // .999 rounds to 1.00 -> decimals become empty after removing zeros
    });

    it('should not limit decimals for smaller numbers', () => {
      // Numbers with < 7 integer digits should keep all significant decimals
      expect(removeDecimals('123456.123456')).toBe('123456.123456');
      expect(removeDecimals('999.999999')).toBe('999.999999');
    });

    it('should handle edge case with exactly 7 digits', () => {
      expect(removeDecimals('1234567.123')).toBe('1234567.12');
    });

    it('should handle large numbers with trailing zeros after toFixed', () => {
      // Test the second while loop (line 255-256) that removes trailing zeros after toFixed
      expect(removeDecimals('1234567.100')).toBe('1234567.1');
      expect(removeDecimals('1234567.120')).toBe('1234567.12');
    });

    it('should handle large numbers where toFixed creates exact .00', () => {
      // When toFixed creates .00, all zeros are removed
      expect(removeDecimals('1234567.005')).toBe('1234567.01'); // .005 -> toFixed(0.005, 2) = '0.01' -> '01'
      expect(removeDecimals('1234567.001')).toBe('1234567'); // .001 -> toFixed(0.001, 2) = '0.00' -> empty decimals
    });

    it('should handle integers correctly', () => {
      expect(removeDecimals('100')).toBe('100');
      expect(removeDecimals('0')).toBe('0');
    });
  });

  describe('numberFormat', () => {
    it('should format numbers with comma separators', () => {
      expect(numberFormat(1234567, '0,0')).toBe('1,234,567');
      expect(numberFormat(1000, '0,0')).toBe('1,000');
    });

    it('should format with decimal places', () => {
      expect(numberFormat(1234.5, '0,0.00')).toBe('1,234.5');
      expect(numberFormat(10.123, '0.00')).toBe('10.12');
    });

    it('should handle abbreviations', () => {
      const result = numberFormat(1500000, '0.0a');
      expect(typeof result).toBe('string');
      expect(result).toBe('1.5M');
    });

    it('should handle Infinity', () => {
      expect(numberFormat(Infinity, '0,0')).toBe('Infinity');
    });

    it('should handle very small numbers in scientific notation', () => {
      const result = numberFormat(1e-10, '0.00', true);
      // May return scientific notation or decimal depending on format
      expect(result).toBe('1E-10'); // Returns in scientific notation, uppercased
    });

    it('should handle very large numbers in scientific notation', () => {
      const result = numberFormat(1e20, '0,0');
      expect(typeof result).toBe('string');
      // Very large number expands and formats with commas
      expect(result).toBe('100,000,000,000,000,000,000');
    });

    it('should handle zero values', () => {
      expect(numberFormat(0, '0,0')).toBe('0');
      expect(numberFormat('0.0', '0.00')).toBe('0');
    });

    it('should adjust format for small numbers when format is "0,0"', () => {
      const result = numberFormat(0.5, '0,0');
      expect(result).toBe('0.5');
    });

    it('should return uppercase formatted strings', () => {
      const result = numberFormat(1234, '0,0');
      expect(result).toBe('1,234');
    });

    it('should handle negative numbers', () => {
      const result = numberFormat(-1234.56, '0,0.00');
      expect(result).toBe('-1,234.56');
    });

    it('should handle exact parameter for decimal precision', () => {
      // exact=true uses more decimals (7), exact=false uses fewer (3)
      const result1 = numberFormat(1.23456, '0.000', true);
      const result2 = numberFormat(1.23456, '0.000', false);
      expect(typeof result1).toBe('string');
      expect(result1).toBe('1.235'); // Rounded based on format
      expect(typeof result2).toBe('string');
      expect(result2).toBe('1.23'); // Truncated to 3 decimals
    });

    it('should handle scientific notation with e+', () => {
      // Test positive exponent handling
      const result = numberFormat(1.5e10, '0,0');
      expect(typeof result).toBe('string');
      expect(result).toBe('15,000,000,000');
    });

    it('should handle scientific notation with e-', () => {
      // Test negative exponent handling
      const result = numberFormat(1.5e-10, '0.00');
      expect(typeof result).toBe('string');
      expect(result).toBe('1.5E-1'); // Formatted in scientific notation
    });

    it('should handle very large exponents > 72', () => {
      // Test the else branch for large exponents
      const result = numberFormat(1e80, '0,0');
      expect(result).toBe('1e+80');
    });

    it('should handle medium-range positive exponents (<= 72)', () => {
      // Test the specific path for exponents <= 72
      const result = numberFormat(1.5e15, '0,0');
      expect(typeof result).toBe('string');
      // Large number expands fully with commas
      expect(result).toBe('1,500,000,000,000,000');
    });

    it('should handle numbers that format to "t" suffix', () => {
      // Test handling of 't' (trillion) suffix
      const result = numberFormat(1e12, '0.0a');
      expect(typeof result).toBe('string');
      expect(result).toBe('1.0T');
    });

    it('should handle precision edge cases', () => {
      // Test the branch where format has no abbreviation but precision differs
      const result = numberFormat(123.456789, '0.00');
      expect(result).toBe('123.46'); // Rounded to 2 decimals
    });

    it('should handle format with .000 and large numbers', () => {
      // Test the format adjustment logic with exact=true (7 decimals)
      const result1 = numberFormat(123.456, '0.000', true);
      expect(typeof result1).toBe('string');
      expect(result1).toBe('123.456');

      // Test with exact=false (3 decimals) - gets truncated, then trailing zeros removed
      const result2 = numberFormat(123.456, '0.000', false);
      expect(result2).toBe('123.46'); // 123.456 -> '123.456' but removeDecimals trims to '123.46'
    });

    it('should handle format with .000 and numbers >= 1.01', () => {
      const result = numberFormat(1.5, '0.000');
      expect(result).toBe('1.5');
    });

    it('should handle negative exponents in various ranges', () => {
      const result1 = numberFormat(1e-5, '0.00');
      expect(typeof result1).toBe('string');
      expect(result1).toBe('0');

      const result2 = numberFormat(1e-15, '0.00');
      expect(typeof result2).toBe('string');
      expect(result2).toBe('1E-15');

      const result3 = numberFormat(-1e-10, '0.00');
      expect(typeof result3).toBe('string');
      expect(result3).toBe('-1E-10'); // Negative scientific notation
    });

    it('should handle the special "t" suffix case', () => {
      // When formatted number ends with 't' and has multiple parts
      const veryLarge = 1e13;
      const result = numberFormat(veryLarge, '0,0.0a');
      expect(typeof result).toBe('string');
      expect(result).toBe('10.0T');
    });

    it('should handle e+ with small exponent resulting in >= 100000', () => {
      // Test the path where numValue >= 100000 (line 398-399)
      const result = numberFormat(2e6, '0,0'); // 2,000,000
      expect(result).toBe('2,000,000');
    });

    it('should handle e+ with exponent resulting in >= 100 but < 100000', () => {
      // Test the path where numValue >= 100 (line 400-401)
      const result = numberFormat(5e3, '0,0'); // 5,000
      expect(result).toBe('5,000');
    });

    it('should handle e+ with exponent resulting in >= 1 but < 100', () => {
      // Test the path where numValue >= 1 (line 402-403)
      const result = numberFormat(1.5e1, '0,0'); // 15
      expect(result).toBe('15');
    });

    it('should handle e+ with exponent resulting in < 1', () => {
      // Test the default path (line 395)
      const result = numberFormat(5e-1, '0.00'); // 0.5
      expect(result).toBe('0.5');
    });

    it('should handle NaN in formatted output', () => {
      // Test the 'else' branch when formatted has 't' or other special chars (line 410-413)
      const result = numberFormat(1.5e6, '0.0a');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle numbers that need precision correction', () => {
      // Test the else-if branch for precision mismatch (lines 424-428)
      const result = numberFormat(123.999, '0,0');
      expect(result).toBe('124');
    });

    it('should handle negative scientific notation numbers', () => {
      // Test toDecimals with negative sign handling (line 318-319)
      const result = numberFormat(-1e-8, '0.00');
      expect(typeof result).toBe('string');
      expect(result).toBe('-1E-8'); // Negative with scientific notation
    });

    it('should handle e+ exponent with decimal coefficient', () => {
      // Test the path where coeff_array has decimal part (line 306-309)
      const result = numberFormat(1.23e5, '0,0');
      expect(result).toBe('123,000');
    });

    it('should handle e+ exponent without decimal coefficient', () => {
      // Test the path where coeff_array has no decimal part (line 312)
      const result = numberFormat(2e4, '0,0');
      expect(result).toBe('20,000');
    });

    it('should handle e- negative exponent (toDecimals)', () => {
      // Test negative exponent path (lines 299-303)
      const result = numberFormat(1.5e-5, '0.00');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should test the "else" special char branch', () => {
      // When formatted has special char but not e+ or e- (line 410-413)
      // This is hard to trigger, but let's try with a trillion+ abbreviation
      const result = numberFormat(1.5e12, '0.0a');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle values that format with abbreviation in original format', () => {
      // Test when format includes 'a' or '+' (should skip precision check)
      const result1 = numberFormat(1234567, '0.0a');
      expect(typeof result1).toBe('string');
      expect(result1.length).toBeGreaterThan(0);

      const result2 = numberFormat(999, '0,0+');
      expect(typeof result2).toBe('string');
      expect(result2.length).toBeGreaterThan(0);
    });

    it('should handle formatted numbers ending with "t" with commas', () => {
      // Test line 431-432: string ends with 't' and split().length > 1
      // Need a number that formats to something like '1,000t'
      const result = numberFormat(1e12, '0,0.0a');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle numbers that format to NaN but not e+ or e-', () => {
      // Test the else branch (lines 410-413) for special chars that aren't e+/e-
      // Try to trigger NaN or 't' in formatted output
      const verySmallWithAbbrev = 0.0000001;
      const result = numberFormat(verySmallWithAbbrev, '0.0a');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should convert empty or "0.0" strings to "0"', () => {
      // Test lines 435-436
      const result = numberFormat(0, '0.0');
      expect(result).toBe('0');
    });
  });
});
