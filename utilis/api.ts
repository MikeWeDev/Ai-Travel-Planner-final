// client/utils/api.ts
export const authenticatedFetch = async (url: string, options: any = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });

  // 🚨 This is the "Auto-Logout" logic
  if (response.status === 401) {
    console.warn("Session expired or unauthorized. Logging out...");
    localStorage.removeItem("token");
    
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/auth/auth-login?reason=expired";
    }
  }

  return response;
};