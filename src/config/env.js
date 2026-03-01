// src/config/env.js
// Export the base URL used by the web app for API requests.
// We fallback to the production VPS IP observed in the Flutter application.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://76.13.114.194';

export const AUTH_API_URL = `${API_BASE_URL}/auth`;
