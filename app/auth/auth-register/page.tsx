"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// ✅ Zod Schema (role removed)
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

  // Submit Handler
  const onSubmit = async (data: RegisterSchemaType) => {
    setLoading(true);
    setError("");
    setSuccess("");
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 to-pink-500">
      <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900 dark:text-white">
          Create Account
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">
              Name
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold p-3 rounded-lg transition"
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

        <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/auth/auth-login")}
            className="text-purple-600 hover:underline cursor-pointer"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}