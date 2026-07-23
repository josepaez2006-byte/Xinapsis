/**
 * api.ts — Centralized API client
 * Automatically injects the JWT token in every request.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Sesión expirada o inválida: limpiar y redirigir al login
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get:    <T>(url: string)                   => request<T>(url),
  post:   <T>(url: string, body: unknown)    => request<T>(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown)    => request<T>(url, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(url: string, body: unknown)    => request<T>(url, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(url: string)                   => request<T>(url, { method: 'DELETE' }),
};
