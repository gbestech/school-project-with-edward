/**
 * Utility functions for handling URLs in the application
 */

/**
 * Converts a relative URL to an absolute URL with the correct base
 * @param relativeUrl - The relative URL (e.g., "/media/school_logos/logo.png")
 * @returns The absolute URL with the correct base
 */
export const getAbsoluteUrl = (relativeUrl: string | null | undefined): string => {
  if (!relativeUrl) return '';
  
  // If it's already an absolute URL, return as is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // If it's a relative URL starting with /, prepend the current origin
  if (relativeUrl.startsWith('/')) {
    return `${window.location.origin}${relativeUrl}`;
  }
  
  // If it's a relative URL without /, prepend the current origin with /
  return `${window.location.origin}/${relativeUrl}`;
};

/**
 * Gets the base URL for API calls
 * @returns The base URL for API calls
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || window.location.origin;
};

/**
 * Gets the base URL for media files
 * @returns The base URL for media files
 */
export const getMediaBaseUrl = (): string => {
  return window.location.origin;
}; 