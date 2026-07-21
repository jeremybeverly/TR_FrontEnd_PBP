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

    // Normalize Windows-style paths coming from DB like "uploads\\product-xxx.jpg"
    const normalized = value.replace(/\\+/g, '/');
    const trimmed = normalized.trim();
    if (!trimmed) return null;

    // If it's already a full URL, keep it.
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
        return trimmed;
    }

    // Always route through Vite proxy path `/uploads/...` to avoid NotSameOrigin issues.
    if (trimmed.startsWith('/uploads/')) {
        return trimmed;
    }

    if (trimmed.startsWith('uploads/')) {
        return `/${trimmed}`;
    }

    // Support bare file names stored in DB like "product-123.jpg"
    if (/^[^/]+\.(jpe?g|png|gif|webp|svg)$/i.test(trimmed)) {
        return `/uploads/${trimmed}`;
    }

    // Fallback: if it contains `/uploads/...` somewhere, extract it.
    const m = trimmed.match(/\/uploads\/(.+)$/i) || trimmed.match(/uploads\/(.+)$/i);
    if (m?.[1]) return `/uploads/${m[1]}`;

    return null;
}


function getToken() {
    return localStorage.getItem('token');
}

let isRedirectingToLogin = false;

function clearAuthAndRedirectToLogin() {
    // Prevent redirect loop when multiple requests fail simultaneously.
    if (isRedirectingToLogin) return;
    isRedirectingToLogin = true;

    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    } catch {
        // ignore
    }

    window.location.href = '/login';
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
        if (res.status === 401 && tokenRequired) {
            clearAuthAndRedirectToLogin();
            return data;
        }

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

