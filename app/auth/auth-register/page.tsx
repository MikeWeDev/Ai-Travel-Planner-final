"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// ✅ Zod Schema
const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export default function AuthRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
  });

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const onSubmit = async (data: RegisterSchemaType) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/auth/auth-login"), 2000);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
        
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-b from-purple-600 to-pink-500 text-white p-16 w-1/2">
          <h1 className="text-4xl font-extrabold mb-2">Welcome <span className="text-pink-200">Explorer</span>!</h1>
          <p className="text-gray-100 mt-4">Start your journey by creating an account.</p>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 bg-gray-800 p-12 flex flex-col justify-center">
          <h2 className="text-white text-2xl font-semibold mb-6">Create Account</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/auth/auth-login")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              {...register("name")}
              className="p-3 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-white focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

            <input
              type="email"
              placeholder="Email Address"
              {...register("email")}
              className="p-3 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-white focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="p-3 rounded-lg bg-gray-900 border border-gray-700 placeholder-gray-500 text-white focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center"
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
              {loading ? "Registering..." : "Register"}
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