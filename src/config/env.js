// src/config/env.js
// Export the base URL used by the web app for API requests.
// In production, requests go through the Nginx reverse proxy at /api/
// which proxies to the backend on the same server, avoiding Mixed Content issues.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const AUTH_API_URL = `${API_BASE_URL}/auth`;
