export function getAuthHeaders(json = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const isJson = options.body !== undefined;
  const headers = {
    ...getAuthHeaders(isJson),
    ...((options.headers as Record<string, string>) || {}),
  };
  return fetch(path, { ...options, headers });
}
