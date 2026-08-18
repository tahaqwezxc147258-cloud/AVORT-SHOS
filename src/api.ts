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
  // The API currently validates the application's JWT (issued by /verify-otp),
  // not a Supabase Auth access token. Keep the app token first so configuring
  // Supabase for data access cannot silently turn valid API requests into 401s.
  const appToken = localStorage.getItem('noir_token');
  const { data: { session } } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } };
  const token = appToken || session?.access_token;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, opts.query), { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    // A token can outlive a redeploy/secret rotation. Remove it immediately
    // so the next request can recover as an anonymous request or re-login.
    if (res.status === 401 && appToken) localStorage.removeItem('noir_token');
    let message = text || res.statusText;
    try {
      const payload = JSON.parse(text);
      message = payload.error || payload.message || message;
    } catch { /* response was plain text */ }
    throw new Error(`${res.status} ${message}`);
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
