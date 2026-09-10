"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { UsersRound, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Password reset API will be connected next.
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
              <UsersRound size={30} strokeWidth={2} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Forgot Password?
            </h1>

            <p className="mt-2 text-gray-500">
              Enter your email and we'll help you reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-lg bg-blue-50 p-5 text-center">
              <Mail
                size={32}
                className="mx-auto mb-3 text-blue-600"
              />

              <p className="font-medium text-gray-900">
                Request received
              </p>

              <p className="mt-2 text-sm text-gray-500">
                If an account exists for this email, password
                reset instructions will be sent.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Send Reset Instructions
              </button>
            </form>
          )}

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
