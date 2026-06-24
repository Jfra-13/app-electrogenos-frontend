// Decodes the JWT payload (no signature check — UI gating only; the API still
// enforces roles and returns 403). The token's signature is the source of truth
// on the backend; here we just read claims to show/hide admin controls.
import { getJwtTokenFromCookie } from "./http";

type JwtPayload = {
  roles?: string[];
  authorities?: string[];
  scope?: string;
  role?: string;
  sub?: string;
};

function decodeBase64Url(part: string): string | undefined {
  if (typeof atob === "undefined") return undefined;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    return atob(base64);
  } catch {
    return undefined;
  }
}

function decodePayload(token: string): JwtPayload | undefined {
  const part = token.split(".")[1];
  if (!part) return undefined;
  const json = decodeBase64Url(part);
  if (!json) return undefined;
  try {
    return JSON.parse(json) as JwtPayload;
  } catch {
    return undefined;
  }
}

// ponytail: the API-FRONTEND.md sample token only carried `sub`/`iat` and roles
// were returned alongside the token in the login response. We read the common
// role claims here so gating works if the backend embeds them; if it never
// does, persist `roles` from the login response into a cookie and read it here.
export function getRoleFromToken(
  token: string | undefined = getJwtTokenFromCookie(),
): string[] {
  if (!token) return [];
  const payload = decodePayload(token);
  if (!payload) return [];

  const raw =
    payload.roles ??
    payload.authorities ??
    (payload.scope ? payload.scope.split(" ") : undefined) ??
    (payload.role ? [payload.role] : []);

  return raw.map(String);
}

// Matches roles by substring so the backend's `ROLE_ADMIN` form satisfies a
// bare `ADMIN` query. Case-insensitive.
export function hasRole(role: string, token?: string): boolean {
  const needle = role.toUpperCase();
  return getRoleFromToken(token).some((r) => r.toUpperCase().includes(needle));
}

export function isAdmin(token?: string): boolean {
  return hasRole("ADMIN", token);
}

export function isEmpleado(token?: string): boolean {
  return hasRole("EMPLEADO", token);
}

// Reads the subject claim (`sub`) — the username the token was issued for.
export function getUsername(
  token: string | undefined = getJwtTokenFromCookie(),
): string | undefined {
  if (!token) return undefined;
  return decodePayload(token)?.sub;
}
