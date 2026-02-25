"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AuthSchema, AuthSchemaType } from "./zod";

export default function AuthLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthSchemaType>({
    resolver: zodResolver(AuthSchema),
  });
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ✅ Check if user already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (res.ok) router.push("/plan");
      } catch {
        console.log("Token check failed");
      }
    };

    checkAuth();
  }, [router]);

  const onSubmit = async (data: AuthSchemaType) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("token", result.token);
      router.push("/plan");
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900 dark:text-white">
          Welcome Back
        </h1>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg transition"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
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
            ) : null}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/auth/auth-register")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}