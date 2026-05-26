const FALLBACK_API_BASE = "http://localhost:8082";

export function getApiBaseUrl(): string {
  const envBase = import.meta.env.PUBLIC_API_BASE_URL as string | undefined;
  return (envBase && envBase.trim()) || FALLBACK_API_BASE;
}
