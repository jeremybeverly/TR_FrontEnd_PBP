function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (typeof configured === 'string' && configured.trim()) {
    return configured.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export function buildApiUrl(path) {
  if (!path) return getApiBaseUrl();
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export function resolveImageUrl(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}${trimmed}`;
  }

  return `${getApiBaseUrl()}/${trimmed}`;
}

function getToken() {
  return localStorage.getItem('token');
}

async function apiFetch(path, { method = 'GET', body, headers = {}, tokenRequired = true } = {}) {
  const token = getToken();

  const finalHeaders = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  };

  if (tokenRequired && token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildApiUrl(path), {
    method,
    headers: finalHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, opts) => apiFetch(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => apiFetch(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => apiFetch(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => apiFetch(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => apiFetch(path, { ...opts, method: 'DELETE' }),
};

