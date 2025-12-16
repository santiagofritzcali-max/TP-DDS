const API_BASE_URL = "http://localhost:8080/api";

const TOKEN_KEY = "authToken";

export const setAuthToken = (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};

export const getAuthToken = () => sessionStorage.getItem(TOKEN_KEY);

/**
 * Wrapper fetch que devuelve {status, ok, data, error}
 */
export async function apiRequest(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
