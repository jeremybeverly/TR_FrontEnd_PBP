import { api } from './api';

function resolvePayload(response) {
  const body = response?.data ?? response;
  return body;
}

export async function login({ username, password }) {
  const res = await api.post('/api/auth/login', { username, password }, { tokenRequired: false });
  const payload = resolvePayload(res);
  const token = payload?.token ?? payload?.data?.token;
  const user = payload?.user ?? payload?.data?.user ?? payload?.userData ?? payload?.data ?? null;

  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));

  return { ...payload, token, user };
}

export async function logout() {
  try {
    await api.post('/api/auth/logout', null);
  } catch {
    // ignore if backend logout is not available or fails
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getMe() {
  const res = await api.get('/api/auth/me');
  const payload = resolvePayload(res);
  return payload?.user ?? payload;
}

