/**
 * Date formatting utility functions for consistent date display throughout the application.
 * Provides standardized date formatting with Brazilian locale (DD/MM/YYYY) format and
 * robust error handling for null values, invalid dates, and type conversion scenarios.
 * Used across components for displaying project dates, task due dates, and timestamps.
 */

/**
 * Transforms date inputs into Brazilian standard format for consistent display across the application.
 * Handles multiple input types with comprehensive error handling and validation to prevent runtime errors.
 * Returns empty string for invalid inputs rather than throwing exceptions for graceful degradation.
 * 
 * @param date - Date input that can be ISO string, Date object, or null/undefined values
 * @returns Formatted date string in DD/MM/YYYY format, or empty string if input is invalid
 */
export const formatDateToBR = (date: string | Date | null | undefined): string => {
  /** Early return for null or undefined values to prevent processing invalid inputs */
  if (!date) return '';
  
  try {
    /** Type conversion handling for both string and Date object inputs */
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    /** Validation check for invalid date objects that may result from malformed strings */
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    /** Extract date components with zero-padding for consistent two-digit format */
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    /** Construct Brazilian date format with forward slashes as separators */
    return `${day}/${month}/${year}`;
  } catch (error) {
    /** Graceful error handling returns empty string instead of throwing exceptions */
    return '';
  }
};

/**
 * Transforms date inputs into Brazilian standard format with time information for detailed timestamps.
 * Extends basic date formatting to include hour and minute components for comprehensive time display.
 * Provides consistent timestamp formatting for task creation dates, project updates, and system logs.
 * 
 * @param date - Date input that can be ISO string, Date object, or null/undefined values
 * @returns Formatted date string in DD/MM/YYYY HH:MM format, or empty string if input is invalid
 */
export const formatDateTimeToBR = (date: string | Date | null | undefined): string => {
  /** Early return for null or undefined values to prevent processing invalid inputs */
  if (!date) return '';
  
  try {
    /** Type conversion handling for both string and Date object inputs */
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    /** Validation check for invalid date objects that may result from malformed strings */
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    /** Extract date components with zero-padding for consistent two-digit format */
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    /** Extract time components with zero-padding for consistent two-digit format */
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    /** Construct Brazilian date-time format with space separator between date and time */
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    /** Graceful error handling returns empty string instead of throwing exceptions */
    return '';
  }
};

/**
 * Default export providing the most commonly used date formatting function.
 * Enables convenient import syntax for basic date formatting needs throughout the application.
 */
export default formatDateToBR; 