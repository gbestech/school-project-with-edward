/**
 * Utility functions for handling URLs in the application
 */

/**
 * Gets the base URL for API/backend calls
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'https://school-management-project-qpox.onrender.com';
};

/**
 * Converts a relative URL to an absolute URL with the correct backend base
 * @param relativeUrl - The relative URL (e.g., "/media/school_logos/logo.png")
 * @returns The absolute URL pointing to the backend server
 */
export const getAbsoluteUrl = (relativeUrl: string | null | undefined): string => {
  if (!relativeUrl) return '';
 
  // If it's already an absolute URL, return as is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
 
  // Get the backend base URL (without /api)
  const apiBase = getApiBaseUrl();
  const backendBase = apiBase.replace('/api', ''); // Remove /api suffix if present
 
  // If it's a relative URL starting with /, prepend the backend origin
  if (relativeUrl.startsWith('/')) {
    return `${backendBase}${relativeUrl}`;
  }
 
  // If it's a relative URL without /, prepend the backend origin with /
  return `${backendBase}/${relativeUrl}`;
};

/**
 * Gets the base URL for media files (served from backend)
 * @returns The base URL for media files
 */
export const getMediaBaseUrl = (): string => {
  const apiBase = getApiBaseUrl();
  return apiBase.replace('/api', ''); // Remove /api to get backend root
};