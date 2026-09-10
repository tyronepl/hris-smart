"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { UsersRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        {
          email: cleanEmail,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Login response:", response.data);

      localStorage.setItem(
        "accessToken",
        response.data.accessToken,
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user),
      );

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (axios.isAxiosError(err)) {
        console.error(
          "Status:",
          err.response?.status,
        );

        console.error(
          "Response:",
          err.response?.data,
        );

        const backendMessage =
          err.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setError(backendMessage.join(", "));
        } else if (backendMessage) {
          setError(backendMessage);
        } else {
          setError(
            "Unable to login. Please try again.",
          );
        }
      } else {
        setError(
          "Unable to connect to the server.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
              <UsersRound
                size={30}
                strokeWidth={2}
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              HRIS Smart
            </h1>

            <p className="mt-2 text-gray-500">
              Sign in to your HR account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="name@email.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-xs text-gray-400">
              OR
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an HR account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Register
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-gray-400">
            HRIS Smart • HR Management System
          </p>
        </div>
      </div>
    </main>
  );
}
