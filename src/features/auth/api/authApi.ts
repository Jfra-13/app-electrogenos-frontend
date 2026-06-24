import { getApiBaseUrl } from "../../../lib/api/baseUrl";

// POST /auth/login -> { token }. Public endpoint.
export async function login(
  username: string,
  password: string,
): Promise<string> {
  const url = new URL("/api/v1/auth/login", getApiBaseUrl());
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    token?: string;
    message?: string;
  };

  if (!res.ok || !data.token) {
    throw new Error(data.message || "Credenciales inválidas");
  }

  return data.token;
}
