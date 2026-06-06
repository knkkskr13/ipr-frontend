/**
 * Decode JWT payload (base64url) without any library.
 * Your backend only puts `sub` (username) in the token.
 * Role is stored in DB and fetched via /api/v1/user/me after login.
 */
export function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)); // { sub, iat, exp }
  } catch {
    return null;
  }
}

export function getStoredToken() { return localStorage.getItem('token'); }
export function setStoredToken(token) { localStorage.setItem('token', token); }

export function clearStoredToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('employeeId');
  localStorage.removeItem('username');
}

export function getStoredRole() { return localStorage.getItem('role'); }
export function getStoredEmployeeId() {
  const id = localStorage.getItem('employeeId');
  return id ? Number(id) : null;
}
export function getStoredUsername() { return localStorage.getItem('username'); }

export function isAuthenticated() {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const payload = decodeToken(token);
    if (!payload) return false;
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      clearStoredToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
