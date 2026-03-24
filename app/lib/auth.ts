export async function checkAuth() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Safety check
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_BASE_URL is not defined in .env");
    return { authenticated: false };
  }

  try {
    const token = localStorage.getItem("token") || "";

    // -----------------------------
    // 1️⃣ Validate access token
    // -----------------------------
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let meRes;
    try {
      meRes = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === "AbortError") {
        console.warn("Auth /me request timed out");
        return { authenticated: false };
      }

      throw err;
    }

    clearTimeout(timeoutId);

    if (meRes.ok) {
      return { authenticated: true };
    }

    // -----------------------------
    // 2️⃣ Try refresh token
    // -----------------------------
    const refreshController = new AbortController();
    const refreshTimeoutId = setTimeout(
      () => refreshController.abort(),
      8000
    );

    let refreshRes;
    try {
      refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "GET",
        credentials: "include",
        signal: refreshController.signal,
      });
    } catch (err: any) {
      clearTimeout(refreshTimeoutId);

      if (err.name === "AbortError") {
        console.warn("Auth refresh request timed out");
        return { authenticated: false };
      }

      throw err;
    }

    clearTimeout(refreshTimeoutId);

    if (!refreshRes.ok) {
      return { authenticated: false };
    }

    const data = await refreshRes.json();

    if (data?.token) {
      localStorage.setItem("token", data.token);
      return { authenticated: true };
    }

    return { authenticated: false };
  } catch (err) {
    console.error("Auth check error:", err);
    return { authenticated: false };
  }
}