import type { DecodedToken } from '@/types/auth';

/**
 * Decodes a JWT's payload without verifying the signature.
 * Verification happens server-side; this is only used client-side to
 * read the username/role/expiry for routing and display purposes.
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );

    return JSON.parse(json) as DecodedToken;
  } catch {
    return null;
  }
}

export function isTokenExpired(decoded: DecodedToken | null): boolean {
  if (!decoded) return true;
  // exp is in seconds since epoch
  return Date.now() >= decoded.exp * 1000;
}
