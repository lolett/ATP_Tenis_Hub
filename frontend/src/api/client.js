// api/client.js - Shared API base URL and authenticated fetch helper

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Wrapper around fetch that automatically injects the JWT Bearer token.
 * If the server returns 401, it clears localStorage and reloads the page
 * so the user is sent back to the login screen.
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token") || "";

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return res;
}