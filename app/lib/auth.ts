export async function checkAuth() {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    // 1️⃣ Try access token validation
    const meRes = await fetch(
      `${API_URL}/auth/me`,
      {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (meRes.ok) {
      return { authenticated: true };
    }

    // 2️⃣ Access token expired → try refresh
    const refreshRes = await fetch(
      `${API_URL}/auth/refresh`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!refreshRes.ok) {
      return { authenticated: false };
    }

    const data = await refreshRes.json();

    // save new access token
    localStorage.setItem("token", data.token);

    return { authenticated: true };
  } catch {
    return { authenticated: false };
  }
}