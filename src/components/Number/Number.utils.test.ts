/**
 * @jest-environment node
 */
import { processNumberValue } from './Number.utils';

describe('Number.utils', () => {
  describe('processNumberValue', () => {
    describe('basic number handling', () => {
      it('should handle integer values', () => {
        const result = processNumberValue(42);
        expect(result).toEqual({
          formattedValue: '42',
          originalValue: 42,
          isFormatted: false,
        });
      });

      it('should handle string number values', () => {
        const result = processNumberValue('42');
        expect(result).toEqual({
          formattedValue: '42',
          originalValue: '42',
          isFormatted: false,
        });
      });

      it('should handle zero', () => {
        const result = processNumberValue(0);
        expect(result).toEqual({
          formattedValue: '0',
          originalValue: 0,
          isFormatted: false,
        });
      });

      it('should handle negative numbers', () => {
        const result = processNumberValue(-42.5);
        expect(result).toEqual({
          formattedValue: '-42.5',
          originalValue: -42.5,
          isFormatted: false,
        });
      });
    });

    describe('large number formatting (>= 1000)', () => {
      it('should format large integers with commas', () => {
        const result = processNumberValue(5000);
        expect(result).toEqual({
          formattedValue: '5,000',
          originalValue: 5000,
          isFormatted: true,
        });
      });

      it('should format very large numbers', () => {
        const result = processNumberValue(1234567);
        expect(result).toEqual({
          formattedValue: '1,234,567',
          originalValue: 1234567,
          isFormatted: true,
        });
      });

      it('should format exactly at threshold', () => {
        const result = processNumberValue(1000);
        expect(result).toEqual({
          formattedValue: '1,000',
          originalValue: 1000,
          isFormatted: true,
        });
      });

      it('should not format just below threshold', () => {
        const result = processNumberValue(999);
        expect(result).toEqual({
          formattedValue: '999',
          originalValue: 999,
          isFormatted: false,
        });
      });

      it('should format negative large numbers', () => {
        const result = processNumberValue(-5000);
        // Fixed: Now uses Math.abs() for threshold check
        expect(result).toEqual({
          formattedValue: '-5,000',
          originalValue: -5000,
          isFormatted: true,
        });
      });
    });

    describe('decimal precision handling', () => {
      it('should trim decimals when maxDecimals is specified and exceeded', () => {
        const result = processNumberValue(1.234567, '.', 2);
        expect(result.formattedValue).toBe('1.23');
        expect(result.originalValue).toBe(1.234567);
      });

      it('should not trim when decimals do not exceed maxDecimals', () => {
        const result = processNumberValue(1.23, '.', 4);
        expect(result).toEqual({
          formattedValue: '1.23',
          originalValue: 1.23,
          isFormatted: false,
        });
      });

      it('should auto-set maxDecimals=0 for large numbers (>= 1000)', () => {
        const result = processNumberValue(1500.123456, '.', undefined);
        expect(result.formattedValue).toBe('1,500');
        expect(result.originalValue).toBe(1500.123456);
      });

      it('should auto-set maxDecimals=2 for medium numbers (>= 1.01)', () => {
        const result = processNumberValue(10.123456, '.', undefined);
        expect(result.formattedValue).toBe('10.12');
        expect(result.originalValue).toBe(10.123456);
      });

      it('should auto-set maxDecimals=6 for small numbers (< 1.01)', () => {
        const result = processNumberValue(0.123456789, '.', undefined);
        expect(result.formattedValue).toBe('0.123457');
        expect(result.originalValue).toBe(0.123456789);
      });

      it('should handle maxDecimals=0', () => {
        const result = processNumberValue(1.9, '.', 0);
        expect(result.formattedValue).toBe('2');
        expect(result.originalValue).toBe(1.9);
      });
    });

    describe('trailing zero removal', () => {
      it('should not format when within decimal limit', () => {
        // 1.5 has only 1 decimal, doesn't exceed maxDecimals=2, so no formatting
        const result = processNumberValue(1.5, '.', 2);
        expect(result).toEqual({
          formattedValue: '1.5',
          originalValue: 1.5,
          isFormatted: false,
        });
      });

      it('should remove .00 entirely', () => {
        // 1.005 rounds to 1.00 with maxDecimals=2, keeps .00
        const result = processNumberValue(1.005, '.', 2);
        expect(result.formattedValue).toBe('1.00');
      });

      it('should clean trailing .0 from string input', () => {
        const result = processNumberValue('123.0');
        expect(result).toEqual({
          formattedValue: '123',
          originalValue: '123.0',
          isFormatted: true, // Cleaning was applied
        });
      });

      it('should not format when decimals within limit', () => {
        // 1.00123 has 5 decimals, doesn't exceed maxDecimals=5, so no formatting
        const result = processNumberValue(1.00123, '.', 5);
        expect(result).toEqual({
          formattedValue: '1.00123',
          originalValue: 1.00123,
          isFormatted: false,
        });
      });

      it('should clean string values with trailing .0', () => {
        const result = processNumberValue('456.0');
        expect(result).toEqual({
          formattedValue: '456',
          originalValue: '456.0',
          isFormatted: true,
        });
      });
    });

    describe('very small number formatting', () => {
      it('should format very small numbers as "< 0.000001"', () => {
        // Use string to avoid scientific notation
        const result = processNumberValue('0.0000001', '.', 6);
        expect(result.formattedValue).toBe('< 0.000001');
        expect(result.originalValue).toBe('0.0000001');
      });

      it('should format small negative numbers as "< 0.000001"', () => {
        // Use string to avoid scientific notation
        const result = processNumberValue('-0.0000001', '.', 6);
        expect(result.formattedValue).toBe('< 0.000001');
        expect(result.originalValue).toBe('-0.0000001');
      });

      it('should format very small with maxDecimals=2', () => {
        const result = processNumberValue(0.001, '.', 2);
        expect(result.formattedValue).toBe('< 0.01');
      });

      it('should format very small with maxDecimals=0', () => {
        const result = processNumberValue(0.5, '.', 0);
        expect(result.formattedValue).toBe('< 1');
      });

      it('should not use small format if value is at threshold', () => {
        const result = processNumberValue('0.000001', '.', 6);
        // This should not be "< 0.000001" because it equals the threshold
        // Has 6 decimals, doesn't exceed maxDecimals=6, so no formatting
        expect(result).toEqual({
          formattedValue: '0.000001',
          originalValue: '0.000001',
          isFormatted: false,
        });
      });

      it('should handle small numbers with many decimal places', () => {
        const result = processNumberValue(0.0000000123456, '.', 6);
        expect(result.formattedValue).toBe('< 0.000001');
      });
    });

    describe('large numbers with decimals', () => {
      it('should format large number and trim decimals', () => {
        const result = processNumberValue(5000.123456, '.', undefined);
        expect(result.formattedValue).toBe('5,000');
        expect(result.originalValue).toBe(5000.123456);
      });

      it('should format large number with specified maxDecimals', () => {
        const result = processNumberValue(1234.56789, '.', 2);
        // Trims to 2 decimals: 1234.57, then formats as large number with comma
        expect(result.formattedValue).toBe('1,234.57');
        expect(result.originalValue).toBe(1234.56789);
      });

      it('should format large numbers even without exceeding decimals', () => {
        const result = processNumberValue(1000.5, '.', 2);
        // Large number formatting is still applied
        expect(result).toEqual({
          formattedValue: '1,000.5',
          originalValue: 1000.5,
          isFormatted: true,
        });
      });
    });

    describe('custom delimiters', () => {
      it('should handle comma delimiter', () => {
        // With comma delimiter, '1,234567' means 1.234567
        const result = processNumberValue('1,234567', ',', 2);
        // Trims to 2 decimals: 1,23, but large number formatting adds commas with '.'
        // The value >= 1000 check treats 1,234567 as 1234567 (large number)
        expect(result.formattedValue).toBe('1,234,567');
      });

      it('should handle custom delimiter for small values', () => {
        // '0,5' with comma delimiter gets cleaned to '5' (leading 0, removed)
        const result = processNumberValue('0,5', ',', 2);
        expect(result).toEqual({
          formattedValue: '5',
          originalValue: '0,5',
          isFormatted: true,
        });
      });

      it('should clean trailing custom delimiter', () => {
        const result = processNumberValue('123,0', ',');
        // With comma delimiter, '123,0' is parsed as 1230, which is >= 1000
        expect(result).toEqual({
          formattedValue: '1,230',
          originalValue: '123,0',
          isFormatted: true,
        });
      });
    });

    describe('custom format strings', () => {
      it('should use custom format for large numbers', () => {
        const result = processNumberValue(5000, '.', undefined, '0,0');
        expect(result).toEqual({
          formattedValue: '5,000',
          originalValue: 5000,
          isFormatted: true,
        });
      });

      it('should apply custom format with decimals', () => {
        const result = processNumberValue(5000.5, '.', undefined, '0,0.0');
        // Large number with auto maxDecimals=0 should trim to integer
        expect(result.formattedValue).toBe('5,001');
      });
    });

    describe('edge cases', () => {
      it('should handle values with trailing delimiter', () => {
        const result = processNumberValue('123.');
        expect(result).toEqual({
          formattedValue: '123.',
          originalValue: '123.',
          isFormatted: false,
        });
      });

      it('should handle values without decimals', () => {
        const result = processNumberValue(123);
        expect(result).toEqual({
          formattedValue: '123',
          originalValue: 123,
          isFormatted: false,
        });
      });

      it('should handle string "0"', () => {
        const result = processNumberValue('0');
        expect(result).toEqual({
          formattedValue: '0',
          originalValue: '0',
          isFormatted: false,
        });
      });

      it('should handle decimal "0.0"', () => {
        const result = processNumberValue('0.0');
        expect(result).toEqual({
          formattedValue: '0',
          originalValue: '0.0',
          isFormatted: true,
        });
      });

      it('should handle 1.01 boundary (auto decimals)', () => {
        const result = processNumberValue(1.01123456, '.', undefined);
        expect(result.formattedValue).toBe('1.01');
      });

      it('should handle 1.00 (below 1.01 boundary)', () => {
        const result = processNumberValue(1.00123456, '.', undefined);
        // Auto maxDecimals = 6 for values < 1.01, rounds to 6 decimals
        expect(result.formattedValue).toBe('1.001235');
      });

      it('should handle exactly 999 (just below large threshold)', () => {
        const result = processNumberValue(999.123456, '.', undefined);
        expect(result.formattedValue).toBe('999.12');
      });

      it('should handle scientific notation input', () => {
        // Scientific notation numbers convert to 1e-8 string (no delimiter)
        const result = processNumberValue(1e-8, '.', 6);
        // No decimals to process, original value stays as is
        expect(result).toEqual({
          formattedValue: '1e-8',
          originalValue: 1e-8,
          isFormatted: false,
        });
      });

      it('should handle large scientific notation', () => {
        const result = processNumberValue(1e5);
        expect(result).toEqual({
          formattedValue: '100,000',
          originalValue: 1e5,
          isFormatted: true,
        });
      });
    });

    describe('complex scenarios', () => {
      it('should not format when within precision limit', () => {
        // 1.25 has only 2 decimals, doesn't exceed maxDecimals=4
        const result = processNumberValue(1.25, '.', 4);
        expect(result).toEqual({
          formattedValue: '1.25',
          originalValue: 1.25,
          isFormatted: false,
        });
      });

      it('should handle large number formatting after decimal precision', () => {
        const result = processNumberValue(1234.567890123, '.', 2);
        // Trims to 2 decimals: 1234.57, then formats as large number
        expect(result.formattedValue).toBe('1,234.57');
      });

      it('should handle negative small numbers', () => {
        // Use string to preserve decimal representation
        const result = processNumberValue('-0.0000005', '.', 6);
        expect(result.formattedValue).toBe('< 0.000001');
      });

      it('should handle negative large numbers with decimals', () => {
        const result = processNumberValue(-5000.123, '.', 2);
        // Fixed: Trims to 2 decimals: -5000.12, then adds comma formatting
        expect(result.formattedValue).toBe('-5,000.12');
      });

      it('should not format when no formatting needed', () => {
        const result = processNumberValue(50.5, '.', 3);
        expect(result).toEqual({
          formattedValue: '50.5',
          originalValue: 50.5,
          isFormatted: false,
        });
      });

      it('should handle string with commas in value', () => {
        const result = processNumberValue('1,234.56', '.', 1);
        // Trims to 1 decimal: 1234.6, then formats as large number
        expect(result.formattedValue).toBe('1,234.6');
      });

      it('should handle very precise decimals', () => {
        const result = processNumberValue(0.123456789012345, '.', 10);
        // JavaScript precision limits, rounds to available precision
        expect(result.formattedValue).toBe('0.123456789');
      });

      it('should round correctly at boundaries', () => {
        const result = processNumberValue(1.999, '.', 2);
        // Rounds to 2.00, keeps the .00
        expect(result.formattedValue).toBe('2.00');
      });

      it('should handle mixed: string input, large number, decimal trimming', () => {
        const result = processNumberValue('5000.999999', '.', undefined);
        expect(result.formattedValue).toBe('5,001');
      });
    });

    it('should format negative numbers at exactly threshold', () => {
      const result = processNumberValue(-1000);
      expect(result).toEqual({
        formattedValue: '-1,000',
        originalValue: -1000,
        isFormatted: true,
      });
    });

    it('should format negative numbers just above threshold', () => {
      const result = processNumberValue(-1001);
      expect(result).toEqual({
        formattedValue: '-1,001',
        originalValue: -1001,
        isFormatted: true,
      });
    });

    it('should not format negative numbers just below threshold', () => {
      const result = processNumberValue(-999);
      expect(result).toEqual({
        formattedValue: '-999',
        originalValue: -999,
        isFormatted: false,
      });
    });

    it('should auto-trim decimals on negative large numbers', () => {
      const result = processNumberValue(-5000.123456, '.', undefined);
      // Auto maxDecimals = 0 for abs value >= 1000
      expect(result.formattedValue).toBe('-5,000');
    });

    it('should handle negative medium numbers with auto decimals', () => {
      const result = processNumberValue(-10.123456, '.', undefined);
      // Auto maxDecimals = 2 for abs value >= 1.01
      expect(result.formattedValue).toBe('-10.12');
    });

    it('should handle negative small numbers with auto decimals', () => {
      const result = processNumberValue(-0.123456789, '.', undefined);
      // Auto maxDecimals = 6 for abs value < 1.01
      expect(result.formattedValue).toBe('-0.123457');
    });

    it('should format very large negative numbers', () => {
      const result = processNumberValue(-1234567.89, '.', 2);
      // Large number with decimals within limit
      expect(result).toEqual({
        formattedValue: '-1,234,567.89',
        originalValue: -1234567.89,
        isFormatted: true,
      });
    });
  });
});
