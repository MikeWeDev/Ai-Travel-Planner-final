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
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
        
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-b from-blue-600 to-blue-400 text-white p-16 w-1/2">
          <h1 className="text-4xl font-extrabold mb-2">Welcome <span className="text-blue-200">Back</span>, Explorer.</h1>
          <p className="text-gray-100 mt-4">Pick up where you left off.</p>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 bg-gray-800 p-12 flex flex-col justify-center">
          <h2 className="text-white text-2xl font-semibold mb-6">Login</h2>
          <p className="text-gray-400 mb-6 text-sm">
            New to the journey?{" "}
            <span
              onClick={() => router.push("/auth/auth-register")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email Address"
              {...register("email")}
              className="p-3 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="p-3 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center"
            >
              {loading && (
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
              )}
              {loading ? "Logging in..." : "Resume Journey"}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>OR</p>
            <button
              onClick={() => alert("Google login")}
              className="mt-2 flex items-center justify-center gap-2 border border-gray-700 rounded-lg p-3 w-full hover:bg-gray-700 transition"
            >
              <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}