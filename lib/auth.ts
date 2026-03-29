const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AuthUser {
  userId: number;
  email: string;
  accountType: 'individual' | 'corporate';
  kycStatus: string;
  partial?: boolean;
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  document.cookie = 'auth_token=; path=/; max-age=0';
}

export function parseToken(token: string): AuthUser | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as AuthUser;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const token = getAuthToken();
  if (!token) return null;
  const user = parseToken(token);
  if (!user) return null;
  // Check expiry
  const payload = user as any;
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    clearAuth();
    return null;
  }
  return user;
}

export function authFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
