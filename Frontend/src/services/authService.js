import {
  apiRequest,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from "./apiClient";

export async function login(username, password) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (result.ok && result.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

export function logout() {
  clearAuthToken();
}

export { getAuthToken };
