// src/config/env.js
// URL base única para toda la API del backend.
// Prioriza VITE_API_URL (nuevo) y mantiene compatibilidad con VITE_API_BASE_URL (legacy).

export const API_BASE_URL =
	import.meta.env.VITE_API_URL ||
	import.meta.env.VITE_API_BASE_URL ||
	'/api';

export const AUTH_API_URL = `${API_BASE_URL}/auth`;
