const API_BASE_URL = "http://localhost:8080/api";

/**
 * Wrapper fetch que devuelve {status, ok, data, error}
 */
export async function apiRequest(path, options = {}) {
  const { headers = {}, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...rest,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
    error: !response.ok ? data?.mensaje || data?.message || null : null,
  };
}
