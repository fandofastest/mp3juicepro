const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function apiRequest<T = any>(
  path: string,
  method = "GET",
  body?: any
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "An error occurred");
  }

  return result.data;
}
