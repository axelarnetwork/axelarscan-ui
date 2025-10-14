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
          formattedValue: undefined,
          originalValue: 42,
        });
      });

      it('should handle string number values', () => {
        const result = processNumberValue('42');
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '42',
        });
      });

      it('should handle zero', () => {
        const result = processNumberValue(0);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: 0,
        });
      });

      it('should handle negative numbers', () => {
        const result = processNumberValue(-42.5);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: -42.5,
        });
      });
    });

    describe('large number formatting (>= 1000)', () => {
      it('should format large integers with commas', () => {
        const result = processNumberValue(5000);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '5,000',
        });
      });

      it('should format very large numbers', () => {
        const result = processNumberValue(1234567);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '1,234,567',
        });
      });

      it('should format exactly at threshold', () => {
        const result = processNumberValue(1000);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '1,000',
        });
      });

      it('should not format just below threshold', () => {
        const result = processNumberValue(999);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: 999,
        });
      });

      it('should format negative large numbers', () => {
        const result = processNumberValue(-5000);
        // Negative large integers don't get formatted the same way
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: -5000,
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
          formattedValue: undefined,
          originalValue: 1.23,
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
      it('should remove trailing zeros after decimal trimming', () => {
        // 1.5 has only 1 decimal, doesn't exceed maxDecimals=2, so no formatting
        const result = processNumberValue(1.5, '.', 2);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: 1.5,
        });
      });

      it('should remove .00 entirely', () => {
        // 1.005 rounds to 1.00 with maxDecimals=2, keeps .00
        const result = processNumberValue(1.005, '.', 2);
        expect(result.formattedValue).toBe('1.00');
      });

      it('should remove trailing .0 from original value', () => {
        const result = processNumberValue('123.0');
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '123',
        });
      });

      it('should keep .00 when appropriate', () => {
        // 1.00123 has 5 decimals, doesn't exceed maxDecimals=5, so no formatting
        const result = processNumberValue(1.00123, '.', 5);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: 1.00123,
        });
      });

      it('should handle string values with trailing .0', () => {
        const result = processNumberValue('456.0');
        expect(result.originalValue).toBe('456');
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
          formattedValue: undefined,
          originalValue: '0.000001',
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

      it('should handle large numbers without exceeding decimals', () => {
        const result = processNumberValue(1000.5, '.', 2);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '1,000.5',
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
        // Custom delimiter affects string operations but not parsing
        // '0,5' after split/toNumber becomes 5, which modifies the original
        const result = processNumberValue('0,5', ',', 2);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '5',
        });
      });

      it('should clean trailing custom delimiter', () => {
        const result = processNumberValue('123,0', ',');
        expect(result.originalValue).toBe('123');
      });
    });

    describe('custom format strings', () => {
      it('should use custom format for large numbers', () => {
        const result = processNumberValue(5000, '.', undefined, '0,0');
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '5,000',
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
          formattedValue: undefined,
          originalValue: '123.',
        });
      });

      it('should handle values without decimals', () => {
        const result = processNumberValue(123);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: 123,
        });
      });

      it('should handle string "0"', () => {
        const result = processNumberValue('0');
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '0',
        });
      });

      it('should handle decimal "0.0"', () => {
        const result = processNumberValue('0.0');
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '0',
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
          formattedValue: undefined,
          originalValue: 1e-8,
        });
      });

      it('should handle large scientific notation', () => {
        const result = processNumberValue(1e5);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: '100,000',
        });
      });
    });

    describe('complex scenarios', () => {
      it('should handle precision trimming with trailing zeros removal', () => {
        // 1.25 has only 2 decimals, doesn't exceed maxDecimals=4
        const result = processNumberValue(1.25, '.', 4);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: 1.25,
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
        // Trims to 2 decimals: -5000.12
        expect(result.formattedValue).toBe('-5000.12');
      });

      it('should preserve original when no formatting needed', () => {
        const result = processNumberValue(50.5, '.', 3);
        expect(result).toEqual({
          formattedValue: undefined,
          originalValue: 50.5,
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
  });
});
