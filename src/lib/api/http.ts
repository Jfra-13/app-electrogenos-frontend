// Shared HTTP helpers for feature API clients.
// Auth lives in the `jwt_token` cookie; calls run client-side (React islands).

// Carries the HTTP status so UI can branch (e.g. 403 -> "no permission" panel).
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Throws an ApiError with the response status when the request failed.
export async function ensureOk(res: Response, fallback: string): Promise<void> {
  if (res.ok) return;
  const message = await getErrorMessage(res, fallback);
  throw new ApiError(res.status, message);
}

export function getJwtTokenFromCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";").map((c) => c.trim());
  const tokenPart = parts.find((c) => c.startsWith("jwt_token="));
  if (!tokenPart) return undefined;
  return tokenPart.slice("jwt_token=".length) || undefined;
}

export function getAuthHeaders(): HeadersInit {
  const token = getJwtTokenFromCookie();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Reads the body once and prefers a JSON `message`; falls back to raw text,
// then to the provided fallback. The body can only be consumed once, so we
// read it as text and try to parse — avoids "body already used" errors.
export async function getErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  let text = "";
  try {
    text = await res.text();
  } catch {
    return fallback;
  }
  if (!text) return fallback;

  try {
    const data = JSON.parse(text) as { message?: string } | undefined;
    if (data?.message) return data.message;
  } catch {
    // Not JSON — fall through to raw text.
  }
  return text;
}
