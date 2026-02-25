"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "./lib/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const result = await checkAuth();

      if (result.authenticated) {
        router.replace("/plan"); // user is logged in
      } else {
        router.replace("/auth/auth-login"); // user is not logged in
      }
    }

    init();
  }, [router]);

  // ✅ Spinner UI while checking
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <svg
        className="animate-spin h-12 w-12 text-blue-500 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      <p className="text-lg text-gray-700 dark:text-gray-200">
        Checking authentication...
      </p>
    </div>
  );
}