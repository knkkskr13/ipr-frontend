/**
 * Decode a JWT token without any external library.
 * Returns { username, role } extracted from the payload.
 */
export function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → Base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonStr = atob(padded);
    const payload = JSON.parse(jsonStr);

    const username = payload.sub || '';

    // Try role field first, then authorities array, then roles array
    let role = '';
    if (payload.role) {
      role = payload.role;
    } else if (Array.isArray(payload.authorities) && payload.authorities.length > 0) {
      role = payload.authorities[0].authority || payload.authorities[0];
    } else if (Array.isArray(payload.roles) && payload.roles.length > 0) {
      role = payload.roles[0];
    }

    // Strip ROLE_ prefix if present
    if (typeof role === 'string' && role.startsWith('ROLE_')) {
      role = role.slice(5);
    }

    return { username, role };
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem('token');
}

export function setStoredToken(token) {
  localStorage.setItem('token', token);
}

export function clearStoredToken() {
  localStorage.removeItem('token');
}

export function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  return decodeToken(token);
}

export function isAuthenticated() {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      clearStoredToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
