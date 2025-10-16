import { isNumber, numberFormat, toFixed, toNumber } from '@/lib/number';
import { headString, isString, lastString } from '@/lib/string';

const LARGE_NUMBER_THRESHOLD = 1000;

/**
 * Result of processing a number value
 */
export interface ProcessedNumberValue {
  /** The formatted value to display (always present) */
  formattedValue: string;
  /** The original value, potentially modified (e.g., trailing .0 removed) */
  originalValue: number | string;
  /** Whether the value was formatted/modified (determines if tooltip should be shown) */
  isFormatted: boolean;
}

/**
 * Automatically determines the appropriate number of decimal places based on value magnitude
 *
 * @param valueNumber - The numeric value to evaluate
 * @returns The recommended number of decimal places (0, 2, or 6)
 *
 * @example
 * ```ts
 * getAutoMaxDecimals(5000) // returns 0 (large numbers get no decimals)
 * getAutoMaxDecimals(-5000) // returns 0 (negative large numbers get no decimals)
 * getAutoMaxDecimals(10) // returns 2 (medium numbers get 2 decimals)
 * getAutoMaxDecimals(0.5) // returns 6 (small numbers get 6 decimals)
 * ```
 */
function getAutoMaxDecimals(valueNumber: number): number {
  const absValue = Math.abs(valueNumber);

  if (absValue >= LARGE_NUMBER_THRESHOLD) {
    return 0;
  }

  if (absValue >= 1.01) {
    return 2;
  }

  return 6;
}

/**
 * Formats a value that is smaller than the maximum displayable precision
 *
 * @param maxDecimals - Maximum number of decimal places
 * @param delimiter - Decimal delimiter character
 * @returns Formatted string like "< 0.000001"
 *
 * @example
 * ```ts
 * formatSmallValue(6, '.') // returns "< 0.000001"
 * formatSmallValue(2, '.') // returns "< 0.01"
 * formatSmallValue(0, '.') // returns "< 1"
 * formatSmallValue(3, ',') // returns "< 0,001"
 * ```
 */
function formatSmallValue(maxDecimals: number, delimiter: string): string {
  if (maxDecimals === 0) {
    return '< 1';
  }

  // Generate the zeros string (maxDecimals - 1 zeros)
  const zeros = '0'.repeat(maxDecimals - 1);

  return `< 0${delimiter}${zeros}1`;
}

/**
 * Removes trailing zeros from a decimal number string
 *
 * @param value - The string value to process
 * @param delimiter - Decimal delimiter character
 * @returns Value with trailing zeros removed
 *
 * @example
 * ```ts
 * removeTrailingZeros('1.500', '.') // returns "1.5"
 * removeTrailingZeros('1.00', '.') // returns "1"
 * removeTrailingZeros('1.20', '.') // returns "1.2"
 * ```
 */
function removeTrailingZeros(value: string, delimiter: string): string {
  let result = value;

  // Remove trailing zeros, but keep at least .00
  while (
    result.includes(delimiter) &&
    result.endsWith('0') &&
    !result.endsWith(`${delimiter}00`)
  ) {
    result = result.substring(0, result.length - 1);
  }

  // Remove delimiter if only .0 or just delimiter remains
  const shouldRemoveDelimiter = [delimiter, `${delimiter}0`].some(s =>
    result.endsWith(s)
  );

  if (shouldRemoveDelimiter) {
    const withoutDelimiter = headString(result, delimiter);
    if (withoutDelimiter !== undefined) {
      return withoutDelimiter;
    }
  }

  return result;
}

/**
 * Handles decimal precision for a value string
 *
 * @param valueString - The string representation of the number
 * @param delimiter - Decimal delimiter character
 * @param maxDecimals - Maximum number of decimal places (optional)
 * @returns Processed value with appropriate decimal precision
 */
function handleDecimalPrecision(
  valueString: string,
  delimiter: string,
  maxDecimals?: number
): string | undefined {
  // Precompute a cleaned numeric string (remove thousand separators) and reuse
  const cleanedNumericString = valueString.replace(/,/g, '');

  // Parse the value
  const valueNumber = toNumber(cleanedNumericString);
  const decimals = lastString(valueString, delimiter);

  if (decimals === undefined) {
    return undefined;
  }

  // Validate that we got a valid number (not 0 from failed conversion)
  // This prevents undefined/null/invalid values from being converted to "0.00"
  if (!isNumber(cleanedNumericString)) {
    return undefined;
  }

  // Determine max decimals if not provided
  const effectiveMaxDecimals =
    maxDecimals !== undefined && isNumber(maxDecimals)
      ? maxDecimals
      : getAutoMaxDecimals(valueNumber);

  // Check if decimals exceed max
  const exceedsMaxDecimals = decimals.length > effectiveMaxDecimals;
  if (!exceedsMaxDecimals) {
    return undefined;
  }

  // Check if value is smaller than the minimum displayable
  const minDisplayableValue = Math.pow(10, -effectiveMaxDecimals);
  const isValueTooSmall = Math.abs(valueNumber) < minDisplayableValue;

  if (isValueTooSmall) {
    return formatSmallValue(effectiveMaxDecimals, delimiter);
  }

  // Format to max decimals
  const fixedValue = toFixed(valueNumber, effectiveMaxDecimals);

  return removeTrailingZeros(fixedValue, delimiter);
}

/**
 * Removes trailing .0 from the original value if present
 *
 * @param value - The original value
 * @param delimiter - Decimal delimiter character
 * @returns Value with trailing .0 removed if applicable
 */
function cleanOriginalValue(
  value: number | string,
  delimiter: string
): number | string {
  if (!isString(value)) {
    return value;
  }

  if (!value.endsWith(`${delimiter}0`)) {
    return value;
  }

  const headValue = headString(value, delimiter);
  if (headValue !== undefined) {
    return headValue;
  }

  return value;
}

/**
 * Applies number formatting for large values (absolute value >= 1000)
 *
 * @param value - The value to format
 * @param format - Numeral.js format string
 * @returns Formatted value or undefined if not applicable
 *
 * @example
 * ```ts
 * applyLargeNumberFormatting(5000, '0,0.00') // returns "5,000"
 * applyLargeNumberFormatting(-5000, '0,0.00') // returns "-5,000"
 * applyLargeNumberFormatting(500, '0,0.00') // returns undefined
 * ```
 */
function applyLargeNumberFormatting(
  value: string | number | undefined,
  format: string
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const numValue = toNumber(value);

  // Use absolute value for threshold check to handle negative numbers correctly
  if (Math.abs(numValue) < LARGE_NUMBER_THRESHOLD) {
    return undefined;
  }

  return numberFormat(value, format, true);
}

/**
 * Processes a number value for display, handling decimal precision and formatting
 *
 * @param value - The input value to process
 * @param delimiter - Decimal delimiter character (default: '.')
 * @param maxDecimals - Maximum number of decimal places (optional, auto-calculated if not provided)
 * @param format - Numeral.js format string for large numbers (default: '0,0.00')
 * @returns Processed number value with formatted value, original value, and isFormatted flag
 *
 * @example
 * ```ts
 * processNumberValue(1234.567, '.', 2)
 * // returns { formattedValue: '1,234.57', originalValue: 1234.567, isFormatted: true }
 *
 * processNumberValue(0.0000001, '.', 6)
 * // returns { formattedValue: '< 0.000001', originalValue: 0.0000001, isFormatted: true }
 *
 * processNumberValue(5000, '.', undefined, '0,0.00')
 * // returns { formattedValue: '5,000', originalValue: 5000, isFormatted: true }
 *
 * processNumberValue(50.5, '.', 2)
 * // returns { formattedValue: '50.5', originalValue: 50.5, isFormatted: false }
 * ```
 */
export function processNumberValue(
  value: number | string,
  delimiter: string = '.',
  maxDecimals?: number,
  format: string = '0,0.00'
): ProcessedNumberValue {
  // Convert to string for processing
  const valueString = value.toString();

  // Check if value has decimals that need processing
  // Only process if: (1) delimiter exists, and (2) not a trailing delimiter (e.g., "123.")
  const hasDecimals =
    valueString.includes(delimiter) && !valueString.endsWith(delimiter);

  let decimalFormattedValue: string | undefined;

  // Step 1: Handle decimal precision if the value has decimals
  // This may trim decimals, format small values as "< 0.000001", or leave unchanged
  if (hasDecimals) {
    decimalFormattedValue = handleDecimalPrecision(
      valueString,
      delimiter,
      maxDecimals
    );
  }

  // Step 2: Clean the original value (remove trailing .0 like "123.0" -> "123")
  const cleanedOriginalValue = cleanOriginalValue(value, delimiter);

  // Step 3: Apply large number formatting (e.g., 5000 -> "5,000")
  // First, try to format the already-processed decimal value
  const formattedLargeValue = applyLargeNumberFormatting(
    decimalFormattedValue,
    format
  );

  // If the formatted value is a large number, use that formatting
  if (formattedLargeValue !== undefined) {
    return {
      formattedValue: formattedLargeValue,
      originalValue: value,
      isFormatted: true,
    };
  }

  // If we have a decimal formatted value (not yet large-number formatted)
  if (decimalFormattedValue !== undefined) {
    return {
      formattedValue: decimalFormattedValue,
      originalValue: value,
      isFormatted: true,
    };
  }

  // Otherwise, check if the original value itself is a large number
  // that needs formatting (even if decimal precision wasn't applied)
  const originalFormattedLarge = applyLargeNumberFormatting(
    cleanedOriginalValue,
    format
  );

  if (originalFormattedLarge !== undefined) {
    return {
      formattedValue: originalFormattedLarge,
      originalValue: value,
      isFormatted: true,
    };
  }

  // No formatting was needed
  // Check if cleaning was applied (e.g., "123.0" -> "123")
  const finalValue = cleanedOriginalValue.toString();
  const wasCleaned = finalValue !== value.toString();

  return {
    formattedValue: finalValue,
    originalValue: value, // Always return the true original
    isFormatted: wasCleaned, // Mark as formatted if cleaning was applied
  };
}
