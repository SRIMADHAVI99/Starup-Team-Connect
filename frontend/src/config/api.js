/**
 * API Configuration for Startup Team Connect
 * Supports local development and production environment overrides.
 */
export const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.VITE_API_BASE_URL) {
    return window.__ENV__.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
