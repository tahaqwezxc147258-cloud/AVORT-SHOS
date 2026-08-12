import { supabase } from './supabase';

type RequestOptions = RequestInit & { query?: Record<string, any> };

// Production uses the separate Express API; local development falls back to Vite's proxy.
const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

function buildUrl(path: string, query?: Record<string, any>) {
  let url = `${API_BASE}${path}`;
  if (query) {
    const qs = new URLSearchParams();
    Object.keys(query).forEach(k => qs.set(k, String(query[k])));
    url += `?${qs.toString()}`;
  }
  return url;
}

export async function request<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // Prefer a Supabase Auth session when available. The legacy OTP flow still
  // falls back to its app JWT until authentication is fully migrated.
  const { data: { session } } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const token = session?.access_token || localStorage.getItem('noir_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, opts.query), { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const api = {
  get: <T = any>(path: string, query?: Record<string, any>) => request<T>(path, { method: 'GET', query }),
  post: <T = any>(path: string, body?: any) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(path: string, body?: any) => request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export default api;
